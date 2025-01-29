import createDebug from 'debug';
import { HELP_MESSAGE } from '../constants';
import type { Context } from 'telegraf';

const debug = createDebug('bot:help');

export const helpCommandReply = () => async (ctx: Context) => {
  debug('Triggered "help" command');
  await ctx.reply(HELP_MESSAGE, { parse_mode: 'HTML' });
};
