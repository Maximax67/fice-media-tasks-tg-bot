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

  const escapedTitle = escapeHTML(task.title);
  const escapedDeadline = task.deadline
    ? escapeHTML(task.deadline)
    : 'відсутній';
  const escapedDeadlinePost = task.post_deadline
    ? escapeHTML(task.post_deadline)
    : 'відсутній';

  let tzFormatted: string;
  if (task.tz) {
    tzFormatted = urlRegex.test(task.tz)
      ? ` <a href="${task.tz}">[ТЗ]</a>`
      : `\nТЗ: ${escapeHTML(task.tz)}`;
  } else {
    tzFormatted = '';
  }

  let assignedPersonFormatted: string;
  const assigned_person = task.assigned_person;
  if (assigned_person) {
    assignedPersonFormatted = usernameRegex.test(assigned_person)
      ? `<a href="https://t.me/${assigned_person.substring(1)}">${assigned_person}</a>`
      : escapeHTML(assigned_person);
  } else {
    assignedPersonFormatted = 'не назначений';
  }

  const title = task.url
    ? `<a href="${task.url}">${escapedTitle}</a>${tzFormatted}`
    : escapedTitle + tzFormatted;

  return (
    `${index + 1}) ${StatusIcons[task.status]} ${title}\n` +
    `Дедлайн: ${escapedDeadline}\n` +
    `Дедлайн посту: ${escapedDeadlinePost}\n` +
    `Відповідальний: ${assignedPersonFormatted}`
  );
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
