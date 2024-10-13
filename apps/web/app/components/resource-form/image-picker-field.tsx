import { Github, Code, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Input } from "../ui/input"
import { useEffect, useState, version } from "react"
import { Repository } from "@repo/shared"
import { GhRepoSelectionField } from "./gh-repo-selection-field"
import { MarkdownWrapper } from "../markdown"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { EnumField } from "./enum-field"
import { Label } from "../ui/label"

const snippet = (group: string, version: string, plural: string, namespace: string, name: string, field: string, image: string) => `
\`\`\`bash
curl \\
  -X PATCH \\
  -H "content-type: application/json" \\
  -H "Authorization: Bearer $KBLOCKS_API_TOKEN" \\
  -d '{ "${field}": "$IMAGE" }' \\
  https://kblocks.io/api/resources/${group}/${version}/${plural}/${namespace}/${name}
\`\`\`
`;

export interface ImagePickerFieldProps {
  group?: string
  version?: string
  plural?: string
  namespace?: string
  name?: string
  fieldName?: string
  onImageNameChange: (imageName: string) => void
}

const SetBadge = () => (
  <Badge variant="secondary" className="text-xs ml-2">
    <Check className="w-3 h-3 mr-1" />
    Set
  </Badge>
);

export const ImagePickerField = ({ onImageNameChange }: ImagePickerFieldProps) => {
  const [selectedImageValue, setSelectedImageValue] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<"github" | "image" | "code">("code");
  const [imageName, setImageName] = useState("");
  const [githubRepo, setGithubRepo] = useState<Repository | null>(null);
  const [language, setLanguage] = useState("");
  const [branch, setBranch] = useState("");

  useEffect(() => {
    onImageNameChange(selectedImageValue ?? "");
  }, [selectedImageType]);

  const handleSetImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imageName) return;
    setSelectedImageValue(imageName);
    setSelectedImageType("image");
  }

  const handleGithubRepoChange = (repo: Repository | null) => {
    setGithubRepo(repo);
    setSelectedImageType("github");
    setSelectedImageValue("IMAGE_PLACEHOLDER");
  }

  const handleCodeSnippetSelection = () => {
    setSelectedImageType("code");
    setSelectedImageValue("IMAGE_PLACEHOLDER");
  }

  return (
    <Tabs defaultValue="github" className="flex w-full">
      <TabsList className="flex flex-col min-w-[220px] h-full justify-start bg-white">
        <TabsTrigger
          value="github"
          className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-gray-100 data-[state=active]:font-semibold">
          GitHub
          <Github className="w-4 h-4 ml-2" />
          {selectedImageType === "github" &&
            <SetBadge />
          }
        </TabsTrigger>
        <TabsTrigger
          value="image"
          className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-gray-100 data-[state=active]:font-semibold">
          Image Name
          {selectedImageType === "image" &&
            <SetBadge />
          }
        </TabsTrigger>
        <TabsTrigger
          value="code"
          className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-gray-100 data-[state=active]:font-semibold">Code Snippet
          <Code className="w-4 h-4 ml-2" />
          {selectedImageType === "code" &&
            <SetBadge />
          }
        </TabsTrigger>
      </TabsList>
      <div className="flex-grow w-full min-h-[180px] border-gray-200">
        <TabsContent value="github" className="pl-2 w-full h-full">
          <GhRepoSelectionField
            handleOnSelection={handleGithubRepoChange}
            initialValue={githubRepo}
          />
          <div className="flex items-center ml-2 mr-2 space-x-6 mt-2">
            <div className="flex items-center space-x-2">
              <Label>Branch:</Label>
              <Input
                disabled={selectedImageType !== "github"}
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Language:</Label>
              <EnumField
                disabled={selectedImageType !== "github"}
                values={mockLanguages}
                selectedValue={language}
                onChange={setLanguage}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="image" className="pl-2 h-full">
          <Input
            type="text"
            placeholder="Enter image name"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
          />
          <div>
            <Button
              variant="outline"
              role="button"
              className="mt-2"
              onClick={handleSetImage}
            >
              Set Image
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="code" className="pl-2 h-full">
          <MarkdownWrapper
            content={snippet("group", "version", "plural", "namespace", "name", "field", imageName)}
            onCopy={handleCodeSnippetSelection}
          />
        </TabsContent>
      </div >
    </Tabs >
  )

}



const mockLanguages = ["python", "go", "rust", "javascript", "typescript", "java", "csharp", "kotlin", "swift", "dart", "php", "ruby"];