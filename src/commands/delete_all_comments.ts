import createDebug from 'debug';
import { client } from '../core';
import { ChangeStatusEvents } from '../enums';
import {
  autoupdateTaskList,
  changeStatusEvent,
  formatChangeStatusEventMessage,
  getTasksForChat,
  urlReplacer,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_all_comments');
const deleteAllCommentsRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteAllTaskComments = () => async (ctx: Context) => {
  debug('Triggered "delete_all_comments" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteAllCommentsRegex);

  if (!match) {
    debug('Invalid task delete all comments command format');
    await ctx.reply(
      'Неправильний формат команди видалення всіх коментарів!\n/delete_all_comments номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);

  if (taskNumber < 1) {
    debug('Invalid task number');
    await ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;
  const tasks = await getTasksForChat(chatId, thread);

  if (!tasks.length) {
    debug('There are no tasks');
    await ctx.reply('Не створено жодної таски');
    return;
  }

  if (taskNumber > tasks.length) {
    debug(`Invalid task number: ${taskNumber}`);
    await ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const selectedTask = tasks[taskNumber - 1];
  const taskId = selectedTask.id;

  const result = await client.query('DELETE FROM comments WHERE task_id = $1', [
    taskId,
  ]);

  if (!result.rowCount) {
    debug('No comments found for the task');
    await ctx.reply(
      'Коментарі до таски не знайдено. Можливо вони вже видалені',
    );
    return;
  }

  const newStatus = await changeStatusEvent(
    taskId,
    chatId,
    thread,
    ChangeStatusEvents.DELETE_ALL_COMMENTS,
  );

  debug(`Deleted ${result.rowCount} comment(s) for task id: ${taskId}`);
  await ctx.reply(
    `Видалено коментарі (${result.rowCount}) до таски: ${urlReplacer(selectedTask.title)}${formatChangeStatusEventMessage(newStatus)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  await autoupdateTaskList(chatId, thread);
};
