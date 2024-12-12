import express from "express";
import cors from "cors";
import {
  GetUserResponse,
  GetTypesResponse,
  GetResourceResponse,
  GetLogsResponse,
  GetEventsResponse,
  parseRef,
} from "@kblocks-portal/shared";
import projects from "./mock-data/projects.json";
import { exchangeCodeForTokens } from "./github.js";
import { createServerSupabase, privateSupabase } from "./supabase.js";
import expressWs from "express-ws";
import { getEnv, getUserOctokit } from "./util";
import * as pubsub from "./pubsub";
import { startStreamListener } from "./stream";
import {
  ApiObject,
  blockTypeFromUri,
  formatBlockUri,
  Manifest,
  ObjectEvent,
  parseBlockUri,
  type Condition,
  type OwnerReference,
} from "@kblocks/api";
import {
  getAllObjects,
  loadEvents,
  getObject,
  resetStorage,
  deleteObject,
} from "./storage";
import { categories } from "./categories";

import { publicProcedure, router } from "./trpc";
import { z } from "zod";

export type Definition = Manifest["definition"];

export interface ResourceType extends Definition {
  icon?: string;
  engine: string;
  systems: string[];
  readme?: string;
}

export type RelationshipType = "parent" | "child" | "ref";

export type Relationship = {
  type: RelationshipType;
};

export { type Condition, type WorkerEventTimestampString };

/**
 * Represents a `@kblocks/api` {@link ApiObject} but without the `any` type, since it
 * seems to break the tRPC typing of the router.
 */
export type StrictApiObject = {
  apiVersion: ApiObject["apiVersion"];
  kind: ApiObject["kind"];
  color?: string;
  metadata: ApiObject["metadata"];
  status?: {
    conditions?: Condition[];
  };
};

/**
 * Extends the {@link StrictApiObject} with common properties.
 */
export type ExtendedApiObject = StrictApiObject & {
  objUri: string;
  objType: string;
  spec?: Manifest;
};

/**
 * Represents a project object.
 *
 * Extends the {@link ExtendedApiObject}.
 */
export type Project = ExtendedApiObject & {
  objects?: string[];
  icon?: string;
  title?: string;
  description?: string;
};

/**
 * Represents a cluster object.
 *
 * Extends the {@link ExtendedApiObject}.
 */
export type Cluster = ExtendedApiObject & {
  access: "read_only" | "read_write";
  type: ResourceType;
};

/**
 * Represents a resource object.
 *
 * Extends the {@link ExtendedApiObject}.
 */
export type Resource = ExtendedApiObject & {
  projects: Project[];
  type?: ResourceType;
  relationships: {
    type: RelationshipType;
    resource: ExtendedApiObject & {
      type?: ResourceType;
    };
  }[];
  references?: Record<string, ExtendedApiObject & { type?: ResourceType }>;
};

const getExtendedObjects = async (): Promise<ExtendedApiObject[]> => {
  const objects = await getAllObjects();
  return Object.entries(objects).map<ExtendedApiObject>(([objUri, object]) => {
    return {
      ...object,
      objUri,
      objType: blockTypeFromUri(objUri),
    };
  });
};

const resolveReferences = (
  object: ExtendedApiObject,
  allObjects: ExtendedApiObject[],
  types: Record<string, ResourceType>,
): Record<string, ExtendedApiObject & { type?: ResourceType }> => {
  const references: Record<
    string,
    ExtendedApiObject & { type?: ResourceType }
  > = {};
  for (const value of Object.values(object)) {
    if (typeof value !== "string" || !value.startsWith("${ref://")) {
      continue;
    }
    const referenceObjectUri = parseRef(value, object.objUri);
    if (references[referenceObjectUri.objUri]) {
      continue;
    }
    const renferenceObject = allObjects.find(
      (o) => o.objUri === referenceObjectUri.objUri,
    );
    if (!renferenceObject) {
      console.error(`Reference object ${referenceObjectUri.objUri} not found`);
      continue;
    }
    references[referenceObjectUri.objUri] = {
      ...renferenceObject,
      type: types[renferenceObject.objType],
    };
  }
  return references;
};

