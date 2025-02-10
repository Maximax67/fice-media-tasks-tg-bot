import type { ChangeStatusEvents } from '../enums';
import type { ChatTaskStatus } from './chat_task_status.interface';

interface StatusEventInfo {
  id: number;
  event: ChangeStatusEvents;
}

export interface StatusesWithEvents extends ChatTaskStatus {
  events: StatusEventInfo[];
}
