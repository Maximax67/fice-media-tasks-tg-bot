import createDebug from 'debug';
import { TaskStatuses } from '../enums';
import { STATUS_ICONS, STATUS_NAMES } from '../constants';
import { fetchImage, formatTask, getTasksAndCommentsForChat } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:edits');

export const edits = () => async (ctx: Context) => {
  debug('Triggered "edits" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  const tasks = await getTasksAndCommentsForChat(chatId, thread);
  if (tasks.length === 0) {
    debug('No tasks found');
    ctx.reply('Немає тасок! Створіть нову командою /new_task');

    return;
  }

  let formattedTasks = '<b>== Очікують правок ==</b>';
  let counter = 0;

  for (const task of tasks) {
    if (task.status == TaskStatuses.EDITING) {
      formattedTasks += '\n\n' + formatTask(task, counter++);
    }
  }

  if (counter === 0) {
    debug('No in process tasks found');
    ctx.reply(
      `Немає тасок зі статусом ${STATUS_ICONS[TaskStatuses.EDITING]} ${STATUS_NAMES[TaskStatuses.EDITING]}!`,
    );

    return;
  }

  const imageBuffer = await fetchImage();
  if (!imageBuffer) {
    debug('Fetch image failed');
    ctx.reply(formattedTasks, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
    return;
  }

  ctx.replyWithPhoto({ source: imageBuffer }, {
    caption: formattedTasks,
    parse_mode: 'HTML',
    show_caption_above_media: true,
  } as any);
};
