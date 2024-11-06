import { Cpu, Microchip, HardDrive } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Slider } from "../../ui/slider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Field } from "../form-field";

type InstanceConfig = {
  cpu: number;
  memory: number;
  storage?: number;
};

export type InstancePickerConfig = Record<string, InstanceConfig>;

type InstanceItem = InstanceConfig & { name: string };

export const InstancePicker = ({
  initialValue,
  defaultInstanceName,
  config,
  onInstanceChange,
  hideField,
  required,
  description,
  fieldName,
  defaultValue,
}: {
  defaultValue?: string;
  initialValue?: string;
  defaultInstanceName: string;
  hideField?: boolean;
  required?: boolean;
  description?: string;
  fieldName: string;
  config: InstancePickerConfig;
  onInstanceChange: (instanceName: string) => void;
}) => {
  // add the "name" property to all instances and organize as an array
  const instanceTypes: InstanceItem[] = Object.entries(config).map(
    ([name, config]) => ({
      name,
      ...config,
    }),
  );

  const [selectedInstance, setSelectedInstance] = useState<InstanceItem>(() => {
    const value = initialValue ?? defaultValue;
    return (
      instanceTypes.find((instance) => instance.name === value) ??
      instanceTypes[0]
    );
  });

  // make sure default instance name value is set in form data
  useEffect(() => {
    if (defaultInstanceName) {
      onInstanceChange(defaultInstanceName);
    }
  }, [defaultInstanceName]);

  const handleSliderChange = (value: number[]) => {
    setSelectedInstance(instanceTypes[value[0]]);
    onInstanceChange(instanceTypes[value[0]].name);
  };

  return (
    <Field
      fieldName={fieldName}
      description={description}
      hideField={hideField}
      required={required}
    >
      <div className="w-full">
        <div className="space-y-4">
          <div className="space-y-4">
            <Slider
              min={0}
              max={instanceTypes.length - 1}
              step={1}
              value={[
                instanceTypes.findIndex(
                  (instance) => instance.name === selectedInstance.name,
                ),
              ]}
              onValueChange={handleSliderChange}
            />
            <div className="text-muted-foreground flex justify-between text-sm">
              {Object.values(instanceTypes).map((instance, index) => (
                <span
                  key={instance.name}
                  onClick={() => handleSliderChange([index])}
                  className={cn(
                    index ===
                      instanceTypes.findIndex(
                        (instance) => instance.name === selectedInstance.name,
                      )
                      ? "text-primary font-bold"
                      : "",
                    "cursor-pointer",
                  )}
                >
                  {instance.name}
                </span>
              ))}
            </div>
          </div>

          <Card className="bg-primary/5">
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background flex flex-col items-center justify-center rounded-lg p-3">
                  <Cpu className="text-primary mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">
                    {selectedInstance.cpu} CPU
                  </span>
                </div>
                <div className="bg-background flex flex-col items-center justify-center rounded-lg p-3">
                  <Microchip className="text-primary mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">
                    {selectedInstance.memory} GB RAM
                  </span>
                </div>
                <div className="bg-background flex flex-col items-center justify-center rounded-lg p-3">
                  <HardDrive className="text-primary mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">
                    {selectedInstance?.storage ?? "N/A"} GB Storage
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Field>
  );
};
