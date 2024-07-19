import createDebug from 'debug';
import { getTasksForChat } from '../utils';

import type { Context } from 'telegraf';
import type { Task } from '../interfaces';

const debug = createDebug('util:get_selected_task');

export async function getSelectedTask(
  ctx: Context,
  taskNumber: number,
): Promise<Task | undefined> {
  debug('Triggered "get_selected_task" function');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;
  const tasks = await getTasksForChat(chatId, thread);

  if (!tasks.length) {
    debug('There is no tasks');
    ctx.reply('Не створено жодної таски');
    return;
  }

  if (taskNumber < 1 || taskNumber > tasks.length) {
    debug(`Invalid task number: ${taskNumber}`);
    ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  return tasks[taskNumber - 1];
}
