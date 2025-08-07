import createDebug from 'debug';
import { client } from '../core';
import { applyRestrictions, autoupdateTaskList } from '../utils';
import {
  TASK_STATUS_ICON_LENGTH_LIMIT,
  TASK_STATUS_TITLE_LENGTH_LIMIT,
  TASK_STATUSES_LIMIT,
} from '../config';

import type { Context } from 'telegraf';

const debug = createDebug('bot:add_status');
const addStatusRegex = /^(\/\S+)\s+([^\n\s\t]+)\s+(.+)$/v;

export const addStatus = async (ctx: Context) => {
  debug('Triggered "add_status" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(addStatusRegex);

  if (!match) {
    debug('Invalid add status command format');
    await ctx.reply(
      'Неправильний формат команди додавання статусу!\n/add_status іконка(емодзі) Назва статусу',
    );
    return;
  }

  const statusIcon = match[2].trim();
  if (statusIcon.length > TASK_STATUS_ICON_LENGTH_LIMIT) {
    debug('Status icon too long');
    await ctx.reply(
      `Іконка статусу дуже довга (${statusIcon.length}). Обмеження за кількістю символів: ${TASK_STATUS_ICON_LENGTH_LIMIT}.`,
    );
    return;
  }

  const statusTitle = match[3].trim();
  if (statusTitle.length > TASK_STATUS_TITLE_LENGTH_LIMIT) {
    debug('Status title too long');
    await ctx.reply(
      `Назва статусу дуже довга (${statusTitle.length}). Обмеження за кількістю символів: ${TASK_STATUS_TITLE_LENGTH_LIMIT}.`,
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
    ), status_count AS (
      SELECT COUNT(*) AS count FROM chat_task_statuses WHERE chat_id = (SELECT id FROM chat_id_resolved)
    )
    INSERT INTO chat_task_statuses (chat_id, icon, title)
    SELECT (SELECT id FROM chat_id_resolved), $3, $4
    FROM status_count
    WHERE count < $5
    RETURNING id;
  `;
  const queryParams = [
    chatId,
    thread,
    statusIcon,
    statusTitle,
    TASK_STATUSES_LIMIT,
  ];

  const result = await client.query(query, queryParams);

  const newStatus = result.rows[0];
  if (!newStatus) {
    debug(`Max task statuses limit reached`);
    await ctx.reply(
      `Ви досягли ліміту статусів в цьому чаті (${TASK_STATUSES_LIMIT}).`,
    );
    return;
  }

  debug(`Task status added with id: ${newStatus.id}`);
  await ctx.reply(`Створено новий статус тасок: ${statusIcon} ${statusTitle}`);
  await autoupdateTaskList(chatId, thread);
};
