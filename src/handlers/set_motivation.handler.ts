import createDebug from 'debug';

import { client } from '../core';
import { MotivationTypes } from '../enums';
import { MOTIVATION_TYPES_NAMES } from '../constants';
import { applyRestrictions } from '../utils';

import type { QueryResult } from 'pg';
import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_set_motivation');

export const handleSetMotivation = async (ctx: Context) => {
  debug('Triggered "handle_set_motivation" handler');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('set_motivation:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || 0;

  const splittedData = callbackData.split(':');
  const motivationType = splittedData[1] as MotivationTypes;

  if (!Object.values(MotivationTypes).includes(motivationType)) {
    debug(`Invalid motivation type: ${motivationType}`);
    await ctx.editMessageText('Не валідний тип мотивації');
    return;
  }

  let result: QueryResult;
  if (motivationType === MotivationTypes.NONE) {
    const query =
      'UPDATE chats SET motivation_type = NULL WHERE chat_id = $1 AND thread = $2';
    result = await client.query(query, [chatId, thread]);
  } else {
    const query = `
      INSERT INTO chats (chat_id, thread, motivation_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (chat_id, thread) 
      DO UPDATE SET motivation_type = EXCLUDED.motivation_type;
    `;
    result = await client.query(query, [chatId, thread, motivationType]);
  }

  if (!result.rowCount) {
    debug('Unable to set motivation type');
    await ctx.editMessageText(
      'Не вдалось встановити тип мотивації. Можливо він вже заданий на бажаний.',
    );
    return;
  }

  await ctx.editMessageText(
    `Встановлено новий тип мотивації: ${MOTIVATION_TYPES_NAMES[motivationType]}`,
  );
};
