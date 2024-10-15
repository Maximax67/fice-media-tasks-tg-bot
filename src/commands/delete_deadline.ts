import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask, taskTitleReplacer } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_deadline');
const deleteDeadlineRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTaskDeadline = () => async (ctx: Context) => {
  debug('Triggered "delete_deadline" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteDeadlineRegex);
  if (!match) {
    debug('Invalid delete deadline command format');
    ctx.reply(
      'Неправильний формат команди видалення дедлайну!\n/delete_deadline номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (!selectedTask.deadline) {
    debug('No deadeline');
    ctx.reply('Дедлайн відсутній на цю таску');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET deadline = NULL
    WHERE id = $1
  `;

  const result = await client.query(query, [taskId]);
  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task deadline deleted successfully');
  ctx.reply(
    `Дедлайн видалений з таски: ${taskTitleReplacer(selectedTask.title)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );
};