const mapObjectToResource = (
  object: ExtendedApiObject,
  allObjects: ExtendedApiObject[],
  projects: Project[],
  types: Record<string, ResourceType>,
  relationships: Record<string, Record<string, Relationship>>,
): Resource => {
  return {
    ...object,
    projects: projects.filter((project) =>
      project.objects?.includes(object.objUri),
    ),
    type: types[object.objType],
    relationships: Object.entries(relationships[object.objUri] ?? {})
      .map(([relationshipObjUri, relationship]) => {
        const child = allObjects.find((o) => o.objUri === relationshipObjUri);
        if (!child) {
          return undefined;
        }
        return {
          relationship,
          child,
        };
      })
      .filter((child) => child !== undefined)
      .map(({ relationship, child }) => {
        return {
          ...relationship,
          resource: {
            ...child,
            type: types[child.objType],
          },
        };
      }),
    references: resolveReferences(object, allObjects, types),
  };
};

const resourcesFromObjects = (
  allObjects: ExtendedApiObject[],
  projects: Project[],
  types: Record<string, ResourceType>,
  clusters: Cluster[],
  relationships: Record<string, Record<string, Relationship>>,
): Resource[] => {
  return allObjects
    .filter((object) => {
      // first check is this object belongs to a cluster known to the portal
      const { system } = parseBlockUri(object.objUri);
      const cluster = Object.values(clusters)?.find(
        (c) => c.metadata?.name === system,
      );
      if (!cluster) {
        return false;
      }

      return (
        object.objType !== "kblocks.io/v1/projects" &&
        object.objType !== "kblocks.io/v1/blocks" &&
        object.objType !== "kblocks.io/v1/clusters"
      );
    })
    .map((object) =>
      mapObjectToResource(object, allObjects, projects, types, relationships),
    );
};

const projectsFromObjects = (allObjects: ExtendedApiObject[]): Project[] => {
  return allObjects.filter(
    (object): object is Project => object.objType === "kblocks.io/v1/projects",
  );
};

const clustersFromObjects = (
  allObjects: ExtendedApiObject[],
  types: Record<string, ResourceType>,
): Cluster[] => {
  return allObjects
    .filter(
      (object): object is Cluster =>
        object.objType === "kblocks.io/v1/clusters",
    )
    .map((object) => ({
      ...object,
      type: types["kblocks.io/v1/clusters"],
    }));
};

const mapTypeFromObject = (
  object: ExtendedApiObject,
): [string, ResourceType] => {
  if (!object.spec) {
    throw new Error(`Object ${object.objUri} has no spec`);
  }

  const key = `${object.spec.definition.group}/${object.spec.definition.version}/${object.spec.definition.plural}`;

  const { system, name } = parseBlockUri(object.objUri);

  return [
    key,
    {
      ...object.spec.definition,
      engine: object.spec.engine,
      systems: [system],
      icon: object.spec.definition.icon,
    },
  ];
};

const typesFromObjects = (
  allObjects: ExtendedApiObject[],
): Record<string, ResourceType> => {
  return allObjects
    .filter((o) => o.objType === "kblocks.io/v1/blocks")
    .reduce<Record<string, ResourceType>>((acc, object) => {
      const [key, type] = mapTypeFromObject(object);
      acc[key] = type;
      return acc;
    }, {});
};

