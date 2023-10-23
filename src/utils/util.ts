export const timeout = (millisecond: number) =>
  new Promise((resolve) => setTimeout(resolve, millisecond));
