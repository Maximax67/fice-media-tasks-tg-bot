import createDebug from 'debug';
import { applyRestrictions } from '../utils';

import type { Context } from 'telegraf';
import { client } from '../core';

const debug = createDebug('bot:limit_access');

export const limitAccess = async (ctx: Context) => {
  debug('Triggered "limit_access" command');

  if (ctx.chat?.type === 'private') {
    await ctx.reply('Команда не працює в приватних чатах!');
    return;
  }

  if (!(await applyRestrictions(ctx, true))) {
    return;
  }

  const chatId = ctx.chat!.id;
  const query = `
    INSERT INTO restricted_chats (chat_id)
    VALUES ($1)
    ON CONFLICT (chat_id) DO NOTHING
    RETURNING chat_id
  `;

  const result = await client.query(query, [chatId]);

  if (!result.rowCount) {
    debug(`Restrictions already enabled: ${chatId}`);
    await ctx.reply(
      'Обмеження на команди вже задані. Щоб їх прибрати, скористайтесь командою /open_access!',
    );
    return;
  }

  await ctx.reply(
    'Усі команди, які вносять зміни в базі даних, тепер обмежені лише для адміністраторів чату!',
  );
};
