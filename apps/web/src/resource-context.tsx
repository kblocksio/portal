import { Category } from "@repo/shared";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useWebSocket from "react-use-websocket";
import { useFetch } from "./hooks/use-fetch";
import {
  ObjectEvent,
  PatchEvent,
  ApiObject,
  WorkerEvent,
  parseBlockUri,
  Manifest,
  formatBlockUri,
} from "@kblocks/api";
import { toast } from "react-hot-toast"; // Add this import
import { request } from "./lib/backend";
import { urlForResource } from "./routes/resources.$group.$version.$plural.$system.$namespace.$name";
import { getIconComponent } from "./lib/get-icon";

const WS_URL = import.meta.env.VITE_WS_URL;
if (!WS_URL) {
  console.error("WebSocket URL is not set");
}

export type Resource = ApiObject & {
  objUri: string;
  objType: string;
};

export type SelectedResourceId = {
  objUri: string;
  objType: string;
};

type Definition = Manifest["definition"];

export interface ResourceType extends Definition {
  iconComponent: React.ComponentType<{ className?: string }>;
  engine: string;
}

type BlockApiObject = ApiObject & {
  spec: Manifest;
};

export type Relationship = {
  type: RelationshipType;
};

export enum RelationshipType {
  PARENT = "parent",
  CHILD = "child",
  REF = "ref",
}

export interface ResourceContextValue {
  // objType -> ResourceType
  resourceTypes: Record<string, ResourceType>;
  // objType -> objUri -> Resource
  resources: Map<string, Map<string, Resource>>;
  // objUri -> Record<timestamp, LogEvent>
  handleObjectMessages: (messages: ObjectEvent[]) => void;
  selectedResourceId: SelectedResourceId | undefined;
  setSelectedResourceId: (resourceId: SelectedResourceId | undefined) => void;
  objects: Record<string, Resource>;
  systems: string[];
  namespaces: string[];
  kinds: string[];
  eventsPerObject: Record<string, Record<string, WorkerEvent>>;
  loadEvents: (objUri: string) => void;
  categories: Record<string, Category>;
  relationships: Record<string, Record<string, Relationship>>;
}

export const ResourceContext = createContext<ResourceContextValue>({
  resourceTypes: {},
  resources: new Map<string, Map<string, Resource>>(),
  handleObjectMessages: () => {},
  selectedResourceId: undefined,
  setSelectedResourceId: () => {},
  objects: {},
  systems: [],
  namespaces: [],
  kinds: [],
  eventsPerObject: {},
  categories: {},
  loadEvents: () => {},
  relationships: {},
});

