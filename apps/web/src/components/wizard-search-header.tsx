import { Search } from "lucide-react";
import { Input } from "./ui/input";

export interface WizardSearchHeaderProps {
  title: string;
  description: string;
  searchQuery: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WizardSearchHeader = ({
  title,
  description,
  searchQuery,
  handleSearch,
}: WizardSearchHeaderProps) => {
  return (
    <div className="flex flex-col gap-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="relative mb-2 mt-4 flex-grow">
        <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          autoFocus
          type="text"
          tabIndex={0}
          placeholder="Search resource..."
          value={searchQuery}
          onChange={handleSearch}
          className="bg-color-wite h-10 w-full py-2 pl-8 pr-4"
        />
      </div>
    </div>
  );
};
