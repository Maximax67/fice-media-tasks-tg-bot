import createDebug from 'debug';
import { client } from '../core';
import { applyRestrictions, escapeHtml } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:leaderboard');

interface LeaderboardRow {
  responsible: string;
  task_count: string;
  last_completed: Date | null;
}

export const getLeaderboard = async (ctx: Context) => {
  debug('Triggered "leaderboard" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `
    SELECT
      t.responsible,
      COUNT(*) AS task_count,
      MAX(t.completed_at) AS last_completed
    FROM tasks t
    JOIN chats c ON t.chat_id = c.id
    WHERE
      c.chat_id = $1
      AND (
        EXISTS (SELECT 1 FROM shared_threads_chats WHERE chat_id = $1)
        OR thread = $2
      )
      AND t.responsible IS NOT NULL
    GROUP BY t.responsible
    HAVING
      COUNT(*) != COUNT(t.completed_at)
      OR MAX(t.completed_at) IS NULL
      OR MAX(t.completed_at) >= NOW() - INTERVAL '3 months'
    ORDER BY task_count DESC, last_completed DESC NULLS LAST;
  `;
  const result = await client.query(query, [chatId, thread]);
  const leaderboard: LeaderboardRow[] = result.rows;

  if (!leaderboard.length) {
    debug('Nobody was responsible for tasks in this chat!');
    await ctx.reply(`Ніхто не був відповідальним за таски в цьому чаті!`);
    return;
  }

  let leaderboardMessage = `=== Leaderboard ===\n`;
  leaderboard.forEach((row, index) => {
    const position = index + 1;

    let badge: string;
    switch (position) {
      case 1:
        badge = '🏆';
        break;
      case 2:
        badge = '🥈';
        break;
      case 3:
        badge = '🥉';
        break;
      default:
        badge = `  <b>${position}</b>  `;
    }

    leaderboardMessage += `\n${badge} <code>${escapeHtml(row.responsible)}</code>: <b>${row.task_count}</b>`;
  });

  await ctx.reply(leaderboardMessage, { parse_mode: 'HTML' });
};
