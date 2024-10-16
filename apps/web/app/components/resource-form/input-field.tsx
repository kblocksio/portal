import { Input } from "../ui/input";

export interface InputFieldProps {
  value: string | number;
  onChange: (value: string | number) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}

const isNumeric = (value: string) => /^-?\d+(\.\d+)?$/.test(value);

export const InputField = ({
  value,
  onChange,
  required,
  type,
  placeholder,
}: InputFieldProps) => {
  return (
    <Input
      required={required}
      type={type === "number" ? "number" : "text"}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        const value =
          type === "number" && isNumeric(e.target.value)
            ? Number(e.target.value)
            : e.target.value;

        onChange(value);
      }}
      className="w-full"
    />
  );
};
