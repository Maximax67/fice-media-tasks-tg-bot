import {
  BOT_OWNER,
  COMMENT_TEXT_LENGTH_LIMIT,
  COMMENTS_LIMIT,
  COMPLETE_TASK_URL_LENGTH_LIMIT,
  DEADLINE_LENGTH_LIMIT,
  POST_DEADLINE_LENGTH_LIMIT,
  RESPONSIBLE_LENGTH_LIMIT,
  TASKS_LIMIT,
  TITLE_LENGTH_LIMIT,
  TZ_ALWAYS_URL,
  TZ_LENGTH_LIMIT,
} from '../config';

export const limitsMessage =
  '<b>Встановлені ліміти:</b>\n' +
  `Кількість тасок: ${TASKS_LIMIT}\n` +
  `Кількість коментарів до таски: ${COMMENTS_LIMIT}\n` +
  `ТЗ завжди url: <b>${TZ_ALWAYS_URL ? 'так' : 'ні'}</b>\n\n` +
  '<b>Обмеження за кількістю символів:</b>\n' +
  `Назва таски: ${TITLE_LENGTH_LIMIT}\n` +
  `ТЗ: ${TZ_LENGTH_LIMIT}\n` +
  `Дедлайн: ${DEADLINE_LENGTH_LIMIT}\n` +
  `Дедлайн посту: ${POST_DEADLINE_LENGTH_LIMIT}\n` +
  `Відповідальний: ${RESPONSIBLE_LENGTH_LIMIT}\n` +
  `Посилання на виконану таску: ${COMPLETE_TASK_URL_LENGTH_LIMIT}\n` +
  `Коментар: ${COMMENT_TEXT_LENGTH_LIMIT}\n\n` +
  `<i>Ліміти єдині для всіх чатів. Якщо маєте пропозицію по їх збільшенню, напишіть ${BOT_OWNER} (власник бота).</i>`;
