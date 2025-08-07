import createDebug from 'debug';
import { client } from '../core';
import { autoupdateTaskList, taskTitleReplacer } from '../utils';

import type { QueryResult } from 'pg';
import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_set_status');

interface ReturnQueryWithTitle {
  title: string;
}

interface TaskStatusIconWithTitle {
  icon: string;
  title: string;
}

export const handleSetStatusTask = async (ctx: Context) => {
  debug('Triggered "handleSetStatusTask" handler');

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('set_status:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const splittedData = callbackData.split(':');
  const taskId = parseInt(splittedData[1], 10);
  const statusId = parseInt(splittedData[2], 10);

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || 0;

  const getStatusQuery = `
    SELECT cts.icon, cts.title
    FROM chat_task_statuses cts
    JOIN chats c ON cts.chat_id = c.id
    WHERE cts.id = $1 AND c.chat_id = $2 AND c.thread = $3
  `;
  const getStatusResult: QueryResult<TaskStatusIconWithTitle> =
    await client.query(getStatusQuery, [statusId, chatId, thread]);

  const getStatusRows = getStatusResult.rows;
  if (!getStatusRows.length) {
    debug(`Invalid task status: ${statusId}`);
    ctx.editMessageText('Не правильний статус таски');
    return;
  }

  const { icon, title } = getStatusRows[0];

  const query = `
    UPDATE tasks
    SET status_id = $1
    FROM chats c
    WHERE tasks.chat_id = c.id
    AND tasks.id = $2
    AND c.chat_id = $3
    AND c.thread = $4
    RETURNING tasks.title
  `;
  const params = [statusId, taskId, chatId, thread];

  const res: QueryResult<ReturnQueryWithTitle> = await client.query(
    query,
    params,
  );
  if (!res.rowCount) {
    debug('Task not found');
    ctx.editMessageText('Завдання не знайдено! Можливо воно вже видалено');
    return;
  }

  const taskTitle = res.rows[0].title;
  debug(`Status changed to: ${title}`);
  ctx.editMessageText(
    `${taskTitleReplacer(taskTitle)}\n\nСтатус: ${icon} ${title}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  await autoupdateTaskList(chatId, thread);
};
