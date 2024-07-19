import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:set_deadline');
const setTaskDeadlineRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskDeadline = () => async (ctx: Context) => {
  debug('Triggered "set_deadline" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskDeadlineRegex);
  if (!match) {
    debug('Invalid set deadline format');
    ctx.reply(
      'Неправильний формат команди встановлення дедлайну таски!\n/set_deadline номер_таски дедлайн',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const deadline = match[3];

  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    return;
  }

  if (deadline === selectedTask.deadline) {
    debug('Deadline not changed');
    ctx.reply('Новий дедлайн ідентичний з попереднім');
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
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task url set successfully');
  ctx.reply(`Новий дедлайн встановлено на таску: ${selectedTask.title}`);
};
