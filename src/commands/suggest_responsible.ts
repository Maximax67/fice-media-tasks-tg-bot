import createDebug from 'debug';
import { client } from '../core';
import { escapeHtml, formatDate } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:suggest_responsible');

interface SuggestResponsibleRow {
  responsible: string;
  task_count: string;
  last_completed: Date | null;
  has_pending: boolean;
}

export const suggestResponsible = async (ctx: Context) => {
  debug('Triggered "suggest_responsible" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `
    SELECT
      t.responsible,
      COUNT(*) AS task_count,
      MAX(t.completed_at) AS last_completed,
      MAX(t.created_at) AS last_created,
      CASE
        WHEN COUNT(*) != COUNT(t.completed_at) THEN true
        ELSE false
      END AS has_pending
    FROM tasks t
    JOIN chats c ON t.chat_id = c.id
    WHERE
      c.chat_id = $1
      AND (
        CASE
          WHEN EXISTS (
            SELECT 1 FROM shared_threads_chats WHERE chat_id = $1
          ) THEN TRUE
          ELSE thread = $2
        END
      )
      AND t.responsible IS NOT NULL
    GROUP BY t.responsible
    ORDER BY 
      has_pending,
      last_completed NULLS FIRST,
      task_count,
      last_created
  `;
  const result = await client.query(query, [chatId, thread]);
  const responsibles: SuggestResponsibleRow[] = result.rows;

  if (!responsibles.length) {
    debug('Nobody was responsible for tasks in this chat!');
    await ctx.reply(`Ніхто не був відповідальним за таски в цьому чаті!`);
    return;
  }

  let suggestResponsible = `=== Відповідальні ===\n`;
  responsibles.forEach((row) => {
    const lastCompleted = row.last_completed;
    const stats = lastCompleted
      ? `${formatDate(lastCompleted)}, <b>${row.task_count}</b>`
      : 'без виконаних тасок';

    let marker = '🟢';
    if (row.has_pending) {
      marker = '🔴';
    } else if (
      row.last_completed &&
      new Date().getTime() - new Date(row.last_completed).getTime() <
        7 * 24 * 60 * 60 * 1000
    ) {
      marker = '🟡';
    }

    suggestResponsible += `\n${marker} <code>${escapeHtml(row.responsible)}</code>: ${stats}`;
  });

  await ctx.reply(suggestResponsible, { parse_mode: 'HTML' });
};
