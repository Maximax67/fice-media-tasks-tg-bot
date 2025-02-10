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
    WHERE c.chat_id = $1 
    AND c.thread = $2 
    ORDER BY cl.id
  `;
  const res = await client.query(query, [chatId, thread]);

  return res.rows;
}
