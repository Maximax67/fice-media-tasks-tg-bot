import createDebug from 'debug';

import {
  escapeHtml,
  getChatTaskStatusesFromChat,
  getSelectedTask,
  taskTitleReplacer,
} from '../utils';

import type { Context } from 'telegraf';
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

const debug = createDebug('bot:set_status');
const setTaskStatusRegex = /^(\/\S+)\s+(\d+)$/;

export const setTaskStatus = () => async (ctx: Context) => {
  debug('Triggered "set_status" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskStatusRegex);
  if (!match) {
    debug('Invalid update task status command format');
    await ctx.reply(
      'Неправильний формат зміни статусу таски!\n/set_status номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  const chatTaskStatuses = await getChatTaskStatusesFromChat(
    selectedTask.chat_id,
  );
  if (chatTaskStatuses.length === 1) {
    debug('Only one status created');
    await ctx.reply('Лише один статус створений!');
    return;
  }

  const taskId = selectedTask.id;
  const taskStatus = selectedTask.status;
  const taskStatusId = taskStatus.id;
  const keyboard: InlineKeyboardButton[][] = [];
  chatTaskStatuses.forEach((status) => {
    if (status.id !== taskStatusId) {
      keyboard.push([
        {
          text: `${status.icon} ${status.title}`,
          callback_data: `set_status:${taskId}:${status.id}`,
        },
      ]);
    }
  });

  keyboard.push([
    {
      text: 'Закрити',
      callback_data: 'remove_markup',
    },
  ]);

  await ctx.reply(
    `${taskTitleReplacer(selectedTask.title)}\n\nСтатус: ${escapeHtml(taskStatus.icon)} ${escapeHtml(taskStatus.title)}`,
    {
      reply_markup: { inline_keyboard: keyboard },
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );
};
