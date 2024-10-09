import { Switch } from "../ui/switch";

export interface SwitchFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
}

export const SwitchField = ({ value, onChange, required }: SwitchFieldProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={value}
        onCheckedChange={onChange}
        required={required}
      />
    </div>
  )
}
