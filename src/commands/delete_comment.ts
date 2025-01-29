import createDebug from 'debug';
import { client } from '../core';
import {
  autoupdateTaskList,
  getSelectedTaskComment,
  urlReplacer,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_comment');
const deleteTaskRegex = /^(\/\S+)\s+(\d+)\s+(\d+)$/;

export const deleteTaskComment = () => async (ctx: Context) => {
  debug('Triggered "delete_comment" command');

  const message: string = (ctx.message as any).text.trim();
  const match = message.match(deleteTaskRegex);

  if (!match) {
    debug('Invalid task delete comment command format');
    await ctx.reply(
      'Неправильний формат команди видалення коментарію!\n/delete_comment номер_таски номер_коментаря',
    );
    return;
  }

  const taskNumber = parseInt(match[2], 10);
  const commentNumber = parseInt(match[3], 10);
  const selectedComment = await getSelectedTaskComment(
    ctx,
    taskNumber,
    commentNumber,
  );

  if (!selectedComment) {
    debug('Selected comment not exists');
    return;
  }

  const commentId = selectedComment.id;
  const result = await client.query('DELETE FROM comments WHERE id = $1', [
    commentId,
  ]);

  if (!result.rowCount) {
    debug('Comment not found');
    await ctx.reply('Коментар не знайдено. Можливо він вже видалений');
    return;
  }

  debug(`Comment deleted with id: ${commentId}`);
  await ctx.reply(
    `Видалено коментар: ${urlReplacer(selectedComment.comment_text)}`,
    {
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || null;

  await autoupdateTaskList(chatId, thread);
};
