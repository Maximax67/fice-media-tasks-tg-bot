import { fetchImage } from './fetch_image';
import { retryOnException } from './retry_on_exception';

export const fetchZenQuotesImage = async (
  retries: number = 3,
): Promise<Buffer<ArrayBufferLike>> => {
  return retryOnException(
    async () => await fetchImage('https://zenquotes.io/api/image'),
    retries,
  );
};
