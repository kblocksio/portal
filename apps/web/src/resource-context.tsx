import { Category } from "@repo/shared";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useWebSocket from "react-use-websocket";
import Emittery from "emittery";
import { useFetch } from "./hooks/use-fetch";
import {
  ObjectEvent,
  PatchEvent,
  ErrorEvent,
  ApiObject,
  WorkerEvent,
  parseBlockUri,
  Manifest,
  formatBlockUri,
  BlockUriComponents,
  type LogEvent,
  type LifecycleEvent,
} from "@kblocks/api";
import { isEqual } from "lodash";
import { request } from "./lib/backend";
import { NotificationsContext } from "./notifications-context";
import { getIconComponent } from "./lib/get-icon";

const WS_URL = import.meta.env.VITE_WS_URL;

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

  // which systems support this resource type
  systems: Set<string>;
}

type BlockApiObject = ApiObject & {
  spec: Manifest;
};

export type Relationship = {
  type: "parent" | "child" | "ref";
};

export interface ResourceContextValue {
  // objType -> ResourceType
  resourceTypes: Record<string, ResourceType>;
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
  projects: Array<Project>;
  clusters: Array<Cluster>;
  emitter: Emittery;
}

export type Project = Resource & {
  description?: string;
  objects?: string[];
  icon?: string;
  title?: string;
};

export type Cluster = Resource & {
  backendUrl?: string;
  apiKey?: string;
  id?: string;
  description?: string;
  icon?: string;
  access?: "read_only" | "read_write";
};

export const ResourceContext = createContext<ResourceContextValue>({
  resourceTypes: {},
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
  projects: [],
  clusters: [],
  emitter: new Emittery(),
});

export function urlForResource(blockUri: BlockUriComponents) {
  return `/resources/${blockUri.group}/${blockUri.version}/${blockUri.plural}/${blockUri.system}/${blockUri.namespace}/${blockUri.name}`;
}

