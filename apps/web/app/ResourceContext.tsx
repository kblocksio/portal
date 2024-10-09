import { GetTypesResponse, ResourceType } from '@repo/shared';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useFetch } from './hooks/use-fetch';
import { LogEvent, ObjectEvent, PatchEvent, ApiObject, WorkerEvent, parseBlockUri } from "@kblocks/api";
import { toast } from 'react-hot-toast'; // Add this import

const WS_URL = import.meta.env.VITE_WS_URL;
if (!WS_URL) {
  console.error('WebSocket URL is not set');
}

export type Resource = ApiObject & {
  objUri: string;
  objType: string;
};

export type SelectedResourceId = {
  objUri: string;
  objType: string;
};

export interface ResourceContextValue {
  objects: Record<string, Resource>;
  systems: string[];
  namespaces: string[];
  // objType -> ResourceType
  resourceTypes: Record<string, ResourceType>;
  // objType -> objUri -> Resource
  resources: Map<string, Map<string, Resource>>;
  // objUri -> Record<timestamp, LogEvent>
  logs: Map<string, Record<string, LogEvent>>;
  handleObjectMessages: (messages: ObjectEvent[]) => void;
  isLoading: boolean;
  selectedResourceId: SelectedResourceId | undefined;
  setSelectedResourceId: (resourceId: SelectedResourceId | undefined) => void;
}

export const ResourceContext = createContext<ResourceContextValue>({
  resourceTypes: {},
  systems: [],
  namespaces: [],
  objects: {},
  resources: new Map<string, Map<string, Resource>>(),
  logs: new Map<string, Record<string, LogEvent>>(),
  handleObjectMessages: () => { },
  isLoading: true,
  selectedResourceId: undefined,
  setSelectedResourceId: () => { },
});

export const ResourceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [resourceTypes, setResourceTypes] = useState<Record<string, ResourceType>>({});
  const [resources, setResources] = useState<Map<string, Map<string, Resource>>>(new Map());
  const [logs, setLogs] = useState<Map<string, Record<string, LogEvent>>>(new Map());
  const [selectedResourceId, setSelectedResourceId] = useState<SelectedResourceId | undefined>(undefined);

  const { lastJsonMessage, getWebSocket } = useWebSocket<WorkerEvent>(WS_URL, {
    shouldReconnect: (closeEvent) => {
      console.log('WebSocket shouldReconnect...', closeEvent);
      return true;
    },
    onOpen: () => {
      console.log('WebSocket connected');
    },
    onClose: () => {
      console.log('WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  const { data: resourceTypesData, isLoading: isResourceTypesLoading } = useFetch<GetTypesResponse>("/api/types");
  const { data: initialResources, isLoading: isSyncInitialResourcesLoading } = useFetch<{ objects: ObjectEvent[] }>("/api/resources");

  useEffect(() => {
    if (resourceTypesData && resourceTypesData.types) {
      console.log("resourceTypesData", resourceTypesData);
      const result: Record<string, ResourceType> = {};
      for (const [k, v] of Object.entries(resourceTypesData.types).sort(([l], [r]) => l.localeCompare(r))) {
        if (!k.startsWith("acme.com/v1")) {
          continue;
        }

        result[k] = v;
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
        const resoucesForTypeMap = prevResourcesForTypes.get(objType) ?? new Map<string, Resource>();
        const newResourcesForTypeMap = new Map(resoucesForTypeMap);
        newResourcesForTypeMap.set(objUri, { ...object, objUri, objType } as Resource);
        const newResources = new Map(prevResourcesForTypes);
        newResources.set(objType, newResourcesForTypeMap);
        return newResources;
      });
    } else {
      setResources((prevResourcesForTypes) => {
        const resoucesForTypeMap = prevResourcesForTypes.get(objType);
        if (!resoucesForTypeMap) {
          console.error('WebSocket Object Message unknown object type:', objType, object, prevResourcesForTypes);
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
    console.log('handlePatchMessage', message);
    const { objUri, objType, patch } = message;
    setResources((prevResourcesForTypes) => {
      const resoucesForTypeMap = prevResourcesForTypes.get(objType);
      if (!resoucesForTypeMap) {
        console.error('WebSocket Patch Message unknown object type:', objType, patch);
        return prevResourcesForTypes;
      }
      const oldObject = resoucesForTypeMap.get(objUri);
      if (!oldObject) {
        console.error('No existing object to patch', objType, objUri);
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

  const handleLogMessage = (message: LogEvent) => {
    const { objUri } = message;
    setLogs((prevLogs) => {
      const copy = new Map(prevLogs);
      const existingMessages = copy.get(objUri) ?? {};
      existingMessages[message.timestamp] = message;

      console.log(`new log message for ${objUri} at ${message.timestamp}:`, message);

      copy.set(objUri, existingMessages);

      console.log('updated logs:', copy);

      return copy;
    });
  };

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }
    switch (lastJsonMessage.type) {
      case 'OBJECT':
        handleObjectMessage(lastJsonMessage as ObjectEvent);
        break;
      case 'PATCH':
        handlePatchMessage(lastJsonMessage as PatchEvent);
        break;
      case 'LOG':
        handleLogMessage(lastJsonMessage as LogEvent);
        break;
      case 'ERROR':
        toast.error((lastJsonMessage as any).message || 'Unknown error');
        break;
      default:
        console.warn('WebSocket unknown message type:', lastJsonMessage);
      // toast.warn(lastJsonMessage.type);
    }
  }, [lastJsonMessage]);

  // make sure to close the websocket when the component is unmounted
  useEffect(() => {
    return () => {
      console.log('Resource Context unmounted, closing websocket');
      const websocket = getWebSocket();
      if (websocket) {
        websocket.close();
      }
    };
  }, [getWebSocket]);

  const { objects, systems, namespaces } = useMemo(() => {
    const result: Record<string, Resource> = {};
    const systems = new Set<string>();
    const namespaces = new Set<string>();

    for (const resourcesForType of resources.values()) {
      for (const resource of resourcesForType.values()) {
        result[resource.objUri] = resource;


        const { system, namespace } = parseBlockUri(resource.objUri);
        systems.add(system);
        namespaces.add(namespace);
      }
    }

    console.log('systems', systems);
    return { objects: result, systems: Array.from(systems), namespaces: Array.from(namespaces) };
  }, [resources]);  

  const value: ResourceContextValue = {
    objects,
    systems,
    namespaces,
    resourceTypes,
    resources,
    logs,
    handleObjectMessages,
    isLoading,
    selectedResourceId,
    setSelectedResourceId,
  };

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};
