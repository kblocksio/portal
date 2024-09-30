import { ResourceType } from "@repo/shared";
import { useState } from "react";
import { CatalogSidebar, SidebarBody, SidebarLabel, SidebarLink } from "~/components/catalog/catalog-sidebar";
import { loadingStates } from "~/components/catalog/loading-states";
import { MultiStepLoader } from "~/components/ui/multi-step-loader";
import { useResources } from "~/hooks/use-resources";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { cn } from "~/lib/utils";
import Markdown from "react-markdown";
import CopyToClipboard from "react-copy-to-clipboard";
import { markdownOverrides } from "~/lib/markdown-overides";
import rehypeRaw from "rehype-raw";
import { DocumentCheckIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ghcolors } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function catalog() {

  const { isLoading, resourceTypes } = useResources();
  const [currentResourceType, setCurrentResourceType] = useState<ResourceType | null>(null);
  return isLoading ? (
    <MultiStepLoader
      loadingStates={loadingStates}
      loading={isLoading}
      duration={1500} // 1.5 seconds mock progress
      loop={false}
      ready={!isLoading}
    // onReady={() => setLoading(false)}
    />
  ) : (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-full",
      )}
    >
      <CatalogSidebar animate={false}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-2">
              {resourceTypes &&
                Object.values(resourceTypes).map((resourceType, idx) => {
                  const resourceTypeName = resourceType.kind;
                  const Icon = getIconComponent({ icon: resourceType?.icon });
                  const iconColor = getResourceIconColors({
                    color: resourceType?.color,
                  });

                  return (
                    <SidebarLabel
                      key={idx}
                      label={resourceTypeName}
                      icon={
                        <Icon
                          className={`${iconColor} h-5 w-5 flex-shrink-0`}
                        />}
                      onClick={() => setCurrentResourceType(resourceType)}
                    />
                  );
                })}
            </div>
          </div>
        </SidebarBody>
      </CatalogSidebar>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden bg-white dark:bg-neutral-900">
          {/* Parent container wrapping both markdown and metadata */}
          <div className="flex flex-row flex-1 h-full overflow-auto">
            <div className="p-2 md:p-8 text-left rounded-tl-2xl dark:border-neutral-700 flex flex-col gap-2 flex-1 w-full h-full">
              {currentResourceType && (
                <Markdown
                  className={"pb-2"}
                  rehypePlugins={[rehypeRaw]}
                  children={currentResourceType.readme}
                  components={{
                    ...markdownOverrides,
                    code(props) {
                      const { children, className, node, ref, ...rest } = props;
                      const [copied, setCopied] = useState(false);
                      const match = /language-(\w+)/.exec(className || "");

                      const handleCopy = () => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
                      };

                      return match ? (
                        <div style={{ position: "relative" }}>
                          <CopyToClipboard
                            text={String(children)}
                            onCopy={handleCopy}
                          >
                            <button
                              className={
                                "absolute top-0 right-0 bg-transparent p-2 focus:outline-none"
                              }
                            >
                              {copied ? (
                                <DocumentCheckIcon
                                  className={`${getResourceIconColors({ color: "slate" })} h-5 w-5 flex-shrink-0`}
                                />
                              ) : (
                                <DocumentIcon
                                  className={`${getResourceIconColors({ color: "slate" })} h-5 w-5 flex-shrink-0`}
                                />
                              )}
                            </button>
                          </CopyToClipboard>
                          <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            children={String(children).replace(/\n$/, "")}
                            language={match[1]}
                            style={ghcolors}
                          />
                        </div>
                      ) : (
                        <code {...rest} className={className}>
                          {children}
                        </code>
                      );
                    },
                  }}
                />
              )}
            </div>
            {currentResourceType && (
              <div className="p-2 md:p-10 text-left dark:border-neutral-700 w-64 flex-shrink-0 p-4 bg-white dark:bg-neutral-900">
                <h1 className="text-2xl font-bold mb-6 mt-4">CRD Metadata</h1>
                <div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-700">
                      API Version
                    </h3>
                    <p className="text-slate-500">apiextensions.k8s.io/v1</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-700">Kind</h3>
                    <p className="text-slate-500">CustomResourceDefinition</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-700">Group</h3>
                    <p className="text-slate-500">mygroup.example.com</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-700">Version</h3>
                    <p className="text-slate-500">v1alpha1</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-700">Scope</h3>
                    <p className="text-slate-500">Namespaced</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-700">Names</h3>
                    <ul className="list-disc list-inside text-slate-500">
                      <li>Plural: myresources</li>
                      <li>Singular: myresource</li>
                      <li>Kind: MyResource</li>
                      <li>Short Names: mr</li>
                    </ul>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-700">Conditions</h3>
                    <ul className="list-disc list-inside text-slate-500">
                      <li>Established: True</li>
                      <li>NamesAccepted: True</li>
                    </ul>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-700">Other Info</h3>
                    <p className="text-slate-500">{"currentCRD.otherInfo"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
