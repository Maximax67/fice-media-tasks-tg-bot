import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask, taskTitleReplacer } from '../utils';
import { COMPLETE_TASK_URL_LENGTH_LIMIT } from '../config';
import type { Context } from 'telegraf';

const debug = createDebug('bot:set_url');
const setTaskUrlRegex = /^(\/\S+)\s+(\d+)\s+(https?:\/\/\S+)$/;

export const setTaskUrl = () => async (ctx: Context) => {
  debug('Triggered "set_url" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskUrlRegex);
  if (!match) {
    debug('Invalid set url command format');
    ctx.reply(
      'Неправильний формат команди встановлення посилання на виконану таску!\n/set_url номер_таски url',
    );
    return;
  }

  const url = match[3].trim();
  if (url.length > COMPLETE_TASK_URL_LENGTH_LIMIT) {
    debug('Url too long');
    ctx.reply(
      `Посилання дуже довге (${url.length}). Обмеження за кількістю символів: ${COMPLETE_TASK_URL_LENGTH_LIMIT}.`,
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (url === selectedTask.url) {
    debug('URL not changed');
    ctx.reply('Новий url ідентичний з попереднім');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET url = $1
    WHERE id = $2
  `;

  const result = await client.query(query, [url, taskId]);
  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task url set successfully');
  ctx.reply(
    `Задано нове посилання на виконану таску: ${taskTitleReplacer(selectedTask.title)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );
};
