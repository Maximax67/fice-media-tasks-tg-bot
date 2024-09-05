import { USERNAME_REGEX } from '../constants';
import { urlReplacer } from './url_replacer';

export const formatAssignedPerson = (assignedPerson: string): string =>
  USERNAME_REGEX.test(assignedPerson)
    ? `<a href="https://t.me/${assignedPerson.substring(1)}">${assignedPerson}</a>`
    : urlReplacer(assignedPerson);
