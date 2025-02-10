import { ChangeStatusEvents } from '../enums';

export const CHANGE_STATUS_EVENT_NAMES: Record<ChangeStatusEvents, string> = {
  [ChangeStatusEvents.NEW]: 'Нова таска',

  [ChangeStatusEvents.SET_TZ]: 'Встановлення ТЗ',
  [ChangeStatusEvents.SET_URL]: 'Встановлення посилання',
  [ChangeStatusEvents.SET_RESPONSIBLE]: 'Встановлення відповідального',
  [ChangeStatusEvents.SET_DEADLINE]: 'Встановлення дедлайну',
  [ChangeStatusEvents.SET_POST_DEADLINE]: 'Встановлення дедлайну посту',

  [ChangeStatusEvents.CHANGE_TITLE]: 'Зміна назви',
  [ChangeStatusEvents.CHANGE_TZ]: 'Зміна ТЗ',
  [ChangeStatusEvents.CHANGE_URL]: 'Зміна посилання',
  [ChangeStatusEvents.CHANGE_RESPONSIBLE]: 'Зміна відповідального',
  [ChangeStatusEvents.CHANGE_DEADLINE]: 'Зміна дедлайну',
  [ChangeStatusEvents.CHANGE_POST_DEADLINE]: 'Зміна дедлайну посту',

  [ChangeStatusEvents.DELETE_TZ]: 'Видалення ТЗ',
  [ChangeStatusEvents.DELETE_URL]: 'Видалення посилання',
  [ChangeStatusEvents.DELETE_RESPONSIBLE]: 'Видалення відповідального',
  [ChangeStatusEvents.DELETE_DEADLINE]: 'Видалення дедлайну',
  [ChangeStatusEvents.DELETE_POST_DEADLINE]: 'Видалення дедлайну посту',

  [ChangeStatusEvents.ADD_COMMENT]: 'Додавання коментаря',
  [ChangeStatusEvents.DELETE_COMMENT]: 'Видалення коментаря',
  [ChangeStatusEvents.DELETE_ALL_COMMENTS]: 'Видалення всіх коментарів',
};
