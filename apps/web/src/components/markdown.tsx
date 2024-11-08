import Markdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { DocumentCheckIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { markdownOverrides } from "@/lib/markdown-overides";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import githubGist from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "./ui/button";
import remarkEmoji from "remark-emoji";

export const MarkdownWrapper = ({
  content,
  componentsOverrides = {},
}: {
  content: string;
  componentsOverrides?: Components | null | undefined;
}) => {
  return (
    <Markdown
      className={"pb-2"}
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm, remarkEmoji]}
      components={{
        ...markdownOverrides,
        ...componentsOverrides,
        code: CodeBlock,
      }}
    >
      {content}
    </Markdown>
  );
};

const CodeBlock = (props: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const { children, className, ...rest } = props;
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  };

  if (!match) {
    return (
      <code
        {...rest}
        className={`${className} inline-block bg-[#f6f8fa] p-[0.2rem] text-sm`}
      >
        {children}
      </code>
    );
  }

  let language = match[1];
  if (language === "sh" || language === "console") {
    language = "shell";
  }

  return (
    <div style={{ position: "relative", margin: "16px 0" }}>
      <CopyToClipboard text={String(children)} onCopy={handleCopy}>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-2"
        >
          {copied ? <DocumentCheckIcon /> : <DocumentIcon />}
        </Button>
      </CopyToClipboard>

      <SyntaxHighlighter
        {...rest}
        PreTag="div"
        language={language}
        style={githubGist}
        customStyle={{ background: "#f3f4f6" }}
      >
        {String(children)}
      </SyntaxHighlighter>
    </div>
  );
};
