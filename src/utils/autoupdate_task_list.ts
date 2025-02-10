import { client } from '../core';
import { BOT_TOKEN } from '../config';
import { formatDateTime } from './format_datetime';
import { generateTaskList } from './generate_task_list';
import { getChatLinksFormatted } from './get_chat_links_formatted';
import { getChatTaskStatuses } from './get_chat_task_statuses';
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
          text: '🔄 Оновити',
          callback_data: 'update_tasks',
        },
      ],
    ],
  },
};

export const autoupdateTaskList = async (chatId: number, thread: number) => {
  const query =
    'SELECT autoupdate_message_id FROM chats WHERE chat_id = $1 AND thread = $2';
  const result = await client.query(query, [chatId, thread]);
  const rows = result.rows;
  if (!rows.length) {
    return;
  }

  const messageId: number = rows[0].autoupdate_message_id;

  const tasks = await getTasksAndCommentsForChat(chatId, thread);
  const chatTaskStatuses = await getChatTaskStatuses(chatId, thread);
  const chatLinks = await getChatLinksFormatted(chatId, thread);
  const formattedDatetime = formatDateTime(new Date(), true);
  const updateMessage = `<i>Оновлено: ${formattedDatetime}</i>`;

  const bot = new Telegram(BOT_TOKEN);

  if (tasks.length === 0) {
    try {
      const noTasksMessage = 'Немає тасок! Створіть нову командою /new_task';
      const messageWithLinks = chatLinks
        ? noTasksMessage + '\n\n' + chatLinks
        : noTasksMessage;

      await bot.editMessageText(
        chatId,
        messageId,
        undefined,
        messageWithLinks + '\n\n' + updateMessage,
        editMessageParams,
      );
    } catch (e: unknown) {
      if (!(e instanceof TelegramError) || e.code !== 400) {
        throw e;
      }
    }
    return;
  }

  try {
    await bot.editMessageText(
      chatId,
      messageId,
      undefined,
      `${generateTaskList(tasks, chatTaskStatuses)}${chatLinks ? '\n\n' + chatLinks : ''}\n\n${updateMessage}`,
      editMessageParams,
    );
  } catch (e: unknown) {
    if (!(e instanceof TelegramError) || e.code !== 400) {
      throw e;
    }
  }
};
