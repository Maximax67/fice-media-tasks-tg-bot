import createDebug from 'debug';
import {
  generateTaskList,
  getChatLinksFormatted,
  getChatTaskStatuses,
  getTasksAndCommentsForChat,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:tasks');

export const getTasks = async (ctx: Context) => {
  debug('Triggered "tasks" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const tasks = await getTasksAndCommentsForChat(chatId, thread);
  const chatLinks = await getChatLinksFormatted(chatId, thread);
  if (tasks.length === 0) {
    debug('No tasks found');
    const noTasksMessage = 'Немає тасок! Створіть нову командою /new_task';
    await ctx.reply(
      chatLinks ? noTasksMessage + '\n\n' + chatLinks : noTasksMessage,
      {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔄 Оновити',
                callback_data: 'update_tasks',
              },
            ],
          ],
        },
      },
    );

    return;
  }

  if (tasks.length === 1) {
    debug('Got task list with 1 item');
  } else {
    debug(`Got task list with ${tasks.length} items`);
  }

  const chatTaskStatuses = await getChatTaskStatuses(chatId, thread);
  const taskList = generateTaskList(tasks, chatTaskStatuses);
  const replyText = chatLinks ? taskList + '\n\n' + chatLinks : taskList;

  await ctx.reply(replyText, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🔄 Оновити',
            callback_data: 'update_tasks',
          },
        ],
      ],
    },
  });
};
