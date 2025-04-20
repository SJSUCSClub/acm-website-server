export const toBoolean = (value: string | boolean | undefined | null) => {
  if (value === 'true') {
    return true;
  }
  return false;
};
