import createDebug from 'debug';
import type { QueryResult } from 'pg';
import { Markup, type Context } from 'telegraf';

import { client } from '../core';
import {
  RESPONSIBLE_LENGTH_LIMIT,
  DEADLINE_LENGTH_LIMIT,
  POST_DEADLINE_LENGTH_LIMIT,
  TITLE_LENGTH_LIMIT,
  TZ_LENGTH_LIMIT,
  URL_REGEX,
  TZ_ALWAYS_URL,
  TASKS_LIMIT,
} from '../config';

const debug = createDebug('bot:new_task');
const newTaskRegex =
  /^(\/\S+)\s+((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*)(?:\s*\/\s*((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*))?(?:\s*\/\s*((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*))?(?:\s*\/\s*((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*))?(?:\s*\/\s*((?:https?:\/\/[^\s\/]+(?:\/[^\s]*)?)?[^\/]*))?$/;

interface ReturnQueryWithId {
  id: number;
}

export const newTask = () => async (ctx: Context) => {
  debug('Triggereыd "new_task" command');

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

  const tz = match[3]?.trim() || null;
  if (tz) {
    if (TZ_ALWAYS_URL && !URL_REGEX.test(tz)) {
      debug('TZ is not url');
      ctx.reply('ТЗ має бути у вигляді посилання.');
      return;
    }
    if (tz.length > TZ_LENGTH_LIMIT) {
      debug('TZ too long');
      ctx.reply(
        `ТЗ дуже довге (${tz.length}). Обмеження за кількістю символів: ${TZ_LENGTH_LIMIT}.`,
      );
      return;
    }
  }

  const title = match[2].trim();
  if (title.length > TITLE_LENGTH_LIMIT) {
    debug('Title too long');
    ctx.reply(
      `Назва таски дуже довга (${title.length}). Обмеження за кількістю символів: ${TITLE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const deadline = match[4]?.trim() || null;
  if (deadline && deadline.length > DEADLINE_LENGTH_LIMIT) {
    debug('Deadline too long');
    ctx.reply(
      `Дедлайн таски дуже довгий (${deadline.length}). Обмеження за кількістю символів: ${DEADLINE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const postDeadline = match[5]?.trim() || null;
  if (postDeadline && postDeadline.length > POST_DEADLINE_LENGTH_LIMIT) {
    debug('Post deadline too long');
    ctx.reply(
      `Дедлайн посту таски дуже довгий (${postDeadline.length}). Обмеження за кількістю символів: ${POST_DEADLINE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const responsible = match[6]?.trim() || null;
  if (responsible && responsible.length > RESPONSIBLE_LENGTH_LIMIT) {
    debug('Responsible too long');
    ctx.reply(
      `Виконавець таски дуже довгий (${responsible.length}). Обмеження за кількістю символів: ${RESPONSIBLE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const query = `
    WITH task_count AS (
      SELECT COUNT(*) AS count
      FROM tasks
      WHERE chat_id = $1
    )
    INSERT INTO tasks (chat_id, thread, title, tz, deadline, post_deadline, assigned_person)
    SELECT $1, $2, $3, $4, $5, $6, $7
    FROM task_count
    WHERE count < $8
    RETURNING id;
  `;

  const result: QueryResult<ReturnQueryWithId> = await client.query(query, [
    chatId,
    thread,
    title,
    tz,
    deadline,
    postDeadline,
    responsible,
    TASKS_LIMIT,
  ]);

  const newTask = result.rows[0];
  if (!newTask) {
    debug(`Max tasks limit reached`);
    ctx.reply(`Ви досягли ліміту завдань (${TASKS_LIMIT}).`);
    return;
  }

  debug('Task added successfully');
  ctx.reply(
    'Нова таска створена!\n\n' +
      `${title}\n\n` +
      `ТЗ: ${tz || 'відсутнє'}\n` +
      `Дедлайн: ${deadline || 'відсутній'}\n` +
      `Дедлайн посту: ${postDeadline || 'відсутній'}\n` +
      `Відповідальний: ${responsible || 'не назначений'}`,
    Markup.inlineKeyboard([
      Markup.button.callback('Видалити', `delete_task:${newTask.id}`),
      Markup.button.callback('Ок', 'remove_markup'),
    ]),
  );
};
