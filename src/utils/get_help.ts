export const helpMessage =
  `Вітаю, я Telegram бот для менеджменту та трекінгу тасок гілки текстовиків відділу медіа ФІОТ.\n\n` +
  `<b>Доступні команди:</b>\n` +
  `/new_task Назва таски / ТЗ / дедлайн / дедлайн посту / відповідальний — ` +
  `Створити нову таску. Кожне поле розділяється символом "/". Ви можете пропустити будь-яке з них, окрім назви, написавши декілька "/" підряд. Наприклад: /new_task Якась назва // дедлайн.\n` +
  `/tasks — Надіслати актуальний список всіх тасок\n` +
  `/delete_task номер_таски — Видалити таску за порядковим номером у списку\n` +
  `/delete_all_tasks — Видалити всі таски\n` +
  `/set_status номер_таски — Встановити статус таски. Бот відправить список усіх статусів. Натисніть кнопку з потрібним статусом.\n` +
  `/set_title номер_таски Нова назва — Встановити нову назву такски.\n` +
  `/set_tz номер_таски https://example.com — Встановити посилання на ТЗ.\n` +
  `/set_responsible номер_таски @Bob — Назначити відповідального.\n` +
  `/set_deadline номер_таски 31.12.2026 — Встановити дедлайн.\n` +
  `/set_post_deadline номер_таски 31.12.2026 — Встановити дедлайн виходу посту.\n` +
  `/set_url номер_таски https://example.com — Встановити посилання на виконане завдання.\n` +
  `/set_comment номер_таски Будь-який коментар — Встановити коментар на завдання.\n` +
  `/delete_comment номер_таски — Видалити коментар.\n` +
  `/help — Надіслати це повідомлення.\n\n` +
  `<b>Корисна порада:</b>\n` +
  `На телефоні при довгому тапі на потрібній команді, вона не відправляється зразу, а копіюється у текстове поле та дає вам можливість дописати щось до неї. На комп'ютері необхідно натиснути TAB.`;
