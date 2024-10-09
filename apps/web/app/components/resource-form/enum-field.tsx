import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface EnumFieldProps {
  values: Array<string>,
  selectedValue?: string,
  onChange: (value: string) => void,
  required?: boolean;
}

export const EnumField = ({ values, selectedValue, onChange, required }: EnumFieldProps) => {

  return (
    <div className="w-full max-w-md space-y-4">
      <Select onValueChange={onChange} value={selectedValue} required={required}>
        <SelectTrigger>
          <SelectValue placeholder="Select a value" />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}