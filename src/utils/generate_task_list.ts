import { StatusIcons } from './status_icons';
import { TaskStatuses } from '../enums';
import { StatusNames } from './status_names';
import type { Task } from '../interfaces';

function escapeHTML(str: string) {
  return str.replace(/[&<>"']/g, function (match) {
    switch (match) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return match;
    }
  });
}

function formatTask(task: Task, index: number) {
  const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
  const usernameRegex = /^@\w+$/;

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

  const escapedTitle = escapeHTML(title);
  const escapedDeadline = deadline ? escapeHTML(deadline) : 'відсутній';
  const escapedDeadlinePost = post_deadline
    ? escapeHTML(post_deadline)
    : 'відсутній';

  let tzFormatted: string;
  if (tz) {
    tzFormatted = urlRegex.test(tz)
      ? ` <a href="${tz}">[ТЗ]</a>`
      : `\nТЗ: ${escapeHTML(tz)}`;
  } else {
    tzFormatted = '';
  }

  let assignedPersonFormatted: string;
  if (assigned_person) {
    assignedPersonFormatted = usernameRegex.test(assigned_person)
      ? `<a href="https://t.me/${assigned_person.substring(1)}">${assigned_person}</a>`
      : escapeHTML(assigned_person);
  } else {
    assignedPersonFormatted = 'не назначений';
  }

  const titleFormatted = url
    ? `<a href="${url}">${escapedTitle}</a>${tzFormatted}`
    : escapedTitle + tzFormatted;

  let formattedTask = `${index + 1}) ${StatusIcons[status]} ${titleFormatted}\n` +
    `Дедлайн: ${escapedDeadline}\n` +
    `Дедлайн посту: ${escapedDeadlinePost}\n` +
    `Відповідальний: ${assignedPersonFormatted}`;

  if (comments && comments.length > 0) {
    const formattedComments = comments
      .map((comment, i) => {
        const formattedDate = new Date(comment.created_at)
          .toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
          .replace(',', ''); // Formats the date to 'dd.mm hh:mm'
        return `${i + 1}. ${escapeHTML(comment.comment_text)} (${formattedDate})`;
      })
      .join('\n');

    formattedTask += `\nКоментарі:\n${formattedComments}`;
  }

  return formattedTask;
}

export function generateTaskList(tasks: Task[]) {
  return (
    '<b>===== Поточні таски =====</b>\n\n' +
    tasks.map(formatTask).join('\n\n') +
    '\n\n' +
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
    '• <a href="https://www.notion.so/invite/bb7b44687447c405a49174ea0c752d71c63e2d19">Notion відділу</a>\n'
  );
}
