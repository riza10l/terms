const chalk = require('chalk').default;

const THEMES = {
  'tokyo-night': {
    primary: '#7aa2f7',
    secondary: '#a9b1d6',
    accent: '#bb9af7',
    success: '#9ece6a',
    warning: '#e0af68',
    error: '#f7768e',
    info: '#73daca',
    bg: '#1a1b26',
    fg: '#c0caf5',
    name: 'Tokyo Night'
  },
  dracula: {
    primary: '#bd93f9',
    secondary: '#f8f8f2',
    accent: '#ff79c6',
    success: '#50fa7b',
    warning: '#f1fa8c',
    error: '#ff5555',
    info: '#8be9fd',
    bg: '#282a36',
    fg: '#f8f8f2',
    name: 'Dracula'
  },
  catppuccin: {
    primary: '#89b4fa',
    secondary: '#cdd6f4',
    accent: '#cba6f7',
    success: '#a6e3a1',
    warning: '#f9e2af',
    error: '#f38ba8',
    info: '#89dceb',
    bg: '#1e1e2e',
    fg: '#cdd6f4',
    name: 'Catppuccin'
  },
  nord: {
    primary: '#88c0d0',
    secondary: '#d8dee9',
    accent: '#b48ead',
    success: '#a3be8c',
    warning: '#ebcb8b',
    error: '#bf616a',
    info: '#81a1c1',
    bg: '#2e3440',
    fg: '#d8dee9',
    name: 'Nord'
  },
  gruvbox: {
    primary: '#83a598',
    secondary: '#ebdbb2',
    accent: '#d3869b',
    success: '#b8bb26',
    warning: '#fabd2f',
    error: '#fb4934',
    info: '#8ec07c',
    bg: '#282828',
    fg: '#ebdbb2',
    name: 'Gruvbox'
  },
  matrix: {
    primary: '#00ff41',
    secondary: '#00cc33',
    accent: '#7fff00',
    success: '#00ff41',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#00ffff',
    bg: '#000000',
    fg: '#00ff41',
    name: 'Matrix'
  },
  cyberpunk: {
    primary: '#ff00ff',
    secondary: '#00ffff',
    accent: '#ffff00',
    success: '#00ff00',
    warning: '#ff8800',
    error: '#ff0044',
    info: '#0088ff',
    bg: '#0d0d2b',
    fg: '#00ffff',
    name: 'Cyberpunk'
  },
  default: {
    primary: '#00ffff',
    secondary: '#00ff00',
    accent: '#ff00ff',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#ffff00',
    bg: '#000000',
    fg: '#ffffff',
    name: 'Default'
  }
};

const themeNames = Object.keys(THEMES);

function getTheme(name) {
  return THEMES[name] || THEMES['tokyo-night'];
}

function applyText(text, color, theme) {
  if (!theme) theme = THEMES['tokyo-night'];
  const hex = theme[color] || theme.primary;
  return chalk.hex(hex)(text);
}

function paint(text, themeName) {
  const theme = getTheme(themeName);
  return {
    primary: (t) => chalk.hex(theme.primary)(t),
    secondary: (t) => chalk.hex(theme.secondary)(t),
    accent: (t) => chalk.hex(theme.accent)(t),
    success: (t) => chalk.hex(theme.success)(t),
    warning: (t) => chalk.hex(theme.warning)(t),
    error: (t) => chalk.hex(theme.error)(t),
    info: (t) => chalk.hex(theme.info)(t)
  };
}

function listThemes() {
  return themeNames;
}

function previewTheme(name) {
  const t = getTheme(name);
  const p = paint('', name);
  return [
    `${p.primary('● Primary')} ${p.secondary('● Secondary')} ${p.accent('● Accent')}`,
    `${p.success('● Success')} ${p.warning('● Warning')} ${p.error('● Error')} ${p.info('● Info')}`,
    `Theme: ${t.name}`
  ].join('\n');
}

module.exports = { getTheme, applyText, paint, listThemes, previewTheme, THEMES };
