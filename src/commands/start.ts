import createDebug from 'debug';
import type { Context } from 'telegraf';

const debug = createDebug('bot:start');

export const startCommandReply = () => async (ctx: Context) => {
  debug('Triggered "start" command');

  ctx.reply('Привіт');
};
