import createDebug from 'debug';

import { client } from '../core';
import { MotivationTypes } from '../enums';
import { MOTIVATION_TYPES_NAMES } from '../constants';

import type { QueryResult } from 'pg';
import type { Context } from 'telegraf';
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

const debug = createDebug('bot:set_motivation');

export const setMotivation = () => async (ctx: Context) => {
  debug('Triggered "set_motivation" command');

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const query =
    'SELECT motivation_type FROM chats WHERE chat_id = $1 AND thread = $2';
  const result: QueryResult<{ motivation_type: MotivationTypes }> =
    await client.query(query, [chatId, thread]);

  const keyboard: InlineKeyboardButton[][] = [];
  const currentMotivation = result.rows.length
    ? result.rows[0].motivation_type
    : MotivationTypes.NONE;

  Object.values(MotivationTypes).forEach((motivationType) => {
    if (motivationType !== currentMotivation) {
      keyboard.push([
        {
          text: MOTIVATION_TYPES_NAMES[motivationType],
          callback_data: `set_motivation:${motivationType}`,
        },
      ]);
    }
  });

  keyboard.push([
    {
      text: 'Закрити',
      callback_data: 'remove_markup',
    },
  ]);

  await ctx.reply(
    `Оберіть тип мотиваційних фото. Поточний: ${MOTIVATION_TYPES_NAMES[currentMotivation]}`,
    {
      reply_markup: { inline_keyboard: keyboard },
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );
};
