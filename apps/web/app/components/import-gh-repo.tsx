import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Github } from "lucide-react";

export const ImportGHRepo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-4">
          <Github className="mr-2" />
          Import GitHub Repository
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import GitHub Repository</DialogTitle>
          <DialogDescription>Select a repository to import.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select>
            <SelectTrigger id="repositories">
              <SelectValue placeholder="Select repository" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="repo1">Repository 1</SelectItem>
              <SelectItem value="repo2">Repository 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="submit">Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
