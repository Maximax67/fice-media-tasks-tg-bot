import type { TaskStatuses } from '../enums';
import type { Comment } from './comment.interface';

export interface Task {
  id: number;
  chat_id: number;
  thread: number | null;
  title: string;
  tz: string | null;
  url: string | null;
  deadline: string | null;
  post_deadline: string | null;
  assigned_person: string | null;
  status: TaskStatuses;
  comments?: Comment[];
}
