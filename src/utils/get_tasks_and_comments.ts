import { client } from '../core';
import type { Task } from '../interfaces';

export async function getTasksAndCommentsForChat(
  chatId: number,
  thread: number,
): Promise<Task[]> {
  const query = `
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
        ) AS comments,
        jsonb_build_object(
          'id', cts.id,
          'title', cts.title,
          'icon', cts.icon
        ) AS status
      FROM tasks t
      LEFT JOIN comments c ON t.id = c.task_id
      JOIN chat_task_statuses cts ON t.status_id = cts.id
      JOIN chats ON t.chat_id = chats.id
      WHERE
        chats.chat_id = $1
        AND (
          CASE
            WHEN EXISTS (
              SELECT 1 FROM shared_threads_chats WHERE chat_id = $1
            ) THEN TRUE
            ELSE chats.thread = $2
          END
        )
        AND t.completed_at IS NULL
      GROUP BY t.id, cts.id
      ORDER BY t.id
    `;
  const res = await client.query(query, [chatId, thread]);

  return res.rows;
}
