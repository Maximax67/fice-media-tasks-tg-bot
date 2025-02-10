import createDebug from 'debug';
import { client } from '../core';

import type { Context } from 'telegraf';

const debug = createDebug('bot:autoupdate');

export const autoupdate = () => async (ctx: Context) => {
  debug('Triggered "autoupdate" command');

  const replyToMessage = (ctx.message as any).reply_to_message;
  if (!replyToMessage) {
    debug('Invalid autoupdate command format');
    await ctx.reply(
      'Неправильний формат команди встановлення автоматичного оновлення списку завдань!\n/autoupdate з реплаєм на повідомленя зі списком завдань',
    );
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const replyChatId: number = replyToMessage.chat.id;
  const replyThread: number = replyToMessage.message_thread_id || 0;
  const messageId: number = replyToMessage.message_id;
  const isBot: boolean = replyToMessage.from.is_bot;

  if (chatId !== replyChatId || (replyThread && thread !== replyThread)) {
    debug('Reply for message in another chat or thread');
    await ctx.reply('Реплай веде на повідомлення у іншому чаті або гілці!');
    return;
  }

  if (!isBot) {
    debug('Invalid autoupdate command format');
    await ctx.reply(
      'Неправильний формат команди встановлення автоматичного оновлення списку завдань!\n/autoupdate з реплаєм на повідомленя зі списком завдань',
    );
    return;
  }

  const query = `
    INSERT INTO chats (chat_id, thread, autoupdate_message_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (chat_id, thread) 
    DO UPDATE SET autoupdate_message_id = EXCLUDED.autoupdate_message_id;
  `;
  const result = await client.query(query, [chatId, replyThread, messageId]);

  if (!result.rowCount) {
    debug('This message is already set for autoupdate');
    await ctx.reply('Це повідомлення вже автоматично оновлюється!');
    return;
  }

  await ctx.reply('Це повідомлення тепер автоматично оновлюватиметься!');
};
