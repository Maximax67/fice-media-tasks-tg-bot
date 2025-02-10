import { escapeHtml } from './escape_html';
import type { TaskStatusInfo } from '../interfaces';

export const formatChangeStatusEventMessage = (
  status: TaskStatusInfo | null,
): string => {
  if (!status) {
    return '';
  }

  return `\n\nСтатус змінено на ${escapeHtml(status.icon)} ${escapeHtml(status.title)}`;
};
