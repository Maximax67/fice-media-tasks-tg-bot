import { NekosiaAPI, type AllTagsList } from 'nekosia.js';
import { retryOnException } from './retry_on_exception';

export const fetchImage = async (
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
    const imageResponse = await fetch(url);

    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch image. Status code: ${imageResponse.status}`,
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return buffer;
  }, retries);
};
