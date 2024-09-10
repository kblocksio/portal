import { useState } from "react";
import { ChevronDown, ChevronUp, Box, Tag, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const BalancedBadge = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <span className={`px-2 py-1 rounded-full ${color} text-xs font-semibold`}>
    {children}
  </span>
);

interface IManagedFieldsEntry {
  apiVersion?: string;
  fieldsType?: string;
  time?: string;
  [key: string]: unknown;
}

interface IOwnerReference {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
  blockOwnerDeletion?: boolean;
  controller?: boolean;
}

interface IObjectMeta {
  annotations?: Record<string, string>;
  creationTimestamp?: string;
  deletionGracePeriodSeconds?: number;
  deletionTimestamp?: string;
  finalizers?: string[];
  generateName?: string;
  generation?: number;
  labels?: Record<string, string>;
  managedFields?: IManagedFieldsEntry[];
  name?: string;
  namespace?: string;
  ownerReferences?: IOwnerReference[];
  resourceVersion?: string;
  selfLink?: string;
  uid?: string;
}

interface IContainerState {
  state?: Record<string, unknown>;
  [key: string]: unknown;
}

interface IContainerStatus {
  name: string;
  image: string;
  ready: boolean;
  restartCount: number;
  state?: IContainerState;
  [key: string]: unknown;
}

interface IPodCondition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastProbeTime?: string;
  lastTransitionTime?: string;
}

interface IPodStatus {
  hostIP?: string;
  phase?: string;
  podIP?: string;
  startTime?: string;
  conditions?: IPodCondition[];
  containerStatuses?: IContainerStatus[];
}

interface IPodSpec {
  containers: Record<string, unknown>[];
  affinity?: unknown;
  automountServiceAccountToken?: boolean;
  dnsConfig?: unknown;
  dnsPolicy?: string;
  enableServiceLinks?: boolean;
  ephemeralContainers?: unknown;
  hostAliases?: unknown;
  hostIPC?: boolean;
  hostNetwork?: boolean;
  hostPID?: boolean;
  hostUsers?: boolean;
  hostname?: string;
  imagePullSecrets?: Record<string, string>[];
  initContainers?: Record<string, unknown>[];
  nodeName?: string;
  nodeSelector?: Record<string, string>;
  os?: unknown;
  overhead?: unknown;
  preemptionPolicy?: string;
  priority?: number;
  priorityClassName?: string;
  readinessGates?: unknown;
  resourceClaims?: unknown;
  restartPolicy?: string;
  runtimeClassName?: string;
  schedulerName?: string;
  schedulingGates?: unknown;
  securityContext?: unknown;
  serviceAccount?: string;
  serviceAccountName?: string;
  setHostnameAsFQDN?: boolean;
  shareProcessNamespace?: boolean;
  subdomain?: string;
  terminationGracePeriodSeconds?: number;
  tolerations?: unknown;
  topologySpreadConstraints?: unknown;
  volumes?: unknown;
}

interface IPod {
  kind?: string;
  apiVersion?: string;
  metadata?: IObjectMeta;
  spec: IPodSpec;
  status?: IPodStatus;
}

export default function BalancedPodViewer({ obj }: { obj: IPod }) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showSpec, setShowSpec] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <Card className="w-full max-w-4xl mx-auto overflow-hidden bg-white shadow-md">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Box className="w-8 h-8" />
              <span>{obj.metadata?.name}</span>
              <BalancedBadge color="bg-yellow-500 text-yellow-900">
                {obj.kind}
              </BalancedBadge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                      <Tag className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-gray-800">
                        API Version:
                      </span>
                      <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                        {obj.apiVersion}
                      </code>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The version of the API used by this workload</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowMetadata(!showMetadata)}
                >
                  <span className="font-semibold">Metadata</span>
                  {showMetadata ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {showMetadata && (
                  <div className="pl-6 space-y-2 animate-fadeIn">
                    <div>
                      Namespace:{" "}
                      <BalancedBadge color="bg-blue-100 text-blue-800">
                        {obj.metadata?.namespace}
                      </BalancedBadge>
                    </div>
                    <div>
                      Resource Version:{" "}
                      <BalancedBadge color="bg-green-100 text-green-800">
                        {obj.metadata?.resourceVersion}
                      </BalancedBadge>
                    </div>
                    <div>
                      UID:{" "}
                      <BalancedBadge color="bg-purple-100 text-purple-800">
                        {obj.metadata?.uid}
                      </BalancedBadge>
                    </div>
                    <div>
                      Created:{" "}
                      <BalancedBadge color="bg-yellow-100 text-yellow-800">
                        {formatDate(obj.metadata?.creationTimestamp || "")}
                      </BalancedBadge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      Labels:
                      {obj.metadata?.labels
                        ? Object.entries(obj.metadata.labels).map(
                            ([key, value]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="bg-gray-200 text-gray-800"
                              >
                                {key}: {value}
                              </Badge>
                            ),
                          )
                        : "None"}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowSpec(!showSpec)}
                >
                  <span className="font-semibold">Pod Spec</span>
                  {showSpec ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {showSpec && (
                  <div className="pl-6 space-y-2 animate-fadeIn">
                    {Object.entries(obj.spec).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                          {key}
                        </code>
                        <span>=</span>
                        <code className="bg-green-100 px-2 py-1 rounded text-green-800">
                          {JSON.stringify(value, null, 2)}
                        </code>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowStatus(!showStatus)}
                >
                  <span className="font-semibold">Status</span>
                  {showStatus ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {showStatus && (
                  <div className="pl-6 space-y-2 animate-fadeIn">
                    <div>
                      Host:{" "}
                      <BalancedBadge color="bg-cyan-100 text-cyan-800">
                        {obj.status?.hostIP}
                      </BalancedBadge>
                    </div>
                    <div>
                      Phase:{" "}
                      <BalancedBadge color="bg-pink-100 text-pink-800">
                        {obj.status?.phase}
                      </BalancedBadge>
                    </div>
                    {obj.status?.conditions?.map((condition, index) => (
                      <div key={index} className="bg-gray-100 p-4 rounded-lg">
                        <div className="font-semibold text-gray-800">
                          Type: {condition.type}
                        </div>
                        <div>
                          Status:
                          <Badge
                            variant={
                              condition.status === "True"
                                ? "success"
                                : "destructive"
                            }
                            className="ml-2"
                          >
                            {condition.status}
                          </Badge>
                        </div>
                        <div className="text-gray-700">
                          Message: {condition.message}
                        </div>
                        <div className="text-xs text-gray-600">
                          Last Probe:{" "}
                          {formatDate(condition.lastProbeTime || "")}
                        </div>
                        <div className="text-xs text-gray-600">
                          Last Transition:{" "}
                          {formatDate(condition.lastTransitionTime || "")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
