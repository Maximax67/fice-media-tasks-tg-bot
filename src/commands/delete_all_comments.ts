import createDebug from 'debug';
import { client } from '../core';
import { autoupdateTaskList, getTasksForChat, urlReplacer } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_all_comments');
const deleteAllCommentsRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteAllTaskComments = () => async (ctx: Context) => {
  debug('Triggered "delete_all_comments" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteAllCommentsRegex);

  if (!match) {
    debug('Invalid task delete all comments command format');
    ctx.reply(
      'Неправильний формат команди видалення всіх коментарів!\n/delete_all_comments номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);

  if (taskNumber < 1) {
    debug('Invalid task number');
    ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;
  const tasks = await getTasksForChat(chatId, thread);

  if (!tasks.length) {
    debug('There are no tasks');
    ctx.reply('Не створено жодної таски');
    return;
  }

  if (taskNumber > tasks.length) {
    debug(`Invalid task number: ${taskNumber}`);
    ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const selectedTask = tasks[taskNumber - 1];
  const taskId = selectedTask.id;

  const result = await client.query('DELETE FROM comments WHERE task_id = $1', [
    taskId,
  ]);

  if (!result.rowCount) {
    debug('No comments found for the task');
    ctx.reply('Коментарі до таски не знайдено. Можливо вони вже видалені');
    return;
  }

  debug(`Deleted ${result.rowCount} comment(s) for task id: ${taskId}`);
  ctx.reply(
    `Видалено коментарі (${result.rowCount}) до таски: ${urlReplacer(selectedTask.title)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  autoupdateTaskList(chatId, thread);
};
