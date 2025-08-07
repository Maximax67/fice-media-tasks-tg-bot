import { initDatabase } from '../src/core/database';

import type { VercelRequest, VercelResponse } from '@vercel/node';

const TELEGRAM_API_BASE = (token: string): string =>
  `https://api.telegram.org/bot${token}`;

async function deleteWebhook(botToken: string): Promise<void> {
  const res = await fetch(`${TELEGRAM_API_BASE(botToken)}/deleteWebhook`);
  if (!res.ok) {
    throw new Error(`Failed to delete webhook: ${await res.text()}`);
  }
}

async function setWebhook(
  botToken: string,
  url: string,
  secretToken?: string,
): Promise<void> {
  const params: Record<string, string> = {
    url,
    allowed_updates: JSON.stringify(['message', 'callback_query']),
  };

  if (secretToken) {
    params.secret_token = secretToken;
  }

  const searchParams = new URLSearchParams(params);
  const res = await fetch(
    `${TELEGRAM_API_BASE(botToken)}/setWebhook?${searchParams.toString()}`,
  );

  if (!res.ok) {
    throw new Error(`Failed to set webhook: ${await res.text()}`);
  }
}

export default async function handle(req: VercelRequest, res: VercelResponse) {
  const VERCEL_URL = process.env.VERCEL_URL;
  if (!VERCEL_URL) {
    return res.status(500).json({ error: 'VERCEL_URL is not set' });
  }

  const SETUP_SECRET = process.env.SETUP_SECRET;
  if (SETUP_SECRET && req.query.token !== SETUP_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const botToken = process.env.BOT_TOKEN!;
  const webhookUrl = `${VERCEL_URL}/api`;
  const secretToken = process.env.TELEGRAM_SECRET_TOKEN;

  try {
    await initDatabase();
    await deleteWebhook(botToken);
    await setWebhook(botToken, webhookUrl, secretToken);

    res.status(200).json({ status: 'Successful setup' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
}
