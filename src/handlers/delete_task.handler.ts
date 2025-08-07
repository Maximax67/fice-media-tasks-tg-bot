import createDebug from 'debug';
import { client } from '../core';
import { applyRestrictions, autoupdateTaskList } from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:handle_delete_task');

export const handleDeleteTask = async (ctx: Context) => {
  debug('Triggered "handleDeleteTask" handler');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

  const callbackData: string = (ctx.callbackQuery as any).data;
  if (!callbackData.startsWith('delete_task:')) {
    debug(`Invalid callback data: ${callbackData}`);
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = (ctx.callbackQuery as any).message.message_thread_id || 0;
  const taskId = parseInt(callbackData.split(':')[1], 10);

  const query = `
    DELETE FROM tasks
    USING chats
    WHERE tasks.chat_id = chats.id 
    AND tasks.id = $1 
    AND chats.chat_id = $2 
    AND chats.thread = $3
  `;
  const res = await client.query(query, [taskId, chatId, thread]);

  if (!res.rowCount) {
    debug('Task not found.');
    await ctx.editMessageText(
      'Завдання не знайдено! Можливо воно вже видалено',
    );
    return;
  }

  debug(`Task deleted. Id: ${taskId}`);
  await ctx.editMessageText('Завдання видалено!');
  await autoupdateTaskList(chatId, thread);
};
