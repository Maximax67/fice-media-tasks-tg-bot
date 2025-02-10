import createDebug from 'debug';
import { START_MESSAGE } from '../constants';

import type { Context } from 'telegraf';

const debug = createDebug('bot:start');

export const startCommandReply = () => async (ctx: Context) => {
  debug('Triggered "start" command');
  await ctx.reply(START_MESSAGE);
};
