import { client } from '../core';
import { MotivationTypes } from '../enums';

import type { QueryResult } from 'pg';

export async function getMotivationType(
  chatId: number,
  thread: number,
): Promise<MotivationTypes> {
  const query =
    'SELECT motivation_type FROM chats WHERE chat_id = $1 AND thread = $2';
  const res: QueryResult<{ motivation_type: string }> = await client.query(
    query,
    [chatId, thread],
  );

  if (!res.rows.length) {
    return MotivationTypes.NONE;
  }

  const motivationType = res.rows[0].motivation_type;
  if (
    !Object.values(MotivationTypes).includes(motivationType as MotivationTypes)
  ) {
    const query =
      'UPDATE chats SET motivation_type = NULL WHERE chat_id = $1 AND thread = $2';
    await client.query(query, [chatId, thread]);

    return MotivationTypes.NONE;
  }

  return motivationType as MotivationTypes;
}
