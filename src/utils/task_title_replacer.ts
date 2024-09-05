import { URL_REGEX } from '../constants';
import { escapeHtml } from './escape_html';
import { urlReplacer } from './url_replacer';

export const taskTitleReplacer = (
  title: string,
  escape: boolean = true,
): string => {
  if (escape) {
    return URL_REGEX.test(title) ? escapeHtml(title) : urlReplacer(title);
  }

  return URL_REGEX.test(title) ? title : urlReplacer(title, false);
};
