import createDebug from 'debug';
import { client } from '../core';
import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_all_tasks');

export const deleteAllTasks = () => async (ctx: Context) => {
  debug('Triggered "delete_all_tasks" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  const query = thread
    ? `
      DELETE FROM tasks
      WHERE chat_id = $1 AND thread = $2
    `
    : `
      DELETE FROM tasks
      WHERE chat_id = $1 AND thread is NULL
    `;

  const params = thread ? [chatId, thread] : [chatId];
  const res = await client.query(query, params);
  const deletedTasks = res.rowCount;

  if (!deletedTasks) {
    debug('Task list is empty');
    ctx.reply('Наразі немає тасок!');
    return;
  }

  if (deletedTasks === 1) {
    debug('1 task deleted');
  } else {
    debug(`${deletedTasks} tasks deleted`);
  }

  ctx.reply(`Видалено всі завдання: ${deletedTasks}`);
};
