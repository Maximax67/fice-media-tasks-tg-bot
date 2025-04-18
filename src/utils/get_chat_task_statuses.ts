import { client } from '../core';
import type { ChatTaskStatus } from '../interfaces';

export const getChatTaskStatuses = async (
  chatId: number,
  thread: number,
): Promise<ChatTaskStatus[]> => {
  const query = `
    SELECT cts.*
    FROM chat_task_statuses cts
    JOIN chats c ON cts.chat_id = c.id
    WHERE
      c.chat_id = $1
      AND (
        CASE
          WHEN EXISTS (
            SELECT 1 FROM shared_threads_chats WHERE chat_id = $1
          ) THEN TRUE
          ELSE thread = $2
        END
      )
  `;
  const result = await client.query(query, [chatId, thread]);

  return result.rows;
};

export const getChatTaskStatusesFromChat = async (
  databaseChatId: number,
): Promise<ChatTaskStatus[]> => {
  const query = 'SELECT * FROM chat_task_statuses WHERE chat_id = $1';
  const result = await client.query(query, [databaseChatId]);

  return result.rows;
};
