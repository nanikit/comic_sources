export const timeout = (millisecond: number) =>
  new Promise((resolve) => setTimeout(resolve, millisecond));

export const getText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  return response.text();
};
