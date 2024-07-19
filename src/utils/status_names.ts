import { TaskStatuses } from '../enums';

export const StatusNames: { [key in TaskStatuses]: string } = {
  [TaskStatuses.NEW]: 'Нова',
  [TaskStatuses.IN_PROCESS]: 'Написання',
  [TaskStatuses.EDITING]: 'Редагування',
  [TaskStatuses.WAITING_FOR_PICTURE]: 'Розробка пікчі',
  [TaskStatuses.WAITING_FOR_PUBLICATION]: 'Чекає публікації',
};
