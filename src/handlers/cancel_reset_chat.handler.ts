import createDebug from 'debug';
import { applyRestrictions } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_cancel_reset_chat');

export const handleCancelResetChat = async (ctx: Context) => {
  debug('Triggered "handleCancelResetChat" handler');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  await ctx.editMessageText('Видалення інформації про чат скасоване!');
};
