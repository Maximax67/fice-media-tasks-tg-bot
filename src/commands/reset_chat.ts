import createDebug from 'debug';
import { client } from '../core';
import { applyRestrictions } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:reset_chat');

export const resetChat = async (ctx: Context) => {
  debug('Triggered "reset_chat" command');

  if (!(await applyRestrictions(ctx, true))) {
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = 'SELECT 1 FROM chats WHERE chat_id = $1 AND thread = $2';
  const result = await client.query(query, [chatId, thread]);

  if (!result.rowCount) {
    debug('Chat not found in database');
    await ctx.reply('Бот не має жодної збереженої інформації про цей чат');
    return;
  }

  await ctx.reply(
    'Ви впевнені, що хочете очистити всю інформацію про цей чат з бази даних?',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Так',
              callback_data: 'reset_chat',
            },
            {
              text: 'Скасувати',
              callback_data: 'cancel_reset_chat',
            },
          ],
        ],
      },
    },
  );
};
