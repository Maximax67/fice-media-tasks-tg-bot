import createDebug from 'debug';
import { client } from '../core';

import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_reset_chat');

export const handleResetChat = () => async (ctx: Context) => {
  debug('Triggered "handleResetChat" handler');

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || 0;

  const query = `
    WITH deleted_chats AS (
      DELETE FROM chats
      WHERE chat_id = $1
        AND (
          CASE
            WHEN EXISTS (
              SELECT 1 FROM shared_threads_chats WHERE chat_id = $1
            ) THEN TRUE
            ELSE thread = $2
          END
        )
      RETURNING *
    ),
    deleted_shared AS (
      DELETE FROM shared_threads_chats
      WHERE chat_id = $1
      RETURNING *
    )
    SELECT
      (SELECT COUNT(*) FROM deleted_chats) AS chats_deleted,
      (SELECT COUNT(*) FROM deleted_shared) AS shared_deleted;
  `;

  const res = await client.query(query, [chatId, thread]);
  const counts = res.rows[0];

  if (counts.chats_deleted === '0' && counts.shared_deleted === '0') {
    debug('Chat info not found');
    await ctx.editMessageText('Інформація про чат не знайдена в базі даних!');
    return;
  }

  debug(`Chat info deleted. Chat id: ${chatId}, thread: ${thread}`);
  await ctx.editMessageText('Вся інформація про чат видалена!');
};