const relationshipsFromObjects = (
  objects: ExtendedApiObject[],
  resourceTypes: Record<string, ResourceType>,
): Record<string, Record<string, Relationship>> => {
  const relationships: Record<string, Record<string, Relationship>> = {};
  for (const r of Object.values(objects)) {
    const refs: OwnerReference[] = r.metadata?.ownerReferences ?? [];
    if (refs.length === 0) {
      continue;
    }

    const childUri = r.objUri;
    const { system, namespace } = parseBlockUri(childUri);

    for (const ref of refs) {
      const parentUri = resolveOwnerUri(ref, system, namespace, resourceTypes);

      relationships[childUri] = {
        ...(relationships[childUri] ?? {}),
        [parentUri]: {
          type: "parent",
        },
      };

      relationships[parentUri] = {
        ...(relationships[parentUri] ?? {}),
        [childUri]: {
          type: "child",
        },
      };
    }
  }

  return relationships;
};

const resolvePluralFromKind = (
  kind: string,
  resourceTypes: Record<string, ResourceType>,
): string => {
  for (const def of Object.values(resourceTypes)) {
    if (def.kind === kind) {
      return def.plural;
    }
  }

  return kind.toLowerCase();
};

const resolveOwnerUri = (
  ref: OwnerReference,
  system: string,
  namespace: string,
  resourceTypes: Record<string, ResourceType>,
) => {
  const [group, version] = ref.apiVersion.split("/");
  const plural = resolvePluralFromKind(ref.kind, resourceTypes);
  return formatBlockUri({
    group,
    version,
    system,
    namespace,
    plural,
    name: ref.name,
  });
};

export interface ObjectHierarchy {
  objUri: string;
  name: string;
  kind?: string;
  icon?: string;
  children: ObjectHierarchy[];
}

const getObjectHierarchy = (
  objUri: string,
  objects: ExtendedApiObject[],
  types: Record<string, ResourceType>,
  relationships: Record<string, Record<string, Relationship>>,
): ObjectHierarchy => {
  const object = objects.find((o) => o.objUri === objUri);
  if (!object) {
    throw new Error(`Object ${objUri} not found`);
  }
  const type = types[object.objType];
  const children = Object.entries(relationships[objUri] ?? {})
    .filter(([childObjUri, relationship]) => relationship.type === "child")
    .map(([childObjUri, relationship]) =>
      getObjectHierarchy(childObjUri, objects, types, relationships),
    );
  return {
    objUri,
    name: object.metadata?.name,
    kind: type?.kind,
    icon: type?.icon,
    children,
  };
};

