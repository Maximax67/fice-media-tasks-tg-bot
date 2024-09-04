import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask } from '../utils';
import { TITLE_LENGTH_LIMIT } from '../config';
import type { Context } from 'telegraf';

const debug = createDebug('bot:set_title');
const updateTaskTitleRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskTitle = () => async (ctx: Context) => {
  debug('Triggered "set_title" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(updateTaskTitleRegex);
  if (!match) {
    debug('Invalid task title update command format');
    ctx.reply(
      'Неправильний формат оновлення заголовку таски!\n/set_title номер_таски Новий заголовок',
    );
    return;
  }

  const newTitle = match[3];
  if (newTitle.length > TITLE_LENGTH_LIMIT) {
    debug('Title too long');
    ctx.reply(
      `Назва таски дуже довга (${newTitle.length}). Обмеження за кількістю символів: ${TITLE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (newTitle === selectedTask.title) {
    debug('Title not changed');
    ctx.reply('Нова назва ідентична з попередньою');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET title = $1
    WHERE id = $2
  `;

  const result = await client.query(query, [newTitle, taskId]);

  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task title updated successfully');
  ctx.reply('Назву таски оновлено');
};
