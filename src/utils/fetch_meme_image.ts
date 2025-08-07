import { retryOnException } from './retry_on_exception';
import { MEMES_REDDIT_THREADS } from '../constants';
import { fetchImage } from './fetch_image';

interface MemeApiResponse {
  postLink: string;
  subreddit: string;
  title: string;
  url: string;
  nsfw: boolean;
  spoiler: boolean;
  autor: string;
  ups: number;
  preview: string[];
}

export const fetchMemeImage = async (retries: number = 3): Promise<Buffer> => {
  return retryOnException(async () => {
    const randomThreadIndex = Math.floor(
      Math.random() * MEMES_REDDIT_THREADS.length,
    );
    const randomThread = MEMES_REDDIT_THREADS[randomThreadIndex];

    const apiUrl = `https://meme-api.com/gimme/${randomThread}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`MemeApi response was not successfull: ${response}`);
    }

    const memeInfo: MemeApiResponse = await response.json();
    if (memeInfo.nsfw || memeInfo.spoiler) {
      throw new Error('NSFW or spoiler image received');
    }

    const previewUrls = memeInfo.preview;
    const url = previewUrls.length
      ? previewUrls[previewUrls.length - 1]
      : memeInfo.url;

    const buffer = await fetchImage(url);

    return buffer;
  }, retries);
};
