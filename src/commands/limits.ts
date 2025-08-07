import createDebug from 'debug';
import { LIMITS_MESSAGE } from '../constants';

import type { Context } from 'telegraf';

const debug = createDebug('bot:limits');

export const limitsCommandReply = async (ctx: Context) => {
  debug('Triggered "limits" command');
  await ctx.reply(LIMITS_MESSAGE, { parse_mode: 'HTML' });
};
