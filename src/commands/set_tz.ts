import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask, taskTitleReplacer } from '../utils';
import { TZ_ALWAYS_URL } from '../config';
import { URL_REGEX } from '../constants';
import type { Context } from 'telegraf';

const debug = createDebug('bot:set_tz');
const setTaskTzRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskTz = () => async (ctx: Context) => {
  debug('Triggered "set_tz" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskTzRegex);
  if (!match) {
    debug('Invalid set tz command format');
    ctx.reply(
      'Неправильний формат команди задання тз!\n/set_tz номер_таски тз текстом або посилання',
    );
    return;
  }

  const tz = match[3].trim();
  if (TZ_ALWAYS_URL && !URL_REGEX.test(tz)) {
    debug('TZ is not url.');
    ctx.reply('ТЗ має бути у вигляді посилання.');
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (tz === selectedTask.tz) {
    debug('TZ not changed');
    ctx.reply('Нове тз ідентичне з попереднім');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET tz = $1
    WHERE id = $2
  `;

  const result = await client.query(query, [tz, taskId]);
  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task tz set successfully');
  ctx.reply(
    `Задано нове тз для таски: ${taskTitleReplacer(selectedTask.title)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );
};
