import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:set_comment');
const setTaskCommentRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskComment = () => async (ctx: Context) => {
  debug('Triggered "set_comment" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskCommentRegex);
  if (!match) {
    debug('Invalid set task comment command format');
    ctx.reply(
      'Неправильний формат встановлення коментаря до таски!\n/set_comment номер_таски Будь-який коментар',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const comment = match[3];

  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    return;
  }

  if (comment === selectedTask.comment) {
    debug('Comment not changed');
    ctx.reply('Новий коментар ідентичний з вже встановленим');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET comment = $1
    WHERE id = $2
  `;

  const result = await client.query(query, [comment, taskId]);

  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task comment set successfully');
  ctx.reply(`Задано коментар до таски: ${selectedTask.title}`);
};
