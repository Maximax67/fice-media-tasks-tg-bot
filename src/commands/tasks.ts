import createDebug from 'debug';
import { generateTaskList, getTasksForChat } from '../utils';
import { Markup, type Context } from 'telegraf';

const debug = createDebug('bot:tasks');

export const getTasks = () => async (ctx: Context) => {
  debug('Triggered "tasks" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  const tasks = await getTasksForChat(chatId, thread);
  if (tasks.length === 0) {
    debug('No tasks found');
    ctx.reply(
      'Немає тасок! Створіть нову командою /new_task',
      Markup.inlineKeyboard([
        Markup.button.callback('Оновити', 'update_tasks'),
      ]),
    );

    return;
  }

  if (tasks.length === 1) {
    debug('Got task list with 1 item');
  } else {
    debug(`Got task list with ${tasks.length} items`);
  }

  ctx.reply(generateTaskList(tasks), {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Оновити',
            callback_data: 'update_tasks',
          },
        ],
      ],
    },
  });
};
