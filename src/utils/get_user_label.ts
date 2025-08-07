import type { Context } from 'telegraf';

export const getUserLabel = (ctx: Context): string => {
  const username = ctx.from?.username;
  if (username) {
    return '@' + username;
  }

  const firstName = ctx.from?.first_name;
  const lastName = ctx.from?.last_name;

  if (lastName) {
    return firstName + ' ' + lastName;
  }

  if (firstName) {
    return firstName;
  }

  return 'Юзер';
};
