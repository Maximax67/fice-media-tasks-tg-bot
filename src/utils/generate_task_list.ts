import { TaskStatuses } from '../enums';
import { STATUS_ICONS, STATUS_NAMES, URL_REGEX } from '../constants';

import { formatDateTime } from './format_datetime';
import { urlReplacer } from './url_replacer';

import { taskTitleReplacer } from './task_title_replacer';
import { formatAssignedPerson } from './format_assigned_person';
import type { Task } from '../interfaces';
import { formatDate } from './format_date';

const taskListLegend =
  '<b>Легенда</b>:\n' +
  `• ${STATUS_ICONS[TaskStatuses.NEW]} — ${STATUS_NAMES[TaskStatuses.NEW]}\n` +
  `• ${STATUS_ICONS[TaskStatuses.IN_PROCESS]} — ${STATUS_NAMES[TaskStatuses.IN_PROCESS]}\n` +
  `• ${STATUS_ICONS[TaskStatuses.EDITING]} — ${STATUS_NAMES[TaskStatuses.EDITING]}\n` +
  `• ${STATUS_ICONS[TaskStatuses.WAITING_FOR_PICTURE]} — ${STATUS_NAMES[TaskStatuses.WAITING_FOR_PICTURE]}\n` +
  `• ${STATUS_ICONS[TaskStatuses.WAITING_FOR_PUBLICATION]} — ${STATUS_NAMES[TaskStatuses.WAITING_FOR_PUBLICATION]}`;

export function formatTask(task: Task, index: number): string {
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
    `${index + 1}) ${STATUS_ICONS[status]} ${titleFormatted}\n` +
    `${escapedDeadline} | ${escapedDeadlinePost} | ${assignedPersonFormatted}`;

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

export function formatTaskMinimalistic(task: Task): string {
  const { title, url, status, completed_at } = task;
  const escapedTitle = taskTitleReplacer(title, true);
  const titleFormatted = url
    ? `<a href="${url}">${escapedTitle}</a>`
    : escapedTitle;

  return completed_at
    ? `${formatDate(completed_at)} - ${titleFormatted}\n`
    : `${STATUS_ICONS[status]} ${titleFormatted}\n`;
}

export function generateTaskList(tasks: Task[]): string {
  return (
    '<b>===== Поточні таски =====</b>\n\n' +
    tasks.map(formatTask).join('\n\n') +
    '\n\n' +
    taskListLegend
  );
}
