import createDebug from 'debug';
import type { QueryResult } from 'pg';
import type { Context } from 'telegraf';

import { client } from '../core';
import {
  autoupdateTaskList,
  formatResponsible,
  taskTitleReplacer,
  urlReplacer,
} from '../utils';
import {
  RESPONSIBLE_LENGTH_LIMIT,
  DEADLINE_LENGTH_LIMIT,
  POST_DEADLINE_LENGTH_LIMIT,
  TITLE_LENGTH_LIMIT,
  TZ_LENGTH_LIMIT,
  TZ_ALWAYS_URL,
  TASKS_LIMIT,
} from '../config';
import { ChangeStatusEvents } from '../enums';
import { URL_REGEX, URL_REGEX_REPLACER } from '../constants';

const debug = createDebug('bot:new_task');

interface ReturnQueryWithId {
  id: number;
}

const newTaskCommandSyntaxError = async (ctx: Context): Promise<void> => {
  debug('Invalid task creation command format');
  await ctx.reply(
    'Неправильний формат створення таски!\n/new_task Назва таски / ТЗ / дедлайн / дедлайн посту / відповідальний',
  );
};

const tempReplacerChar = '\uFFFF';

export const newTask = () => async (ctx: Context) => {
  debug('Triggereыd "new_task" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;
  const message: string = (ctx.message as any).text;

  const spaceIndex = message.indexOf(' ');
  if (spaceIndex === -1) {
    await newTaskCommandSyntaxError(ctx);
    return;
  }

  const commandData = message.substring(spaceIndex + 1);
  const urls = commandData.match(URL_REGEX_REPLACER);

  let dataArray: string[];
  if (urls && urls.length) {
    const commandDataWithoutUrls = commandData.replace(
      URL_REGEX_REPLACER,
      tempReplacerChar,
    );
    const dataArrayWithoutUrls = commandDataWithoutUrls.split('/');

    let urlIndex = 0;
    dataArray = dataArrayWithoutUrls.map((part) => {
      if (part.includes(tempReplacerChar)) {
        return part.replace(tempReplacerChar, urls[urlIndex++]);
      }

      return part;
    });
  } else {
    dataArray = commandData.split('/');
  }

  const dataArrayLength = dataArray.length;
  if (!dataArrayLength || dataArrayLength > 5) {
    await newTaskCommandSyntaxError(ctx);
    return;
  }

  const filteredData = dataArray.map((str) => {
    const trimmed = str.trim();
    return trimmed === '' ? null : trimmed;
  });

  if (filteredData[0] === null) {
    await newTaskCommandSyntaxError(ctx);
    return;
  }

  while (filteredData.length < 5) {
    filteredData.push(null);
  }

  const [title, tz, deadline, postDeadline, responsible] = filteredData;
  const validationErrors: string[] = [];

  if (title.length > TITLE_LENGTH_LIMIT) {
    debug('Title too long');
    validationErrors.push(
      `Назва таски дуже довга (${title.length} > ${TITLE_LENGTH_LIMIT}).`,
    );
  }

  if (tz) {
    if (TZ_ALWAYS_URL && !URL_REGEX.test(tz)) {
      debug('TZ is not url');
      validationErrors.push('ТЗ має бути у вигляді посилання.');
    }
    if (tz.length > TZ_LENGTH_LIMIT) {
      debug('TZ too long');
      validationErrors.push(
        `ТЗ дуже довге (${tz.length} > ${TZ_LENGTH_LIMIT}).`,
      );
    }
  }

  if (deadline && deadline.length > DEADLINE_LENGTH_LIMIT) {
    debug('Deadline too long');
    validationErrors.push(
      `Дедлайн таски дуже довгий (${deadline.length} > ${POST_DEADLINE_LENGTH_LIMIT}).`,
    );
  }

  if (postDeadline && postDeadline.length > POST_DEADLINE_LENGTH_LIMIT) {
    debug('Post deadline too long');
    validationErrors.push(
      `Дедлайн посту таски дуже довгий (${postDeadline.length} > ${POST_DEADLINE_LENGTH_LIMIT}).`,
    );
  }

  if (responsible && responsible.length > RESPONSIBLE_LENGTH_LIMIT) {
    debug('Responsible too long');
    validationErrors.push(
      `Виконавець таски дуже довгий (${responsible.length} > ${POST_DEADLINE_LENGTH_LIMIT}).`,
    );
  }

  if (validationErrors.length) {
    await ctx.reply(validationErrors.join('\n'));
    return;
  }

  const getTaskStatusQuery = `
    SELECT cts.id, cts.chat_id
    FROM chat_task_statuses cts
    JOIN chat_status_change_events ctce ON cts.id = ctce.status_id
    JOIN chats c ON cts.chat_id = c.id
    WHERE c.chat_id = $1 AND c.thread = $2 AND ctce.event = $3
    LIMIT 1
  `;

  const statusResult = await client.query(getTaskStatusQuery, [
    chatId,
    thread,
    ChangeStatusEvents.NEW,
  ]);
  const statusRows = statusResult.rows;

  if (!statusRows.length) {
    debug('Defaut new task status not set');
    await ctx.reply(
      'Статус за замовчуванням під нові таски не встановлено! Створіть новий статус /add_status та встановіть його за замовчування для нових тасок командою /set_change_status_event',
    );
    return;
  }

  const statusRow = statusRows[0];
  const statusId = statusRow.id;
  const chatIdRecord = statusRow.chat_id;
  const query = `
    WITH task_count AS (
      SELECT COUNT(*) AS count
      FROM tasks
      WHERE chat_id = $1 AND completed_at IS NULL
    )
    INSERT INTO tasks (chat_id, title, tz, deadline, post_deadline, responsible, status_id)
    SELECT $1, $2, $3, $4, $5, $6, $7
    FROM task_count
    WHERE count < $8
    RETURNING id
  `;

  const result: QueryResult<ReturnQueryWithId> = await client.query(query, [
    chatIdRecord,
    title,
    tz,
    deadline,
    postDeadline,
    responsible,
    statusId,
    TASKS_LIMIT,
  ]);

  const newTask = result.rows[0];
  if (!newTask) {
    debug('Max tasks limit reached');
    await ctx.reply(`Ви досягли ліміту завдань (${TASKS_LIMIT}).`);
    return;
  }

  debug('Task added successfully');
  await ctx.reply(
    'Нова таска створена!\n\n' +
      `${taskTitleReplacer(title)}\n\n` +
      `ТЗ: ${tz ? urlReplacer(tz) : 'відсутнє'}\n` +
      `Дедлайн: ${deadline ? urlReplacer(deadline) : 'відсутній'}\n` +
      `Дедлайн посту: ${postDeadline ? urlReplacer(postDeadline) : 'відсутній'}\n` +
      `Відповідальний: ${responsible ? formatResponsible(responsible) : 'не назначений'}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Видалити', callback_data: `delete_task:${newTask.id}` }],
          [{ text: 'Ок', callback_data: 'remove_markup' }],
        ],
      },
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );

  await autoupdateTaskList(chatId, thread);
};
