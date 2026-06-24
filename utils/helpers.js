const os = require('os');
const { getTheme } = require('../themes/engine');

const TERMS_ASCII = `
████████╗███████╗██████╗ ███╗   ███╗███████╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔════╝
   ██║   █████╗  ██████╔╝██╔████╔██║███████╗
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║╚════██║
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║███████║
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
`;

const RANDOM_ASCII = [
  '(≧▽≦)',
  '(◕‿◕)',
  '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
  '¯\\_(ツ)_/¯',
  '(╯°□°)╯︵ ┻━┻',
  '┻━┻ ︵ヽ(`▭´)ﾉ︵ ┻━┻',
  '┬──┬ ノ( ゜-゜ノ)',
  '(◣_◢)',
  'ᕙ(▀̿̿Ĺ̯̿̿▀̿ ̿)ᕗ',
  '☞   ☞',
  '(づ｡◕‿‿◕｡)づ',
  '♪～(´ε｀ )',
  '[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]',
  '←(▀̿Ĺ̯▀̿ ̿)',
  '⛓️‍💥',
];

function getTermsAscii(colorFn) {
  if (!colorFn) return TERMS_ASCII;
  return TERMS_ASCII.split('\n').map(l => l ? colorFn(l) : l).join('\n');
}

function getRandomAscii() {
  return RANDOM_ASCII[Math.floor(Math.random() * RANDOM_ASCII.length)];
}

function getSystemInfo() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = ((usedMem / totalMem) * 100).toFixed(1);
  const usedGB = (usedMem / (1024 ** 3)).toFixed(1);
  const totalGB = (totalMem / (1024 ** 3)).toFixed(1);
  const uptime = os.uptime();
  const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
  const cpuModel = cpus[0]?.model || 'Unknown';
  const cpuLoad = os.loadavg()[0];
  const cpuPercent = ((cpuLoad / cpus.length) * 100).toFixed(1);

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    cpuModel,
    cpuCores: cpus.length,
    cpuPercent,
    usedGB,
    totalGB,
    memPercent,
    uptime: uptimeStr,
    uptimeSeconds: uptime,
    user: (process.env.USERNAME || os.userInfo()?.username || 'unknown').toLowerCase(),
    type: os.type(),
    arch: os.arch()
  };
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function progressBar(current, total, width = 15, fill = '█', empty = '░') {
  const pct = Math.min(current / total, 1);
  const filled = Math.round(pct * width);
  const blanks = width - filled;
  return fill.repeat(filled) + empty.repeat(blanks);
}

function centerText(text, width = 50) {
  const lines = text.split('\n');
  return lines.map(l => {
    const pad = Math.max(0, Math.floor((width - l.length) / 2));
    return ' '.repeat(pad) + l;
  }).join('\n');
}

module.exports = {
  TERMS_ASCII, getTermsAscii, getRandomAscii, getSystemInfo,
  formatUptime, progressBar, centerText, RANDOM_ASCII
};
