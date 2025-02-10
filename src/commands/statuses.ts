import createDebug from 'debug';
import { escapeHtml, getStatusesWithEvents } from '../utils';

import type { Context } from 'telegraf';
import { CHANGE_STATUS_EVENT_NAMES } from '../constants';

const debug = createDebug('bot:statuses');

export const getStatuses = () => async (ctx: Context) => {
  debug('Triggered "statuses" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const statuses = await getStatusesWithEvents(chatId, thread);
  if (statuses.length === 0) {
    debug('No statuses found');
    await ctx.reply('Немає статусів! Створіть новий командою /add_status');
    return;
  }

  if (statuses.length === 1) {
    debug('Got statuses list with 1 item');
  } else {
    debug(`Got statuses list with ${statuses.length} items`);
  }

  let statusesMessage = '<b>=== Статуси ===</b>\n';
  statuses.forEach((status, index) => {
    statusesMessage += `\n${index + 1}) ${escapeHtml(status.icon)} ${escapeHtml(status.title)}`;

    const events = status.events;
    if (events.length) {
      let eventsLabel = ': <i>';
      events.forEach((eventInfo, index) => {
        eventsLabel += `${index ? ', ' : ''}${CHANGE_STATUS_EVENT_NAMES[eventInfo.event]}`;
      });

      eventsLabel += '</i>';
      statusesMessage += eventsLabel;
    }
  });

  await ctx.reply(statusesMessage, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
};
