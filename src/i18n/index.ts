import { dictionary, DictionaryKey } from './tr';

export const t = (key: DictionaryKey): string => {
  return dictionary[key] || key;
};
