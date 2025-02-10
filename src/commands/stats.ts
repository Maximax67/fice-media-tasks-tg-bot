import createDebug from 'debug';
import { client } from '../core';
import { Task } from '../interfaces';
import { formatResponsible, formatTaskMinimalistic } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:stats');
const statsRegex = /^(\/\S+)\s+(.+)$/;

export const getStats = () => async (ctx: Context) => {
  const message: string = (ctx.message as any).text.trim();
  const match = message.match(statsRegex);

  if (!match) {
    debug('Invalid get stats command format');
    await ctx.reply(
      'Неправильний формат команди отримання статистики користувача!\n/stats юзернейм',
    );
    return;
  }

  const responsible = match[2];
  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `
    SELECT t.* FROM tasks t
    JOIN chats c ON t.chat_id = c.id
    WHERE c.chat_id = $1 AND c.thread = $2 AND t.responsible = $3
  `;
  const result = await client.query(query, [chatId, thread, responsible]);
  const tasks: Task[] = result.rows;

  if (!tasks.length) {
    debug('This user does not complete any task');
    await ctx.reply(`${responsible} не був відповідальним за жодну з тасок!`);
    return;
  }

  const completedTasks = [];
  const inProgressTasks = [];

  for (const task of tasks) {
    if (task.completed_at) {
      completedTasks.push(task);
    } else {
      inProgressTasks.push(task);
    }
  }

  let statsMessage =
    `== Статистика ${formatResponsible(responsible)} ==\n\n` +
    `Виконано завдань: <b>${completedTasks.length}</b>\n` +
    `Поточних завдань: <b>${inProgressTasks.length}</b>\n\n`;

  if (inProgressTasks.length) {
    const formattedInProgressTasks = inProgressTasks
      .map(formatTaskMinimalistic)
      .join('\n');

    statsMessage += `<b>Поточні таски:</b>\n${formattedInProgressTasks}`;

    if (completedTasks.length) {
      statsMessage += '\n\n';
    }
  }

  if (completedTasks.length) {
    const formattedCompletedTasks = completedTasks
      .map(formatTaskMinimalistic)
      .join('\n');

    statsMessage += `<b>Виконані таски:</b>\n${formattedCompletedTasks}`;
  }

  await ctx.reply(statsMessage, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
};
