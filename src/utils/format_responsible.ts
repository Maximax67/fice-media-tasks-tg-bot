import { USERNAME_REGEX } from '../constants';
import { urlReplacer } from './url_replacer';

export const formatResponsible = (responsible: string): string =>
  urlReplacer(responsible, true).replace(USERNAME_REGEX, (match) => {
    return `<a href="https://t.me/${match.substring(1)}">${match}</a>`;
  });
