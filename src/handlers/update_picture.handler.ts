import createDebug from 'debug';
import { fetchImage } from '../utils';

import { TelegramError, type Context } from 'telegraf';
import type {
  ExtraEditMessageMedia,
  WrapCaption,
} from 'telegraf/typings/telegram-types';
import type { InputMedia } from 'telegraf/typings/core/types/typegram';

const debug = createDebug('bot:handle_update_picture');
const editMessageParams: ExtraEditMessageMedia = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '🔄 Нова картинка',
          callback_data: 'update_picture',
        },
      ],
    ],
  },
};

export const handleUpdatePicture = () => async (ctx: Context) => {
  debug('Triggered "handleUpdatePicture" handler');

  const imageBuffer = await fetchImage();
  if (!imageBuffer) {
    debug('Fetch image failed');
    return;
  }

  const photoInfo = ctx.callbackQuery?.message as any;
  const caption = photoInfo ? photoInfo.caption : undefined;
  const caption_entities = caption ? photoInfo.caption_entities : undefined;
  const has_spoiler = photoInfo ? photoInfo.has_spoiler : undefined;
  const show_caption_above_media = caption
    ? photoInfo.show_caption_above_media
    : undefined;

  const mediaData = {
    media: {
      source: imageBuffer,
    },
    type: 'photo',
    caption,
    caption_entities,
    has_spoiler,
    show_caption_above_media,
  } as WrapCaption<InputMedia>;

  try {
    await ctx.editMessageMedia(mediaData, editMessageParams);
  } catch (e: unknown) {
    if (!(e instanceof TelegramError) || e.code !== 400) {
      throw e;
    }
  }
};
