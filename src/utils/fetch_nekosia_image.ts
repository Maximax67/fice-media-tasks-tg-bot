import { NekosiaAPI, type AllTagsList } from 'nekosia.js';
import { retryOnException } from './retry_on_exception';
import { fetchImage } from './fetch_image';

export const fetchNekosiaImage = async (
  tags: AllTagsList[] = ['cute'],
  retries: number = 3,
): Promise<Buffer<ArrayBufferLike>> => {
  return retryOnException(async () => {
    const response = await NekosiaAPI.fetchImages({
      tags,
      count: 1,
      session: 'ip',
    });

    if (!response.success) {
      throw new Error(`NekosiaAPI response was not successfull: ${response}`);
    }

    const url = response.image.compressed.url;
    const buffer = await fetchImage(url);

    return buffer;
  }, retries);
};
