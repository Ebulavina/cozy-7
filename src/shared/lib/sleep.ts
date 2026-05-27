/** Promise-based sleep — replaces `DispatchQueue.main.asyncAfter`. */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
