import createDebug from 'debug';
import { client } from '../core';
import { ChangeStatusEvents } from '../enums';
import { RESPONSIBLE_LENGTH_LIMIT } from '../config';
import {
  autoupdateTaskList,
  changeStatusEvent,
  formatChangeStatusEventMessage,
  getSelectedTask,
  taskTitleReplacer,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:set_responsible');
const setTaskResponsibleRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskResponsible = () => async (ctx: Context) => {
  debug('Triggered "set_responsible" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskResponsibleRegex);
  if (!match) {
    debug('Invalid set responsible command format');
    await ctx.reply(
      'Неправильний формат команди встановлення відповідального за таску!\n/set_responsible номер_таски юзернейм',
    );
    return;
  }

  const responsible = match[3];
  if (responsible.length > RESPONSIBLE_LENGTH_LIMIT) {
    debug('Responsible too long');
    await ctx.reply(
      `Виконавець таски дуже довгий (${responsible.length}). Обмеження за кількістю символів: ${RESPONSIBLE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (responsible === selectedTask.responsible) {
    debug('Responsible not changed');
    await ctx.reply('Відповідальний не змінився');
    return;
  }

  const taskId = selectedTask.id;
  const query = 'UPDATE tasks SET responsible = $1 WHERE id = $2';
  const result = await client.query(query, [responsible, taskId]);

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
    selectedTask.responsible
      ? ChangeStatusEvents.CHANGE_RESPONSIBLE
      : ChangeStatusEvents.SET_RESPONSIBLE,
  );

  debug('Task responsible set successfully');
  await ctx.reply(
    `Відповідального встановлено на таску: ${taskTitleReplacer(selectedTask.title)}${formatChangeStatusEventMessage(newStatus)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  await autoupdateTaskList(chatId, thread);
};
