import { Search } from "lucide-react";
import { Input } from "./ui/input";

export interface WizardSearchHeaderProps {
  title: string;
  description: string;
  searchQuery: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WizardSearchHeader = ({ title, description, searchQuery, handleSearch }: WizardSearchHeaderProps) => {
  return (
    <div>
      {title}
      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
      <div className="relative flex-grow mt-4 mb-2">
        <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search resource..."
          value={searchQuery}
          onChange={handleSearch}
          className="bg-color-wite h-10 w-full py-2 pl-8 pr-4"
        />
      </div>
    </div>
  );
};
