import { Cpu, Microchip, HardDrive } from "lucide-react"
import { Card, CardContent, CardTitle, CardHeader } from '../ui/card'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/badge'
import { useState } from "react"

export interface InstanceType {
  name: string
  cpu: number
  ram: number
  storage: number
  price: number
}

interface InstanceSelectorProps {
  instanceTypes: InstanceType[]
  onInstanceChange: (instance: InstanceType) => void
}

export const InstanceTypeField = ({ instanceTypes, onInstanceChange }: InstanceSelectorProps) => {

  const [selectedInstance, setSelectedInstance] = useState<InstanceType>(instanceTypes[0])

  const handleSliderChange = (value: number[]) => {
    setSelectedInstance(instanceTypes[value[0]])
    onInstanceChange(instanceTypes[value[0]])
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Choose Your Instance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold">{selectedInstance.name}</span>
          </div>
          <Slider
            min={0}
            max={instanceTypes.length - 1}
            step={1}
            value={[instanceTypes.indexOf(selectedInstance)]}
            onValueChange={handleSliderChange}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            {instanceTypes.map((instance, index) => (
              <span key={instance.name} className={index === instanceTypes.indexOf(selectedInstance) ? 'font-bold text-primary' : ''}>
                |
              </span>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Selected Instance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{selectedInstance.name}</span>
              <Badge variant="secondary" className="text-lg">
                ${selectedInstance.price.toFixed(4)}/hour
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-background rounded-lg">
                <Cpu className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">{selectedInstance.cpu} CPU</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-background rounded-lg">
                <Microchip className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">{selectedInstance.ram} GB RAM</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-background rounded-lg">
                <HardDrive className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">{selectedInstance.storage} GB Storage</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}