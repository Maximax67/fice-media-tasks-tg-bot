import createDebug from 'debug';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

import {
  autoupdateTaskList,
  getSelectedTask,
  taskTitleReplacer,
} from '../utils';
import { STATUS_ICONS, STATUS_NAMES } from '../constants';
import { TaskStatuses } from '../enums';

import type { Context } from 'telegraf';

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

  const taskId = selectedTask.id;
  const keyboard: InlineKeyboardButton[][] = [];
  Object.values(TaskStatuses).forEach((taskStatus) => {
    if (taskStatus !== selectedTask.status) {
      keyboard.push([
        {
          text: `${STATUS_ICONS[taskStatus]} ${STATUS_NAMES[taskStatus]}`,
          callback_data: `set_status:${taskId}:${taskStatus}`,
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

  debug('Task added successfully');
  await ctx.reply(
    `${taskTitleReplacer(selectedTask.title)}\n\nСтатус: ${STATUS_ICONS[selectedTask.status]} ${STATUS_NAMES[selectedTask.status]}`,
    {
      reply_markup: { inline_keyboard: keyboard },
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  await autoupdateTaskList(chatId, thread);
};
