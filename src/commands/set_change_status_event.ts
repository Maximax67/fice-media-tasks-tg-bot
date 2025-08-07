import createDebug from 'debug';
import {
  escapeHtml,
  getStatusesWithEvents,
  makeChangeStatusEventKeyboard,
} from '../utils';
import { STATUS_EVENT_KEYBOARD_ITEMS } from '../constants';

import type { Context } from 'telegraf';

const debug = createDebug('bot:set_change_status_event');
const setChangeStatusEventRegex = /^(\/\S+)\s+(\d+)$/;

export const setChangeStatusEvent = async (ctx: Context) => {
  debug('Triggered "set_change_status_event" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(setChangeStatusEventRegex);
  if (!match) {
    debug('Invalid set change status event command format');
    await ctx.reply(
      'Неправильний формат встановлення тригеру зміни статусу!\n/set_change_status_event номер_статусу',
    );
    return;
  }

  const statusNumber = parseInt(match[2], 10);
  if (statusNumber < 1) {
    await ctx.reply('Не існує статусу з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const statuses = await getStatusesWithEvents(chatId, thread);
  if (!statuses.length) {
    await ctx.reply('Не створено жодного статусу');
    return;
  }

  if (statusNumber > statuses.length) {
    await ctx.reply('Не існує статусу з таким порядковим номером');
    return;
  }

  const selectedStatus = statuses[statusNumber - 1];
  const keyboard = makeChangeStatusEventKeyboard(
    statuses,
    selectedStatus,
    0,
    STATUS_EVENT_KEYBOARD_ITEMS,
  );

  const statusIcon = escapeHtml(selectedStatus.icon);
  const statusTitle = escapeHtml(selectedStatus.title);

  await ctx.reply(
    `Налаштування автоматичної зміни на статус ${statusIcon} ${statusTitle}`,
    {
      reply_markup: { inline_keyboard: keyboard },
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );
};
