import { client } from '../core';

import type { QueryResult } from 'pg';
import type { StatusesWithEvents } from '../interfaces';

export const getStatusesWithEvents = async (
  chatId: number,
  thread: number,
): Promise<StatusesWithEvents[]> => {
  const query = `
    SELECT cts.*,
    COALESCE(
      json_agg(
        json_build_object(
          'id', ctce.id,
          'event', ctce.event
        )
      ) FILTER (WHERE ctce.id IS NOT NULL), 
      '[]'
    ) AS events
    FROM chat_task_statuses cts
    JOIN chats c ON cts.chat_id = c.id
    LEFT JOIN chat_status_change_events ctce ON cts.id = ctce.status_id
    WHERE c.chat_id = $1 AND c.thread = $2
    GROUP BY cts.id
    ORDER BY cts.id
  `;
  const result: QueryResult<StatusesWithEvents> = await client.query(query, [
    chatId,
    thread,
  ]);

  return result.rows;
};
