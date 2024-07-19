import createDebug from 'debug';
import { getSelectedTask, StatusIcons, StatusNames } from '../utils';
import { Markup, type Context } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { TaskStatuses } from '../enums';

const debug = createDebug('bot:set_status');
const setTaskStatusRegex = /^(\/\S+)\s+(\d+)$/;

export const setTaskStatus = () => async (ctx: Context) => {
  debug('Triggered "set_status" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setTaskStatusRegex);
  if (!match) {
    debug('Invalid update task status command format');
    ctx.reply(
      'Неправильний формат зміни статусу таски!\n/set_status номер_таски',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const selectedTask = await getSelectedTask(ctx, taskNumber);
  if (!selectedTask) {
    return;
  }

  const taskId = selectedTask.id;
  const keyboard: InlineKeyboardButton[][] = [];
  Object.values(TaskStatuses).forEach((taskStatus) => {
    if (taskStatus !== selectedTask.status) {
      keyboard.push([
        Markup.button.callback(
          `${StatusIcons[taskStatus]} ${StatusNames[taskStatus]}`,
          `set_status:${taskId}:${taskStatus}`,
        ),
      ]);
    }
  });

  keyboard.push([Markup.button.callback('Закрити', 'remove_markup')]);

  debug('Task added successfully');
  ctx.reply(
    `${selectedTask.title}\n\nСтатус: ${StatusIcons[selectedTask.status]} ${StatusNames[selectedTask.status]}`,
    Markup.inlineKeyboard(keyboard),
  );
};
