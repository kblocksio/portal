export interface KblocksInstanceType {
  name: string
  cpu: number
  memory: number
  storage?: number
}

export type KblocksInstancePickerData = KblocksInstanceType[];

interface KblocksUiAnnotation {
  fieldType: 'instance-picker'
  data: KblocksInstancePickerData
}

export const parseKblocksField = (description: string): KblocksUiAnnotation | null => {
  const regex = /@ui\s+kblocks\.io\/([a-zA-Z0-9_-]+):\s*({[\s\S]*})/;
  const match = description.match(regex);

  if (match) {
    const fieldType = match[1];
    const jsonString = match[2];

    try {
      const data = JSON.parse(jsonString);
      if (fieldType === 'instance-picker') {
        const instancePickerData = Object.keys(data.values).map((key) => ({
          ...data.values[key],
          name: key
        }));
        return { fieldType, data: instancePickerData as KblocksInstancePickerData };
      }
      return null;
    } catch (error) {
      console.error('Invalid JSON:', error);
      return null;
    }
  }

  return null;
};
