import createDebug from 'debug';
import { WEBHOOK_SECRET } from '../config';

import type { Context, Telegraf } from 'telegraf';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Update } from 'telegraf/typings/core/types/typegram';

const debug = createDebug('bot:dev');

const production = async (
  req: VercelRequest,
  res: VercelResponse,
  bot: Telegraf<Context<Update>>,
) => {
  debug('Bot runs in production mode');

  if (req.method === 'POST') {
    const secretToken = req.headers['x-telegram-bot-api-secret-token'];

    if (WEBHOOK_SECRET && secretToken !== WEBHOOK_SECRET) {
      debug('Invalid secret token in request header');
      res.status(403).json({ error: 'Forbidden: invalid secret token' });
      return;
    }

    await bot.handleUpdate(req.body as unknown as Update, res);
  } else {
    res.status(200).json({ status: 'Listening to bot events...' });
  }
};

export { production };
