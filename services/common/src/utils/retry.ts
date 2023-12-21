/**
 * Retries the given function up to maxTries times before failing hard.
 * @param fn The function to retry
 * @param maxTries The maximum number of times to retry
 * @param currentTry The current try number (used for recursion)
 * @param retryDelayMs The delay between retries in milliseconds
 * @returns The result of the function
 */
export const retryOnFail = async <T>(
  fn: () => Promise<T>,
  maxTries: number,
  retryDelayMs = 500
) => {
  const callFunction = async (currentTry = 1) => {
    try {
      return await fn();
    } catch (e) {
      if (currentTry > maxTries) {
        throw e;
      }

      // Exponential backoff of retries
      await new Promise((resolve) => setTimeout(resolve, currentTry * 2 * retryDelayMs));

      return callFunction(currentTry + 1);
    }
  };

  return callFunction(1);
};
