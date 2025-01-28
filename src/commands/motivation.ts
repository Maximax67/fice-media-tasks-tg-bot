import createDebug from 'debug';
import { fetchImage } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:motivation');

export const motivation = () => async (ctx: Context) => {
  debug('Triggered "motivation" command');

  const imageBuffer = await fetchImage();
  if (!imageBuffer) {
    debug('Fetch image failed');
    ctx.reply('Не вдалось завантажити картинку з API. Спробуйте ще раз!');
    return;
  }

  ctx.replyWithPhoto({ source: imageBuffer });
};
