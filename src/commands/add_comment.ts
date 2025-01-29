import createDebug from 'debug';
import { client } from '../core';
import {
  autoupdateTaskList,
  formatDateTime,
  getTasksForChat,
  taskTitleReplacer,
  urlReplacer,
} from '../utils';
import { COMMENT_TEXT_LENGTH_LIMIT, COMMENTS_LIMIT } from '../config';

import type { Context } from 'telegraf';

const debug = createDebug('bot:add_comment');
const addCommentRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const addComment = () => async (ctx: Context) => {
  debug('Triggered "add_comment" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(addCommentRegex);

  if (!match) {
    debug('Invalid task add comment command format');
    await ctx.reply(
      'Неправильний формат команди додавання коментаря!\n/add_comment номер_таски Текст коментаря',
    );
    return;
  }

  const commentText = match[3].trim();
  if (commentText.length > COMMENT_TEXT_LENGTH_LIMIT) {
    debug('Comment text too long');
    await ctx.reply(
      `Текст коментаря дуже довгий (${commentText.length}). Обмеження за кількістю символів: ${COMMENT_TEXT_LENGTH_LIMIT}.`,
    );
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;
  const taskNumber = parseInt(match[2], 10);
  const tasks = await getTasksForChat(chatId, thread);

  if (!tasks.length) {
    debug('There are no tasks');
    await ctx.reply('Не створено жодної таски');
    return;
  }

  if (taskNumber > tasks.length) {
    debug(`Invalid task number: ${taskNumber}`);
    await ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const selectedTask = tasks[taskNumber - 1];
  const taskId = selectedTask.id;

  const result = await client.query(
    `
      WITH comment_count AS (
        SELECT COUNT(*) AS count
        FROM comments
        WHERE task_id = $1
      )
      INSERT INTO comments (task_id, comment_text, created_at)
      SELECT $1, $2, NOW()
      FROM comment_count
      WHERE count < $3
      RETURNING id, created_at;
    `,
    [taskId, commentText, COMMENTS_LIMIT],
  );

  const newComment = result.rows[0];
  if (!newComment) {
    debug(`Max comments limit reached for task_id: ${taskId}`);
    await ctx.reply(
      `Ви досягли ліміту коментарів на цю таску (${COMMENTS_LIMIT}).`,
    );
    return;
  }

  const formattedTitle = taskTitleReplacer(selectedTask.title);
  const formattedComment = urlReplacer(commentText);
  const formattedDatetime = formatDateTime(
    new Date(newComment.created_at),
    true,
  );

  debug(`Comment added with id: ${newComment.id}`);
  await ctx.reply(
    `Додано коментар до таски "${formattedTitle}": ${formattedComment}\n\n<i>Час додавання: ${formattedDatetime}</i>`,
    { link_preview_options: { is_disabled: true }, parse_mode: 'HTML' },
  );

  await autoupdateTaskList(chatId, thread);
};
