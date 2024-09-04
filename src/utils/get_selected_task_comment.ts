import createDebug from 'debug';
import { getTasksForChat } from '.';
import { client } from '../core';

import type { Context } from 'telegraf';
import type { Comment } from '../interfaces';

const debug = createDebug('util:get_selected_task');

export async function getSelectedTaskComment(
  ctx: Context,
  taskNumber: number,
  commentNumber: number,
): Promise<Comment | undefined> {
  debug('Triggered "get_selected_task" function');

  if (taskNumber < 1) {
    debug(`Invalid task number: ${taskNumber}`);
    ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  if (commentNumber < 1) {
    debug(`Invalid comment number: ${commentNumber}`);
    ctx.reply('Не існує коментаря до таски з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;
  const tasks = await getTasksForChat(chatId, thread);

  if (!tasks.length) {
    debug('There is no tasks');
    ctx.reply('Не створено жодної таски');
    return;
  }

  if (taskNumber > tasks.length) {
    debug(`Invalid task number: ${taskNumber}`);
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
    debug(`Task ${taskNumber} has no comments`);
    ctx.reply('Ця таска не містить жодного коментаря');
    return;
  }

  if (commentNumber > comments.length) {
    debug(`Invalid comment number: ${commentNumber}`);
    ctx.reply('Не існує коментаря до таски з таким порядковим номером');
    return;
  }

  return comments[commentNumber - 1];
}
