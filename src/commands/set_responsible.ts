import createDebug from 'debug';
import { client } from '../core';
import { RESPONSIBLE_LENGTH_LIMIT } from '../config';
import { STATUS_ICONS, STATUS_NAMES } from '../constants';
import { autoupdateTaskList, getSelectedTask, taskTitleReplacer } from '../utils';
import { TaskStatuses } from '../enums';

import type { Context } from 'telegraf';

const debug = createDebug('bot:set_responsible');
const setTaskResponsibleRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskResponsible = () => async (ctx: Context) => {
  debug('Triggered "set_responsible" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskResponsibleRegex);
  if (!match) {
    debug('Invalid set responsible command format');
    ctx.reply(
      'Неправильний формат команди встановлення відповідального за таску!\n/set_responsible номер_таски юзернейм',
    );
    return;
  }

  const responsible = match[3];
  if (responsible.length > RESPONSIBLE_LENGTH_LIMIT) {
    debug('Responsible too long');
    ctx.reply(
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

  if (responsible === selectedTask.assigned_person) {
    debug('Responsible not changed');
    ctx.reply('Відповідальний не змінився');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET assigned_person = $1, status = $2
    WHERE id = $3
  `;

  const result = await client.query(query, [
    responsible,
    TaskStatuses.IN_PROCESS,
    taskId,
  ]);

  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task responsible set successfully');
  ctx.reply(
    `Відповідального встановлено на таску: ${taskTitleReplacer(selectedTask.title)}\n\n` +
      `Статус змінено на: ${STATUS_ICONS.IN_PROCESS} ${STATUS_NAMES.IN_PROCESS}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  autoupdateTaskList(chatId, thread);
};
