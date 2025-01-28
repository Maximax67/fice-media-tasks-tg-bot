import createDebug from 'debug';
import { client } from '../core';
import type { Context } from 'telegraf';

const debug = createDebug('bot:autoupdate');
const autoupdateRegex =
  /^(\/\S+)\s+(https?:\/\/t\.me\/c\/(\d+)\/(\d+)(?:\/(\d+))?)$/;

export const autoupdate = () => async (ctx: Context) => {
  debug('Triggered "autoupdate" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(autoupdateRegex);
  if (!match) {
    debug('Invalid autoupdate command format');
    ctx.reply(
      'Неправильний формат команди встановлення автоматичного оновлення списку завдань!\n/autoupdate посилання на повідомлення в телеграм зі списком тасок',
    );
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  const urlChatId = parseInt(match[3], 10);
  const urlThread = match.length === 6 ? parseInt(match[4], 10) : null;
  const messageId = parseInt(match[match.length - 1], 10);

  if (chatId.toString() !== "-100" + urlChatId.toString() || thread !== urlThread) {
    debug('Provided url for message in another chat or thread');
    ctx.reply('Надане посилання веде на повідомлення у іншому чаті або гілці!');
    return;
  }

  const result = await client.query(
    `
    INSERT INTO autoupdate_messages (chat_id, thread, message_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (chat_id, thread) 
    DO UPDATE SET message_id = EXCLUDED.message_id;
  `,
    [chatId, thread, messageId],
  );

  if (!result.rowCount) {
    debug('This message is already set for autoupdate');
    ctx.reply('Це повідомлення вже автоматично оновлюється!');
    return;
  }

  ctx.reply('Це повідомлення тепер автоматично оновлюватиметься!');
};
