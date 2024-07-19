import { TaskStatuses } from '../enums';

export const StatusIcons: { [key in TaskStatuses]: string } = {
  [TaskStatuses.NEW]: '🔥',
  [TaskStatuses.IN_PROCESS]: '✏️',
  [TaskStatuses.EDITING]: '🔍',
  [TaskStatuses.WAITING_FOR_PICTURE]: '🎨',
  [TaskStatuses.WAITING_FOR_PUBLICATION]: '⏰',
};
