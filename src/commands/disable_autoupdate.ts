import createDebug from 'debug';
import { client } from '../core';

import type { Context } from 'telegraf';

const debug = createDebug('bot:disable_autoupdate');

export const disableAutoupdate = () => async (ctx: Context) => {
  debug('Triggered "disable_autoupdate" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `
    UPDATE chats
    SET autoupdate_message_id = NULL
    WHERE chat_id = $1 AND thread = $2
  `;
  const result = await client.query(query, [chatId, thread]);

  if (!result.rowCount) {
    debug('Autoupdate already disabled');
    await ctx.reply('Автоматичне оновлення вже вимкнено!');
    return;
  }

  await ctx.reply('Автоматичне оновлення вимкнено!');
};
