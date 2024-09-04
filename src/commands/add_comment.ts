import createDebug from 'debug';
import { client } from '../core';
import { getTasksForChat } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:add_comment');
const addCommentRegex = /^(\/\S+)\s+(\d+)\s+(.+)$/;

export const addComment = () => async (ctx: Context) => {
  debug('Triggered "add_comment" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(addCommentRegex);

  if (!match) {
    debug('Invalid task add comment command format');
    ctx.reply(
      'Неправильний формат команди додавання коментаря!\n/add_comment номер_таски Текст коментаря',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const commentText = match[3].trim();

  if (taskNumber < 1) {
    debug('Invalid task number');
    ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;
  const tasks = await getTasksForChat(chatId, thread);

  if (!tasks.length) {
    debug('There are no tasks');
    ctx.reply('Не створено жодної таски');
    return;
  }

  if (taskNumber > tasks.length) {
    debug(`Invalid task number: ${taskNumber}`);
    ctx.reply('Не існує таски з таким порядковим номером');
    return;
  }

  const selectedTask = tasks[taskNumber - 1];
  const taskId = selectedTask.id;

  const result = await client.query(
    'INSERT INTO comments (task_id, comment_text, created_at) VALUES ($1, $2, NOW()) RETURNING id, created_at',
    [taskId, commentText],
  );

  const newComment = result.rows[0];

  if (!newComment) {
    debug('Failed to insert comment');
    ctx.reply('Не вдалося додати коментар. Спробуйте ще раз.');
    return;
  }

  debug(`Comment added with id: ${newComment.id}`);
  ctx.reply(
    `Додано коментар до таски "${selectedTask.title}":\n${commentText}\n\nЧас додавання: ${new Date(newComment.created_at).toLocaleString('uk-UA')}`,
  );
};
