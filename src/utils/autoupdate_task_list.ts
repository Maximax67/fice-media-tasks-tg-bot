import { client } from '../core';
import { BOT_TOKEN } from '../config';
import { formatDateTime } from './format_datetime';
import { generateTaskList } from './generate_task_list';
import { getAdditionalText } from './get_additional_text';
import { getTasksAndCommentsForChat } from './get_tasks_and_comments';

import { Telegram, TelegramError } from 'telegraf';
import type { ExtraEditMessageText } from 'telegraf/typings/telegram-types';

const editMessageParams: ExtraEditMessageText = {
  parse_mode: 'HTML',
  link_preview_options: { is_disabled: true },
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Оновити',
          callback_data: 'update_tasks',
        },
      ],
    ],
  },
};

export const autoupdateTaskList = async (chatId: number, thread: number | null) => {
  const query = thread
    ? 'SELECT message_id FROM autoupdate_messages WHERE chat_id = $1 AND thread = $2'
    : 'SELECT message_id FROM autoupdate_messages WHERE chat_id = $1 AND thread IS NULL';
  const params = thread ? [chatId, thread] : [chatId];
  const result = await client.query(query, params);
  const rows = result.rows;
  if (!rows.length) {
    return;
  }

  const messageId: number = rows[0].message_id;

  const tasks = await getTasksAndCommentsForChat(chatId, thread);
  const formattedDatetime = formatDateTime(new Date(), true);
  const updateMessage = `<i>Оновлено: ${formattedDatetime}</i>`;

  const bot = new Telegram(BOT_TOKEN);

  if (tasks.length === 0) {
    try {
      await bot.editMessageText(
        chatId,
        messageId,
        undefined,
        'Немає тасок! Створіть нову командою /new_task\n' + updateMessage,
        editMessageParams,
      );
    } catch (e: unknown) {
      if (!(e instanceof TelegramError) || e.code !== 400) {
        throw e;
      }
    }
    return;
  }

  const additionalText = getAdditionalText(chatId, thread);

  try {
    await bot.editMessageText(
      chatId,
      messageId,
      undefined,
      `${generateTaskList(tasks)}${additionalText ? '\n\n' + additionalText : ''}\n\n${updateMessage}`,
      editMessageParams,
    );
  } catch (e: unknown) {
    if (!(e instanceof TelegramError) || e.code !== 400) {
      throw e;
    }
  }
};
