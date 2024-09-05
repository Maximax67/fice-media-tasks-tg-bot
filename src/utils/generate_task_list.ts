import { StatusIcons } from './status_icons';
import { TaskStatuses } from '../enums';
import { URL_REGEX, USERNAME_REGEX } from '../constants';
import { StatusNames } from './status_names';
import { formatDateTime } from './format_datetime';
import { urlReplacer } from './url_replacer';
import { escapeHtml } from './escape_html';
import type { Task } from '../interfaces';
import { taskTitleReplacer } from './task_title_replacer';
import { formatAssignedPerson } from './format_assigned_person';

const taskListLegend =
  '<b>Легенда</b>:\n' +
  `• ${StatusIcons[TaskStatuses.NEW]} — ${StatusNames[TaskStatuses.NEW]}\n` +
  `• ${StatusIcons[TaskStatuses.IN_PROCESS]} — ${StatusNames[TaskStatuses.IN_PROCESS]}\n` +
  `• ${StatusIcons[TaskStatuses.EDITING]} — ${StatusNames[TaskStatuses.EDITING]}\n` +
  `• ${StatusIcons[TaskStatuses.WAITING_FOR_PICTURE]} — ${StatusNames[TaskStatuses.WAITING_FOR_PICTURE]}\n` +
  `• ${StatusIcons[TaskStatuses.WAITING_FOR_PUBLICATION]} — ${StatusNames[TaskStatuses.WAITING_FOR_PUBLICATION]}\n\n` +
  '<b>Корисні ресурси</b>:\n' +
  '• <a href="https://www.notion.so/92d4818b30f2489786857def5f134b4b?pvs=4">Гайд з інфостилю</a>\n' +
  '• <a href="https://docs.google.com/spreadsheets/d/14nw8TbXsuJ_jcPBLZYjuUpFhlxS9LGpF-sO9Vuo8avc/edit?usp=sharing">Спірні моменти</a>\n' +
  '• <a href="https://docs.google.com/spreadsheets/d/1NGHNTGFDbVUlensextChmeUruqLnZktkaJcPkU4lqQk/edit?pli=1#gid=932356770">Реєстр гайдів</a>\n' +
  '• <a href="https://www.notion.so/invite/bb7b44687447c405a49174ea0c752d71c63e2d19">Notion відділу</a>\n' +
  '• <a href="https://telegra.ph/Reyestr-standartnih-pomilok-09-04">Реєстр стандартних помилок</a>';

function formatTask(task: Task, index: number): string {
  const {
    title,
    deadline,
    post_deadline,
    tz,
    url,
    assigned_person,
    status,
    comments,
  } = task;

  const escapedTitle = taskTitleReplacer(title, true);
  const escapedDeadline = deadline ? urlReplacer(deadline) : 'відсутній';
  const escapedDeadlinePost = post_deadline
    ? urlReplacer(post_deadline)
    : 'відсутній';

  let tzFormatted: string;
  if (tz) {
    tzFormatted = URL_REGEX.test(tz)
      ? ` <a href="${tz}">[ТЗ]</a>`
      : `\nТЗ: ${urlReplacer(tz)}`;
  } else {
    tzFormatted = '';
  }

  const assignedPersonFormatted = assigned_person
    ? formatAssignedPerson(assigned_person)
    : 'не назначений';

  const titleFormatted = url
    ? `<a href="${url}">${escapedTitle}</a>${tzFormatted}`
    : escapedTitle + tzFormatted;

  let formattedTask =
    `${index + 1}) ${StatusIcons[status]} ${titleFormatted}\n` +
    `Дедлайн: ${escapedDeadline}\n` +
    `Дедлайн посту: ${escapedDeadlinePost}\n` +
    `Відповідальний: ${assignedPersonFormatted}`;

  if (comments && comments.length > 0) {
    const formattedComments = comments
      .map((comment, i) => {
        const formattedDate = formatDateTime(new Date(comment.created_at));
        const commentText = urlReplacer(comment.comment_text);

        return `${i + 1}. ${commentText} (${formattedDate})`;
      })
      .join('\n');

    formattedTask += `\nКоментарі:\n${formattedComments}`;
  }

  return formattedTask;
}

export function generateTaskList(tasks: Task[]): string {
  return (
    '<b>===== Поточні таски =====</b>\n\n' +
    tasks.map(formatTask).join('\n\n') +
    '\n\n' +
    taskListLegend
  );
}
