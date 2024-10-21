import { StatusIcons } from './status_icons';
import { TaskStatuses } from '../enums';
import { URL_REGEX } from '../constants';
import { StatusNames } from './status_names';
import { formatDateTime } from './format_datetime';
import { urlReplacer } from './url_replacer';
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
  '• <a href="https://rough-approval-ef2.notion.site/1226ef8015f58065987bf549b1122c66">Гайд з інфостилю</a>\n' +
  '• <a href="https://docs.google.com/spreadsheets/d/1NGHNTGFDbVUlensextChmeUruqLnZktkaJcPkU4lqQk/edit">Реєстр гайдів</a>\n' +
  '• <a href="https://www.notion.so/invite/bb7b44687447c405a49174ea0c752d71c63e2d19">Notion відділу</a>\n' +
  '• <a href="https://telegra.ph/Reyestr-tipovih-pomilok-10-06">Реєстр типових помилок</a>\n' +
  '• <a href="https://docs.google.com/spreadsheets/d/19YUgfG5q8u3flwFiSgcki4mU-ytsHdtnGaYnO-o851c/edit">Сумнівне написання</a>';

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

export function generateTaskList(tasks: Task[]): string {
  return (
    '<b>===== Поточні таски =====</b>\n\n' +
    tasks.map(formatTask).join('\n\n') +
    '\n\n' +
    taskListLegend
  );
}
