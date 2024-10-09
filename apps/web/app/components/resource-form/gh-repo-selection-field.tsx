import { Repository } from "@repo/shared";
import { ImportGHRepo } from "../gh-repos-selection";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface GhRepoSelectionFieldProps {
  handleOnSelection: (repositories: Repository[]) => void;
}

export const GhRepoSelectionField = ({ handleOnSelection }: GhRepoSelectionFieldProps) => {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Connect a GitHub Repository</CardTitle>
      </CardHeader>
      <CardContent>
        <ImportGHRepo
          singleSelection={true}
          singleActionLabel="Connect"
          multipleActionLabel="Connect Selected"
          handleOnSelection={handleOnSelection}
        />
      </CardContent>
    </Card>
  )
}
