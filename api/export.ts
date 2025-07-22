import { getExportObject } from '../src/commands';
import { EXPORT_DATA_SECRET } from '../src/config';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handle(req: VercelRequest, res: VercelResponse) {
  try {
    if (EXPORT_DATA_SECRET) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res
          .status(401)
          .json({ error: true, content: 'Authorization header missing' });
        return;
      }

      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (token !== EXPORT_DATA_SECRET) {
        res
          .status(403)
          .json({ error: true, content: 'Forbidden: Invalid token' });
        return;
      }
    }

    const chatId = parseInt(req.query.chatId as string, 10);
    if (isNaN(chatId)) {
      res
        .status(400)
        .json({ error: true, content: 'Invalid or missing chatId' });
      return;
    }

    const exportObject = await getExportObject(chatId);

    if (exportObject === null) {
      res.status(404).json({ error: true, content: 'Chat not found' });
      return;
    }

    res.status(200).json({ error: false, content: exportObject });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: true, content: 'Internal Server Error' });
  }
}
