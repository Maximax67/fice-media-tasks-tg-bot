import createDebug from 'debug';
import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_remove_markup');

export const handleRemoveMarkup = async (ctx: Context) => {
  debug('Triggered "handleRemoveMarkup" handler');
  await ctx.editMessageReplyMarkup(undefined);
};
