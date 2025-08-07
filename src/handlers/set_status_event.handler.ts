import createDebug from 'debug';
import { client } from '../core';
import { STATUS_EVENT_KEYBOARD_ITEMS } from '../constants';
import {
  applyRestrictions,
  getStatusesWithEvents,
  makeChangeStatusEventKeyboard,
} from '../utils';

import type { Context } from 'telegraf';
import type { StatusesWithEvents } from '../interfaces';
import type { ChangeStatusEvents } from '../enums';

const debug = createDebug('bot:handle_set_status_event');

export const handleSetStatusEvent = async (ctx: Context) => {
  debug('Triggered "handle_set_status_event" handler');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('sse:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || 0;

  const splittedData = callbackData.split(':');
  const statusId = parseInt(splittedData[1], 10);
  const event = splittedData[3] as ChangeStatusEvents;

  const query = `
    WITH status_info AS (
      SELECT chat_id
      FROM chat_task_statuses
      WHERE id = $1
    ),
    existing_events AS (
      SELECT cse.event
      FROM chat_status_change_events cse
      JOIN chat_task_statuses cts ON cse.status_id = cts.id
      WHERE cts.chat_id = (SELECT chat_id FROM status_info)
    )
    INSERT INTO chat_status_change_events (status_id, event)
    SELECT $1, $2
    WHERE NOT EXISTS (
      SELECT 1 FROM existing_events WHERE event = $2
    )
  `;
  const result = await client.query(query, [statusId, event]);

  if (!result.rowCount) {
    debug('Unable to set status event');
    await ctx.editMessageText(
      'Не вдалось встановити тригер на зміну статусу. Можливо статус вже видалений або такий тригер вже встановлений на інший статус',
    );
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
