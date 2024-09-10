import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Key, Lock, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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

interface SecretData {
  [key: string]: string;
}

interface ObjectMetadata {
  annotations?: { [key: string]: string };
  creationTimestamp?: string;
  deletionGracePeriodSeconds?: number;
  deletionTimestamp?: string;
  finalizers?: string[];
  generateName?: string;
  generation?: number;
  labels?: { [key: string]: string };
  managedFields?: any[];
  name?: string;
  namespace?: string;
  ownerReferences?: any[];
  resourceVersion?: string;
  selfLink?: string;
  uid?: string;
}

interface Secret {
  apiVersion?: string;
  data?: SecretData;
  immutable?: boolean;
  kind?: string;
  metadata?: ObjectMetadata;
  stringData?: { [key: string]: string };
  type?: string;
}

const KubernetesSecretViewer = ({ obj }: { obj: Secret }) => {
  const [showData, setShowData] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <Card className="w-full max-w-4xl mx-auto overflow-hidden bg-white shadow-md">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lock className="w-8 h-8" />
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
                      <Box className="w-5 h-5 text-blue-500" />
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
                      <FileText className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-gray-800">Type:</span>
                      <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">
                        {obj.type}
                      </code>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Type of the secret</p>
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
                    {obj.metadata?.name && (
                      <div>
                        Name:{" "}
                        <BalancedBadge color="bg-blue-100 text-blue-800">
                          {obj.metadata.name}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.metadata?.namespace && (
                      <div>
                        Namespace:{" "}
                        <BalancedBadge color="bg-blue-100 text-blue-800">
                          {obj.metadata.namespace}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.metadata?.resourceVersion && (
                      <div>
                        Resource Version:{" "}
                        <BalancedBadge color="bg-green-100 text-green-800">
                          {obj.metadata.resourceVersion}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.metadata?.uid && (
                      <div>
                        UID:{" "}
                        <BalancedBadge color="bg-purple-100 text-purple-800">
                          {obj.metadata.uid}
                        </BalancedBadge>
                      </div>
                    )}
                    {obj.metadata?.creationTimestamp && (
                      <div>
                        Created:{" "}
                        <BalancedBadge color="bg-yellow-100 text-yellow-800">
                          {formatDate(obj.metadata.creationTimestamp)}
                        </BalancedBadge>
                      </div>
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowData(!showData)}
                >
                  <span className="font-semibold">Data</span>
                  {showData ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {showData && (
                  <div className="pl-6 space-y-2 animate-fadeIn">
                    {Object.entries(obj.data || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-yellow-500" />
                        <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                          {key}
                        </code>
                        <span>=</span>
                        <code className="bg-green-100 px-2 py-1 rounded text-green-800">
                          {atob(value)}
                        </code>
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
};

export default KubernetesSecretViewer;