const appRouter = router({
  listEvents: publicProcedure
    .input(
      z.object({
        objUri: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { objUri } = input;
      const events = await loadEvents(objUri);
      return events as unknown as WorkerEventTimestampString[];
    }),
  listTypes: publicProcedure.query(async () => {
    const objects = await getExtendedObjects();
    const types = typesFromObjects(objects);
    return types;
  }),
  getType: publicProcedure
    .input(z.object({ typeUri: z.string() }))
    .query(async ({ input }) => {
      const objects = await getExtendedObjects();
      const types = typesFromObjects(objects);
      const type = types[input.typeUri];
      if (!type) {
        throw new Error(`Type ${input.typeUri} not found`);
      }
      return type;
    }),
  listResources: publicProcedure
    .input(
      z
        .object({
          page: z
            .union([z.number(), z.string()])
            .optional()
            .pipe(z.coerce.number().int().min(1).default(1)),
          perPage: z
            .union([z.number(), z.string()])
            .optional()
            .pipe(z.coerce.number().int().min(1).max(100).default(20)),
        })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const { page, perPage } = input;
      const objects = await getExtendedObjects();
      const projects = projectsFromObjects(objects);
      const types = typesFromObjects(objects);
      const relationships = relationshipsFromObjects(objects, types);
      const clusters = clustersFromObjects(objects, types);
      const resources = resourcesFromObjects(
        objects,
        projects,
        types,
        clusters,
        relationships,
      );
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedResources = resources.slice(startIndex, endIndex);
      const pageCount = Math.ceil(resources.length / perPage);
      return {
        data: paginatedResources,
        page,
        perPage,
        pageCount,
      };
    }),
  listResourcesV2: publicProcedure
    .input(
      z
        .object({
          page: z
            .union([z.number(), z.string()])
            .optional()
            .pipe(z.coerce.number().int().min(1).default(1)),
          perPage: z
            .union([z.number(), z.string()])
            .optional()
            .pipe(z.coerce.number().int().min(1).max(100).default(20)),
        })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const { page, perPage } = input;
      const objects = await getExtendedObjects();
      const projects = projectsFromObjects(objects);
      const types = typesFromObjects(objects);
      const clusters = clustersFromObjects(objects, types);
      const relationships = relationshipsFromObjects(objects, types);
      const resources = resourcesFromObjects(
        objects,
        projects,
        types,
        clusters,
        relationships,
      );
      return resources.find((resource) => {
        const entries = Object.entries(resource);
        const references = entries.filter(([key, value]) => {
          if (key.startsWith("ref://")) {
            return [key, value];
          }
        });
      });
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedResources = resources.slice(startIndex, endIndex);
      const pageCount = Math.ceil(resources.length / perPage);
      return {
        data: paginatedResources,
        page,
        perPage,
        pageCount,
        references: [],
      };
    }),
  listProjects: publicProcedure.query(async () => {
    const objects = await getExtendedObjects();
    const projects = projectsFromObjects(objects);
    return projects;
  }),
  listClusters: publicProcedure.query(async () => {
    const objects = await getExtendedObjects();
    const types = typesFromObjects(objects);
    return clustersFromObjects(objects, types);
  }),
  getResource: publicProcedure
    .input(z.object({ objUri: z.string() }))
    .query(async ({ input }) => {
      const objects = await getExtendedObjects();
      const projects = projectsFromObjects(objects);
      const types = typesFromObjects(objects);
      const relationships = relationshipsFromObjects(objects, types);
      const clusters = clustersFromObjects(objects, types);
      // special case for clusters
      if (input.objUri.indexOf("kblocks.io/v1/clusters") !== -1) {
        const cluster = clusters.find((c) => c.objUri === input.objUri);
        if (!cluster) {
          throw new Error(`Cluster ${input.objUri} not found`);
        }
        return cluster;
      }
      // normal case for resources
      const object = objects.find((r) => r.objUri === input.objUri);
      if (!object) {
        throw new Error(`Resource ${input.objUri} not found`);
      }
      return mapObjectToResource(
        object,
        objects,
        projects,
        types,
        relationships,
      );
    }),
  getObjectHierarchy: publicProcedure
    .input(z.object({ objUri: z.string() }))
    .query(async ({ input }) => {
      const objects = await getExtendedObjects();
      const types = typesFromObjects(objects);
      const relationships = relationshipsFromObjects(objects, types);
      return getObjectHierarchy(input.objUri, objects, types, relationships);
    }),
  getProject: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const objects = await getExtendedObjects();
      const projects = projectsFromObjects(objects);
      return projects.find((p) => p.metadata?.name === input.name);
    }),
  listProjectResources: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const objects = await getExtendedObjects();
      const projects = projectsFromObjects(objects);
      const project = projects.find(
        (project) => project.metadata?.name === input.name,
      );
      return (
        project?.objects?.map((objUri) =>
          objects.find((o) => o.objUri === objUri),
        ) ?? []
      );
    }),
  listCategories: publicProcedure.query(async () => {
    return categories;
  }),
  listCatalogItems: publicProcedure.query(async () => {
    const objects = await getExtendedObjects();
    const types = typesFromObjects(objects);
    const nonSystemTypes = Object.fromEntries(
      Object.entries(types).filter(
        ([, item]) => !item.group.startsWith("kblocks.io"),
      ),
    );
    return Object.keys(categories)
      .map((categoryName) => {
        const category = categories[categoryName];
        return {
          category: category.title,
          icon: category.icon,
          types: Object.values(nonSystemTypes)
            .filter((type) => type.categories?.includes(categoryName))
            .map((type) => ({
              typeUri: `${type.group}/${type.version}/${type.plural}`,
              kind: type.kind,
              icon: type.icon,
            })),
        };
      })
      .filter((item) => item.types.length > 0);
  }),
});

