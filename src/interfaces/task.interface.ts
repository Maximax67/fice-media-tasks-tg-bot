import type { ChatTaskStatus } from './chat_task_status.interface';
import type { Comment } from './comment.interface';

export interface Task {
  id: number;
  chat_id: number;
  thread: number;
  title: string;
  tz: string | null;
  url: string | null;
  deadline: string | null;
  post_deadline: string | null;
  responsible: string | null;
  status: ChatTaskStatus;
  created_at: Date;
  completed_at?: Date;
  comments?: Comment[];
}
