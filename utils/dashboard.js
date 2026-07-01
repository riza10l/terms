const os = require('os');
const chalk = require('chalk').default;
const { getSystemInfo, formatUptime } = require('./helpers');

// ─── side art (anime, braille) ───
const LOGO = [
  '⣿⣿⣿⣿⣿⣷⣿⣿⣿⡅⡹⢿⠆⠙⠋⠉⠻⠿⣿⣿⣿⣿⣿⣿⣮⠻⣦⡙⢷⡑⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣌⠡⠌⠂⣙⠻⣛⠻⠷⠐⠈⠛⢱⣮⣷⣽⣿',
  '⣿⣿⣿⣿⡇⢿⢹⣿⣶⠐⠁⠀⣀⣠⣤⠄⠀⠀⠈⠙⠻⣿⣿⣿⣦⣵⣌⠻⣷⢝⠦⠚⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣻⣿⣊⡃⠀⣙⠿⣿⣿⣿⣎⢮⡀⢮⣽⣿⣿',
  '⢿⣿⣿⣿⣧⡸⡎⡛⡩⠖⠀⣴⣿⣿⣿⠀⠀⠀⠀⠸⠇⠀⠙⢿⣿⣿⣿⣷⣌⢷⣑⢷⣄⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⠶⠛⠉⠀⠁⠀⠈⠈⠀⠠⠜⠻⣿⣆⢿⣼⣿⣿⣿',
  '⢐⣿⣿⣿⣿⣧⢧⣧⢻⣦⢀⣹⣿⣿⣿⣇⠀⠄⠀⠀⠀⡀⠀⠈⢻⣿⣿⣿⣿⣷⣝⢦⡹⠷⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⠈⠁⠀⠀⠀⠁⠀⠀⠀⠱⣶⣄⡀⠀⠈⠛⠜⣿⣿⣿⣿',
  '⠀⠊⢫⣿⣏⣿⡌⣼⣄⢫⡌⣿⣿⣿⣿⣿⣦⡈⠲⣄⣤⣤⡡⢀⣠⣿⣿⣿⣿⣿⣿⣷⣼⣍⢬⣦⡙⣿⣿⣿⣿⣿⣯⢁⡄⠀⡀⡀⠀⠄⢈⣠⢪⠀⣿⣿⣿⣦⠀⢉⢂⠹⡿⣿⣿',
  '⠀⠀⠄⢹⢃⢻⣟⠙⣿⣦⠱⢻⣿⣿⣿⣿⣿⣿⣷⣬⣍⣭⣥⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⡙⢿⣼⡿⣿⣿⣿⣿⣿⣷⣄⠘⣱⢦⣤⡴⡿⢈⣼⣿⣿⣿⣇⣴⣶⣮⣅⢻⣿⡏',
  '⠀⠀⠈⠹⣇⢡⢿⡆⠻⣿⣷⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣍⡻⣿⣟⣻⣿⣿⣿⣿⣷⣦⣥⣬⣤⣴⣾⣿⣿⣿⣿⣷⣿⣿⣿⣿⣷⡜⠃',
  '⠀⠀⠀⢀⣘⠈⢂⠃⣧⡹⣿⣷⡄⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣅⡙⢿⣟⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⡕⠂',
  '⠀⠀⠀⠀⠀⠀⠛⢷⣜⢷⡌⠻⣿⣿⣦⣝⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣹⣷⣦⣹⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠉⠃⠀',
];
const LOGO_WIDTH = Math.max(...LOGO.map((l) => [...l].length));

// ─── hex colour helpers ───
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lerp(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return rgbToHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
}

// ─── OS pretty name (Windows build heuristic) ───
function prettyOsName() {
  const platform = os.platform();
  if (platform === 'win32') {
    const build = parseInt((os.release().split('.')[2]) || '0', 10);
    return build >= 22000 ? 'Windows 11' : 'Windows 10';
  }
  if (platform === 'darwin') return 'macOS';
  if (platform === 'linux') return 'Linux';
  return platform;
}

// Strip a long CPU model down so the panel never wraps.
function shortCpu(model) {
  let m = model
    .replace(/\(R\)|\(TM\)|\(r\)|\(tm\)|CPU|Processor|@.*$/g, '')
    .replace(/\s+w\/.*$/i, '')        // drop "w/ Radeon Graphics" etc.
    .replace(/\s+with\s+.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (m.length > 28) m = m.slice(0, 28).replace(/\s+\S*$/, '').trim() + '…';
  return m;
}

function renderDashboard(term, ctx) {
  const info = getSystemInfo();
  const theme = ctx.getTheme();

  const primary = chalk.hex(theme.primary);
  const secondary = chalk.hex(theme.secondary);
  const accent = chalk.hex(theme.accent);
  const dim = chalk.hex(theme.secondary).dim;

  const user = info.user;
  const host = 'TERMS';
  const title = `${accent.bold(user)}${dim('@')}${primary.bold(host)}`;
  const titleLen = user.length + 1 + host.length; // visible length, no ansi

  // ─── info rows: [label, value] ───
  const rows = [
    ['OS', `${prettyOsName()} (${info.arch})`],
    ['Host', info.hostname],
    ['Kernel', info.release],
    ['Uptime', info.uptime],
    ['Shell', 'TERMS v2.0'],
    ['Terminal', os.platform() === 'win32' ? 'Windows Terminal' : 'tty'],
    ['Theme', theme.name],
    ['CPU', `${shortCpu(info.cpuModel)} (${info.cpuCores})`],
    ['Memory', `${info.usedGB} GB / ${info.totalGB} GB`],
  ];

  // Right column: title + underline + rows
  const right = [];
  right.push(title);
  right.push(dim('─'.repeat(Math.max(titleLen, 12))));
  rows.forEach(([label, value]) => {
    right.push(`${accent.bold(label.padEnd(9))}${dim('  ')}${secondary(value)}`);
  });

  // ─── gradient logo lines ───
  const logo = LOGO.map((line, i) => {
    const t = LOGO.length > 1 ? i / (LOGO.length - 1) : 0;
    return chalk.hex(lerp(theme.primary, theme.accent, t))(line);
  });

  term.clear();
  term('\n');

  // ─── side-by-side render ───
  const rowCount = Math.max(logo.length, right.length);
  for (let i = 0; i < rowCount; i++) {
    const left = logo[i] !== undefined ? logo[i] : ' '.repeat(LOGO_WIDTH);
    const r = right[i] !== undefined ? right[i] : '';
    term(`  ${left}   ${r}\n`);
  }

  // ─── colour palette (two rows, fastfetch style) ───
  const palette = [
    theme.bg || '#1e1e2e',
    theme.error,
    theme.success,
    theme.warning,
    theme.info,
    theme.accent,
    theme.primary,
    theme.fg || '#cdd6f4',
  ];
  term('\n  ');
  palette.forEach((c) => term(chalk.hex(c)('███')));
  term('\n  ');
  palette.forEach((c) => term(chalk.bgHex(c)('   ')));
  term('\n\n');

  // ─── live status line ───
  const totalMem = os.totalmem();
  const memPct = (((totalMem - os.freemem()) / totalMem) * 100).toFixed(0);
  const now = new Date();
  term(`  ${chalk.hex(theme.success)('●')} ${secondary('online')}   `);
  term(`${chalk.hex(theme.warning)('●')} ${secondary('RAM ' + memPct + '%')}   `);
  term(`${chalk.hex(theme.info)('●')} ${secondary(now.toLocaleTimeString())}\n\n`);

  term(dim("  type 'help' to list commands · 'fetch' to refresh\n\n"));
}

module.exports = { renderDashboard };