export type AppRouter = typeof appRouter;

const WEBSITE_ORIGIN = getEnv("WEBSITE_ORIGIN");
const NON_PRIMARY_ENVIRONMENT = process.env.NON_PRIMARY_ENVIRONMENT;
const GITHUB_CLIENT_ID = getEnv("GITHUB_CLIENT_ID");

const port = process.env.PORT ?? 3001;

startStreamListener();

const { app } = expressWs(express());

app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

import * as trpcExpress from "@trpc/server/adapters/express";
import type { WorkerEventTimestampString } from "./api-events";

app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  }),
);

app.get("/", async (_, res) => {
  return res.status(200).json({ message: "Hello, kblocks backend!" });
});

app.ws("/api/events", (ws) => {
  console.log("Client connected");

  const callback = (message: string) => {
    ws.send(message);
  };

  pubsub.subscribeToEvents(callback);

  ws.on("close", () => {
    console.log("/api/events client disconnected");
    pubsub.unsubscribeFromEvents(callback);
  });
});

app.get("/api/resources", async (_, res) => {
  const objects: ObjectEvent[] = [];

  const all = await getAllObjects();

  for (const [objUri, object] of Object.entries(all)) {
    objects.push({
      type: "OBJECT",
      object,
      objUri,
      objType: blockTypeFromUri(objUri),
      reason: "SYNC",
      timestamp: new Date(),
      requestId: "<server>",
    });
  }

  const response: GetResourceResponse = { objects };
  return res.status(200).json(response);
});

app.get("/api/projects", async (_, res) => {
  return res.status(200).json(projects);
});

app.get("/api/categories", async (_, res) => {
  return res.status(200).json(categories);
});

app.get("/api/types", async (_, res) => {
  const result: GetTypesResponse = { types: {} };

  const all = await getAllObjects();

  // find all the kblocks.io/v1/blocks objects
  for (const [objUri, object] of Object.entries(all) as [
    string,
    ApiObject & { spec: Manifest },
  ][]) {
    if (!objUri.startsWith("kblocks://kblocks.io/v1/blocks")) {
      continue;
    }

    const def = object.spec?.definition;
    if (!def) {
      console.warn(
        `block object ${objUri} has no definition:`,
        JSON.stringify(object),
      );
      continue;
    }

    const type = `${def.group}/${def.version}/${def.plural}`;
    result.types[type] = def;
  }

  return res.status(200).json(result);
});

app.get(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });

    const obj = await getObject(objUri);
    if (!obj) {
      return res.status(404).json({ error: `Block ${objUri} not found` });
    }

    return res.status(200).json(obj);
  },
);

app.get(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name/logs",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });
    const logs = (await loadEvents(objUri)).filter((e) => e.type === "LOG");
    return res.status(200).json({ objUri, logs } as GetLogsResponse);
  },
);

app.get(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name/events",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });
    const events = await loadEvents(objUri);
    return res.status(200).json({ objUri, events } as GetEventsResponse);
  },
);

