export const chooseColor = (key: string, palette: string[]): string => {
  const index =
    key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    palette.length;
  return palette[index];
};
