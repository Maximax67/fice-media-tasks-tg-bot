import createDebug from 'debug';
import { client } from '../core';
import { autoupdateTaskList } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_all_tasks');

export const deleteAllTasks = () => async (ctx: Context) => {
  debug('Triggered "delete_all_tasks" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `
    UPDATE tasks
    SET completed_at = CURRENT_TIMESTAMP, status_id = NULL
    FROM chats c
    WHERE tasks.chat_id = c.id
    AND c.chat_id = $1
    AND c.thread = $2
    AND tasks.completed_at IS NULL
  `;

  const res = await client.query(query, [chatId, thread]);
  const deletedTasksCount = res.rowCount;

  if (!deletedTasksCount) {
    debug('Task list is empty');
    await ctx.reply('Наразі немає тасок!');
    return;
  }

  if (deletedTasksCount === 1) {
    debug('1 task deleted');
  } else {
    debug(`${deletedTasksCount} tasks deleted`);
  }

  await ctx.reply(`Видалено всі завдання: ${deletedTasksCount}`);

  await autoupdateTaskList(chatId, thread);
};
