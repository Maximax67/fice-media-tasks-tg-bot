import createDebug from 'debug';
import { client } from '../core';

import type { Context } from 'telegraf';

const debug = createDebug('bot:task_message');

export const getTasksMessage = () => async (ctx: Context) => {
  debug('Triggered "task_message" command');

  if (ctx.chat?.type === 'private') {
    await ctx.reply('Команда не працює в приватних повідомленнях!');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `SELECT autoupdate_message_id FROM chats WHERE chat_id = $1 AND thread = $2`;
  const result = await client.query(query, [chatId, thread]);
  const rows = result.rows;
  const tasks_message_id: string | null = rows.length
    ? rows[0].autoupdate_message_id.toString()
    : null;

  if (!tasks_message_id) {
    await ctx.reply(
      'Повідомлення з автоматичним оновленням відсутнє у цьому чаті або гілці!',
    );
    return;
  }

  const chat_id_str = chatId.toString().replace('-100', '');
  if (thread == 0) {
    await ctx.reply(`https://t.me/c/${chat_id_str}/${tasks_message_id}`);
    return;
  }

  await ctx.reply(
    `https://t.me/c/${chat_id_str}/${thread}/${tasks_message_id}`,
  );
};
