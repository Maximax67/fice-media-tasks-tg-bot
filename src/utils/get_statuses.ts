import { client } from '../core';
import type { ChatTaskStatus } from '../interfaces';

export async function getStatusesForChat(
  chatId: number,
  thread: number,
): Promise<ChatTaskStatus[]> {
  const query = `
    SELECT cts.*
    FROM chat_task_statuses cts
    JOIN chats c ON cts.chat_id = c.id
    WHERE c.chat_id = $1 AND c.thread = $2
  `;
  const res = await client.query(query, [chatId, thread]);

  return res.rows;
}
