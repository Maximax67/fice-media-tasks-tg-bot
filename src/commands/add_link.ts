import createDebug from 'debug';
import { client } from '../core';
import {
  applyRestrictions,
  autoupdateTaskList,
  formatChatLink,
} from '../utils';
import {
  URL_DESCRIPTION_LENGTH_LIMIT,
  URL_LENGTH_LIMIT,
  URLS_LIMIT,
} from '../config';

import type { Context } from 'telegraf';

const debug = createDebug('bot:add_link');
const addLinkRegex = /^(\/\S+)\s+(https?:\/\/\S+)\s*(.+)?$/;

export const addLink = async (ctx: Context) => {
  debug('Triggered "add_link" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(addLinkRegex);

  if (!match) {
    debug('Invalid add link command format');
    await ctx.reply(
      'Неправильний формат команди додавання посилання!\n/add_link посилання Опис посилання',
    );
    return;
  }

  const url = match[2].trim();
  if (url.length > URL_LENGTH_LIMIT) {
    debug('URL is too long');
    await ctx.reply(
      `Посилання дуже довге (${url.length}). Обмеження за кількістю символів: ${URL_LENGTH_LIMIT}.`,
    );
    return;
  }

  const urlDescription = match[3] ? match[3].trim() : '';
  if (urlDescription.length > URL_DESCRIPTION_LENGTH_LIMIT) {
    debug('URL description is too long');
    await ctx.reply(
      `Опис посилання дуже довгий (${urlDescription.length}). Обмеження за кількістю символів: ${URL_DESCRIPTION_LENGTH_LIMIT}.`,
    );
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query = `
    WITH chat_entry AS (
      INSERT INTO chats (chat_id, thread)
      VALUES ($1, $2)
      ON CONFLICT (chat_id, thread) DO NOTHING
      RETURNING id
    ), chat_id_resolved AS (
      SELECT COALESCE(
        (SELECT id FROM chat_entry),
        (SELECT id FROM chats WHERE chat_id = $1 AND thread = $2)
      ) AS id
    ), link_count AS (
      SELECT COUNT(*) AS count FROM chat_links WHERE chat_id = (SELECT id FROM chat_id_resolved)
    )
    INSERT INTO chat_links (chat_id, url, description)
    SELECT (SELECT id FROM chat_id_resolved), $3, $4
    FROM link_count
    WHERE count < $5
    RETURNING id;
  `;
  const queryParams = [chatId, thread, url, urlDescription || null, URLS_LIMIT];

  const result = await client.query(query, queryParams);

  const newStatus = result.rows[0];
  if (!newStatus) {
    debug(`Max links limit reached`);
    await ctx.reply(`Ви досягли ліміту посилань в цьому чаті (${URLS_LIMIT}).`);
    return;
  }

  debug(`Link added with id: ${newStatus.id}`);
  await ctx.reply(
    `Створено нове посилання: ${formatChatLink(url, urlDescription)}`,
    { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
  );
  await autoupdateTaskList(chatId, thread);
};
