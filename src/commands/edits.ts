import createDebug from 'debug';
import {
  applyRestrictions,
  formatTask,
  getMotivationImage,
  getMotivationType,
  getTasksAndCommentsForChat,
} from '../utils';
import { MotivationTypes } from '../enums';

import type { Context } from 'telegraf';

const debug = createDebug('bot:edits');

export const edits = async (ctx: Context) => {
  debug('Triggered "edits" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const tasks = await getTasksAndCommentsForChat(chatId, thread);
  if (tasks.length === 0) {
    debug('No tasks found');
    await ctx.reply('Немає тасок! Створіть нову командою /new_task');

    return;
  }

  let formattedTasks = '<b>== Очікують правок ==</b>';
  let counter = 0;

  for (const task of tasks) {
    if (task.url) {
      formattedTasks += '\n\n' + formatTask(task, counter++, false);
    }
  }

  if (counter === 0) {
    debug('No in process tasks found');
    await ctx.reply(`Немає тасок зі встановленими посиланнями!`);
    return;
  }

  const motivationType = await getMotivationType(chatId, thread);
  if (motivationType === MotivationTypes.NONE) {
    await ctx.reply(formattedTasks, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
    return;
  }

  const imageBuffer = await getMotivationImage(motivationType);
  if (!imageBuffer) {
    debug('Fetch image failed');
    await ctx.reply(formattedTasks, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
    return;
  }

  await ctx.replyWithPhoto({ source: imageBuffer }, {
    caption: formattedTasks,
    parse_mode: 'HTML',
    show_caption_above_media: true,
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
  } as any);
};
