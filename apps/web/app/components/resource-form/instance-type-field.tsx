import { Cpu, Microchip, HardDrive } from "lucide-react"
import { Card, CardContent } from '../ui/card'
import { Slider } from '../ui/slider'
import { useEffect, useState } from "react"
import { KblocksInstancePickerData, KblocksInstanceType } from "./kblocks-ui-fileds-parser"
import { cn } from "~/lib/utils"
interface InstanceSelectorProps {
  defaultInstanceName: string
  instanceTypes: KblocksInstancePickerData
  onInstanceChange: (instanceName: string) => void
}

export const InstanceTypeField = ({ defaultInstanceName, instanceTypes, onInstanceChange }: InstanceSelectorProps) => {

  const [selectedInstance, setSelectedInstance] = useState<KblocksInstanceType>(
    () => instanceTypes.find((instance) => instance.name === defaultInstanceName) ?? instanceTypes[0]
  )

  // make sure default instance name value is set in form data
  useEffect(() => {
    if (defaultInstanceName) {
      onInstanceChange(defaultInstanceName);
    }
  }, [defaultInstanceName]);

  const handleSliderChange = (value: number[]) => {
    setSelectedInstance(instanceTypes[value[0]]);
    onInstanceChange(instanceTypes[value[0]].name);
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="space-y-4">
          <Slider
            min={0}
            max={instanceTypes.length - 1}
            step={1}
            value={[instanceTypes.findIndex((instance) => instance.name === selectedInstance.name)]}
            onValueChange={handleSliderChange}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            {Object.values(instanceTypes).map((instance, index) => (
              <span
                key={instance.name}
                onClick={() => handleSliderChange([index])}
                className={cn(index === instanceTypes.findIndex((instance) => instance.name === selectedInstance.name) ? 'font-bold text-primary' : '', 'cursor-pointer')}>
                {instance.name}
              </span>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5">
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-background rounded-lg">
                <Cpu className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">{selectedInstance.cpu} CPU</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-background rounded-lg">
                <Microchip className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">{selectedInstance.memory} GB RAM</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-background rounded-lg">
                <HardDrive className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">{selectedInstance?.storage ?? 'N/A'} GB Storage</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}