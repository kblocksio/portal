import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { CopyToClipboardButton } from "@/components/copy-to-clipboard";

export const Shell = ({ value }: { value: any }) => {
  return (
    <CopyToClipboardButton text={value}>
      <div className="items-centerpl-2 relative flex rounded-sm">
        <SyntaxHighlighter
          language="shell"
          style={githubGist}
          customStyle={{ padding: "0", background: "transparent" }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </CopyToClipboardButton>
  );
};
