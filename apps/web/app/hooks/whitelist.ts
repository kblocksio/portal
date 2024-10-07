export const whitelist = [
  // "ainvonercode@gmail.com",
  "eladc@monada.co",
  "eladb@wing.cloud",
  "shaib@monada.co",
  "cristianp@wing.cloud",
  "wing.cloud.apps@wing.cloud"
];

export const isUserWhitelisted = (email?: string) => {
  return whitelist.includes(email ?? "");
};
