import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask, taskTitleReplacer } from '../utils';
import { POST_DEADLINE_LENGTH_LIMIT } from '../config';
import type { Context } from 'telegraf';

const debug = createDebug('bot:set_post_deadline');
const setTaskDeadlineRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskPostDeadline = () => async (ctx: Context) => {
  debug('Triggered "set_post_deadline" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskDeadlineRegex);
  if (!match) {
    debug('Invalid set post deadline format');
    ctx.reply(
      'Неправильний формат команди встановлення дедлайну посту!\n/set_post_deadline номер_таски дедлайн',
    );
    return;
  }

  const postDeadline = match[3];
  if (postDeadline.length > POST_DEADLINE_LENGTH_LIMIT) {
    debug('Post deadline too long');
    ctx.reply(
      `Дедлайн посту таски дуже довгий (${postDeadline.length}). Обмеження за кількістю символів: ${POST_DEADLINE_LENGTH_LIMIT}.`,
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (postDeadline === selectedTask.post_deadline) {
    debug('Deadline not changed');
    ctx.reply('Новий дедлайн посту ідентичний з попереднім');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET post_deadline = $1
    WHERE id = $2
  `;

  const result = await client.query(query, [postDeadline, taskId]);
  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task url set successfully');
  ctx.reply(
    `Новий дедлайн посту встановлено на таску: ${taskTitleReplacer(selectedTask.title)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );
};
