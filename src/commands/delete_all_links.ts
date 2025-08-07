import createDebug from 'debug';
import { client } from '../core';
import { applyRestrictions, autoupdateTaskList } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_all_links');

export const deleteAllLinks = async (ctx: Context) => {
  debug('Triggered "delete_all_links" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `
    DELETE FROM chat_links cl
    USING chats c
    WHERE cl.chat_id = c.id
    AND c.chat_id = $1
    AND c.thread = $2
  `;

  const res = await client.query(query, [chatId, thread]);
  const deletedLinksCount = res.rowCount;

  if (!deletedLinksCount) {
    debug('Links not created');
    await ctx.reply('Не створено жодних посилань!');
    return;
  }

  if (deletedLinksCount === 1) {
    debug('1 link deleted');
  } else {
    debug(`${deletedLinksCount} links deleted`);
  }

  await ctx.reply(`Видалено всі посилання: ${deletedLinksCount}`);

  await autoupdateTaskList(chatId, thread);
};
