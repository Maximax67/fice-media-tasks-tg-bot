import createDebug from 'debug';
import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_cancel_reset_chat');

export const handleCancelResetChat = async (ctx: Context) => {
  debug('Triggered "handleCancelResetChat" handler');
  await ctx.editMessageText('Видалення інформації про чат скасоване!');
};
