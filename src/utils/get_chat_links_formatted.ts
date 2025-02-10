import { formatChatLink } from './format_chat_link';
import { getLinksForChat } from './get_links_for_chat';

export const getChatLinksFormatted = async (
  chatId: number,
  thread: number,
): Promise<string | null> => {
  const links = await getLinksForChat(chatId, thread);

  if (!links.length) {
    return null;
  }

  let linksMessage = '<b>Корисні посилання:</b>';
  links.forEach((link) => {
    linksMessage += `\n• ${formatChatLink(link.url, link.description)}`;
  });

  return linksMessage;
};
