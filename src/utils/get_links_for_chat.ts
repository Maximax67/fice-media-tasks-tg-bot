import { client } from '../core';
import type { ChatLink } from '../interfaces';

export async function getLinksForChat(
  chatId: number,
  thread: number,
): Promise<ChatLink[]> {
  const query = `
    SELECT cl.id, cl.url, cl.description
    FROM chat_links cl
    JOIN chats c ON cl.chat_id = c.id
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
    ORDER BY cl.id
  `;
  const res = await client.query(query, [chatId, thread]);

  return res.rows;
}
