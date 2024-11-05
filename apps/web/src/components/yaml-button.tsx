"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { dump } from "js-yaml";
import { Button } from "./ui/button";
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";

SyntaxHighlighter.registerLanguage("yaml", yaml);

export default function YamlButton({
  children,
  object,
}: {
  children: React.ReactNode;
  object: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const yamlString = dump(object);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div className="mt-4 overflow-auto rounded border">
          <CopyButton text={yamlString} className="absolute top-12 right-8"/>
          <SyntaxHighlighter
            language="yaml"
            style={docco}
            customStyle={{
              fontSize: "14px",
              padding: "16px",
              // backgroundColor: "transparent",
            }}
          >
            {yamlString}
          </SyntaxHighlighter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const CopyButton = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  };

  const Icon = copied ? ClipboardCheckIcon : ClipboardIcon;

  return (
    <Button variant="outline" onClick={handleCopy} size="icon" className={className}>
      <Icon className="size-4 shrink-0 grow-0" />
    </Button>
  );
};

