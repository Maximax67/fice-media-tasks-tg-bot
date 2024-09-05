import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask, taskTitleReplacer } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_task');
const deleteTaskRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTask = () => async (ctx: Context) => {
  debug('Triggered "delete_task" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteTaskRegex);

  if (!match) {
    debug('Invalid task delete command format');
    ctx.reply(
      'Неправильний формат команди видалення таски!\n/delete_task номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  const taskId = selectedTask.id;
  const result = await client.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING title',
    [taskId],
  );
  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  const taskTitle = result.rows[0].title;

  debug(`Task deleted with id: ${taskId}`);
  ctx.reply(`Таска видалена: ${taskTitleReplacer(taskTitle)}`, {
    link_preview_options: { is_disabled: true },
    parse_mode: 'HTML',
  });
};
