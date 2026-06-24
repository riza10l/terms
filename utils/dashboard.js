const os = require('os');
const chalk = require('chalk').default;
const { getSystemInfo } = require('./helpers');

const ANIME_ASCII = [
  "⣿⣿⣿⣿⣿⣷⣿⣿⣿⡅⡹⢿⠆⠙⠋⠉⠻⠿⣿⣿⣿⣿⣿⣿⣮⠻⣦⡙⢷⡑⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣌⠡⠌⠂⣙⠻⣛⠻⠷⠐⠈⠛⢱⣮⣷⣽⣿",
  "⣿⣿⣿⣿⡇⢿⢹⣿⣶⠐⠁⠀⣀⣠⣤⠄⠀⠀⠈⠙⠻⣿⣿⣿⣦⣵⣌⠻⣷⢝⠦⠚⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣻⣿⣊⡃⠀⣙⠿⣿⣿⣿⣎⢮⡀⢮⣽⣿⣿",
  "⢿⣿⣿⣿⣧⡸⡎⡛⡩⠖⠀⣴⣿⣿⣿⠀⠀⠀⠀⠸⠇⠀⠙⢿⣿⣿⣿⣷⣌⢷⣑⢷⣄⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⠶⠛⠉⠀⠁⠀⠈⠈⠀⠠⠜⠻⣿⣆⢿⣼⣿⣿⣿",
  "⢐⣿⣿⣿⣿⣧⢧⣧⢻⣦⢀⣹⣿⣿⣿⣇⠀⠄⠀⠀⠀⡀⠀⠈⢻⣿⣿⣿⣿⣷⣝⢦⡹⠷⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⠈⠁⠀⠀⠀⠁⠀⠀⠀⠱⣶⣄⡀⠀⠈⠛⠜⣿⣿⣿⣿",
  "⠀⠊⢫⣿⣏⣿⡌⣼⣄⢫⡌⣿⣿⣿⣿⣿⣦⡈⠲⣄⣤⣤⡡⢀⣠⣿⣿⣿⣿⣿⣿⣷⣼⣍⢬⣦⡙⣿⣿⣿⣿⣿⣯⢁⡄⠀⡀⡀⠀⠄⢈⣠⢪⠀⣿⣿⣿⣦⠀⢉⢂⠹⡿⣿⣿",
  "⠀⠀⠄⢹⢃⢻⣟⠙⣿⣦⠱⢻⣿⣿⣿⣿⣿⣿⣷⣬⣍⣭⣥⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⡙⢿⣼⡿⣿⣿⣿⣿⣿⣷⣄⠘⣱⢦⣤⡴⡿⢈⣼⣿⣿⣿⣇⣴⣶⣮⣅⢻⣿⡏",
  "⠀⠀⠈⠹⣇⢡⢿⡆⠻⣿⣷⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣍⡻⣿⣟⣻⣿⣿⣿⣿⣷⣦⣥⣬⣤⣴⣾⣿⣿⣿⣿⣷⣿⣿⣿⣿⣷⡜⠃",
  "⠀⠀⠀⢀⣘⠈⢂⠃⣧⡹⣿⣷⡄⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣅⡙⢿⣟⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⡕⠂",
  "⠀⠀⠀⠀⠀⠀⠛⢷⣜⢷⡌⠻⣿⣿⣦⣝⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣹⣷⣦⣹⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠉⠃⠀"
];

function renderDashboard(term, ctx) {
  const info = getSystemInfo();
  const theme = ctx.getTheme();

  // Basic styling
  const primary = chalk.hex(theme.primary);
  const secondary = chalk.hex(theme.secondary);
  const accent = chalk.hex(theme.accent);
  const infoColor = chalk.hex(theme.info || '#89dceb');

  term.clear();
  term('\n');

  // Separator
  const sep = secondary('════════════════════════════════════════════════════════════════════════\n');
  term(sep);

  const lines = [];
  const maxAsciiHeight = Math.max(ANIME_ASCII.length, 14);


  //info 
  const rightSide = [
    `${accent('riza')}@${infoColor('TERMS-Drive')}`,
    '',
    `OS       : ${primary('Windows 11 Pro')}`,
    `Kernel   : ${secondary('Windows 11')}`,
    `Shell    : ${secondary('TERMS Shell')}`,
    `Packages : ${secondary('43 plugins')}`,
    `Theme    : ${primary(theme.name)}`,
    `Icons    : ${secondary('Nerd Fonts')}`,
    `Terminal : ${secondary('TERMS')}`,
    `CPU      : ${secondary('AMD Ryzen™ AI 9 365')}`,
    `Memory   : ${secondary('32.0 GB')}`,
  ];

  // If network is available
  try {
    const { execSync } = require('child_process');
    const out = execSync('netsh wlan show interfaces 2>nul | findstr "SSID"', { encoding: 'utf8' });
    if (out.trim()) {
      rightSide.push(`Network  : ${secondary(out.trim().replace('SSID', '').replace(':', '').trim())}`);
    } else {
      rightSide.push(`Network  : ${secondary('Connected')}`);
    }
  } catch {
    rightSide.push(`Network  : ${secondary('Connected')}`);
  }

  const now = new Date();
  rightSide.push(`Time     : ${secondary(now.toLocaleTimeString())}`);
  rightSide.push(`Date     : ${secondary(now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))}`);

  for (let i = 0; i < maxAsciiHeight; i++) {
    const left = ANIME_ASCII[i] ? primary(ANIME_ASCII[i]) : ' '.repeat(40);
    const right = rightSide[i] || '';
    term(`  ${left}   ${right}\n`);
  }

  term(sep);

  // Theme palette preview
  term('\n  ');
  const blocks = [
    '#1e1e2e', // black
    theme.error, // red
    theme.success, // green
    theme.warning, // yellow
    theme.info, // blue
    theme.accent, // magenta
    theme.primary, // cyan
    '#cdd6f4' // white
  ];

  blocks.forEach(c => {
    term(chalk.hex(c)('■ '));
  });
  term('\n\n');

  // Status indicators
  term(`  ${chalk.hex(theme.success)('●')} CPU: ${info.cpuPercent}%   `);
  term(`${chalk.hex(theme.warning)('●')} RAM: ${info.memPercent}%   `);
  term(`${chalk.hex(theme.info)('●')} NET: OK\n\n`);
}

module.exports = { renderDashboard };