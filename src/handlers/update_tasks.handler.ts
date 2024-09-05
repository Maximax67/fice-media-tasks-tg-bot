import createDebug from 'debug';
import { TelegramError, type Context } from 'telegraf';
import type { ExtraEditMessageText } from 'telegraf/typings/telegram-types';

import {
  formatDateTime,
  generateTaskList,
  getTasksAndCommentsForChat,
} from '../utils';

const debug = createDebug('bot:handle_update_tasks');
const editMessageParams: ExtraEditMessageText = {
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
};

export const handleUpdateTasks = () => async (ctx: Context) => {
  debug('Triggered "handleUpdateTasks" handler');

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || null;
  const tasks = await getTasksAndCommentsForChat(chatId, thread);
  const formattedDatetime = formatDateTime(new Date(), true);
  const updateMessage = `<i>Оновлено: ${formattedDatetime}</i>`;

  if (tasks.length === 0) {
    debug('No tasks found');
    try {
      await ctx.editMessageText(
        'Немає тасок! Створіть нову командою /new_task\n' + updateMessage,
        editMessageParams,
      );
    } catch (e: unknown) {
      if (!(e instanceof TelegramError) || e.code !== 400) {
        throw e;
      }
    }
    return;
  }

  if (tasks.length === 1) {
    debug(`Got task list with ${tasks.length} item`);
  } else {
    debug(`Got task list with ${tasks.length} items`);
  }

  try {
    await ctx.editMessageText(
      generateTaskList(tasks) + '\n\n' + updateMessage,
      editMessageParams,
    );
  } catch (e: unknown) {
    if (!(e instanceof TelegramError) || e.code !== 400) {
      throw e;
    }
  }
};
