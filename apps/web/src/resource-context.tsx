import { Category } from "@repo/shared";
import React, {
  createContext,
  useCallback,
  useContext,
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
import { isEqual } from "lodash";
import { request } from "./lib/backend";
import { urlForResource } from "./routes/resources.$group.$version.$plural.$system.$namespace.$name";
import { NotificationsContext } from "./notifications-context";
import { getIconComponent } from "./lib/get-icon";
const WS_URL = `wss://${import.meta.env.VITE_BACKEND_ENDPOINT}/api/events`;
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
}

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
});

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
    }
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

    if (!(object as ApiObject)?.metadata) {
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

      return prev;
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

    console.log("new event:", lastJsonMessage);
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

  const loadEvents = useCallback(
    (objUri: string) => {
      const uri = parseBlockUri(objUri);
      const eventsUrl = `/api/resources/${uri.group}/${uri.version}/${uri.plural}/${uri.system}/${uri.namespace}/${uri.name}/events`;
      const fetchEvents = async () => {
        const response = await request("GET", eventsUrl);

        for (const event of response.events) {
          addEvent(event);
        }
      };
      fetchEvents();
    },
    [addEvent],
  );

  const value: ResourceContextValue = {
    resourceTypes,
    objects,
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
