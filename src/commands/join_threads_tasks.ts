import createDebug from 'debug';
import { client } from '../core';

import type { Context } from 'telegraf';
import { autoupdateTaskList } from '../utils';

const debug = createDebug('bot:join_threads_tasks');

export const joinThreadsTasks = () => async (ctx: Context) => {
  debug('Triggered "join_threads_tasks" command');

  const chatId = ctx.chat!.id;
  const query = `
    INSERT INTO shared_threads_chats (chat_id)
    VALUES ($1)
    ON CONFLICT (chat_id) DO NOTHING
    RETURNING chat_id
  `;

  const result = await client.query(query, [chatId]);

  if (!result.rowCount) {
    debug(`Shared threads already enabled: ${chatId}`);
    await ctx.reply('Завдання між гілками вже спільні!');
    return;
  }

  await ctx.reply('Завдання між гілками тепер спільні!');
  await autoupdateTaskList(chatId, -1);
};
