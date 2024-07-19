import createDebug from 'debug';
import { client } from '../core';
import type { QueryResult } from 'pg';
import { Markup, type Context } from 'telegraf';

const debug = createDebug('bot:new_task');
const newTaskRegex =
  /^(\/\S+)\s+((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*)(?:\s*\/\s*((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*))?(?:\s*\/\s*((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*))?(?:\s*\/\s*((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*))?(?:\s*\/\s*((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*))?$/;

interface ReturnQueryWithId {
  id: number;
}

export const newTask = () => async (ctx: Context) => {
  debug('Triggered "new_task" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;
  const message: string = (ctx.message as any).text;

  const match = message.match(newTaskRegex);
  if (!match || !match[2]) {
    debug('Invalid task creation command format');
    ctx.reply(
      'Неправильний формат створення таски!\n/new_task Назва таски / ТЗ / дедлайн / дедлайн посту / відповідальний',
    );
    return;
  }

  const title = match[2].trim();
  const tz = match[3]?.trim() || null;
  const deadline = match[4]?.trim() || null;
  const postDeadline = match[5]?.trim() || null;
  const assignedPerson = match[6]?.trim() || null;

  const query = `
    INSERT INTO tasks (chat_id, thread, title, tz, deadline, post_deadline, assigned_person)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
  `;

  const result: QueryResult<ReturnQueryWithId> = await client.query(query, [
    chatId,
    thread,
    title,
    tz,
    deadline,
    postDeadline,
    assignedPerson,
  ]);

  const taskId = result.rows[0].id;

  debug('Task added successfully');
  ctx.reply(
    'Нова таска створена!\n\n' +
      `${title}\n\n` +
      `ТЗ: ${tz || 'відсутнє'}\n` +
      `Дедлайн: ${deadline || 'відсутній'}\n` +
      `Дедлайн посту: ${postDeadline || 'відсутній'}\n` +
      `Відповідальний: ${assignedPerson || 'не назначений'}`,
    Markup.inlineKeyboard([
      Markup.button.callback('Видалити', `delete_task:${taskId}`),
      Markup.button.callback('Ок', 'remove_markup'),
    ]),
  );
};