app.post("/api/resources/:group/:version/:plural", async (req, res) => {
  const { group, version, plural } = req.params;
  const apiVersion = `${group}/${version}`;

  const system = req.query.system as string;
  if (!system) {
    return res
      .status(400)
      .json({ error: "'system' is required as a query param" });
  }

  const obj = req.body as ApiObject;

  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace: obj.metadata?.namespace ?? "default",
    name: obj.metadata?.name,
  });

  const objType = blockTypeFromUri(objUri);

  console.log("creating object:", JSON.stringify(obj));

  // patch the status and add a "Ready" condition indicating that the object is pending
  obj.status = {
    ...obj.status,

    conditions: [
      ...(obj.status?.conditions ?? []).filter((c) => c.type !== "Ready"),
      {
        type: "Ready",
        status: "False",
        reason: "Pending",
        message: "Pending",
        lastTransitionTime: new Date().toISOString(),
      },
    ],
  };

  // we are going to publish a synthetic OBJECT event to the event stream which will serve
  // as a placeholder for the object until it is actually created and the real OBJECT
  // event is published by the worker.
  await pubsub.publishEvent({
    type: "OBJECT",
    object: obj,
    objUri,
    objType,
    reason: "CREATE",
    timestamp: new Date(),
    requestId: "<server>",
  });

  sanitizeObject(obj);

  // verify that the request has the correct `apiVersion` and `kind`
  if (obj.apiVersion !== apiVersion) {
    return res.status(400).json({
      error: `Invalid "apiVersion" in object. Expected ${apiVersion}, but got ${obj.apiVersion}`,
    });
  }

  // verify that the request as a metadata.name
  if (!obj.metadata?.name) {
    return res
      .status(400)
      .json({ error: `Object is missing "metadata.name" field` });
  }

  await pubsub.publishControlRequest(
    { system, group, version, plural },
    {
      type: "APPLY",
      object: obj,
    },
  );

  return res.status(200).json({
    message: "Create request accepted",
    objType: `${group}/${version}/${plural}`,
    obj,
  });
});

app.patch(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });

    if (!system) {
      return res
        .status(400)
        .json({ error: "'system' is required as a query param" });
    }

    const obj = req.body as ApiObject;

    console.log("patching object:", JSON.stringify(obj));

    sanitizeObject(obj);

    pubsub.publishControlRequest(
      { system, group, version, plural },
      {
        type: "PATCH",
        objUri,
        object: obj,
      },
    );

    return res.status(200).json({
      message: "Patch request accepted",
      objType: `${group}/${version}/${plural}`,
      obj,
    });
  },
);

app.delete(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const force =
      req.query["force"] !== undefined && req.query["force"] !== "false";

    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });

    pubsub.publishControlRequest(
      { system, group, version, plural },
      {
        type: "DELETE",
        objUri,
      },
    );

    // if this is a kblocks.io/v1.Block object, we need to delete the object from storage
    if (force || objUri.startsWith("kblocks://kblocks.io/v1/blocks/")) {
      await deleteObject(objUri);
      return res.status(200).json({ message: `Block ${objUri} deleted` });
    }

    return res.status(200).json({ message: "Delete request accepted" });
  },
);

app.post(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name/read",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });

    if (!system) {
      return res
        .status(400)
        .json({ error: "'system' is required as a query param" });
    }

    console.log("reading object:", objUri);

    pubsub.publishControlRequest(
      { system, group, version, plural },
      {
        type: "READ",
        objUri,
      },
    );

    return res.status(200).json({
      message: "Read request accepted",
    });
  },
);

