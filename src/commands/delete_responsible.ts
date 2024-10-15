import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask, taskTitleReplacer } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_responsible');
const deleteResponsibleRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteTaskResponsible = () => async (ctx: Context) => {
  debug('Triggered "delete_responsible" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteResponsibleRegex);
  if (!match) {
    debug('Invalid delete responsible command format');
    ctx.reply(
      'Неправильний формат команди видалення відповідального!\n/delete_responsible номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    debug('Selected task not exists');
    return;
  }

  if (!selectedTask.assigned_person) {
    debug('No assigned person');
    ctx.reply('Відповідальний не назначений на цю таску');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET assigned_person = NULL
    WHERE id = $1
  `;

  const result = await client.query(query, [taskId]);
  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task assigned person deleted successfully');
  ctx.reply(
    `Відповідальний видалений з таски: ${taskTitleReplacer(selectedTask.title)}`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );
};
