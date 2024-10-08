import { Switch } from "../ui/switch";

export interface SwitchFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const SwitchField = ({ value, onChange }: SwitchFieldProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={value}
        onCheckedChange={onChange}
      />
    </div>
  )
}
