import { Client } from 'pg';
import { TaskStatuses } from '../enums';
import { ENVIRONMENT, POSTGRESQL_LINK } from '../config';

if (!POSTGRESQL_LINK) {
  throw new Error('POSTGRESQL_LINK is not set.');
}

const createTableQuery = `
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_statuses') THEN
      CREATE TYPE task_statuses AS ENUM('${Object.keys(TaskStatuses).join("','")}');
    END IF;
  END $$;

  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    thread BIGINT,
    title TEXT NOT NULL,
    tz TEXT,
    url TEXT,
    deadline TEXT,
    post_deadline TEXT,
    assigned_person TEXT,
    status task_statuses DEFAULT '${TaskStatuses.NEW}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_chat_and_thread ON tasks (chat_id, thread);

  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments (task_id);

  CREATE TABLE IF NOT EXISTS autoupdate_messages (
    chat_id BIGINT NOT NULL,
    thread BIGINT,
    message_id BIGINT NOT NULL,
    CONSTRAINT autoupdate_chat_thread_unique UNIQUE (chat_id, thread)
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
