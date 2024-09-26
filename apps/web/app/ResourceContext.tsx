import { Resource } from '@repo/shared';
import React, { createContext, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

type ObjectMessage = {
  type: 'OBJECT';
  object: any;
  reason: 'CREATE' | 'DELETE' | 'SYNC' | 'UPDATE';
  objUri: string;
  objType: string;
};

type PatchMessage = {
  type: 'PATCH';
  patch: any;
  objUri: string;
  objType: string;
};

const WS_URL = import.meta.env.VITE_WS_URL;
if (!WS_URL) {
  console.error('WebSocket URL is not set');
}

export interface ResourceContextValue {
  resources: Map<string, Map<string, Resource>>;
  handleObjectMessages: (messages: ObjectMessage[]) => void;
}

export const ResourceContext = createContext<ResourceContextValue>({
  resources: new Map<string, Map<string, Resource>>(),
  handleObjectMessages: () => { },
});

export const ResourceProvider = ({ children }: { children: React.ReactNode }) => {
  const [resources, setResources] = useState<Map<string, Map<string, Resource>>>(new Map());
  const { lastJsonMessage, getWebSocket } = useWebSocket<ObjectMessage | PatchMessage>(WS_URL, {
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

  const handleObjectMessage = (message: ObjectMessage) => {
    console.log('handleObjectMessage', message);
    const { object, reason, objUri, objType } = message;
    switch (reason) {
      case 'CREATE':
      case 'SYNC':
      case 'UPDATE':
        setResources((prevResourcesForTypes) => {
          const resoucesForTypeMap = prevResourcesForTypes.get(objType) || new Map<string, Resource>();
          const newResourcesForTypeMap = new Map(resoucesForTypeMap);
          newResourcesForTypeMap.set(objUri, object);
          const newResources = new Map(prevResourcesForTypes);
          newResources.set(objType, newResourcesForTypeMap);
          return newResources;
        });
        break;
      case 'DELETE':
        setResources((prevResourcesForTypes) => {
          const resoucesForTypeMap = prevResourcesForTypes.get(objType);
          if (!resoucesForTypeMap) {
            console.error('WebSocket Object Message unknown object type:', objType, object);
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
        console.error('WebSocket Object Message unknown reason:', reason);
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

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    if (lastJsonMessage.type === 'OBJECT') {
      handleObjectMessage(lastJsonMessage as ObjectMessage);
    } else if (lastJsonMessage.type === 'PATCH') {
      handlePatchMessage(lastJsonMessage as PatchMessage);
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
    resources,
    handleObjectMessages,
  };

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};
