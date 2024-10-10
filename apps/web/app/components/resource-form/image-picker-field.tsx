import { Github, Code } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Input } from "../ui/input"
import { useState, version } from "react"
import { Repository } from "@repo/shared"
import { GhRepoSelectionField } from "./gh-repo-selection-field"
import { MarkdownWrapper } from "../markdown"

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
  group: string
  version: string
  plural: string
  namespace: string
  name: string
  field: string
  onImageNameChange: (imageName: string) => void
  onGithubRepoChange: (githubRepo: Repository) => void
  onCodeSnippetSelection: () => void
}

/**
 * 3 tabs
 * gh repo selection
 * image name input field
 * code snippet input field
 */
export const ImagePickerField = () => {
  const [imageName, setImageName] = useState("")

  return (
    <Tabs defaultValue="github" className="flex w-full">
      <TabsList className="flex flex-col w-[200px] h-full justify-start bg-white">
        <TabsTrigger
          value="github"
          className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-gray-100 data-[state=active]:font-semibold">
          GitHub
          <Github className="w-4 h-4 ml-2" />
        </TabsTrigger>
        <TabsTrigger value="image" className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-gray-100 data-[state=active]:font-semibold">Image Name</TabsTrigger>
        <TabsTrigger
          value="code"
          className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-gray-100 data-[state=active]:font-semibold">Code Snippet
          <Code className="w-4 h-4 ml-2" />
        </TabsTrigger>
      </TabsList>
      <div className="flex-grow border-l w-full min-h-[160px] border-gray-200">
        <TabsContent value="github" className="pl-2 w-full h-full">
          <GhRepoSelectionField
            handleOnSelection={(repo) => setImageName(`${repo.owner}/${repo.name}`)}
          />
        </TabsContent>
        <TabsContent value="image" className="pl-2 h-full">
          <Input
            type="text"
            placeholder="Enter image name"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
          />
        </TabsContent>
        <TabsContent value="code" className="pl-2 h-full">
          <MarkdownWrapper
            content={snippet("group", "version", "plural", "namespace", "name", "field", imageName)}
            onCopy={() => {
              setImageName("IMAGE_PLACEHOLDER");
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  )

}  