app.get("/api/auth/sign-in", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${WEBSITE_ORIGIN}/api/auth/callback/supabase`,
    },
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.redirect(data.url);
});

app.get("/api/auth/sign-out", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  await supabase.auth.signOut();
  return res.redirect("/");
});

app.get("/api/auth/reject", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  await supabase.auth.signOut();
  return res
    .status(200)
    .json({ error: "User is not whitelisted and was signed out" });
});

app.get("/api/auth/callback/supabase", async (req, res) => {
  const { error, error_description } = req.query;
  if (error) {
    console.error(
      `Supabase auth error: ${error}, Description: ${error_description}`,
    );
    return res.redirect(
      `${WEBSITE_ORIGIN}/auth-error?error=${error}&description=${error_description}`,
    );
  }

  const code = req.query.code?.toString();

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const supabase = createServerSupabase(req, res);
  const { error: supabaseError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (supabaseError) {
    return res.redirect(`${WEBSITE_ORIGIN}/auth-error?error=${supabaseError}`);
  }

  return res.redirect(303, `${WEBSITE_ORIGIN}/`);
});

app.get("/api/auth/callback/github", async (req, res) => {
  const code = req.query.code?.toString();
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const supabase = createServerSupabase(req, res);

  const user = await supabase.auth.getUser();
  if (user.error) {
    return res.redirect(
      `${WEBSITE_ORIGIN}/auth-error?error=${user.error.name}`,
    );
  }

  const tokens = await exchangeCodeForTokens(code.toString());
  if ("error" in tokens) {
    return res.redirect(
      `${WEBSITE_ORIGIN}/auth-error?error=${tokens.error.message}`,
    );
  }

  const { error } = await privateSupabase.from("user_ghtokens").upsert([
    {
      user_id: user.data.user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      refresh_token_expires_in: tokens.refresh_token_expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expires_at: new Date(
        new Date().getTime() + tokens.expires_in * 1000,
      ).toISOString(),
      refresh_token_expires_at: new Date(
        new Date().getTime() + tokens.refresh_token_expires_in * 1000,
      ).toISOString(),
    },
  ]);

  if (error) {
    console.error("supabase error", error);
    console.log("supabase error (log)", error);
    return res
      .status(500)
      .json({ message: "Server error (supabase)", error: { ...error } });
  }

  const next = (req.query.next ?? "/").toString();
  return res.redirect(303, `${WEBSITE_ORIGIN}/${next.slice(1)}`);
});

app.get("/api/github/installations", async (req, res) => {
  try {
    const octokit = await getUserOctokit(req, res);
    if (!octokit) {
      return res.status(200).json({
        githubAppInstalled: false,
        installations: [],
      });
    }
    const { data: installations } =
      await octokit.rest.apps.listInstallationsForAuthenticatedUser({
        page: 0,
        per_page: 100,
      });
    return res.status(200).json({
      githubAppInstalled: true,
      // @ts-ignore-error
      login: installations.installations[0]?.account?.login!,
      installations: installations.installations,
    });
  } catch (error) {
    console.error("error getting installations", error);
    if ((error as any).status === 401) {
      return res.redirect("/api/auth/sign-out");
    }
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/github/repositories", async (req, res) => {
  const installation_id = Number(req.query.installation_id?.toString());
  if (!installation_id) {
    return res.status(400).json({ error: "Installation ID is required" });
  }
  const octokit = await getUserOctokit(req, res);
  if (!octokit) {
    return res.status(401).json({ message: "User is not signed in" });
  }
  const { data: repositories } =
    await octokit.rest.apps.listInstallationReposForAuthenticatedUser({
      installation_id,
    });
  return res.status(200).json(repositories.repositories);
});

app.get("/api/user", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  const user = await supabase.auth.getUser();
  return res.status(200).json({ user: user.data.user } as GetUserResponse);
});

app.get("/api/users", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }

  return res.status(200).json(users.users);
});

app.post("/api/reset", async (req, res) => {
  if (req.query["password"] !== "kblocks4422") {
    return res.status(401).json({ error: "Invalid password" });
  }

  await resetStorage();
  return res.status(200).json({ message: "Storage reset" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/**
 * Clean up the object to remove fields that shouldn't be sent to apply requests.
 */
function sanitizeObject(obj: ApiObject) {
  const metadata: any = obj.metadata;
  if (metadata) {
    delete metadata.managedFields;
    delete metadata.generation;
    delete metadata.resourceVersion;
    delete metadata.uid;
    delete metadata.creationTimestamp;
    delete metadata.deletionTimestamp;
    delete metadata.deletionGracePeriodSeconds;
    delete metadata.ownerReferences;
    delete metadata.finalizers;
    delete metadata.generation;
  }

  delete obj.status;
}

export default app;
