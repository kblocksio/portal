interface UIPicker {
  type: string;
  config: any;
}

export const uiPickerParser = (description: string): UIPicker | undefined => {
  const regex =
    /@ui\s+kblocks\.io\/([a-zA-Z0-9_-]+)(?:\s*:\s*({[\s\S]*?}))?(?=\n|$)/;
  const match = description.match(regex);
  if (!match) {
    return undefined;
  }

  const type = match[1];
  const configStr = match[2];
  const config = tryParseJson(type, configStr);
  return { type, config };
};

function tryParseJson(fieldName: string, jsonString?: string) {
  if (!jsonString) {
    return undefined;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(
      `Unable to parse JSON value '${jsonString}' for field ${fieldName}`,
      error,
    );
    return undefined;
  }
}
