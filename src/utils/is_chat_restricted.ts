import { client } from '../core';

export const isChatRestricted = async (chatId: number): Promise<boolean> => {
  const result = await client.query(
    'SELECT 1 FROM restricted_chats WHERE chat_id = $1;',
    [chatId],
  );

  return result.rowCount !== null && result.rowCount > 0;
};
