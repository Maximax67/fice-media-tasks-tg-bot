export const retryOnException = async <T>(
  fn: () => Promise<T>,
  retries = 3,
): Promise<T> => {
  if (retries < 0) {
    throw new Error('Retries parameter is less than zero');
  }

  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > retries) {
        throw error;
      }
    }
  }

  // This line will never be reached, but TypeScript doesn't know that.
  throw new Error('Unexpected error in retryOnException');
};
