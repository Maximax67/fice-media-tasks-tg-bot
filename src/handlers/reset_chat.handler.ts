import createDebug from 'debug';
import { client } from '../core';

import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_reset_chat');

export const handleResetChat = () => async (ctx: Context) => {
  debug('Triggered "handleResetChat" handler');

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || 0;

  const query = 'DELETE FROM chats WHERE chat_id = $1 AND thread = $2';
  const res = await client.query(query, [chatId, thread]);

  if (!res.rowCount) {
    debug('Chat info not found');
    await ctx.editMessageText('Інформація про чат не знайдена в базі даних!');
    return;
  }

  debug(`Chat info deleted. Chat id: ${chatId}, thread: ${thread}`);
  await ctx.editMessageText('Вся інформація про чат видалена!');
};
