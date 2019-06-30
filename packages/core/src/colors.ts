export const colors = {
  black: (str: string, alt?: boolean): string => {
    return `\u00A70${str}\u00A7r`;
  },
  darkBlue: (str: string, alt?: boolean): string => {
    return `\u00A71${str}\u00A7r`;
  },
  darkGreen: (str: string, alt?: boolean): string => {
    return `\u00A72${str}\u00A7r`;
  },
  darkAqua: (str: string, alt?: boolean): string => {
    return `\u00A73${str}\u00A7r`;
  },
  darkRed: (str: string, alt?: boolean): string => {
    return `\u00A74${str}\u00A7r`;
  },
  darkPurple: (str: string, alt?: boolean): string => {
    return `\u00A75${str}\u00A7r`;
  },
  gold: (str: string, alt?: boolean): string => {
    return `\u00A76${str}\u00A7r`;
  },
  gray: (str: string, alt?: boolean): string => {
    return `\u00A77${str}\u00A7r`;
  },
  darkGray: (str: string, alt?: boolean): string => {
    return `\u00A78${str}\u00A7r`;
  },
  blue: (str: string, alt?: boolean): string => {
    return `\u00A79${str}\u00A7r`;
  },
  green: (str: string, alt?: boolean): string => {
    return `\u00A7a${str}\u00A7r`;
  },
  aqua: (str: string, alt?: boolean): string => {
    return `\u00A7b${str}\u00A7r`;
  },
  red: (str: string, alt?: boolean): string => {
    return `\u00A7c${str}\u00A7r`;
  },
  lightPurple: (str: string, alt?: boolean): string => {
    return `\u00A7d${str}\u00A7r`;
  },
  yellow: (str: string, alt?: boolean): string => {
    return `\u00A7e${str}\u00A7r`;
  },
  white: (str: string, alt?: boolean): string => {
    return `\u00A7f${str}\u00A7r`;
  },
  obfuscated: (str: string, alt?: boolean): string => {
    return `\u00A7k${str}\u00A7r`;
  },
  bold: (str: string, alt?: boolean): string => {
    return `\u00A7l${str}\u00A7r`;
  },
  strikethrough: (str: string, alt?: boolean): string => {
    return `\u00A7m${str}\u00A7r`;
  },
  underline: (str: string, alt?: boolean): string => {
    return `\u00A7n${str}\u00A7r`;
  },
  italic: (str: string, alt?: boolean): string => {
    return `\u00A7o${str}\u00A7r`;
  },
  reset: (str: string, alt?: boolean): string => {
    return `\u00A7r`;
  },
  extraLine: (str: string, alt?: boolean): string => {
    return `\n`;
  }
};
