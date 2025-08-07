import createDebug from 'debug';
import { client } from '../core';
import { ChangeStatusEvents } from '../enums';
import {
  applyRestrictions,
  autoupdateTaskList,
  changeStatusEvent,
  formatChangeStatusEventMessage,
  getSelectedTask,
  taskTitleReplacer,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_post_deadline');
const deletePostDeadlineRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTaskPostDeadline = async (ctx: Context) => {
  debug('Triggered "delete_post_deadline" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deletePostDeadlineRegex);
  if (!match) {
    debug('Invalid delete post deadline command format');
    await ctx.reply(
      'Неправильний формат команди видалення дедлайну посту!\n/delete_post_deadline номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (!selectedTask.post_deadline) {
    debug('No post deadeline');
    await ctx.reply('Дедлайн посту відсутній на цю таску');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET post_deadline = NULL
    WHERE id = $1
  `;

  const result = await client.query(query, [taskId]);
  if (!result.rowCount) {
    debug('Task not found');
    await ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;
  const newStatus = await changeStatusEvent(
    taskId,
    chatId,
    thread,
    ChangeStatusEvents.DELETE_POST_DEADLINE,
  );

  debug('Task post deadline deleted successfully');
  await ctx.reply(
    `Дедлайн посту видалений з таски: ${taskTitleReplacer(selectedTask.title)}${formatChangeStatusEventMessage(newStatus)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  await autoupdateTaskList(chatId, thread);
};
