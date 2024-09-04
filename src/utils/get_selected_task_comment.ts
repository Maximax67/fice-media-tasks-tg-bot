import { getTasksForChat } from '.';
import { client } from '../core';

import type { Context } from 'telegraf';
import type { Comment } from '../interfaces';

export async function getSelectedTaskComment(
  ctx: Context,
  taskNumber: number,
  commentNumber: number,
): Promise<Comment | undefined> {
  if (taskNumber < 1) {
    ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  if (commentNumber < 1) {
    ctx.reply('Не існує коментаря до таски з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;
  const tasks = await getTasksForChat(chatId, thread);

  if (!tasks.length) {
    ctx.reply('Не створено жодної таски');
    return;
  }

  if (taskNumber > tasks.length) {
    ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const commentsQuery = `
  SELECT *
  FROM comments
  WHERE task_id = $1
  ORDER BY id
  `;

  const taskId = tasks[taskNumber - 1].id;
  const commentsResult = await client.query(commentsQuery, [taskId]);
  const comments: Comment[] = commentsResult.rows;

  if (!comments.length) {
    ctx.reply('Ця таска не містить жодного коментаря');
    return;
  }

  if (commentNumber > comments.length) {
    ctx.reply('Не існує коментаря до таски з таким порядковим номером');
    return;
  }

  return comments[commentNumber - 1];
}
