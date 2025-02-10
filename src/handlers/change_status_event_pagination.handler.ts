import createDebug from 'debug';
import { STATUS_EVENT_KEYBOARD_ITEMS } from '../constants';
import { getStatusesWithEvents, makeChangeStatusEventKeyboard } from '../utils';

import type { Context } from 'telegraf';
import type { StatusesWithEvents } from '../interfaces';

const debug = createDebug('bot:handle_change_status_event_pagination');

export const handleChangeStatusEventPagination = () => async (ctx: Context) => {
  debug('Triggered "handle_change_status_event_pagination" handler');

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('csep:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || 0;

  const statuses = await getStatusesWithEvents(chatId, thread);
  if (!statuses.length) {
    debug('Statuses not created');
    await ctx.editMessageText('Не створено жодного статусу');
    return;
  }

  const splittedData = callbackData.split(':');
  const statusId = parseInt(splittedData[1], 10);

  let selectedStatus: StatusesWithEvents | null = null;
  for (const status of statuses) {
    if (status.id === statusId) {
      selectedStatus = status;
      break;
    }
  }

  if (!selectedStatus) {
    debug('Status not found');
    await ctx.editMessageText('Статус не знайдено');
    return;
  }

  const offset = parseInt(splittedData[2], 10);
  const keyboard = makeChangeStatusEventKeyboard(
    statuses,
    selectedStatus,
    offset,
    STATUS_EVENT_KEYBOARD_ITEMS,
  );

  await ctx.editMessageReplyMarkup({ inline_keyboard: keyboard });
};
