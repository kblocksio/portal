import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Project } from "@repo/shared";

export interface ProjectHeaderProps {
  selectedProject: Project | null;
}

const avatars = [
  { initials: "JD", name: "John Doe" },
  { initials: "JS", name: "Jane Smith" },
  { initials: "RJ", name: "Robert Johnson" },
  { initials: "AS", name: "Alice Smith" },
  { initials: "MT", name: "Mike Thompson" },
  { initials: "EW", name: "Emma Wilson" },
  { initials: "DL", name: "David Lee" },
  { initials: "OG", name: "Olivia Green" },
];

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export const ProjectHeader = ({ selectedProject }: ProjectHeaderProps) => {
  return (
    <div className="container mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start justify-between">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedProject ? selectedProject.label : ""}
          </h1>
          <p className="text-m text-muted-foreground">
            {selectedProject ? selectedProject.description : ""}
          </p>
        </div>
        <div className="w-full md:w-auto">
          <div className="grid grid-cols-4 gap-0">
            {avatars.map((avatar, index) => (
              <div key={index} className="relative">
                <Avatar className="w-12 h-12 border-2 border-background">
                  <AvatarFallback
                    className={`${colors[index % colors.length]} text-primary-foreground text-xs`}
                  >
                    {avatar.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
