import createDebug from 'debug';
import { client } from '../core';
import { STATUS_EVENT_KEYBOARD_ITEMS } from '../constants';
import { getStatusesWithEvents, makeChangeStatusEventKeyboard } from '../utils';

import type { Context } from 'telegraf';
import type { StatusesWithEvents } from '../interfaces';

const debug = createDebug('bot:handle_remove_status_event');

export const handleRemoveStatusEvent = () => async (ctx: Context) => {
  debug('Triggered "handle_remove_status_event" handler');

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('rse:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || 0;

  const splittedData = callbackData.split(':');
  const statusId = parseInt(splittedData[1], 10);
  const eventId = parseInt(splittedData[3], 10);

  const query = 'DELETE FROM chat_status_change_events WHERE id = $1 AND status_id = $2'; 
  const result = await client.query(query, [eventId, statusId]);

  if (!result.rowCount) {
    debug('Change status event not found');
    await ctx.editMessageText('Тригер зміни статусу таски не знайдено');
    return;
  }

  const statuses = await getStatusesWithEvents(chatId, thread);
  if (!statuses.length) {
    debug('Statuses not created');
    await ctx.editMessageText('Не створено жодного статусу');
    return;
  }

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
