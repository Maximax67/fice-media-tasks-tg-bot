import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask, taskTitleReplacer } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_post_deadline');
const deletePostDeadlineRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTaskPostDeadline = () => async (ctx: Context) => {
  debug('Triggered "delete_post_deadline" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deletePostDeadlineRegex);
  if (!match) {
    debug('Invalid delete post deadline command format');
    ctx.reply(
      'Неправильний формат команди видалення дедлайну посту!\n/delete_post_deadline номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (!selectedTask.post_deadline) {
    debug('No post deadeline');
    ctx.reply('Дедлайн посту відсутній на цю таску');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET post_deadline = NULL
    WHERE id = $1
  `;

  const result = await client.query(query, [taskId]);
  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task post deadline deleted successfully');
  ctx.reply(
    `Дедлайн посту видалений з таски: ${taskTitleReplacer(selectedTask.title)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );
};
