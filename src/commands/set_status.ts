import createDebug from 'debug';
import { Markup, type Context } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import {
  getSelectedTask,
  StatusIcons,
  StatusNames,
  taskTitleReplacer,
} from '../utils';
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
    debug('Selected task not exists');
    return;
  }

  const taskId = selectedTask.id;
  const keyboard: InlineKeyboardButton[][] = [];
  Object.values(TaskStatuses).forEach((taskStatus) => {
    if (taskStatus !== selectedTask.status) {
      keyboard.push([
        {
          text: `${StatusIcons[taskStatus]} ${StatusNames[taskStatus]}`,
          callback_data: `set_status:${taskId}:${taskStatus}`,
        },
      ]);
    }
  });

  keyboard.push([
    {
      text: 'Закрити',
      callback_data: 'remove_markup',
    },
  ]);

  debug('Task added successfully');
  ctx.reply(
    `${taskTitleReplacer(selectedTask.title)}\n\nСтатус: ${StatusIcons[selectedTask.status]} ${StatusNames[selectedTask.status]}`,
    {
      reply_markup: { inline_keyboard: keyboard },
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );
};
