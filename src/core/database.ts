import { Client } from 'pg';
import { TaskStatuses } from '../enums';

const POSTGRESQL_LINK = process.env.POSTGRESQL_LINK;
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
    comment TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_chat_and_thread ON tasks (chat_id, thread);
`;

const client = new Client({
  connectionString: POSTGRESQL_LINK,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect(function (err) {
  if (err) throw err;
  client.query(createTableQuery, []);
});

export { client };
