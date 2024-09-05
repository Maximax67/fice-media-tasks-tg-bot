import { LINK_REPLACER_TEXT } from '../config';
import { URL_REGEX_REPLACER } from '../constants';
import { escapeHtml } from './escape_html';

export const urlReplacer = (str: string, escape: boolean = true): string =>
  (escape ? escapeHtml(str) : str).replace(
    URL_REGEX_REPLACER,
    (link) => `<a href="${link}">${LINK_REPLACER_TEXT}</a>`,
  );
