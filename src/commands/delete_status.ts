import createDebug from 'debug';
import { client } from '../core';
import {
  autoupdateTaskList,
  escapeHtml,
  getSelectedStatus,
  taskTitleReplacer,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_status');
const deleteStatusRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteStatus = () => async (ctx: Context) => {
  debug('Triggered "delete_status" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteStatusRegex);

  if (!match) {
    debug('Invalid delete status command format');
    await ctx.reply(
      'Неправильний формат команди видалення статусу!\n/delete_status номер_cтатусу',
    );
    return;
  }

  const statusNumber = parseInt(match[2], 10);
  const selectedStatus = await getSelectedStatus(ctx, statusNumber);
  if (!selectedStatus) {
    debug('Selected status not exists');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const statusId = selectedStatus.id;
  const statusIcon = escapeHtml(selectedStatus.icon);
  const statusTitle = escapeHtml(selectedStatus.title);

  const searchTasksQuery = `
    SELECT title FROM tasks
    WHERE chat_id = (
      SELECT id FROM chats WHERE chat_id = $1 AND thread = $2
    ) AND status_id = $3
  `;
  const searchTasksResult = await client.query(searchTasksQuery, [
    chatId,
    thread,
    statusId,
  ]);

  const foundedTasks = searchTasksResult.rows;
  if (foundedTasks.length) {
    debug('Selected status is used in tasks');
    let foundedTasksMessage = '';
    for (const task of foundedTasks) {
      foundedTasksMessage += `\n${taskTitleReplacer(task.title)}`;
    }
    await ctx.reply(
      `Неможливо видалити статус ${statusIcon} ${statusTitle}, бо він використовується у тасках: ${foundedTasksMessage}`,
    );
    return;
  }

  const result = await client.query(
    'DELETE FROM chat_task_statuses WHERE id = $1',
    [statusId],
  );
  if (!result.rowCount) {
    debug('Status not found');
    await ctx.reply('Статус не знайдено. Можливо він вже видалений');
    return;
  }

  debug(`Status deleted with id: ${statusId}`);
  await ctx.reply(`Статус видалений: ${statusIcon} ${statusTitle}`, {
    link_preview_options: { is_disabled: true },
    parse_mode: 'HTML',
  });

  await autoupdateTaskList(chatId, thread);
};
