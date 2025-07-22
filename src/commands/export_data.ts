import createDebug from 'debug';
import { client } from '../core';

import type { Context } from 'telegraf';
import type { ExportData } from '../interfaces';

const debug = createDebug('bot:export_data');

export const getExportObject = async (chatId: number): Promise<ExportData | null> => {
  const { rows } = await client.query(
    `
      SELECT
        COALESCE(jsonb_agg(per_thread.thread_data ORDER BY per_thread.thread), '[]'::jsonb) AS threads
      FROM (
        SELECT
          ch.thread,
          jsonb_build_object(
            'info', to_jsonb(ch),
            'statuses', COALESCE((
              SELECT jsonb_agg(
                        jsonb_build_object(
                          'id', s.id,
                          'icon', s.icon,
                          'title', s.title,
                          'created_at', s.created_at,
                          'events', (
                            SELECT jsonb_agg(e.*)
                            FROM chat_status_change_events e
                            WHERE e.status_id = s.id
                          )
                        )
                      )
              FROM chat_task_statuses s
              WHERE s.chat_id = ch.id
            ), '[]'::jsonb),
            'tasks', COALESCE((
              SELECT jsonb_agg(
                        jsonb_build_object(
                          'id', t.id,
                          'title', t.title,
                          'tz', t.tz,
                          'url', t.url,
                          'deadline', t.deadline,
                          'post_deadline', t.post_deadline,
                          'responsible', t.responsible,
                          'status_id', t.status_id,
                          'created_at', t.created_at,
                          'completed_at', t.completed_at,
                          'comments', (
                            SELECT jsonb_agg(c.*)
                            FROM comments c
                            WHERE c.task_id = t.id
                          )
                        )
                      )
              FROM tasks t
              WHERE t.chat_id = ch.id
            ), '[]'::jsonb),
            'links', COALESCE((
              SELECT jsonb_agg(l.*)
              FROM chat_links l
              WHERE l.chat_id = ch.id
            ), '[]'::jsonb)
          ) AS thread_data
        FROM chats ch
        WHERE ch.chat_id = $1
      ) per_thread;
    `,
    [chatId],
  );

  const threads = rows[0]?.threads ?? [];

  if (threads.length === 0) {
    return null;
  }

  const timestamp = new Date().toISOString();

  return {
    chat_id: chatId,
    timestamp,
    threads,
  };
} 

export const exportData = () => async (ctx: Context) => {
  debug('Triggered "export_data" command');

  const chatId = ctx.chat!.id;

  try {
    const exportObject = await getExportObject(chatId);

    if (exportObject === null) {
      await ctx.reply('No data found for this chat.');
      return;
    }

    const jsonString = JSON.stringify(exportObject);
    const buffer = Buffer.from(jsonString);

    await ctx.replyWithDocument({
      source: buffer,
      filename: `${chatId}-${exportObject.timestamp.replace(/[:.]/g, '-')}.json`,
    });
  } catch (err) {
    debug('Error exporting data:', err);
    await ctx.reply('Failed to export data!');
  }
};
