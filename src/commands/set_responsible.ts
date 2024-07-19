import createDebug from 'debug';
import { client } from '../core';
import { getSelectedTask } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:set_responsible');
const setTaskResponsibleRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const setTaskResponsible = () => async (ctx: Context) => {
  debug('Triggered "set_responsible" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskResponsibleRegex);
  if (!match) {
    debug('Invalid set responsible command format');
    ctx.reply(
      'Неправильний формат команди встановлення відповідального за таску!\n/set_responsible номер_таски юзернейм',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const responsible = match[3];

  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    return;
  }

  if (responsible === selectedTask.assigned_person) {
    debug('Responsible tag not changed');
    ctx.reply('Відповідальний не змінився');
    return;
  }

  const taskId = selectedTask.id;
  const query = `
    UPDATE tasks
    SET assigned_person = $1
    WHERE id = $2
  `;

  const result = await client.query(query, [responsible, taskId]);

  if (!result.rowCount) {
    debug('Task not found');
    ctx.reply('Таску не знайдено. Можливо вона вже видалена');
    return;
  }

  debug('Task responsible set successfully');
  ctx.reply(`Відповідального встановлено на таску: ${selectedTask.title}`);
};
