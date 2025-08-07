import createDebug from 'debug';
import { applyRestrictions } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_remove_markup');

export const handleRemoveMarkup = async (ctx: Context) => {
  debug('Triggered "handleRemoveMarkup" handler');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  await ctx.editMessageReplyMarkup(undefined);
};
