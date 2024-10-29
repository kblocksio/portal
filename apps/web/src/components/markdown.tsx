import Markdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import { DocumentCheckIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { getResourceIconColors } from "~/lib/hero-icon";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { markdownOverrides } from "~/lib/markdown-overides";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ghcolors } from "react-syntax-highlighter/dist/cjs/styles/prism";

export const MarkdownWrapper = ({
  content,
  onCopy,
  componentsOverrides = {},
}: {
  content: string;
  onCopy?: () => void;
  componentsOverrides?: Components | null | undefined;
}) => {
  return (
    <Markdown
      className={"pb-2"}
      rehypePlugins={[rehypeRaw]}
      children={content}
      components={{
        ...markdownOverrides,
        ...componentsOverrides,
        code(props) {
          const { children, className, node, ref, ...rest } = props;
          const [copied, setCopied] = useState(false);
          const match = /language-(\w+)/.exec(className || "");

          const handleCopy = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
            onCopy?.();
          };

          return match ? (
            <div
              style={{
                position: "relative",
                borderRadius: "6px",
                margin: "16px 0",
              }}
            >
              <CopyToClipboard text={String(children)} onCopy={handleCopy}>
                <button className="absolute right-2 top-2 bg-transparent p-2 focus:outline-none">
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
                customStyle={{
                  background: "#f6f8fa", // GitHub-like light gray background
                  padding: "16px",
                  overflow: "auto",
                  borderRadius: "6px",
                }}
              />
            </div>
          ) : (
            <code
              {...rest}
              className={`${className} inline-block rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-[0.2rem] text-sm`}
            >
              {children}
            </code>
          );
        },
      }}
    />
  );
};
