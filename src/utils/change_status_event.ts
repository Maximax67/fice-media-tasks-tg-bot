import { client } from '../core';
import { ChangeStatusEvents } from '../enums';
import { TaskStatusInfo } from '../interfaces';

import type { QueryResult } from 'pg';

export const changeStatusEvent = async (
  taskId: number,
  chatId: number,
  thread: number,
  event: ChangeStatusEvents,
): Promise<TaskStatusInfo | null> => {
  const query = `
    SELECT cts.id, cts.title, cts.icon
    FROM chat_task_statuses cts
    JOIN chat_status_change_events ctce ON cts.id = ctce.status_id
    JOIN chats c ON cts.chat_id = c.id
    WHERE c.chat_id = $1 AND c.thread = $2 AND ctce.event = $3
    LIMIT 1
  `;
  const params = [chatId, thread, event];
  const result: QueryResult<TaskStatusInfo> = await client.query(query, params);
  const rows = result.rows;
  if (!rows.length) {
    return null;
  }

  const status = rows[0];
  const updateResult = await client.query(
    'UPDATE tasks SET status_id = $1 WHERE id = $2',
    [status.id, taskId],
  );

  if (!updateResult.rowCount) {
    return null;
  }

  return status;
};
