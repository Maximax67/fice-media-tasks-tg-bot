import { getStatusesForChat } from './get_statuses';

import type { Context } from 'telegraf';
import type { ChatTaskStatus } from '../interfaces';

export async function getSelectedStatus(
  ctx: Context,
  statusNumber: number,
): Promise<ChatTaskStatus | undefined> {
  if (statusNumber < 1) {
    await ctx.reply('Не існує статусу з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;
  const statuses = await getStatusesForChat(chatId, thread);

  if (!statuses.length) {
    await ctx.reply('Не створено жодного статусу');
    return;
  }

  if (statusNumber > statuses.length) {
    await ctx.reply('Не існує статусу з таким порядковим номером');
    return;
  }

  return statuses[statusNumber - 1];
}
