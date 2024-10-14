export interface KblocksInstanceType {
  name: string
  cpu: number
  memory: number
  storage?: number
}

export type KblocksInstancePickerData = KblocksInstanceType[];
export type KblocksImagePickerData = null;
export type KblocksRepoPickerData = null;
interface KblocksUiAnnotation {
  fieldType: 'instance-picker' | 'image-picker' | 'repo-picker'
  data: KblocksInstancePickerData | KblocksImagePickerData | KblocksRepoPickerData
}

export const kblocksUiFieldsParser = (description: string): KblocksUiAnnotation | null => {
  const regex = /@ui\s+kblocks\.io\/([a-zA-Z0-9_-]+)(?:\s*:\s*({[\s\S]*?}))?(?=\n|$)/;
  const match = description.match(regex);

  if (match) {
    const fieldType = match[1];
    const jsonString = match[2];
    if (!jsonString) {
      if (fieldType === 'image-picker') {
        return { fieldType, data: null as KblocksImagePickerData };
      }
      if (fieldType === 'repo-picker') {
        return { fieldType, data: null as KblocksRepoPickerData };
      }
    }
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
