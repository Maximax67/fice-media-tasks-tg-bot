import { escapeHtml } from './escape_html';
import { urlReplacer } from './url_replacer';

export const formatChatLink = (url: string, description: string | null) => {
  return `<a href="${url}">${description ? urlReplacer(description) : escapeHtml(url)}</a>`;
};
