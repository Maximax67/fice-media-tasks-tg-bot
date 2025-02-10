import createDebug from 'debug';
import { client } from '../core';
import { ChangeStatusEvents } from '../enums';
import {
  autoupdateTaskList,
  changeStatusEvent,
  formatChangeStatusEventMessage,
  getSelectedTask,
  taskTitleReplacer,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_tz');
const deleteTzRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTaskTz = () => async (ctx: Context) => {
  debug('Triggered "delete_tz" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteTzRegex);
  if (!match) {
    debug('Invalid delete tz command format');
    await ctx.reply(
      'Неправильний формат команди видалення тз!\n/delete_tz номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (!selectedTask.tz) {
    debug('No tz');
    await ctx.reply('ТЗ відсутнє на цю таску');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET tz = NULL
    WHERE id = $1
  `;

  const result = await client.query(query, [taskId]);
  if (!result.rowCount) {
    debug('Task not found');
    await ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;
  const newStatus = await changeStatusEvent(
    taskId,
    chatId,
    thread,
    ChangeStatusEvents.DELETE_TZ,
  );

  debug('Task tz deleted successfully');
  await ctx.reply(
    `ТЗ видалене з таски: ${taskTitleReplacer(selectedTask.title)}${formatChangeStatusEventMessage(newStatus)}`,
    {
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );

  await autoupdateTaskList(chatId, thread);
};
