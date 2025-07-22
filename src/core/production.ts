import createDebug from 'debug';
import { WEBHOOK_SECRET } from '../config';

import type { Context, Telegraf } from 'telegraf';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Update } from 'telegraf/typings/core/types/typegram';

const debug = createDebug('bot:dev');

const PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;
const VERCEL_URL = `${process.env.VERCEL_URL}`;

const production = async (
  req: VercelRequest,
  res: VercelResponse,
  bot: Telegraf<Context<Update>>,
) => {
  debug('Bot runs in production mode');

  if (!VERCEL_URL) {
    throw new Error('VERCEL_URL is not set.');
  }

  debug(`setting webhook: ${VERCEL_URL}`);

  const getWebhookInfo = await bot.telegram.getWebhookInfo();
  if (getWebhookInfo.url !== VERCEL_URL + '/api') {
    debug(`deleting webhook ${VERCEL_URL}`);
    await bot.telegram.deleteWebhook();
    debug(`setting webhook: ${VERCEL_URL}/api`);

    await bot.telegram.setWebhook(`${VERCEL_URL}/api`, {
      secret_token: WEBHOOK_SECRET,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false,
    });
  }

  if (req.method === 'POST') {
    const secretToken = req.headers['x-telegram-bot-api-secret-token'];

    if (WEBHOOK_SECRET && secretToken !== WEBHOOK_SECRET) {
      debug('Invalid secret token in request header');
      res.status(403).json({ error: 'Forbidden: invalid secret token' });
      return;
    }

    await bot.handleUpdate(req.body as unknown as Update, res);
  } else {
    res.status(200).json('Listening to bot events...');
  }

  debug(`starting webhook on port: ${PORT}`);
};

export { production };
