import createDebug from 'debug';
import { client } from '../core';
import { ChangeStatusEvents } from '../enums';
import {
  applyRestrictions,
  autoupdateTaskList,
  changeStatusEvent,
  formatChangeStatusEventMessage,
  getSelectedTaskComment,
  urlReplacer,
} from '../utils';

import type { Context } from 'telegraf';

const debug = createDebug('bot:delete_comment');
const deleteTaskRegex = /^(\/\S+)\s+(\d+)\s+(\d+)$/;

export const deleteTaskComment = async (ctx: Context) => {
  debug('Triggered "delete_comment" command');

  if (!(await applyRestrictions(ctx))) {
    return;
  }

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
  const selectedTaskComment = await getSelectedTaskComment(
    ctx,
    taskNumber,
    commentNumber,
  );

  if (!selectedTaskComment) {
    debug('Selected comment not exists');
    return;
  }

  const { comment, taskId } = selectedTaskComment;

  const commentId = comment.id;
  const result = await client.query('DELETE FROM comments WHERE id = $1', [
    commentId,
  ]);

  if (!result.rowCount) {
    debug('Comment not found');
    await ctx.reply('Коментар не знайдено. Можливо він вже видалений');
    return;
  }

  const chatId = ctx.chat!.id;
  const thread = ctx.message!.message_thread_id || 0;

  const newStatus = await changeStatusEvent(
    taskId,
    chatId,
    thread,
    ChangeStatusEvents.DELETE_COMMENT,
  );

  debug(`Comment deleted with id: ${commentId}`);
  await ctx.reply(
    `Видалено коментар: ${urlReplacer(comment.comment_text)}${formatChangeStatusEventMessage(newStatus)}`,
    {
      link_preview_options: { is_disabled: true },
      parse_mode: 'HTML',
    },
  );

  await autoupdateTaskList(chatId, thread);
};
