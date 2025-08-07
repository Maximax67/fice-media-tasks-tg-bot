import createDebug from 'debug';
import { client } from '../core';

import type { Context } from 'telegraf';
import { autoupdateTaskList } from '../utils';

const debug = createDebug('bot:separate_threads_tasks');

export const separateThreadsTasks = async (ctx: Context) => {
  debug('Triggered "separate_threads_tasks" command');

  const chatId = ctx.chat!.id;
  const query = `
    DELETE FROM shared_threads_chats
    WHERE chat_id = $1
  `;
  const result = await client.query(query, [chatId]);

  if (!result.rowCount) {
    await ctx.reply('Таски вже розділені між гілками!');
    return;
  }

  await ctx.reply('Таски тепер розділені між гілками!');
  await autoupdateTaskList(chatId, -1);
};
