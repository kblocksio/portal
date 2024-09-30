import { GetTypesResponse, ResourceType } from '@repo/shared';
import React, { createContext, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useFetch } from './hooks/use-fetch';
import { LogEvent, ObjectEvent, PatchEvent } from "@kblocks/cli/types/events";
import { ApiObject } from '@kblocks/cli/types';

const WS_URL = import.meta.env.VITE_WS_URL;
if (!WS_URL) {
  console.error('WebSocket URL is not set');
}

export type Resource = ApiObject & {
  objUri: string;
  objType: string;
};

export interface ResourceContextValue {
  resourceTypes: Record<string, ResourceType>;
  resources: Map<string, Map<string, Resource>>;
  logs: Map<string, Record<string, LogEvent>>;
  handleObjectMessages: (messages: ObjectEvent[]) => void;
  isLoading: boolean;
  selectedResource: Resource | undefined;
  setSelectedResource: (resource: Resource | undefined) => void;
}

export const ResourceContext = createContext<ResourceContextValue>({
  resourceTypes: {},
  resources: new Map<string, Map<string, Resource>>(),
  logs: new Map<string, Record<string, LogEvent>>(),
  handleObjectMessages: () => { },
  isLoading: true,
  selectedResource: undefined,
  setSelectedResource: () => { },
});

export const ResourceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [resourceTypes, setResourceTypes] = useState<Record<string, ResourceType>>({});
  const [resources, setResources] = useState<Map<string, Map<string, Resource>>>(new Map());
  const [logs, setLogs] = useState<Map<string, Record<string, LogEvent>>>(new Map());
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>(undefined);

  const { lastJsonMessage, getWebSocket } = useWebSocket<ObjectEvent | PatchEvent | LogEvent>(WS_URL, {
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
  const { data: initialResources, isLoading: isSyncInitialResourcesLoading } = useFetch<{ objects: ObjectMessage[] }>("/api/resources");


  useEffect(() => {
    if (resourceTypesData && resourceTypesData.types) {
      setResourceTypes(resourceTypesData.types);
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
    // console.log('handleObjectMessage', message);
    const { object, reason, objUri, objType } = message;
    switch (reason) {
      case 'CREATE':
      case 'SYNC':
      case 'UPDATE':
        setResources((prevResourcesForTypes) => {
          const resoucesForTypeMap = prevResourcesForTypes.get(objType) ?? new Map<string, Resource>();
          const newResourcesForTypeMap = new Map(resoucesForTypeMap);
          newResourcesForTypeMap.set(objUri, { ...object, objUri, objType } as Resource);
          const newResources = new Map(prevResourcesForTypes);
          newResources.set(objType, newResourcesForTypeMap);
          return newResources;
        });
        break;
      case 'DELETE':
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
        break;
      default:
        console.error('WebSocket Object Message unknown reason:', reason, object);
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
      default:
        console.warn('WebSocket unknown message type:', lastJsonMessage);
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
  }, []);

  const value: ResourceContextValue = {
    resourceTypes,
    resources,
    logs,
    handleObjectMessages,
    isLoading,
    selectedResource,
    setSelectedResource,
  };

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};
