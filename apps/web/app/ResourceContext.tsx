import { GetTypesResponse, LogMessage, ObjectMessage, PatchMessage, Resource, ResourceType } from '@repo/shared';
import React, { createContext, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useFetch } from './hooks/use-fetch';

const WS_URL = import.meta.env.VITE_WS_URL;
if (!WS_URL) {
  console.error('WebSocket URL is not set');
}

export interface ResourceContextValue {
  resourceTypes: Record<string, ResourceType>;
  resources: Map<string, Map<string, Resource>>;
  resourcesLogs: Map<string, Map<string, LogMessage[]>>;
  handleObjectMessages: (messages: ObjectMessage[]) => void;
  isLoading: boolean;
}

export const ResourceContext = createContext<ResourceContextValue>({
  resourceTypes: {},
  resources: new Map<string, Map<string, Resource>>(),
  resourcesLogs: new Map<string, Map<string, LogMessage[]>>(),
  handleObjectMessages: () => { },
  isLoading: true,
});

export const ResourceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [resourceTypes, setResourceTypes] = useState<Record<string, ResourceType>>({});
  const [resources, setResources] = useState<Map<string, Map<string, Resource>>>(new Map());
  const [resourcesLogs, setResourcesLogs] = useState<Map<string, Map<string, LogMessage[]>>>(new Map());
  const { lastJsonMessage, getWebSocket } = useWebSocket<ObjectMessage | PatchMessage | LogMessage>(WS_URL, {
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

  const handleObjectMessage = (message: ObjectMessage) => {
    console.log('handleObjectMessage', message);
    const { object, reason, objUri, objType } = message;
    switch (reason) {
      case 'CREATE':
      case 'SYNC':
      case 'UPDATE':
        setResources((prevResourcesForTypes) => {
          const resoucesForTypeMap = prevResourcesForTypes.get(objType) ?? new Map<string, Resource>();
          const newResourcesForTypeMap = new Map(resoucesForTypeMap);
          newResourcesForTypeMap.set(objUri, { ...object, objUri });
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

  const handleObjectMessages = (messages: ObjectMessage[]) => {
    messages.forEach((message) => {
      handleObjectMessage(message);
    });
  };

  const handlePatchMessage = (message: PatchMessage) => {
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

  const handleLogMessage = (message: LogMessage) => {
    console.log('handleLogMessage', message);
    const { objType, objUri } = message;
    setResourcesLogs((prevResourcesLogs) => {
      const resoucesLogsForTypeMap = prevResourcesLogs.get(objType) || new Map<string, LogMessage[]>();
      const newResourcesLogsForTypeMap = new Map(resoucesLogsForTypeMap);
      // add the message to the existing messages for this resource
      const existingMessages = newResourcesLogsForTypeMap.get(objUri) || [];
      existingMessages.push(message);
      newResourcesLogsForTypeMap.set(objUri, existingMessages);
      const newResourcesLogs = new Map(prevResourcesLogs);
      newResourcesLogs.set(objType, newResourcesLogsForTypeMap);
      return newResourcesLogs;
    });
  };


  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }
    switch (lastJsonMessage.type) {
      case 'OBJECT':
        handleObjectMessage(lastJsonMessage as ObjectMessage);
        break;
      case 'PATCH':
        handlePatchMessage(lastJsonMessage as PatchMessage);
        break;
      case 'LOG':
        handleLogMessage(lastJsonMessage as LogMessage);
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
    resourcesLogs,
    handleObjectMessages,
    isLoading,
  };

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};
