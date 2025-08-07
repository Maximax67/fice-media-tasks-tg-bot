import type { Context } from 'telegraf';

export const isAdmin = async (ctx: Context): Promise<boolean> => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!userId || !chatId) {
    return false;
  }

  if (ctx.chat?.type === 'private') {
    return true;
  }

  try {
    const admins = await ctx.telegram.getChatAdministrators(chatId);
    return admins.some((admin) => admin.user.id === userId);
  } catch (error) {
    return false;
  }
};
