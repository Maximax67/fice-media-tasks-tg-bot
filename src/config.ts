export const LOCALE = process.env.LOCALE || 'uk-UA';
export const UTC = parseInt(process.env.UTC || '3', 10);

export const LINK_REPLACER_TEXT = process.env.LINK_REPLACER_TEXT || '*тиць*';

export const TITLE_LENGTH_LIMIT = parseInt(
  process.env.TITLE_LENGTH_LIMIT || '50',
  10,
);
export const TZ_LENGTH_LIMIT = parseInt(
  process.env.TZ_LENGTH_LIMIT || '100',
  10,
);
export const DEADLINE_LENGTH_LIMIT = parseInt(
  process.env.DEADLINE_LENGTH_LIMIT || '25',
  10,
);
export const POST_DEADLINE_LENGTH_LIMIT = parseInt(
  process.env.POST_DEADLINE_LENGTH_LIMIT || '25',
  10,
);
export const RESPONSIBLE_LENGTH_LIMIT = parseInt(
  process.env.RESPONSIBLE_LENGTH_LIMIT || '25',
  10,
);
export const COMPLETE_TASK_URL_LENGTH_LIMIT = parseInt(
  process.env.COMPLETE_TASK_URL_LENGTH_LIMIT || '100',
  10,
);
export const COMMENT_TEXT_LENGTH_LIMIT = parseInt(
  process.env.COMMENT_TEXT_LENGTH_LIMIT || '150',
  10,
);

export const TASKS_LIMIT = parseInt(process.env.TASKS_LIMIT || '10', 10);
export const COMMENTS_LIMIT = parseInt(process.env.COMMENTS_LIMIT || '5', 10);

export const BOT_OWNER = process.env.BOT_OWNER || '@Maximax67';

const tzAlwaysUrlEnv = process.env.TZ_ALWAYS_URL;
export const TZ_ALWAYS_URL =
  !!tzAlwaysUrlEnv &&
  (tzAlwaysUrlEnv === '1' || tzAlwaysUrlEnv.toLowerCase() === 'true');
