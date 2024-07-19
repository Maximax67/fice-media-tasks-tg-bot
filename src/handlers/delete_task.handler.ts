import createDebug from 'debug';
import { client } from '../core';
import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_delete_task');

export const handleDeleteTask = () => async (ctx: Context) => {
  debug('Triggered "handleDeleteTask" handler');

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('delete_task:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || null;
  const taskId = parseInt(callbackData.split(':')[1], 10);

  let query: string;
  let params: number[];
  if (thread) {
    query = 'DELETE FROM tasks WHERE id = $1 AND chat_id = $2 AND thread = $3';
    params = [taskId, chatId, thread];
  } else {
    query =
      'DELETE FROM tasks WHERE id = $1 AND chat_id = $2 AND thread IS NULL';
    params = [taskId, chatId];
  }

  const res = await client.query(query, params);
  if (!res.rowCount) {
    debug('Task not found.');
    await ctx.editMessageText(
      'Завдання не знайдено! Можливо воно вже видалено',
    );
    return;
  }

  debug(`Task deleted. Id: ${taskId}`);
  await ctx.editMessageText('Завдання видалено!');
};
