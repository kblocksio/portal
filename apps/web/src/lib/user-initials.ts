export const getUserInitials = (name: string) => {
  if (!name) return "";

  return name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
};
