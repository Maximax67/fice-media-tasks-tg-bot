import createDebug from 'debug';
import { client } from '../core';
import { ChangeStatusEvents } from '../enums';
import {
  autoupdateTaskList,
  changeStatusEvent,
  formatChangeStatusEventMessage,
  getSelectedTask,
  taskTitleReplacer,
} from '../utils';
import { DEADLINE_LENGTH_LIMIT } from '../config';

import type { Context } from 'telegraf';

const debug = createDebug('bot:set_deadline');
const setTaskDeadlineRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskDeadline = () => async (ctx: Context) => {
  debug('Triggered "set_deadline" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskDeadlineRegex);
  if (!match) {
    debug('Invalid set deadline format');
    await ctx.reply(
      'Неправильний формат команди встановлення дедлайну таски!\n/set_deadline номер_таски дедлайн',
    );
    return;
  }

  const deadline = match[3];
  if (deadline.length > DEADLINE_LENGTH_LIMIT) {
    debug('Deadline too long');
    await ctx.reply(
      `Дедлайн таски дуже довгий (${deadline.length}). Обмеження за кількістю символів: ${DEADLINE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (deadline === selectedTask.deadline) {
    debug('Deadline not changed');
    await ctx.reply('Новий дедлайн ідентичний з попереднім');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET deadline = $1
    WHERE id = $2
  `;

  const result = await client.query(query, [deadline, taskId]);
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
    selectedTask.deadline
      ? ChangeStatusEvents.CHANGE_DEADLINE
      : ChangeStatusEvents.SET_DEADLINE,
  );

  debug('Task url set successfully');
  await ctx.reply(
    `Новий дедлайн встановлено на таску: ${taskTitleReplacer(selectedTask.title)}${formatChangeStatusEventMessage(newStatus)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  await autoupdateTaskList(chatId, thread);
};
