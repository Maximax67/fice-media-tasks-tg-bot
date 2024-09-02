import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_comment');
const deleteTaskRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTaskComment = () => async (ctx: Context) => {
  debug('Triggered "delete_comment" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteTaskRegex);

  if (!match) {
    debug('Invalid task delete comment command format');
    ctx.reply(
      'Неправильний формат команди видалення коментарію!\n/delete_comment номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    return;
  }

  if (!selectedTask.comment) {
    debug('Task does not have comment');
    ctx.reply('Таска не має встановленого коментаря.');
    return;
  }

  const taskId = selectedTask.id;
  const result = await client.query(
    'UPDATE tasks SET comment = NULL WHERE id = $1',
    [taskId],
  );
  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug(`Task deleted with id: ${taskId}`);
  ctx.reply(`Коментар видалений до таски: ${selectedTask.title}`);
};
