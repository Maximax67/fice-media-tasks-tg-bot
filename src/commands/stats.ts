import createDebug from 'debug';
import { client } from '../core';
import type { Context } from 'telegraf';
import { Task } from '../interfaces';
import { formatAssignedPerson, formatTaskMinimalistic } from '../utils';

const debug = createDebug('bot:stats');
const statsRegex = /^(\/\S+)\s+(.+)$/;

export const getStats = () => async (ctx: Context) => {
  const message: string = (ctx.message as any).text.trim();
  const match = message.match(statsRegex);

  if (!match) {
    debug('Invalid get stats command format');
    ctx.reply(
      'Неправильний формат команди отримання статистики користувача!\n/stats юзернейм',
    );
    return;
  }

  const responsible = match[2];
  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  const query = thread
    ? `
    SELECT * FROM tasks
    WHERE chat_id = $1 AND thread = $2 AND assigned_person = $3
  `
    : `
    SELECT * FROM tasks
    WHERE chat_id = $1 AND thread IS NULL AND assigned_person = $2
  `;

  const params = thread ? [chatId, thread, responsible] : [chatId, responsible];
  const result = await client.query(query, params);
  const tasks: Task[] = result.rows;

  if (!tasks.length) {
    debug('This user does not complete any task');
    ctx.reply(`${responsible} не був відповідальним за жодну з тасок!`);
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
    `== Статистика ${formatAssignedPerson(responsible)} ==\n\n` +
    `Виконано завдань: ${completedTasks.length}\n` +
    `Поточних завдань: ${inProgressTasks.length}\n\n`;

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

  ctx.reply(statsMessage, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
};
