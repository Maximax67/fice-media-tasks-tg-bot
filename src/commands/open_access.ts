import createDebug from 'debug';
import { applyRestrictions } from '../utils';

import type { Context } from 'telegraf';
import { client } from '../core';

const debug = createDebug('bot:open_access');

export const openAccess = async (ctx: Context) => {
  debug('Triggered "open_access" command');

  if (ctx.chat?.type === 'private') {
    await ctx.reply('Команда не працює в приватних чатах!');
    return;
  }

  if (!(await applyRestrictions(ctx, true))) {
    return;
  }

  const chatId = ctx.chat!.id;
  const query = `
    DELETE FROM restricted_chats
    WHERE chat_id = $1
  `;
  const result = await client.query(query, [chatId]);

  if (!result.rowCount) {
    await ctx.reply(
      'Обмеження на команди відсутні. Щоб їх задати, скористайтесь командою /limit_access!',
    );
    return;
  }

  await ctx.reply('Усі команди тепер не мають обмежень!');
};
