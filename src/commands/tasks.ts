import createDebug from 'debug';
import {
  generateTaskList,
  getAdditionalText,
  getTasksAndCommentsForChat,
} from '../utils';
import { Markup, type Context } from 'telegraf';

const debug = createDebug('bot:tasks');

export const getTasks = () => async (ctx: Context) => {
  debug('Triggered "tasks" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  const tasks = await getTasksAndCommentsForChat(chatId, thread);
  if (tasks.length === 0) {
    debug('No tasks found');
    await ctx.reply(
      'Немає тасок! Створіть нову командою /new_task',
      Markup.inlineKeyboard([
        Markup.button.callback('🔄 Оновити', 'update_tasks'),
      ]),
    );

    return;
  }

  if (tasks.length === 1) {
    debug('Got task list with 1 item');
  } else {
    debug(`Got task list with ${tasks.length} items`);
  }

  const additionalText = getAdditionalText(chatId, thread);
  const taskList = generateTaskList(tasks);
  const replyText = additionalText
    ? taskList + '\n\n' + additionalText
    : taskList;

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
