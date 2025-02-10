import { ChangeStatusEvents } from '../enums';
import { CHANGE_STATUS_EVENT_NAMES } from '../constants';

import type { StatusesWithEvents } from '../interfaces';
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

export const makeChangeStatusEventKeyboard = (
  statuses: StatusesWithEvents[],
  selectedStatus: StatusesWithEvents,
  offset: number,
  limit: number,
): InlineKeyboardButton[][] => {
  const statusId = selectedStatus.id;

  const changeStatusEventsValues = Object.values(ChangeStatusEvents);
  const changeStatusEventsSet = new Set(changeStatusEventsValues);
  const activeStatusEventsMap = new Map<ChangeStatusEvents, number>();

  for (const status of statuses) {
    const changeEvents = status.events;
    if (changeEvents) {
      if (status.id === statusId) {
        for (const changeEvent of changeEvents) {
          activeStatusEventsMap.set(changeEvent.event, changeEvent.id);
        }
      } else {
        for (const changeEvent of changeEvents) {
          changeStatusEventsSet.delete(changeEvent.event);
        }
      }
    }
  }

  const keyboard: InlineKeyboardButton[][] = [];
  let counter = 0;
  for (const event of changeStatusEventsValues) {
    if (counter < offset) {
      counter++;
      continue;
    }

    if (counter > limit + offset) {
      break;
    }

    if (changeStatusEventsSet.has(event)) {
      const eventId = activeStatusEventsMap.get(event);
      if (eventId) {
        keyboard.push([
          {
            text: '✅ ' + CHANGE_STATUS_EVENT_NAMES[event],
            callback_data: `rse:${statusId}:${offset}:${eventId}`,
          },
        ]);
      } else {
        keyboard.push([
          {
            text: CHANGE_STATUS_EVENT_NAMES[event],
            callback_data: `sse:${statusId}:${offset}:${event}`,
          },
        ]);
      }

      counter++;
    }
  }

  const paginationButtons: InlineKeyboardButton[] = [];
  if (offset !== 0) {
    paginationButtons.push({
      text: '<--',
      callback_data: `csep:${statusId}:${Math.max(offset - limit, 0)}`,
    });
  }
  if (counter !== changeStatusEventsValues.length) {
    paginationButtons.push({
      text: '-->',
      callback_data: `csep:${statusId}:${Math.min(offset + limit, changeStatusEventsSet.size)}`,
    });
  }
  if (paginationButtons.length) {
    keyboard.push(paginationButtons);
  }

  keyboard.push([
    {
      text: 'Закрити',
      callback_data: 'remove_markup',
    },
  ]);

  return keyboard;
};
