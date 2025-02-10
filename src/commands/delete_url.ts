import createDebug from 'debug';
import { client } from '../core';
import {
  autoupdateTaskList,
  changeStatusEvent,
  formatChangeStatusEventMessage,
  getSelectedTask,
  taskTitleReplacer,
} from '../utils';

import type { Context } from 'telegraf';
import { ChangeStatusEvents } from '../enums';

const debug = createDebug('bot:delete_url');
const deleteUrlRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTaskUrl = () => async (ctx: Context) => {
  debug('Triggered "delete_url" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteUrlRegex);
  if (!match) {
    debug('Invalid delete url command format');
    await ctx.reply(
      'Неправильний формат команди видалення посилання на виконану таску!\n/delete_url номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (!selectedTask.url) {
    debug('No url');
    await ctx.reply('Посилання відсутнє на цю таску');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET url = NULL
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

  debug('Task url deleted successfully');
  await ctx.reply(
    `Посилання видалене з таски: ${taskTitleReplacer(selectedTask.title)}${formatChangeStatusEventMessage(newStatus)}`,
    {
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );

  await autoupdateTaskList(chatId, thread);
};
