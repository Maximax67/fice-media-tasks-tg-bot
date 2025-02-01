import { BOT_OWNER } from '../config';
import { TaskStatuses } from '../enums';
import { STATUS_NAMES } from './status_names';

export const HELP_MESSAGE =
  'Вітаю, я Telegram бот для менеджменту та трекінгу тасок гілки текстовиків відділу медіа ФІОТ.\n\n' +
  '<b>Доступні команди:</b>\n' +
  '/new_task Назва таски / ТЗ / дедлайн / дедлайн посту / відповідальний — ' +
  'Створити нову таску. Поля розділяються через "/". Можна пропустити будь-яке з них, окрім назви, написавши декілька "/" підряд. Наприклад: /new_task Якась назва // дедлайн.\n' +
  '/tasks — Надіслати актуальний список всіх тасок\n' +
  '/delete_task номер_таски — Видалити таску за порядковим номером у списку\n' +
  '/delete_all_tasks — Видалити всі таски\n' +
  '/set_status номер_таски — Встановити статус таски. Бот відправить список усіх статусів. Натисніть кнопку з потрібним статусом.\n' +
  '/set_title номер_таски Нова назва — Встановити нову назву такски.\n' +
  '/set_tz номер_таски https://example.com — Встановити посилання на ТЗ.\n' +
  '/set_responsible номер_таски @Bob — Назначити відповідального.\n' +
  '/set_deadline номер_таски 31.12.2026 — Встановити дедлайн.\n' +
  '/set_post_deadline номер_таски 31.12.2026 — Встановити дедлайн виходу посту.\n' +
  '/set_url номер_таски https://example.com — Встановити посилання на виконане завдання.\n' +
  '/add_comment номер_таски Текст коментаря — Встановити коментар на завдання.\n' +
  '/delete_comment номер_таски номер_коментаря — Видалити коментар.\n' +
  '/delete_all_comments номер_таски — Видалити всі коментарі.\n' +
  '/delete_responsible номер_таски — Видалити відповідального.\n' +
  '/delete_deadline номер_таски — Видалити дедлайн.\n' +
  '/delete_post_deadline номер_таски — Видалити дедлайн посту.\n' +
  '/delete_tz номер_таски — Видалити тз.\n' +
  '/delete_url номер_таски — Видалити посилання на виконану таску.\n' +
  '/autoupdate посилання на повідомлення в телеграм зі списком тасок — Встановити автоматичне оновлення списку. Лише останній встановлений список буде оновлюватись автоматично.\n' +
  `/edits — Вивести список тасок зі статусом ${STATUS_NAMES[TaskStatuses.EDITING]}.\n` +
  '/stats username — Вивести статистику користувача.\n' +
  '/motivation — Надіслати рандомну картинку для мотивації робити правки.\n' +
  '/leaderboard — Вивести список користувачів відсортованих за кількістю взятих тасок.\n' +
  '/limits — Переглянути обмеження.\n' +
  '/help — Надіслати це повідомлення.\n\n' +
  '<b>Корисна порада:</b>\n' +
  "На телефоні при довгому тапі на потрібній команді, вона не відправляється зразу, а копіюється у текстове поле та дає вам можливість дописати щось до неї. На комп'ютері необхідно натиснути TAB.\n\n" +
  `<i>Знайшли баг, чогось не вистачає, або маєте ідеї та пропозиції — пишіть ${BOT_OWNER} (власник бота).</i>`;
