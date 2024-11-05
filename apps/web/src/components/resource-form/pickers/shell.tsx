import { DocumentIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { CopyToClipboardButton } from "@/components/copy-to-clipboard";

export const Shell = ({ value }: { value: any }) => {
  
  return (
    <CopyToClipboardButton text={value}>
      <div className="relative flex items-centerpl-2 rounded-sm">
        <SyntaxHighlighter language="shell" style={githubGist} customStyle={{ padding: "0", background: "transparent" }}>
          {value}
        </SyntaxHighlighter>
      </div>
    </CopyToClipboardButton>
  );
};
