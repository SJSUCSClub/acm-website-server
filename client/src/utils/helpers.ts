export const capitalizeFirstLetter = (str: string): string => {
  if (!str.length) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const isFull = (
  capacity: number | undefined | null,
  count: number | undefined
): boolean => {
  if (capacity === null) return false;
  if (!capacity || !count) return true;
  return capacity === count;
};
