import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Project, User } from "@repo/shared";
import { useFetch } from "@/hooks/use-fetch";
import { getUserInitials } from "@/lib/user-initials";

export interface ProjectHeaderProps {
  selectedProject: Project | null;
}

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
  const { data: users } = useFetch<User[]>("/api/users");

  return (
    <div className="flex flex-col items-start justify-between md:flex-row">
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedProject ? selectedProject.label : ""}
        </h1>
        <p className="text-md text-muted-foreground">
          {selectedProject ? selectedProject.description : ""}
        </p>
      </div>
      { /* hide team */ }
      {false && <Team users={users ?? []} />}
    </div>
  );
};

const Team = ({ users }: { users: User[] }) => {
  return (
    <div className="w-full md:w-auto">
      <div className="grid grid-cols-4 gap-0">
        {(users ?? []).map((user, index) => (
          <div key={index} className="relative">
            <Avatar className="border-background h-12 w-12 border-2">
              <AvatarImage
                alt={`@${user.user_metadata.full_name}`}
                src={user.user_metadata.avatar_url}
              />
              <AvatarFallback
                className={`${colors[index % colors.length]} text-primary-foreground text-xs`}
              >
                {getUserInitials(user.user_metadata.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}
      </div>
    </div>
  );
};