export const ResourceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [resourceTypes, setResourceTypes] = useState<
    Record<string, ResourceType>
  >({});
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [resources, setResources] = useState<
    Map<string, Map<string, Resource>>
  >(new Map());
  const [selectedResourceId, setSelectedResourceId] = useState<
    SelectedResourceId | undefined
  >(undefined);
  const [eventsPerObject, setEventsPerObject] = useState<
    Record<string, Record<string, WorkerEvent>>
  >({});
  const [relationships, setRelationships] = useState<
    Record<string, Record<string, Relationship>>
  >({});

  const { lastJsonMessage, getWebSocket } = useWebSocket<WorkerEvent>(WS_URL, {
    shouldReconnect: (closeEvent) => {
      console.log("WebSocket shouldReconnect...", closeEvent);
      return true;
    },
    onOpen: () => {
      console.log("WebSocket connected");
    },
    onClose: () => {
      console.log("WebSocket disconnected");
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
  });

  const { data: initialResources } = useFetch<{ objects: ObjectEvent[] }>(
    "/api/resources",
  );
  const { data: categoriesData } =
    useFetch<Record<string, Category>>("/api/categories");

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  const addType = useCallback((block: BlockApiObject) => {
    const key = `${block.spec.definition.group}/${block.spec.definition.version}/${block.spec.definition.plural}`;

    setResourceTypes((prev) => {
      return {
        ...prev,
        [key]: {
          ...block.spec.definition,
          engine: block.spec.engine,
          iconComponent: getIconComponent({ icon: block.spec.definition.icon }),
        },
      };
    });
  }, []);

  const deleteObject = useCallback((message: ObjectEvent) => {
    const { objUri, objType } = message;
    setResources((prev) => {
      const oldResourcesForType = prev.get(objType);
      if (!oldResourcesForType) {
        return prev;
      }

      const newResourcesForType = new Map(oldResourcesForType);
      newResourcesForType.delete(objUri);
      const newResources = new Map(prev);
      newResources.set(objType, newResourcesForType);
      return newResources;
    });
  }, []);

  const resolvePluralFromKind = useCallback(
    (kind: string) => {
      for (const def of Object.values(resourceTypes)) {
        if (def.kind === kind) {
          return def.plural;
        }
      }

      return kind.toLowerCase();
    },
    [resourceTypes],
  );

  useEffect(() => {
    setRelationships((prev) => {
      const updates: Record<string, Record<string, Relationship>> = {};

      for (const resourcesForType of resources.values()) {
        for (const r of resourcesForType.values()) {
          const refs: OwnerReference[] =
            (r.metadata as any)?.ownerReferences ?? [];
          if (refs.length === 0) {
            continue;
          }

          const childUri = r.objUri;
          const { system, namespace } = parseBlockUri(childUri);

          for (const ref of refs) {
            const [group, version] = ref.apiVersion.split("/");

            const plural = resolvePluralFromKind(ref.kind);
            const parentUri = formatBlockUri({
              group,
              version,
              system,
              namespace,
              plural,
              name: ref.name,
            });

            updates[childUri] = {
              ...(prev[childUri] ?? {}),
              [parentUri]: {
                type: RelationshipType.PARENT,
              },
            };

            updates[parentUri] = {
              ...(prev[parentUri] ?? {}),
              [childUri]: {
                type: RelationshipType.CHILD,
              },
            };
          }
        }
      }

      return {
        ...prev,
        ...updates,
      };
    });
  }, [resolvePluralFromKind, resources]);

  const handleObjectMessage = useCallback(
    (message: ObjectEvent) => {
      const { object, objUri, objType } = message;

      if (Object.keys(object).length === 0) {
        deleteObject(message);
        return;
      }

      if (objType === "kblocks.io/v1/blocks") {
        addType(object as BlockApiObject);
      }

      setResources((prevResourcesForTypes) => {
        const resoucesForTypeMap =
          prevResourcesForTypes.get(objType) ?? new Map<string, Resource>();
        const newResourcesForTypeMap = new Map(resoucesForTypeMap);
        const resource: Resource = {
          ...(object as ApiObject),
          objUri,
          objType,
        };

        newResourcesForTypeMap.set(objUri, resource);
        const newResources = new Map(prevResourcesForTypes);
        newResources.set(objType, newResourcesForTypeMap);
        return newResources;
      });
    },
    [addType, deleteObject],
  );

  const handleObjectMessages = useCallback(
    (messages: ObjectEvent[]) => {
      messages.forEach((message) => {
        handleObjectMessage(message);
      });
    },
    [handleObjectMessage],
  );

  const handlePatchMessage = useCallback((message: PatchEvent) => {
    const { objUri, objType, patch } = message;

    setResources((prevResourcesForTypes) => {
      const resoucesForTypeMap = prevResourcesForTypes.get(objType);
      if (!resoucesForTypeMap) {
        console.error(
          "WebSocket Patch Message unknown object type:",
          objType,
          patch,
        );
        return prevResourcesForTypes;
      }
      const oldObject = resoucesForTypeMap.get(objUri);
      if (!oldObject) {
        console.error("No existing object to patch", objType, objUri);
        return prevResourcesForTypes;
      }
      const newObject: Resource = { ...oldObject, ...patch };
      const newResourcesForTypeMap = new Map(resoucesForTypeMap);
      newResourcesForTypeMap.set(objUri, newObject);
      const newResources = new Map(prevResourcesForTypes);
      newResources.set(objType, newResourcesForTypeMap);
      return newResources;
    });
  }, []);

  useEffect(() => {
    if (!initialResources || !initialResources.objects) {
      return;
    }
    handleObjectMessages(initialResources.objects);
  }, [initialResources, handleObjectMessages]);

  const addEvent = (event: WorkerEvent) => {
    let timestamp = (event as any).timestamp ?? new Date();
    if (timestamp && typeof timestamp === "string") {
      timestamp = new Date(timestamp);
      event.timestamp = timestamp;
    }

    const eventKey = `${timestamp.toISOString()}.${event.objUri}`;

    // ignore OBJECT and PATCH events because they are handled by the respective handlers
    if (event.type === "OBJECT" || event.type === "PATCH") {
      return;
    }

    setEventsPerObject((eventsPerObject) => {
      return {
        ...eventsPerObject,
        [event.objUri]: {
          ...eventsPerObject[event.objUri],
          [eventKey]: event,
        },
      };
    });
  };

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    addEvent(lastJsonMessage);
    const blockUri = parseBlockUri(lastJsonMessage.objUri);

    switch (lastJsonMessage.type) {
      case "OBJECT":
        handleObjectMessage(lastJsonMessage as ObjectEvent);
        break;
      case "PATCH":
        handlePatchMessage(lastJsonMessage as PatchEvent);
        break;
      case "ERROR":
        toast.error(lastJsonMessage.message ?? "Unknown error", {
          id: urlForResource(blockUri),
        });
        break;
      case "LIFECYCLE":
        toast.success(`${blockUri.name}: ${lastJsonMessage.event.message}`, {
          duration: 2000,
          id: urlForResource(blockUri),
          icon: "",
        });
        break;
    }
  }, [lastJsonMessage, handleObjectMessage, handlePatchMessage]);

  // make sure to close the websocket when the component is unmounted
  useEffect(() => {
    return () => {
      console.log("Resource Context unmounted, closing websocket");
      const websocket = getWebSocket();
      if (websocket) {
        websocket.close();
      }
    };
  }, [getWebSocket]);

  const objects = useMemo(() => {
    const result: Record<string, Resource> = {};
    for (const resourcesForType of resources.values()) {
      for (const [objUri, resource] of resourcesForType.entries()) {
        result[objUri] = resource;
      }
    }
    return result;
  }, [resources]);

  const { systems, namespaces, kinds } = useMemo(() => {
    const systems = new Set<string>();
    const namespaces = new Set<string>();
    const kinds = new Set<string>();

    for (const resourcesForType of resources.values()) {
      for (const resource of resourcesForType.values()) {
        const { system, namespace } = parseBlockUri(resource.objUri);
        systems.add(system);
        namespaces.add(namespace);
        kinds.add(resource.kind);
      }
    }

    return {
      systems: Array.from(systems),
      namespaces: Array.from(namespaces),
      kinds: Array.from(kinds),
    };
  }, [resources]);

  const loadEvents = (objUri: string) => {
    const requests = [];

    const uri = parseBlockUri(objUri);

    const eventsUrl = `/api/resources/${uri.group}/${uri.version}/${uri.plural}/${uri.system}/${uri.namespace}/${uri.name}/events`;
    const fetchEvents = async () => {
      const response = await request("GET", eventsUrl);

      for (const event of response.events) {
        addEvent(event);
      }
    };

    requests.push(fetchEvents());

    Promise.all(requests).catch((e) => {
      console.error(e);
    });
  };

  const value: ResourceContextValue = {
    resourceTypes,
    objects,
    loadEvents,
    systems,
    namespaces,
    kinds,
    resources,
    eventsPerObject,
    handleObjectMessages,
    selectedResourceId,
    setSelectedResourceId,
    categories,
    relationships,
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};

export type OwnerReference = {
  apiVersion: string;
  kind: string;
  name: string;
  uid?: string;
  blockOwnerDeletion?: boolean;
  controller?: boolean;
};
