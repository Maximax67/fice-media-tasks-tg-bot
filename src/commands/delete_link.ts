import createDebug from 'debug';
import { client } from '../core';
import {
  applyRestrictions,
  autoupdateTaskList,
  formatChatLink,
  getLinksForChat,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_link');
const deleteLinkRegex = /^(\/\S+)\s+(\d+)$/;

export const deleteLink = async (ctx: Context) => {
  debug('Triggered "delete_link" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteLinkRegex);

  if (!match) {
    debug('Invalid delete link command format');
    await ctx.reply(
      'Неправильний формат видалення посилання!\n/delete_link номер_посилання',
    );
    return;
  }

  const linkNumber = parseInt(match[2], 10);
  if (linkNumber < 1) {
    debug('Selected link not exists');
    await ctx.reply('Не існує посилання з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const links = await getLinksForChat(chatId, thread);
  if (!links.length) {
    debug('Links not created');
    await ctx.reply('Не створено жодних посилань');
    return;
  }

  if (linkNumber > links.length) {
    debug('Selected link not exists');
    await ctx.reply('Не існує посилання з таким порядковим номером');
    return;
  }

  const selectedLink = links[linkNumber - 1];
  const linkId = selectedLink.id;
  const result = await client.query(
    'DELETE FROM chat_links WHERE id = $1 RETURNING url, description',
    [linkId],
  );
  if (!result.rowCount) {
    debug('Link not found');
    await ctx.reply('Посилання не знайдено. Можливо воно вже видалено');
    return;
  }

  const url = result.rows[0].url;
  const description = result.rows[0].description;

  debug(`Link deleted with id: ${linkId}`);
  await ctx.reply(`Посилання видалено: ${formatChatLink(url, description)}`, {
    link_preview_options: { is_disabled: true },
    parse_mode: 'HTML',
  });

  await autoupdateTaskList(chatId, thread);
};
