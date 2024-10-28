import { GetTypesResponse } from "@repo/shared";
import React, { createContext, useEffect, useMemo, useState } from "react";
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
import { toast } from "react-hot-toast"; // Add this import
import { request } from "./lib/backend";
import { getIconComponent } from "./lib/hero-icon";
import { urlForResource } from "./routes/resources.$group.$version.$plural.$system.$namespace.$name";

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
}

export interface ResourceContextValue {
  // objType -> ResourceType
  resourceTypes: Record<string, ResourceType>;
  // objType -> objUri -> Resource
  resources: Map<string, Map<string, Resource>>;
  // objUri -> Record<timestamp, LogEvent>
  handleObjectMessages: (messages: ObjectEvent[]) => void;
  isLoading: boolean;
  selectedResourceId: SelectedResourceId | undefined;
  setSelectedResourceId: (resourceId: SelectedResourceId | undefined) => void;
  objects: Record<string, Resource>;
  systems: string[];
  namespaces: string[];
  eventsPerObject: Record<string, Record<string, WorkerEvent>>;
}

export const ResourceContext = createContext<ResourceContextValue>({
  resourceTypes: {},
  resources: new Map<string, Map<string, Resource>>(),
  handleObjectMessages: () => {},
  isLoading: true,
  selectedResourceId: undefined,
  setSelectedResourceId: () => {},
  objects: {},
  systems: [],
  namespaces: [],
  eventsPerObject: {},
});

export const ResourceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [resourceTypes, setResourceTypes] = useState<
    Record<string, ResourceType>
  >({});
  const [resources, setResources] = useState<
    Map<string, Map<string, Resource>>
  >(new Map());
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

  const { data: resourceTypesData, isLoading: isResourceTypesLoading } =
    useFetch<GetTypesResponse>("/api/types");
  const { data: initialResources, isLoading: isSyncInitialResourcesLoading } =
    useFetch<{ objects: ObjectEvent[] }>("/api/resources");

  useEffect(() => {
    if (resourceTypesData && resourceTypesData.types) {
      const result: Record<string, ResourceType> = {};
      for (const [k, v] of Object.entries(resourceTypesData.types).sort(
        ([l], [r]) => l.localeCompare(r),
      )) {
        if (k.startsWith("kblocks.io/v1")) {
          continue;
        }

        result[k] = {
          ...v,
          iconComponent: getIconComponent({ icon: v.icon ?? "CircleDotIcon" }),
        };
      }

      setResourceTypes(result);
    }
  }, [resourceTypesData]);

  useEffect(() => {
    if (!initialResources || !initialResources.objects) {
      return;
    }
    handleObjectMessages(initialResources.objects);
  }, [initialResources]);

  useEffect(() => {
    if (!isResourceTypesLoading && !isSyncInitialResourcesLoading) {
      setIsLoading(false);
    }
  }, [isResourceTypesLoading, isSyncInitialResourcesLoading]);

  const handleObjectMessage = (message: ObjectEvent) => {
    const { object, objUri, objType } = message;

    if (Object.keys(object).length > 0) {
      setResources((prevResourcesForTypes) => {
        const resoucesForTypeMap =
          prevResourcesForTypes.get(objType) ?? new Map<string, Resource>();
        const newResourcesForTypeMap = new Map(resoucesForTypeMap);
        newResourcesForTypeMap.set(objUri, {
          ...object,
          objUri,
          objType,
        } as Resource);
        const newResources = new Map(prevResourcesForTypes);
        newResources.set(objType, newResourcesForTypeMap);
        return newResources;
      });
    } else {
      setResources((prevResourcesForTypes) => {
        const resoucesForTypeMap = prevResourcesForTypes.get(objType);
        if (!resoucesForTypeMap) {
          console.error(
            "WebSocket Object Message unknown object type:",
            objType,
            object,
            prevResourcesForTypes,
          );
          return prevResourcesForTypes;
        }

        const newResourcesForTypeMap = new Map(resoucesForTypeMap);
        newResourcesForTypeMap.delete(objUri);
        const newResources = new Map(prevResourcesForTypes);
        newResources.set(objType, newResourcesForTypeMap);
        return newResources;
      });
    }
  };

  const handleObjectMessages = (messages: ObjectEvent[]) => {
    messages.forEach((message) => {
      handleObjectMessage(message);
    });
  };

  const handlePatchMessage = (message: PatchEvent) => {
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
      const newObject = { ...oldObject, ...patch };
      const newResourcesForTypeMap = new Map(resoucesForTypeMap);
      newResourcesForTypeMap.set(objUri, newObject);
      const newResources = new Map(prevResourcesForTypes);
      newResources.set(objType, newResourcesForTypeMap);
      return newResources;
    });
  };

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

  const objects = useMemo(() => {
    const result: Record<string, Resource> = {};
    for (const resourcesForType of resources.values()) {
      for (const [objUri, resource] of resourcesForType.entries()) {
        result[objUri] = resource;
      }
    }
    return result;
  }, [resources]);

  const { systems, namespaces } = useMemo(() => {
    const systems = new Set<string>();
    const namespaces = new Set<string>();

    for (const resourcesForType of resources.values()) {
      for (const resource of resourcesForType.values()) {
        const { system, namespace } = parseBlockUri(resource.objUri);
        systems.add(system);
        namespaces.add(namespace);
      }
    }

    return { systems: Array.from(systems), namespaces: Array.from(namespaces) };
  }, [resources]);

  // initial fetch of events
  useEffect(() => {
    const requests = [];

    for (const obj of Object.values(objects)) {
      const uri = parseBlockUri(obj.objUri);

      const eventsUrl = `/api/resources/${uri.group}/${uri.version}/${uri.plural}/${uri.system}/${uri.namespace}/${uri.name}/events`;
      const fetchEvents = async () => {
        const response = await request("GET", eventsUrl);

        for (const event of response.events) {
          addEvent(event);
        }
      };

      requests.push(fetchEvents());
    }

    Promise.all(requests).catch((e) => {
      console.error(e);
    });
  }, [objects]);

  const value: ResourceContextValue = {
    resourceTypes,
    objects,
    systems,
    namespaces,
    resources,
    eventsPerObject,
    handleObjectMessages,
    isLoading,
    selectedResourceId,
    setSelectedResourceId,
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};
