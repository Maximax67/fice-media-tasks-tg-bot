import createDebug from 'debug';
import { client } from '../core';
import { escapeHtml } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:leaderboard');

interface LeaderboardRow {
  assigned_person: string;
  task_count: string;
  last_completed: Date | null;
}

export const getLeaderboard = () => async (ctx: Context) => {
  debug('Triggered "leaderboard" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  const query = thread
    ? `SELECT 
        assigned_person, 
        COUNT(*) AS task_count,
        MAX(completed_at) AS last_completed
    FROM tasks
    WHERE chat_id = $1 AND thread = $2 AND assigned_person IS NOT NULL
    GROUP BY assigned_person
    ORDER BY task_count DESC, last_completed DESC NULLS LAST;
    `
    : `SELECT 
        assigned_person, 
        COUNT(*) AS task_count,
        MAX(completed_at) AS last_completed
    FROM tasks
    WHERE chat_id = $1 AND thread IS NULL AND assigned_person IS NOT NULL
    GROUP BY assigned_person
    ORDER BY task_count DESC, last_completed ASC NULLS LAST`;

  const params = thread ? [chatId, thread] : [chatId];
  const result = await client.query(query, params);
  const leaderboard: LeaderboardRow[] = result.rows;

  if (!leaderboard.length) {
    debug('Nobody was responsible for tasks in this chat!');
    await ctx.reply(`Ніхто не був відповідальним за таски в цьому чаті!`);
    return;
  }

  let leaderboardMessage = `=== Leaderboard ===\n\n`;
  leaderboard.forEach((row, index) => {
    const position = index + 1;

    let badge;
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
      case leaderboard.length:
        badge = '💩';
        break;
      default:
        badge = `  <b>${position}</b>  `;
    }

    leaderboardMessage += `${badge} <code>${escapeHtml(row.assigned_person)}</code>: <b>${row.task_count}</b>\n`;
  });

  await ctx.reply(leaderboardMessage, { parse_mode: 'HTML' });
};
