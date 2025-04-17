export const capitalizeFirstLetter = (str: string): string => {
  if (!str.length) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
