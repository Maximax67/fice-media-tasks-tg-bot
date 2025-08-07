import { getUserLabel } from './get_user_label';
import { isAdmin } from './is_admin';
import { isChatRestricted } from './is_chat_restricted';

import type { Context } from 'telegraf';

export const applyRestrictions = async (
  ctx: Context,
  isAlwaysAdmins: boolean = false,
): Promise<boolean> => {
  const isUserAdmin = await isAdmin(ctx);

  if (
    isUserAdmin ||
    (!isAlwaysAdmins && !(await isChatRestricted(ctx.chat!.id)))
  ) {
    return true;
  }

  const userLabel = getUserLabel(ctx);
  await ctx.reply(
    `${userLabel}, тобі потрібно бути адміністратором чату, щоб виконати цю команду!`,
  );

  return false;
};
