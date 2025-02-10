import createDebug from 'debug';
import { getMotivationImage } from '../utils';

import { TelegramError, type Context } from 'telegraf';
import type { WrapCaption } from 'telegraf/typings/telegram-types';
import type { InputMedia } from 'telegraf/typings/core/types/typegram';
import { MotivationTypes } from '../enums';

const debug = createDebug('bot:handle_update_picture');

export const handleUpdatePicture = () => async (ctx: Context) => {
  debug('Triggered "handleUpdatePicture" handler');

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('update_picture:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const splittedData = callbackData.split(':');
  const motivationType = splittedData[1] as MotivationTypes;

  if (!Object.values(MotivationTypes).includes(motivationType)) {
    debug(`Invalid motivation type: ${motivationType}`);
    await ctx.editMessageText('Не валідний тип мотивації');
    return;
  }

  const imageBuffer = await getMotivationImage(motivationType);
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
    await ctx.editMessageMedia(mediaData, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔄 Нова картинка',
              callback_data: `update_picture:${motivationType}`,
            },
          ],
        ],
      },
    });
  } catch (e: unknown) {
    if (!(e instanceof TelegramError) || e.code !== 400) {
      throw e;
    }
  }
};
