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

const debug = createDebug('bot:delete_responsible');
const deleteResponsibleRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTaskResponsible = async (ctx: Context) => {
  debug('Triggered "delete_responsible" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteResponsibleRegex);
  if (!match) {
    debug('Invalid delete responsible command format');
    await ctx.reply(
      'Неправильний формат команди видалення відповідального!\n/delete_responsible номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (!selectedTask.responsible) {
    debug('There is no responsible for this task');
    await ctx.reply('Відповідальний не назначений на цю таску');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET responsible = NULL
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
    ChangeStatusEvents.DELETE_RESPONSIBLE,
  );

  debug('Task responsible deleted successfully');
  await ctx.reply(
    `Відповідальний видалений з таски: ${taskTitleReplacer(selectedTask.title)}${formatChangeStatusEventMessage(newStatus)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  await autoupdateTaskList(chatId, thread);
};
