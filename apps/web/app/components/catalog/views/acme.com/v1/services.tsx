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

interface Metadata {
  name: string;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
  creationTimestamp?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

interface Repo {
  name: string;
  owner: string;
  public?: boolean;
}

interface Condition {
  type: string;
  status: string;
  lastProbeTime?: string;
  lastTransitionTime: string;
  message?: string;
}

interface Status {
  conditions?: Condition[];
}

interface Service {
  apiVersion?: string;
  kind?: string;
  metadata: Metadata;
  repo: Repo;
  status?: Status;
  configOnly?: boolean;
}

export default function ServiceViewer({ obj }: { obj: Service }) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showRepo, setShowRepo] = useState(false);
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
                {obj.apiVersion && (
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
                )}
                {obj.repo?.name && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                        <Server className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-gray-800">
                          Repo Name:
                        </span>
                        <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                          {obj.repo.name}
                        </code>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The repository name for this service</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {obj.repo?.owner && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                        <Globe className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-gray-800">
                          Repo Owner:
                        </span>
                        <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                          {obj.repo.owner}
                        </code>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The owner of the repository</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {obj.repo?.public !== undefined && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                        <Cpu className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-gray-800">
                          Public:
                        </span>
                        <span
                          className={`bg-gray-200 px-2 py-1 rounded text-gray-800 ${obj.repo.public ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {obj.repo.public ? "Yes" : "No"}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Is the repository public?</p>
                    </TooltipContent>
                  </Tooltip>
                )}
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
                    {obj.metadata.namespace && (
                      <div>
                        Namespace:{" "}
                        <BalancedBadge color="bg-blue-100 text-blue-800">
                          {obj.metadata.namespace}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.metadata.resourceVersion && (
                      <div>
                        Resource Version:{" "}
                        <BalancedBadge color="bg-green-100 text-green-800">
                          {obj.metadata.resourceVersion}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.metadata.uid && (
                      <div>
                        UID:{" "}
                        <BalancedBadge color="bg-purple-100 text-purple-800">
                          {obj.metadata.uid}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.metadata.creationTimestamp && (
                      <div>
                        Created:{" "}
                        <BalancedBadge color="bg-yellow-100 text-yellow-800">
                          {formatDate(obj.metadata.creationTimestamp)}
                        </BalancedBadge>
                      </div>
                    )}
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
                  onClick={() => setShowRepo(!showRepo)}
                >
                  <span className="font-semibold">Repository</span>
                  {showRepo ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {showRepo && (
                  <div className="pl-6 space-y-2 animate-fadeIn">
                    {obj.repo.name && (
                      <div>
                        Name:{" "}
                        <BalancedBadge color="bg-yellow-100 text-yellow-800">
                          {obj.repo.name}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.repo.owner && (
                      <div>
                        Owner:{" "}
                        <BalancedBadge color="bg-green-100 text-green-800">
                          {obj.repo.owner}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.repo.public !== undefined && (
                      <div>
                        Public:{" "}
                        <BalancedBadge
                          color={`bg-${obj.repo.public ? "green-100" : "red-100"} text-${obj.repo.public ? "green-800" : "red-800"}`}
                        >
                          {obj.repo.public ? "Yes" : "No"}
                        </BalancedBadge>
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
                    {obj.status?.conditions &&
                      obj.status.conditions.map((condition, index) => (
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
                          {condition.lastProbeTime && (
                            <div className="text-xs text-gray-600">
                              Last Probe: {formatDate(condition.lastProbeTime)}
                            </div>
                          )}
                          <div className="text-xs text-gray-600">
                            Last Transition:{" "}
                            {formatDate(condition.lastTransitionTime)}
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
