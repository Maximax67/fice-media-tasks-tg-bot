import createDebug from 'debug';
import { getMotivationImage, getMotivationType } from '../utils';

import { Markup, type Context } from 'telegraf';
import { MotivationTypes } from '../enums';

const debug = createDebug('bot:motivation');

export const motivation = async (ctx: Context) => {
  debug('Triggered "motivation" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const motivationType = await getMotivationType(chatId, thread);
  if (motivationType === MotivationTypes.NONE) {
    debug('Motivation image type not set');
    await ctx.reply(
      'Тип мотиваційних зображень не встановлений. Задайте командою /set_motivation',
    );
    return;
  }

  const imageBuffer = await getMotivationImage(motivationType);
  if (!imageBuffer) {
    debug('Fetch image failed');
    await ctx.reply('Не вдалось завантажити картинку з API. Спробуйте ще раз!');
    return;
  }

  await ctx.replyWithPhoto(
    { source: imageBuffer },
    Markup.inlineKeyboard([
      Markup.button.callback(
        '🔄 Нова картинка',
        `update_picture:${motivationType}`,
      ),
    ]),
  );
};
