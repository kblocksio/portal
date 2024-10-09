import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { ScrollArea } from '../ui/scroll-area'
import { Label } from '../ui/label'
// Define the props for the PricingCard component
interface InstanceTypeCardProps {
  id: string
  title: string
  ram: string
  cpu: string
  price: string
}

const InstanceTypeCard: React.FC<InstanceTypeCardProps & {
  isSelected: boolean,
  onSelect: () => void
}> = ({ id, title, ram, cpu, price, isSelected, onSelect }) => {

  return (
    <Card
      className={`w-full cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{ram}</p>
        <p>{cpu}</p>
        <p className="text-sm text-muted-foreground">{price}</p>
      </CardContent>
    </Card>)
}

// Define the props for the PricingGrid component
interface InstanceTypeFieldProps {
  cards: InstanceTypeCardProps[]
  onSelectionChange: (selectedCard: InstanceTypeCardProps | null) => void
}

export const InstanceTypeField = ({ cards, onSelectionChange }: InstanceTypeFieldProps) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const handleSelection = (cardId: string) => {
    setSelectedCardId(cardId)
    const selectedCard = cards.find(card => card.id === cardId) || null
    onSelectionChange(selectedCard)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ScrollArea className="h-[calc(2*12rem)] w-full rounded-md border" contentClassName="content-center">
        <div className="grid grid-cols-2 gap-4 p-4">
          {cards.map((card) => (
            <Label htmlFor={card.id} key={card.id} className="cursor-pointer">
              <InstanceTypeCard
                {...card}
                isSelected={card.id === selectedCardId}
                onSelect={() => handleSelection(card.id)}
              />
            </Label>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// Example usage
export const ExampleUsage = () => {
  const pricingCards = [
    { id: "starter", title: "Starter", ram: "512 MB RAM", cpu: "0.5 CPU", price: "0.016¢ / min" },
    { id: "standard", title: "Standard", ram: "2 GB RAM", cpu: "1 CPU", price: "0.058¢ / min" },
    { id: "pro", title: "Pro", ram: "4 GB RAM", cpu: "2 CPU", price: "0.197¢ / min" },
    { id: "pro-plus", title: "Pro Plus", ram: "8 GB RAM", cpu: "4 CPU", price: "0.405¢ / min" },
  ]

  useEffect(() => {
    console.log('init')
  }, [])


  const handleSelectionChange = (selectedCard: InstanceTypeCardProps | null) => {
    console.log('Selected card:', selectedCard)
    // Here you can update your form state or perform any other action
  }



  return (
    <div className="space-y-4">
      <Label htmlFor="instance-type" className="text-sm font-medium">
        Instance Type
      </Label>
      <InstanceTypeField cards={pricingCards} onSelectionChange={handleSelectionChange} />
    </div>

  )
}