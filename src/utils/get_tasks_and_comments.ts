import { client } from '../core';
import type { Task } from '../interfaces';

export async function getTasksAndCommentsForChat(
  chatId: number,
  thread: number | null = null,
): Promise<Task[]> {
  const query = thread
    ? `
      SELECT 
        t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'task_id', c.task_id,
              'comment_text', c.comment_text,
              'created_at', c.created_at
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) AS comments
      FROM tasks t
      LEFT JOIN comments c ON t.id = c.task_id
      WHERE t.chat_id = $1 AND t.thread = $2 AND completed_at IS NULL
      GROUP BY t.id
      ORDER BY t.id
    `
    : `
      SELECT 
        t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'task_id', c.task_id,
              'comment_text', c.comment_text,
              'created_at', c.created_at
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) AS comments
      FROM tasks t
      LEFT JOIN comments c ON t.id = c.task_id
      WHERE t.chat_id = $1 AND t.thread IS NULL AND completed_at IS NULL
      GROUP BY t.id
      ORDER BY t.id
    `;

  const params = thread ? [chatId, thread] : [chatId];
  const res = await client.query(query, params);

  return res.rows;
}
