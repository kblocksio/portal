import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { LogLevel, LogMessage, Resource } from "@repo/shared"
import RightSideDrawer from "./ui/right-side-drawer"
import { LogsViewer } from "./logs-viewer"

export interface ResourceDetailsDrawerProps {
  resource?: Resource
  objType?: string
}

export const ResourceDetailsDrawer = ({ resource, objType }: ResourceDetailsDrawerProps) => {
  return (
    <RightSideDrawer>
      <div className="grid gap-6 py-6 w-[650px]">
        <div className="grid gap-2">
          <h4 className="text-lg font-medium">Properties</h4>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground">Account Type</div>
            <Badge variant="outline">Pro</Badge>
            <div className="text-sm font-medium text-muted-foreground">Storage</div>
            <div>50GB / 100GB</div>
            <div className="text-sm font-medium text-muted-foreground">Bandwidth</div>
            <div>500GB / 1TB</div>
          </div>
        </div>
        <div className="grid gap-2">
          <h4 className="text-lg font-medium">Activity Log</h4>
          <ScrollArea className="h-[300px] rounded-md border">
            <LogsViewer messages={Logs()} />
          </ScrollArea>
        </div>
      </div>
    </RightSideDrawer>
  )
}

const Logs = (): LogMessage[] => {
  return [
    {
      type: 'LOG',
      objUri: 'example-namespace',
      objType: 'Namespace',
      level: LogLevel.INFO,
      timestamp: 1716998400000,
      message: "Namespace 'example-namespace' created successfully."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-serviceaccount',
      objType: 'ServiceAccount',
      level: LogLevel.INFO,
      timestamp: 1716998410000,
      message: "ServiceAccount 'example-serviceaccount' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-configmap',
      objType: 'ConfigMap',
      level: LogLevel.ERROR,
      timestamp: 1727596820000,
      message: "ConfigMap 'example-configmap' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-secret',
      objType: 'Secret',
      level: LogLevel.INFO,
      timestamp: 1727596830000,
      message: "Secret 'example-secret' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-deployment',
      objType: 'Deployment',
      level: LogLevel.INFO,
      timestamp: 1727596840000,
      message: "Deployment 'example-deployment' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-service',
      objType: 'Service',
      level: LogLevel.INFO,
      timestamp: 1727596850000,
      message: "Service 'example-service' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-ingress',
      objType: 'Ingress',
      level: LogLevel.INFO,
      timestamp: 1727596860000,
      message: "Ingress 'example-ingress' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-pod-1',
      objType: 'Pod',
      level: LogLevel.INFO,
      timestamp: 1727596870000,
      message: "Pod 'example-pod-1' scheduled successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-pod-2',
      objType: 'Pod',
      level: LogLevel.ERROR,
      timestamp: 1727596880000,
      message: "Pod 'example-pod-2' scheduled successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-deployment',
      objType: 'Deployment',
      level: LogLevel.INFO,
      timestamp: 1727596890000,
      message: "Deployment 'example-deployment' successfully scaled to 2 replicas."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-serviceaccount',
      objType: 'ServiceAccount',
      level: LogLevel.INFO,
      timestamp: 1716998410000,
      message: "ServiceAccount 'example-serviceaccount' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-configmap',
      objType: 'ConfigMap',
      level: LogLevel.ERROR,
      timestamp: 1727596820000,
      message: "ConfigMap 'example-configmap' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-secret',
      objType: 'Secret',
      level: LogLevel.INFO,
      timestamp: 1727596830000,
      message: "Secret 'example-secret' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-deployment',
      objType: 'Deployment',
      level: LogLevel.INFO,
      timestamp: 1727596840000,
      message: "Deployment 'example-deployment' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-service',
      objType: 'Service',
      level: LogLevel.INFO,
      timestamp: 1727596850000,
      message: "Service 'example-service' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-ingress',
      objType: 'Ingress',
      level: LogLevel.INFO,
      timestamp: 1727596860000,
      message: "Ingress 'example-ingress' created successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-pod-1',
      objType: 'Pod',
      level: LogLevel.INFO,
      timestamp: 1727596870000,
      message: "Pod 'example-pod-1' scheduled successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-pod-2',
      objType: 'Pod',
      level: LogLevel.ERROR,
      timestamp: 1727596880000,
      message: "Pod 'example-pod-2' scheduled successfully in 'example-namespace'."
    },
    {
      type: 'LOG',
      objUri: 'example-namespace/example-deployment',
      objType: 'Deployment',
      level: LogLevel.INFO,
      timestamp: 1727596890000,
      message: "Deployment 'example-deployment' successfully scaled to 2 replicas."
    }
  ];
};