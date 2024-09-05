import createDebug from 'debug';
import { client } from '../core';
import { TaskStatuses } from '../enums';
import { StatusIcons, StatusNames, taskTitleReplacer } from '../utils';

import type { QueryResult } from 'pg';
import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_set_status');

interface ReturnQueryWithTitle {
  title: string;
}

export const handleSetStatusTask = () => async (ctx: Context) => {
  debug('Triggered "handleSetStatusTask" handler');

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('set_status:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const splittedData = callbackData.split(':');
  const taskId = parseInt(splittedData[1], 10);
  const status = splittedData[2];

  if (!(status in TaskStatuses)) {
    debug(`Invalid task status: ${status}`);
    ctx.editMessageText('Invalid task status');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || null;

  let query: string;
  let params: Array<string | number>;
  if (thread) {
    query = `
      UPDATE tasks
      SET status = $1
      WHERE id = $2 AND chat_id = $3 AND thread = $4
      RETURNING title
    `;
    params = [status, taskId, chatId, thread];
  } else {
    query = query = `
      UPDATE tasks
      SET status = $1
      WHERE id = $2 AND chat_id = $3 AND thread IS NULL
      RETURNING title
    `;
    params = [status, taskId, chatId];
  }

  const res: QueryResult<ReturnQueryWithTitle> = await client.query(
    query,
    params,
  );
  if (!res.rowCount) {
    debug('Task not found');
    ctx.editMessageText('Завдання не знайдено! Можливо воно вже видалено');
    return;
  }

  const title = res.rows[0].title;
  const statusName = StatusNames[status as TaskStatuses];
  const statusIcon = StatusIcons[status as TaskStatuses];

  debug(`Status changed to: ${statusName}`);
  ctx.editMessageText(
    `${taskTitleReplacer(title)}\n\nСтатус: ${statusIcon} ${statusName}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );
};
