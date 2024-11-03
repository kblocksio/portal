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
} from "@kblocks/api";
import { request } from "./lib/backend";
import { getIconComponent } from "./lib/hero-icon";
import { urlForResource } from "./routes/resources.$group.$version.$plural.$system.$namespace.$name";
import { NotificationsContext } from "./notifications-context";

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

  const handleObjectMessage = useCallback((message: ObjectEvent) => {
    const { object, objUri, objType } = message;

    if (objType === "kblocks.io/v1/blocks") {
      const block = object as BlockApiObject;
      const key = `${block.spec.definition.group}/${block.spec.definition.version}/${block.spec.definition.plural}`;
      setResourceTypes((prev) => {
        return {
          ...prev,
          [key]: {
            ...block.spec.definition,
            engine: block.spec.engine,
            iconComponent: getIconComponent({
              icon: block.spec.definition.icon,
            }),
          },
        };
      });
    }

    if (Object.keys(object).length > 0) {
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

  const handlePatchMessage = (message: PatchEvent) => {
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
  };

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
    if (!lastJsonMessage) {
      return;
    }

    console.log("event:", lastJsonMessage);

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
  }, [lastJsonMessage]);

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
        console.warn(`unable to fetch events for ${objUri}: ${e.message}`);
      });
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
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};
