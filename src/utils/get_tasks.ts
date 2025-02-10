import { client } from '../core';
import type { Task } from '../interfaces';

export async function getTasksForChat(
  chatId: number,
  thread: number,
): Promise<Task[]> {
  const query = `
    SELECT 
      t.*, 
      jsonb_build_object(
        'id', cts.id,
        'title', cts.title,
        'icon', cts.icon
      ) AS status
    FROM tasks t
    JOIN chats c ON t.chat_id = c.id
    JOIN chat_task_statuses cts ON t.status_id = cts.id
    WHERE c.chat_id = $1 
    AND c.thread = $2 
    AND t.completed_at IS NULL
    ORDER BY t.id;
  `;
  const res = await client.query(query, [chatId, thread]);

  return res.rows;
}
