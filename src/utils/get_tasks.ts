import { client } from '../core';
import type { Task } from '../interfaces';

export async function getTasksForChat(
  chatId: number,
  thread: number | null = null,
): Promise<Task[]> {
  const query = thread
    ? `
      SELECT *
      FROM tasks
      WHERE chat_id = $1 AND thread = $2 AND completed_at IS NULL
      ORDER BY id
    `
    : `
      SELECT *
      FROM tasks
      WHERE chat_id = $1 AND thread IS NULL AND completed_at IS NULL
      ORDER BY id
    `;

  const params = thread ? [chatId, thread] : [chatId];
  const res = await client.query(query, params);

  return res.rows;
}
