export type BoardThemeId = 'walnut' | 'slate' | 'emerald' | 'midnight';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  light: string;
  lightAlt: string;
  dark: string;
  darkAlt: string;
  frame: string;
  frameAlt: string;
  edge: string;
  coordinateOnLight: string;
  coordinateOnDark: string;
  lastMove: string;
  selected: string;
  check: string;
  legalDot: string;
  legalRing: string;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  walnut: {
    id: 'walnut',
    name: 'Walnut',
    light: '#eadcc1',
    lightAlt: '#e2d0ae',
    dark: '#8f6039',
    darkAlt: '#7c4f2d',
    frame: '#23170f',
    frameAlt: '#3a2618',
    edge: '#caa76b',
    coordinateOnLight: 'rgba(91,64,38,0.72)',
    coordinateOnDark: 'rgba(250,240,220,0.72)',
    lastMove: 'rgba(222, 177, 83, 0.42)',
    selected: 'rgba(238, 198, 105, 0.55)',
    check: 'rgba(210, 58, 58, 0.62)',
    legalDot: 'rgba(30, 24, 16, 0.32)',
    legalRing: 'rgba(30, 24, 16, 0.34)',
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    light: '#d8dde4',
    lightAlt: '#cbd2db',
    dark: '#5b6977',
    darkAlt: '#4d5a67',
    frame: '#141920',
    frameAlt: '#222a34',
    edge: '#94a1b0',
    coordinateOnLight: 'rgba(46,57,71,0.65)',
    coordinateOnDark: 'rgba(235,241,247,0.7)',
    lastMove: 'rgba(133, 186, 244, 0.36)',
    selected: 'rgba(122, 179, 247, 0.5)',
    check: 'rgba(203, 55, 55, 0.6)',
    legalDot: 'rgba(18, 28, 42, 0.3)',
    legalRing: 'rgba(18, 28, 42, 0.32)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    light: '#e7e0c9',
    lightAlt: '#ddd4b8',
    dark: '#416a56',
    darkAlt: '#355b48',
    frame: '#0e1a15',
    frameAlt: '#1b2f26',
    edge: '#b9a56d',
    coordinateOnLight: 'rgba(56,74,55,0.68)',
    coordinateOnDark: 'rgba(240,235,215,0.72)',
    lastMove: 'rgba(231, 194, 98, 0.4)',
    selected: 'rgba(238, 202, 105, 0.52)',
    check: 'rgba(200, 54, 54, 0.6)',
    legalDot: 'rgba(22, 42, 31, 0.32)',
    legalRing: 'rgba(22, 42, 31, 0.34)',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    light: '#b9c3d2',
    lightAlt: '#aab6c7',
    dark: '#38465c',
    darkAlt: '#2e3b50',
    frame: '#0a0f17',
    frameAlt: '#151d29',
    edge: '#8f9db2',
    coordinateOnLight: 'rgba(35,47,66,0.62)',
    coordinateOnDark: 'rgba(226,234,246,0.7)',
    lastMove: 'rgba(125, 179, 247, 0.34)',
    selected: 'rgba(129, 187, 255, 0.48)',
    check: 'rgba(206, 52, 52, 0.62)',
    legalDot: 'rgba(14, 22, 34, 0.32)',
    legalRing: 'rgba(14, 22, 34, 0.34)',
  },
};

export type PieceThemeId = 'ivory' | 'marble' | 'bronze' | 'obsidian' | 'sapphire' | 'rose-gold';

export interface PieceColors {
  body: string;
  bodyMid: string;
  bodyDark: string;
  highlight: string;
  base: string;
  baseDark: string;
  outline: string;
}

export interface PieceTheme {
  id: PieceThemeId;
  name: string;
  white: PieceColors;
  black: PieceColors;
}

export const PIECE_THEMES: Record<PieceThemeId, PieceTheme> = {
  ivory: {
    id: 'ivory',
    name: 'Ivory',
    white: {
      body: '#fbf7ee',
      bodyMid: '#eee2ca',
      bodyDark: '#c8b490',
      highlight: '#fffdf8',
      base: '#e4d3b3',
      baseDark: '#a99269',
      outline: '#8f7b5a',
    },
    black: {
      body: '#3a3d44',
      bodyMid: '#222429',
      bodyDark: '#0d0e10',
      highlight: '#8e959f',
      base: '#282a2f',
      baseDark: '#050506',
      outline: '#08090b',
    },
  },
  marble: {
    id: 'marble',
    name: 'Marble',
    white: {
      body: '#f2f4f5',
      bodyMid: '#dfe4e7',
      bodyDark: '#aeb7bd',
      highlight: '#ffffff',
      base: '#d6dde1',
      baseDark: '#8c979f',
      outline: '#7d878e',
    },
    black: {
      body: '#414953',
      bodyMid: '#2a3038',
      bodyDark: '#0f1216',
      highlight: '#a6b1bd',
      base: '#2c323a',
      baseDark: '#080a0c',
      outline: '#0b0d10',
    },
  },
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    white: {
      body: '#f5e8cf',
      bodyMid: '#e5d0aa',
      bodyDark: '#bb9d6d',
      highlight: '#fff9ec',
      base: '#dcc49a',
      baseDark: '#9c7d50',
      outline: '#7f653f',
    },
    black: {
      body: '#4a3428',
      bodyMid: '#2d1f18',
      bodyDark: '#120c09',
      highlight: '#a47a58',
      base: '#35251c',
      baseDark: '#080504',
      outline: '#0e0907',
    },
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    white: {
      body: '#e9edf2',
      bodyMid: '#c5ccd6',
      bodyDark: '#8994a3',
      highlight: '#ffffff',
      base: '#b8c1cd',
      baseDark: '#687484',
      outline: '#596575',
    },
    black: {
      body: '#242832',
      bodyMid: '#11151d',
      bodyDark: '#05070b',
      highlight: '#727e91',
      base: '#171c26',
      baseDark: '#020306',
      outline: '#05070b',
    },
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    white: {
      body: '#e8f2ff',
      bodyMid: '#c4d9f4',
      bodyDark: '#83a8d4',
      highlight: '#ffffff',
      base: '#b6d0ef',
      baseDark: '#6c91bd',
      outline: '#587da9',
    },
    black: {
      body: '#263e68',
      bodyMid: '#15294d',
      bodyDark: '#07152e',
      highlight: '#769bd1',
      base: '#1b3158',
      baseDark: '#061027',
      outline: '#08152b',
    },
  },
  'rose-gold': {
    id: 'rose-gold',
    name: 'Rose Gold',
    white: {
      body: '#fff0e9',
      bodyMid: '#edc9bd',
      bodyDark: '#c28e83',
      highlight: '#fffaf7',
      base: '#e3b8aa',
      baseDark: '#a97469',
      outline: '#95665e',
    },
    black: {
      body: '#573b40',
      bodyMid: '#35252b',
      bodyDark: '#160e13',
      highlight: '#bd8990',
      base: '#402b32',
      baseDark: '#10090d',
      outline: '#1c1015',
    },
  },
};

export const BOARD_THEME_LIST = Object.values(BOARD_THEMES);
export const PIECE_THEME_LIST = Object.values(PIECE_THEMES);
