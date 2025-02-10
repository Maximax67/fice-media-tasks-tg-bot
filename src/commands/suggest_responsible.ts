import createDebug from 'debug';
import { client } from '../core';
import { escapeHtml, formatDate } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:suggest_responsible');

interface SuggestResponsibleRow {
  responsible: string;
  task_count: string;
  last_completed: Date | null;
}

export const suggestResponsible = () => async (ctx: Context) => {
  debug('Triggered "suggest_responsible" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `
    SELECT 
      t.responsible, 
      COUNT(*) AS task_count,
      MAX(t.completed_at) AS last_completed,
      MAX(t.created_at) AS last_created
    FROM tasks t
    JOIN chats c ON t.chat_id = c.id
    WHERE c.chat_id = $1 
    AND c.thread = $2
    AND t.responsible IS NOT NULL
    GROUP BY t.responsible
    ORDER BY last_completed NULLS FIRST, task_count, last_created
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
    suggestResponsible += `\n<code>${escapeHtml(row.responsible)}</code>: ${stats}`;
  });

  await ctx.reply(suggestResponsible, { parse_mode: 'HTML' });
};
