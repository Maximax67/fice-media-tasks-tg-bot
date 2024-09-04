import createDebug from 'debug';
import { limitsMessage } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:limits');

export const limitsCommandReply = () => async (ctx: Context) => {
  debug('Triggered "limits" command');
  ctx.reply(limitsMessage, { parse_mode: 'HTML' });
};
