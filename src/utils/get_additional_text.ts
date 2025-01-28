import {
  DESIGN_CHAT_ID,
  DESIGN_THREAD_ID,
  TEXTS_CHAT_ID,
  TEXTS_THREAD_ID,
} from '../config';
import {
  DEFAULT_ADDITIONAL_TEXT,
  DESIGN_ADDITIONAL_TEXT,
  TEXTS_ADDITIONAL_TEXT,
} from '../constants';

export const getAdditionalText = (
  chatId: number,
  thread: number | null,
): string => {
  if (chatId === DESIGN_CHAT_ID && thread === DESIGN_THREAD_ID) {
    return DESIGN_ADDITIONAL_TEXT;
  }

  if (chatId === TEXTS_CHAT_ID && thread === TEXTS_THREAD_ID) {
    return TEXTS_ADDITIONAL_TEXT;
  }

  return DEFAULT_ADDITIONAL_TEXT;
};
