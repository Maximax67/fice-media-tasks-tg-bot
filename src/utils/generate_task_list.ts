import { formatDateTime } from './format_datetime';
import { urlReplacer } from './url_replacer';

import { escapeHtml } from './escape_html';
import { taskTitleReplacer } from './task_title_replacer';
import { formatResponsible } from './format_responsible';
import { formatDate } from './format_date';
import { URL_REGEX } from '../constants';

import type { ChatTaskStatus, Task } from '../interfaces';

const generateTaskLegend = (statuses: ChatTaskStatus[]): string => {
  let legend = '<b>Легенда:</b>';
  const iconMap = new Map<string, Set<string>>();

  for (const status of statuses) {
    const icon = status.icon;
    const title = status.title;

    if (!iconMap.has(icon)) {
      iconMap.set(icon, new Set());
    }

    iconMap.get(icon)!.add(title);
  }

  for (const [icon, titlesSet] of iconMap.entries()) {
    const titles = Array.from(titlesSet).map(escapeHtml).join(' / ');
    legend += `\n• ${escapeHtml(icon)} — ${titles}`;
  }

  return legend;
};

export const formatTask = (
  task: Task,
  index: number,
  includeResponsible = true,
): string => {
  const {
    title,
    deadline,
    post_deadline,
    tz,
    url,
    responsible,
    status: { icon },
    comments,
  } = task;

  const escapedTitle = taskTitleReplacer(title, true);
  const escapedDeadline = deadline ? urlReplacer(deadline) : 'відсутній';
  const escapedDeadlinePost = post_deadline
    ? ' | ' + urlReplacer(post_deadline)
    : '';

  let tzFormatted: string;
  if (tz) {
    tzFormatted = URL_REGEX.test(tz)
      ? ` <a href="${tz}">[ТЗ]</a>`
      : `\nТЗ: ${urlReplacer(tz)}`;
  } else {
    tzFormatted = '';
  }

  const titleFormatted = url
    ? `<a href="${url}">${escapedTitle}</a>${tzFormatted}`
    : escapedTitle + tzFormatted;

  let formattedTask =
    `${index + 1}) ${escapeHtml(icon)} ${titleFormatted}\n` +
    escapedDeadline +
    escapedDeadlinePost;

  if (includeResponsible) {
    formattedTask += responsible ? ' | ' + formatResponsible(responsible) : '';
  }

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
};

export const formatTaskMinimalistic = (task: Task): string => {
  const { title, url, status, completed_at } = task;

  const escapedTitle = taskTitleReplacer(title, true);
  const titleFormatted = url
    ? `<a href="${url}">${escapedTitle}</a>`
    : escapedTitle;

  return completed_at
    ? `${formatDate(completed_at)} - ${titleFormatted}`
    : `${escapeHtml(status.icon)} ${titleFormatted}`;
};

export const generateTaskList = (
  tasks: Task[],
  statuses: ChatTaskStatus[],
): string => {
  const legend = generateTaskLegend(statuses);
  const tasksFormatted = tasks
    .map((task, index) => formatTask(task, index, true))
    .join('\n\n');

  return (
    '<b>===== Поточні таски =====</b>\n\n' + tasksFormatted + '\n\n' + legend
  );
};
