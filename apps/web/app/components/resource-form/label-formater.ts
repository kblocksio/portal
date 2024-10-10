export const splitAndCapitalizeCamelCase = (str: string): string => {
  return str
    // Insert a space between lowercase and uppercase letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Insert a space between sequences of uppercase letters followed by lowercase letters
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // Split the string into words
    .split(' ')
    // Capitalize the first letter of each word
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    // Join the words back into a single string
    .join(' ');
}
