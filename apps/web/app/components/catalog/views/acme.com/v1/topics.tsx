import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Box,
  Tag,
  Server,
  Globe,
  Cpu,
} from "lucide-react";
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

const ResourceViewer = ({ obj }: { obj: any }) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <Card className="w-full max-w-4xl mx-auto overflow-hidden bg-white shadow-md">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Box className="w-8 h-8" />
              <span>{obj.metadata.name}</span>
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
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                      <Server className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-gray-800">Kind:</span>
                      <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                        {obj.kind}
                      </code>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Kind of the Kubernetes resource</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                      <Cpu className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-gray-800">
                        Topic Name:
                      </span>
                      <span className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                        {obj?.topicName}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Name of the Topic</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                      <Globe className="w-5 h-5 text-purple-500" />
                      <span className="font-semibold text-gray-800">
                        Region:
                      </span>
                      <span className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                        {obj?.region}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Region of the Topic</p>
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
                        {obj.metadata.namespace}
                      </BalancedBadge>
                    </div>
                    <div>
                      Resource Version:{" "}
                      <BalancedBadge color="bg-green-100 text-green-800">
                        {obj.metadata.resourceVersion}
                      </BalancedBadge>
                    </div>
                    <div>
                      UID:{" "}
                      <BalancedBadge color="bg-purple-100 text-purple-800">
                        {obj.metadata.uid}
                      </BalancedBadge>
                    </div>
                    <div>
                      Created:{" "}
                      <BalancedBadge color="bg-yellow-100 text-yellow-800">
                        {formatDate(obj.metadata.creationTimestamp)}
                      </BalancedBadge>
                    </div>
                    {obj.metadata.labels && (
                      <div className="flex flex-wrap gap-2">
                        Labels:
                        {Object.entries(obj.metadata.labels).map(
                          ([key, value]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="bg-gray-200 text-gray-800"
                            >
                              {key}: {value}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
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
                    {obj.status?.conditions?.length > 0 && (
                      <div>
                        <div>Conditions:</div>
                        {obj.status.conditions.map((condition, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 p-4 rounded-lg"
                          >
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
                              Last Probe: {formatDate(condition.lastProbeTime)}
                            </div>
                            <div className="text-xs text-gray-600">
                              Last Transition:{" "}
                              {formatDate(condition.lastTransitionTime)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {obj.status?.topicArn && (
                      <div>
                        <div>
                          Topic ARN:{" "}
                          <BalancedBadge color="bg-cyan-100 text-cyan-800">
                            {obj.status.topicArn}
                          </BalancedBadge>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default ResourceViewer;
