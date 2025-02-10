import { MotivationTypes } from '../enums';

export const MOTIVATION_TYPES_NAMES: Record<MotivationTypes, string> = {
  [MotivationTypes.NONE]: '❌ Без мотивації',
  [MotivationTypes.CATGIRLS]: '😻 Кішкодівчинки',
  [MotivationTypes.MEMES]: '😂 Меми',
  [MotivationTypes.QUOTES]: '💬 Цитати',
  [MotivationTypes.NATURE]: '🖼 Природа',
  [MotivationTypes.RANDOM]: '🎲 Рандомний тип',
};