export const ResourceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { addNotifications } = useContext(NotificationsContext);
  const [resourceTypes, setResourceTypes] = useState<
    Record<string, ResourceType>
  >({});
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [objects, setObjects] = useState<Record<string, Resource>>({});
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
      console.error("WebSocket Error:", error);
    },
  });

  const [previousMessage, setPreviousMessage] = useState<
    WorkerEvent | undefined
  >(undefined);

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

  const resolveOwnerUri = useCallback(
    (ref: OwnerReference, system: string, namespace: string) => {
      const [group, version] = ref.apiVersion.split("/");
      const plural = resolvePluralFromKind(ref.kind);
      return formatBlockUri({
        group,
        version,
        system,
        namespace,
        plural,
        name: ref.name,
      });
    },
    [resolvePluralFromKind],
  );

  const handleObjectMessage = useCallback((message: ObjectEvent) => {
    const { object, objUri, objType } = message;
    const { system } = parseBlockUri(objUri);

    // ignore object messages that don't have metadata (don't skip is object is empty - it means the object was deleted)
    if (
      object &&
      Object.keys(object).length > 0 &&
      !(object as ApiObject)?.metadata
    ) {
      return;
    }

    if (objType === "kblocks.io/v1/blocks") {
      const block = object as BlockApiObject;
      const key = `${block.spec.definition.group}/${block.spec.definition.version}/${block.spec.definition.plural}`;

      setResourceTypes((prev) => {
        const systems = prev[key]?.systems ?? new Set();
        systems.add(system);

        return {
          ...prev,
          [key]: {
            ...block.spec.definition,
            engine: block.spec.engine,
            iconComponent: getIconComponent({
              icon: block.spec.definition.icon,
            }),
            systems,
          },
        };
      });
    }

    // add the object to the list of objects
    if (Object.keys(object).length > 0) {
      // load the events for the object
      loadEvents(objUri);
      setObjects((prev) => {
        const r: Resource = {
          ...(object as ApiObject),
          objUri,
          objType,
        };

        return {
          ...prev,
          [objUri]: r,
        };
      });
      // delete the object from the list of objects
    } else {
      setObjects((prev) => {
        const newObjects = { ...prev };
        delete newObjects[objUri];
        return newObjects;
      });
    }
  }, []);

  const handleObjectMessages = useCallback(
    (messages: ObjectEvent[]) => {
      messages.forEach((message) => {
        handleObjectMessage(message);
      });
    },
    [handleObjectMessage],
  );

  useEffect(() => {
    if (!initialResources || !initialResources.objects) {
      return;
    }
    handleObjectMessages(initialResources.objects);
  }, [initialResources, handleObjectMessages]);

  useEffect(() => {
    setRelationships((prev) => {
      for (const r of Object.values(objects)) {
        const refs: OwnerReference[] = r.metadata?.ownerReferences ?? [];
        if (refs.length === 0) {
          continue;
        }

        const childUri = r.objUri;
        const { system, namespace } = parseBlockUri(childUri);

        for (const ref of refs) {
          const parentUri = resolveOwnerUri(ref, system, namespace);

          prev[childUri] = {
            ...(prev[childUri] ?? {}),
            [parentUri]: {
              type: "parent",
            },
          };

          prev[parentUri] = {
            ...(prev[parentUri] ?? {}),
            [childUri]: {
              type: "child",
            },
          };
        }
      }

      // DO NOT REMOVE!!
      // Here we use the spread syntax to shallow copy the relationships object.
      // This is necessary to trigger a re-render.
      return { ...prev };
    });
  }, [resolvePluralFromKind, objects, resolveOwnerUri]);

  const handlePatchMessage = useCallback((message: PatchEvent) => {
    const { objUri, patch } = message;

    setObjects((prev) => {
      if (!prev[objUri]) {
        return prev;
      }

      const newObject = { ...prev[objUri], ...patch };
      return {
        ...prev,
        [objUri]: newObject,
      };
    });
  }, []);

  const addEvent = useCallback((event: WorkerEvent) => {
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
  }, []);

  useEffect(() => {
    if (!lastJsonMessage || isEqual(lastJsonMessage, previousMessage)) {
      return;
    }

    setPreviousMessage(lastJsonMessage);
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
        addNotifications([
          {
            id: urlForResource(blockUri),
            message: lastJsonMessage.message ?? "Unknown error",
            type: "error",
          },
        ]);
        break;
      case "LIFECYCLE":
        addNotifications([
          {
            id: urlForResource(blockUri),
            message: `${blockUri.name}: ${lastJsonMessage.event.message}`,
            type: "success",
          },
        ]);
        break;
    }
  }, [
    lastJsonMessage,
    handleObjectMessage,
    handlePatchMessage,
    addNotifications,
    addEvent,
    previousMessage,
  ]);

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

  const { systems, namespaces, kinds } = useMemo(() => {
    const systems = new Set<string>();
    const namespaces = new Set<string>();
    const kinds = new Set<string>();

    for (const obj of Object.values(objects)) {
      const { system, namespace } = parseBlockUri(obj.objUri);
      systems.add(system);
      namespaces.add(namespace);
      kinds.add(obj.kind);
    }

    return {
      systems: Array.from(systems),
      namespaces: Array.from(namespaces),
      kinds: Array.from(kinds),
    };
  }, [objects]);

  const [emitter] = useState(() => new Emittery());

  const loadEvents = useCallback(
    (objUri: string) => {
      emitter.emit(`loadEvents:${objUri}`, objUri);
    },
    [emitter],
  );

  const projects = useMemo(() => {
    return Object.values(objects).filter(
      (obj) => obj.objType === "kblocks.io/v1/projects",
    );
  }, [objects]);

  const clusters = useMemo(() => {
    return Object.values(objects).filter(
      (obj) => obj.objType === "kblocks.io/v1/clusters",
    );
  }, [objects]);

  const value: ResourceContextValue = {
    resourceTypes,
    objects,
    projects,
    clusters,
    loadEvents,
    systems,
    namespaces,
    kinds,
    eventsPerObject,
    handleObjectMessages,
    selectedResourceId,
    setSelectedResourceId,
    categories,
    relationships,
    emitter,
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

export type WorkerEventTimestampString = {
  timestamp: string;
} & (
  | Omit<ObjectEvent, "timestamp">
  | Omit<LogEvent, "timestamp">
  | Omit<LifecycleEvent, "timestamp">
  | Omit<ErrorEvent, "timestamp">
);

export const useObjectEvents = (
  objUri: string,
  callback: (events: WorkerEventTimestampString[]) => void,
) => {
  const { emitter } = useContext(ResourceContext);

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const eventsUrl = useMemo(() => {
    const uri = parseBlockUri(objUri);
    return `/api/resources/${uri.group}/${uri.version}/${uri.plural}/${uri.system}/${uri.namespace}/${uri.name}/events`;
  }, [objUri]);

  const fetchEvents = useCallback(async () => {
    const response = await request("GET", eventsUrl);

    callbackRef.current(response.events);
  }, [eventsUrl]);

  useEffect(() => {
    fetchEvents();
    const unsubscribe = emitter.on(`loadEvents:${objUri}`, async () => {
      fetchEvents();
    });
    return () => {
      unsubscribe();
    };
  }, [emitter, eventsUrl, fetchEvents, objUri]);
};
