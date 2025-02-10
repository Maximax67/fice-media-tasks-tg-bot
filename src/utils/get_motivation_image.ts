import { MotivationTypes } from '../enums';
import { fetchMemeImage } from './fetch_meme_image';
import { fetchNatureImage } from './fetch_nature_image';
import { fetchNekosiaImage } from './fetch_nekosia_image';
import { fetchZenQuotesImage } from './fetch_zen_quotes_image';

type MotivationTypeSubset = Exclude<
  MotivationTypes,
  MotivationTypes.NONE | MotivationTypes.RANDOM
>;

const motivationGetterFunctions: Record<MotivationTypeSubset, Function> = {
  [MotivationTypes.CATGIRLS]: async () => await fetchNekosiaImage(),
  [MotivationTypes.QUOTES]: async () => await fetchZenQuotesImage(),
  [MotivationTypes.MEMES]: async () => await fetchMemeImage(),
  [MotivationTypes.NATURE]: async () => await fetchNatureImage(),
};

export async function getMotivationImage(
  type: MotivationTypes,
): Promise<Buffer<ArrayBufferLike> | null> {
  if (type === MotivationTypes.NONE) {
    return null;
  }

  let motivationFunction: Function;
  if (type === MotivationTypes.RANDOM) {
    const keys = Object.keys(motivationGetterFunctions);
    const randomKey = keys[
      Math.floor(Math.random() * keys.length)
    ] as MotivationTypeSubset;

    motivationFunction = motivationGetterFunctions[randomKey];
  } else {
    motivationFunction = motivationGetterFunctions[type];
  }

  try {
    return await motivationFunction();
  } catch (e) {
    return null;
  }
}
