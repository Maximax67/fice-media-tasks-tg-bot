import { Client } from 'pg';
import { ChangeStatusEvents } from '../enums';
import { ENVIRONMENT, POSTGRESQL_LINK } from '../config';

if (!POSTGRESQL_LINK) {
  throw new Error('POSTGRESQL_LINK is not set.');
}

const createTableQuery = `
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_status_event') THEN
      CREATE TYPE change_status_event AS ENUM('${Object.keys(ChangeStatusEvents).join("','")}');
    END IF;
  END $$;

  CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    thread BIGINT NOT NULL,
    motivation_type TEXT,
    autoupdate_message_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chat_thread_unique UNIQUE (chat_id, thread)
  );

  CREATE TABLE IF NOT EXISTS chat_task_statuses (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_chat_task_statuses_chat ON chat_task_statuses (chat_id);

  CREATE TABLE IF NOT EXISTS chat_status_change_events (
    id SERIAL PRIMARY KEY,
    status_id INTEGER NOT NULL REFERENCES chat_task_statuses(id) ON DELETE CASCADE,
    event change_status_event NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_chat_status_change_events_status_id ON chat_status_change_events (status_id);

  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    tz TEXT,
    url TEXT,
    deadline TEXT,
    post_deadline TEXT,
    responsible TEXT,
    status_id INTEGER REFERENCES chat_task_statuses(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_chat ON tasks (chat_id);

  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments (task_id);

  CREATE TABLE IF NOT EXISTS chat_links (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_chat_links_chat ON chat_links (chat_id);

  CREATE TABLE IF NOT EXISTS shared_threads_chats (
    chat_id BIGINT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

const client = new Client({
  connectionString: POSTGRESQL_LINK,
  ssl:
    ENVIRONMENT === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

client.connect(function (err) {
  if (err) throw err;
  client.query(createTableQuery, []);
});

export { client };
