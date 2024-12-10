"use client";

import { memo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { dump } from "js-yaml";
import { Button } from "./ui/button";
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

SyntaxHighlighter.registerLanguage("yaml", yaml);

export default memo(function YamlButton({
  children,
  object,
}: {
  children: React.ReactNode;
  object: any;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle className="sr-only">YAML</DialogTitle>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogDescription>
          <p className="text-sm text-gray-500">
            Copy & paste to add this into a Kubernetes manifest
          </p>
        </DialogDescription>
        <YamlView object={object} />
      </DialogContent>
    </Dialog>
  );
});

export const YamlView = memo(function YamlView({ object }: { object: any }) {
  const yamlString = dump(object);

  return (
    <div className="overflow-auto rounded border">
      <div className="relative">
        <CopyButton text={yamlString} className="absolute right-2 top-2 z-10" />
        <SyntaxHighlighter
          language="yaml"
          style={docco}
          customStyle={{
            fontSize: "14px",
            padding: "16px",
          }}
        >
          {yamlString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});

const CopyButton = memo(function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  };

  const Icon = copied ? ClipboardCheckIcon : ClipboardIcon;

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      size="icon"
      className={className}
    >
      <Icon className="size-4 shrink-0 grow-0" />
    </Button>
  );
});
