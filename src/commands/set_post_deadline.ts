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
import { POST_DEADLINE_LENGTH_LIMIT } from '../config';

import type { Context } from 'telegraf';

const debug = createDebug('bot:set_post_deadline');
const setTaskDeadlineRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskPostDeadline = async (ctx: Context) => {
  debug('Triggered "set_post_deadline" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskDeadlineRegex);
  if (!match) {
    debug('Invalid set post deadline format');
    await ctx.reply(
      'Неправильний формат команди встановлення дедлайну посту!\n/set_post_deadline номер_таски дедлайн',
    );
    return;
  }

  const postDeadline = match[3];
  if (postDeadline.length > POST_DEADLINE_LENGTH_LIMIT) {
    debug('Post deadline too long');
    await ctx.reply(
      `Дедлайн посту таски дуже довгий (${postDeadline.length}). Обмеження за кількістю символів: ${POST_DEADLINE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (postDeadline === selectedTask.post_deadline) {
    debug('Deadline not changed');
    await ctx.reply('Новий дедлайн посту ідентичний з попереднім');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET post_deadline = $1
    WHERE id = $2
  `;

  const result = await client.query(query, [postDeadline, taskId]);
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
    selectedTask.post_deadline
      ? ChangeStatusEvents.CHANGE_POST_DEADLINE
      : ChangeStatusEvents.SET_POST_DEADLINE,
  );

  debug('Task url set successfully');
  await ctx.reply(
    `Новий дедлайн посту встановлено на таску: ${taskTitleReplacer(selectedTask.title)}${formatChangeStatusEventMessage(newStatus)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  await autoupdateTaskList(chatId, thread);
};
