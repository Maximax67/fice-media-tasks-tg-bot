import { getTasksForChat } from './get_tasks';

import type { Context } from 'telegraf';
import type { Task } from '../interfaces';

export async function getSelectedTask(
  ctx: Context,
  taskNumber: number,
): Promise<Task | undefined> {
  if (taskNumber < 1) {
    await ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;
  const tasks = await getTasksForChat(chatId, thread);

  if (!tasks.length) {
    await ctx.reply('Не створено жодної таски');
    return;
  }

  if (taskNumber > tasks.length) {
    await ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  return tasks[taskNumber - 1];
}
