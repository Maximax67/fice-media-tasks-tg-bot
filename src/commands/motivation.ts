import createDebug from 'debug';
import { fetchImage } from '../utils';

import { Markup, type Context } from 'telegraf';

const debug = createDebug('bot:motivation');

export const motivation = () => async (ctx: Context) => {
  debug('Triggered "motivation" command');

  const imageBuffer = await fetchImage();
  if (!imageBuffer) {
    debug('Fetch image failed');
    await ctx.reply('Не вдалось завантажити картинку з API. Спробуйте ще раз!');
    return;
  }

  await ctx.replyWithPhoto(
    { source: imageBuffer },
    Markup.inlineKeyboard([
      Markup.button.callback('🔄 Нова картинка', 'update_picture'),
    ]),
  );
};
