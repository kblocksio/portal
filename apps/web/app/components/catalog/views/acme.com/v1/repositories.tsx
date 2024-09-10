import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Box,
  Tag,
  Server,
  Globe,
  Cpu,
  Zap,
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

// Helper functions
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

// TypeScript interfaces
interface Metadata {
  name: string;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
  creationTimestamp?: string;
  labels?: Record<string, string>;
}

interface StatusCondition {
  lastProbeTime?: string;
  lastTransitionTime: string;
  message?: string;
  status: string;
  type: string;
}

interface Status {
  conditions: StatusCondition[];
}

interface Repository {
  apiVersion: string;
  kind: string;
  metadata: Metadata;
  name: string;
  owner: string;
  public?: boolean;
  status?: Status;
  files?: Array<{ content: string; path: string; readonly?: boolean }>;
  tags?: string[];
}

interface BalancedWorkloadViewerProps {
  obj: Repository;
}

// Main component
export default function BalancedWorkloadViewer({
  obj,
}: BalancedWorkloadViewerProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showTags, setShowTags] = useState(false);

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
                      <span className="font-semibold text-gray-800">
                        Owner:
                      </span>
                      <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                        {obj.owner}
                      </code>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The owner of this repository</p>
                  </TooltipContent>
                </Tooltip>

                {obj.public && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                        <Globe className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-gray-800">
                          Public:
                        </span>
                        <span className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                          Yes
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This repository is public</p>
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
                        {obj.metadata.creationTimestamp &&
                          formatDate(obj.metadata.creationTimestamp)}
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
                  onClick={() => setShowFiles(!showFiles)}
                >
                  <span className="font-semibold">Files</span>
                  {showFiles ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {showFiles && obj.files && (
                  <div className="pl-6 space-y-2 animate-fadeIn">
                    {obj.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                          {file.path}
                        </code>
                        <span>=</span>
                        <code className="bg-green-100 px-2 py-1 rounded text-green-800">
                          {file.content}
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
                {showStatus && obj.status && (
                  <div className="pl-6 space-y-2 animate-fadeIn">
                    {obj.status.conditions.map((condition, index) => (
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
                          {condition.lastProbeTime &&
                            formatDate(condition.lastProbeTime)}
                        </div>
                        <div className="text-xs text-gray-600">
                          Last Transition:{" "}
                          {formatDate(condition.lastTransitionTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowTags(!showTags)}
                >
                  <span className="font-semibold">Tags</span>
                  {showTags ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {showTags && obj.tags && (
                  <div className="pl-6 space-y-2 animate-fadeIn">
                    {obj.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gray-200 text-gray-800"
                      >
                        {tag}
                      </Badge>
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
