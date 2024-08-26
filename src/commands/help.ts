import createDebug from 'debug';
import { getHelp } from '../utils';
import type { Context } from 'telegraf';

const debug = createDebug('bot:help');

export const helpCommandReply = () => async (ctx: Context) => {
  debug('Triggered "help" command');

  ctx.reply(getHelp(), { parse_mode: 'HTML' });
};
