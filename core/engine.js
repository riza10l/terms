const term = require('terminal-kit').terminal;

const configLoader = require('../config/loader');
const { getTheme, paint, listThemes, previewTheme } = require('../themes/engine');
const { getSystemInfo, formatUptime } = require('../utils/helpers');
const commands = require('../commands');
const shell = require('../shell');

// Graceful exit on stdin close
process.on('uncaughtException', (err) => {
  if (err.code === 'ERR_USE_AFTER_CLOSE') process.exit(0);
  console.error(err);
  process.exit(1);
});

// ─── Context ───
function createContext(themeName) {
  const theme = getTheme(themeName);
  const raw = paint('', themeName);
  // Auto-output via term so callers don't need to wrap every paint call
  const p = {};
  Object.keys(raw).forEach(k => {
    p[k] = (t) => { term(raw[k](t)); };
  });
  return {
    theme,
    paint: p,
    config: configLoader.load(),
    getTheme: () => theme,
    reloadTheme: () => {
      const t = getTheme(configLoader.get('theme'));
      const r = paint('', configLoader.get('theme'));
      const p2 = {};
      Object.keys(r).forEach(k => { p2[k] = (txt) => { term(r[k](txt)); }; });
      return { theme: t, paint: p2 };
    }
  };
}

// ─── Wrap raw paint functions with term() output ───
function wrapPaint(themeName) {
  const raw = paint('', themeName);
  const p = {};
  Object.keys(raw).forEach(k => {
    p[k] = (t) => { term(raw[k](t)); };
  });
  return p;
}

// ─── Built-in commands (not plugin-based) ───
const builtins = {
  help: async (ctx) => {
    const p = ctx.paint;
    term('\n');
    p.primary('╔══════════════════════════════════════════╗\n');
    p.primary('║            TERMS v2 — Linux Mode         ║\n');
    p.primary('╚══════════════════════════════════════════╝\n\n');

    p.secondary('Usage: type a command and press Enter.\n');
    p.info('File path Tab completion available.\n\n');

    const groups = [
      { title: '🖥  SYSTEM', cmds: [
        ['fetch',      'Show system info with ASCII art'],
        ['device',     'Display detailed device information'],
        ['uptime',     'Show system uptime'],
        ['process',    'List running processes'],
        ['disk',       'Show disk usage'],
        ['ping',       'Ping a host (ping <host>)'],
        ['network',    'Show network information'],
        ['battery',    'Show battery status'],
        ['ports',      'Show open ports'],
      ]},
      { title: '📦  PRODUCTIVITY', cmds: [
        ['notes',      'Quick notes (add/list/rm/clear)'],
        ['todo',       'Task manager (add/list/done/rm/clear)'],
        ['calendar',   'Show calendar'],
        ['timer',      'Countdown timer (timer <seconds>)'],
        ['stopwatch',  'Simple stopwatch'],
        ['qr',         'Generate QR code (qr <text>)'],
        ['weather',    'Show weather forecast (weather <city>)'],
      ]},
      { title: '🎮  FUN', cmds: [
        ['matrix',     'Matrix rain effect'],
        ['snake',      'Play Snake game'],
        ['tetris',     'Play Tetris game'],
        ['2048',       'Play 2048 game'],
        ['pong',       'Play Pong game'],
        ['waifu',      'Show random waifu ASCII'],
      ]},
      { title: '🔧  DEV TOOLS', cmds: [
        ['compile',    'Compile & run source code'],
        ['compile build',     'Compile only (no run)'],
        ['compile run',       'Run without recompiling'],
        ['compile list',      'All supported languages'],
      ]},
      { title: '🎭  SECRET', cmds: [
        ['hack',       'Hack the mainframe!'],
        ['boot',       'Simulate system boot'],
        ['coffee',     'Get a virtual coffee'],
        ['fortune',    'Get a fortune cookie'],
        ['joke',       'Tell a programming joke'],
        ['randomfact', 'Show a random fact'],
        ['easteregg',  'Find a hidden easter egg'],
      ]},
      { title: '⚙️  SETTINGS', cmds: [
        ['theme',      'Change theme (theme <name>/list)'],
        ['config',     'View/edit config (show/set/open)'],
        ['alias',      'Manage command aliases'],
        ['pkg',        'Plugin manager (install/list/remove)'],
        ['dashboard',  'Real-time system dashboard'],
        ['shell',      'Interactive system shell (cmd.exe)'],
        ['ai',         'Ask AI a question (ai <prompt>)'],
        ['chat',       'Interactive AI chat mode'],
        ['music',      'Music controls (simulated)'],
        ['clear',      'Clear the screen'],
        ['exit',       'Exit TERMS'],
        ['help',       'Show this help message'],
      ]},
    ];

    groups.forEach(group => {
      p.primary(group.title + '\n');
      group.cmds.forEach(([cmd, desc]) => {
        p.secondary(`  ${cmd.padEnd(22)}`);
        term(`${desc}\n`);
      });
      term('\n');
    });

    p.secondary('─'.repeat(50) + '\n');
    p.info('Any unrecognized command is passed to the system shell.\n');
    p.info('Tip: Tab autocompletes file paths, not commands.\n');
    p.accent('🔍 Try finding the secret commands... they\'re hidden!\n\n');
  },

  theme: async (ctx, args) => {
    const themes = listThemes();
    if (args && args !== 'list') {
      if (themes.includes(args)) {
        configLoader.set('theme', args);
        ctx.theme = getTheme(args);
        // Re-wrap paint functions with term() output (NOT raw paint)
        ctx.paint = wrapPaint(args);
        ctx.paint.success(`✓ Theme set to "${getTheme(args).name}"\n\n`);
      } else {
        ctx.paint.error(`Theme "${args}" not found.\n`);
        ctx.paint.secondary(`Available: ${themes.join(', ')}\n\n`);
      }
      return;
    }

    // Show preview
    ctx.paint.primary('🎨 Themes\n\n');
    themes.forEach(t => {
      const active = t === configLoader.get('theme') ? ' ◄ active' : '';
      ctx.paint.primary(t.padEnd(15));
      ctx.paint.secondary(previewTheme(t).split('\n')[0] + active + '\n');
    });
    term('\n');
    ctx.paint.secondary(`Usage: theme <name>\n\n`);
  },

  config: async (ctx, args) => {
    if (!args || args === 'show') {
      const cfg = configLoader.load();
      ctx.paint.primary('⚙️ Config\n\n');
      Object.keys(cfg).forEach(k => {
        if (k === 'ai' && cfg[k].apiKey) cfg[k].apiKey = '***';
        ctx.paint.secondary(`${k}: `);
        term(JSON.stringify(cfg[k]) + '\n');
      });
      term('\n');
    } else if (args.startsWith('set ')) {
      const rest = args.slice(4);
      const eqIdx = rest.indexOf('=');
      if (eqIdx > 0) {
        const key = rest.slice(0, eqIdx).trim();
        const val = rest.slice(eqIdx + 1).trim();
        configLoader.set(key, val);
        ctx.paint.success(`✓ Config updated: ${key} = ${val}\n\n`);
      } else {
        ctx.paint.error('Usage: config set <key>=<value>\n\n');
      }
    } else if (args === 'open') {
      ctx.paint.info(`Config file: ${require('path').join(__dirname, '..', 'config', 'user.json')}\n\n`);
    }
  },

  alias: async (ctx, args) => {
    if (!args || args === 'list') {
      const aliases = configLoader.getAliases();
      ctx.paint.primary('🔗 Aliases\n\n');
      if (!Object.keys(aliases).length) {
        ctx.paint.secondary('No aliases defined.\n');
        ctx.paint.info('Usage: alias <name>="<command>"\n\n');
        return;
      }
      Object.keys(aliases).forEach(a => {
        ctx.paint.secondary(`${a} → `);
        term(`${aliases[a]}\n`);
      });
      term('\n');
    } else if (args.includes('=')) {
      const eqIdx = args.indexOf('=');
      const name = args.slice(0, eqIdx).trim();
      let cmd = args.slice(eqIdx + 1).trim();
      cmd = cmd.replace(/^["']|["']$/g, '');
      configLoader.addAlias(name, cmd);
      ctx.paint.success(`✓ Alias added: ${name} → ${cmd}\n\n`);
    } else if (args.startsWith('rm ')) {
      configLoader.removeAlias(args.slice(3).trim());
      ctx.paint.success('✓ Alias removed\n\n');
    }
  },

  clear: async () => {
    term.clear();
  },

  exit: async () => {
    term.green('\nGoodbye!\n');
    process.exit(0);
  },

  compile: async (ctx, args) => {
    await require('../commands/compile').exec(term, ctx, args);
  },

  // ─── SECRET/HIDDEN COMMANDS ───
  konami: async (ctx) => {
    const p = ctx.paint;
    term.clear();
    p.primary('╔══════════════════════════════════╗\n');
    p.primary('║       KONAMI CODE ACTIVATED!      ║\n');
    p.primary('╠══════════════════════════════════╣\n');
    p.success('║  ↑↑↓↓←→←→BA                      ║\n');
    p.accent('║  30 LIVES CHEAT ENABLED!           ║\n');
    p.primary('╚══════════════════════════════════╝\n\n');
    term(chalk.hex('#ff0000')(' ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\n'));
    term(chalk.hex('#ff8800')(' ████████████████████████████████\n'));
    term(chalk.hex('#ffff00')(' █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█\n\n'));
    p.info('🕹 All cheats unlocked!\n\n');
  },

  doom: async (ctx) => {
    const p = ctx.paint;
    term.clear();
    p.primary('██████╗  ██████╗  ██████╗ ███╗   ███╗\n');
    p.primary('██╔══██╗██╔═══██╗██╔═══██╗████╗ ████║\n');
    p.primary('██║  ██║██║   ██║██║   ██║██╔████╔██║\n');
    p.primary('██║  ██║██║   ██║██║   ██║██║╚██╔╝██║\n');
    p.primary('██████╔╝╚██████╔╝╚██████╔╝██║ ╚═╝ ██║\n');
    p.primary('╚═════╝  ╚═════╝  ╚═════╝ ╚═╝     ╚═╝\n\n');
    p.secondary('DOOM (1993) running in ASCII...\n\n');
    for (let i = 0; i < 20; i++) {
      term(chalk.hex('#00ff00')(`${' '.repeat(Math.floor(Math.random()*20))}████████\n`));
      await new Promise(r => setTimeout(r, 50));
    }
    p.warning('\n⚠ Requires actual DOOM WAD file for real gameplay.\n');
    p.info('But the ASCII shoot-em-up is ready! 🔫\n\n');
  },

  matrixx: async (ctx) => {
    const p = ctx.paint;
    term.clear();
    term.hideCursor();
    p.primary('WAKE UP, NEO...\n\n');
    await new Promise(r => setTimeout(r, 1000));
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒヘホマミムメモヤユヨラリルレロワヲン0123456789';
    for (let frame = 0; frame < 80; frame++) {
      term.moveTo(1, 3);
      for (let i = 0; i < 20; i++) {
        const line = Array.from({length: 80}, () => {
          const c = chars[Math.floor(Math.random() * chars.length)];
          const bright = Math.random() > 0.7 ? '#00ff00' : '#003300';
          return chalk.hex(bright)(c);
        }).join('');
        term(line + '\n');
      }
      await new Promise(r => setTimeout(r, 100));
    }
    term.showCursor();
    p.success('\nYou escaped the Matrix.\n\n');
  },

  'sudo-supreme': async (ctx, args) => {
    const p = ctx.paint;
    if (!args) {
      p.accent('🔱 SUPREMO MODE: ACTIVE\n');
      p.info('You are now root. Use: sudo-supreme <command>\n\n');
      return;
    }
    p.warning(`⚠ Executing "${args}" with supreme privileges...\n`);
    await new Promise(r => setTimeout(r, 800));
    p.success(`✔ ${args} executed as SUPREMO\n\n`);
  },

  selfdestruct: async (ctx) => {
    const p = ctx.paint;
    p.error('⚠ SELF-DESTRUCT SEQUENCE INITIATED ⚠\n\n');
    for (let i = 5; i > 0; i--) {
      p.warning(`${i}...\n`);
      await new Promise(r => setTimeout(r, 800));
    }
    p.error('💥 BOOM!\n\n');
    await new Promise(r => setTimeout(r, 500));
    p.secondary('Just kidding. 😄\n\n');
    term(chalk.hex('#ff00ff')('(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧\n\n'));
  },

  catverse: async (ctx) => {
    const p = ctx.paint;
    const cats = [
      '  ∧＿∧\n ( ･ω･)\n ｜　｜\n (＿⊃＿)\n',
      '  ∧＿∧\n (｡･ω･｡)\n ｜　｜\n (⊃＿⊃)\n',
      '  ／￣￣＼\n ｜ ﾟωﾟ ｜\n ￣￣￣￣\n',
      '  ∧＿∧\n (　･∀･)\n ｜　⊃　\n (⊂　　)\n',
      '  ╱◕‿◕╲\n ｜　　　｜\n ｜　　　｜\n ╲　　　╱\n',
    ];
    term.clear();
    p.primary('🌈 CATVERSE — Infinite Cats! (CTRL+C to exit)\n\n');
    const catInterval = setInterval(() => {
      const cat = cats[Math.floor(Math.random() * cats.length)];
      const color = ['#ff69b4','#00ffff','#ffd700','#7fff00','#ff4500','#da70d6'][Math.floor(Math.random()*6)];
      term.moveTo(Math.floor(Math.random()*50)+1, Math.floor(Math.random()*10)+3);
      term(chalk.hex(color)(cat));
    }, 300);
    term.once('key', (name) => {
      if (name === 'CTRL_C') {
        clearInterval(catInterval);
        term.clear();
        term.showCursor();
        p.secondary('Cats returned to their dimension.\n\n');
      }
    });
  },
};

// ─── Descriptions ───
const descriptions = {
  fetch: 'Show system info with ASCII art',
  device: 'Display detailed device information',
  uptime: 'Show system uptime',
  process: 'List running processes',
  disk: 'Show disk usage',
  ping: 'Ping a host (usage: ping <host>)',
  network: 'Show network information',
  battery: 'Show battery status',
  ports: 'Show open ports',
  weather: 'Show weather forecast (usage: weather <city>)',
  matrix: 'Matrix rain effect',
  snake: 'Play Snake game',
  tetris: 'Play Tetris game',
  '2048': 'Play 2048 game',
  pong: 'Play Pong game',
  waifu: 'Show random waifu ASCII',
  hack: 'Hack the mainframe!',
  boot: 'Simulate system boot',
  coffee: 'Get a virtual coffee',
  fortune: 'Get a fortune cookie',
  joke: 'Tell a programming joke',
  randomfact: 'Show a random fact',
  easteregg: 'Find a hidden easter egg',
  notes: 'Quick notes (notes add/list/rm/clear)',
  todo: 'Task manager (todo add/list/done/rm/clear)',
  calendar: 'Show calendar',
  timer: 'Countdown timer (timer <seconds>)',
  stopwatch: 'Simple stopwatch',
  qr: 'Generate QR code (qr <text>)',
  theme: 'Change theme (theme <name>/list)',
  config: 'View/edit config (config show/set/open)',
  alias: 'Manage command aliases',
  pkg: 'Plugin manager (pkg install/list/remove)',
  dashboard: 'Real-time system dashboard',
  shell: 'Interactive system shell',
  ai: 'Ask AI a question (ai <prompt>)',
  chat: 'Interactive AI chat mode',
  music: 'Music controls (simulated)',
  clear: 'Clear the screen',
  exit: 'Exit TERMS',
  help: 'Show this help message',
  compile: 'Compile & run source code (C, C++, Python, Java, etc.)',
  konami: '↑↑↓↓←→←→BA — activate konami code',
  doom: 'ASCII DOOM teaser',
  matrixx: 'Enhanced Matrix rain',
  'sudo-supreme': 'Execute commands as SUPREME',
  selfdestruct: 'Self-destruct sequence',
  catverse: '🌈 Infinite cats!',
};

// ─── Main loop ───
async function main() {
  const cfg = configLoader.load();
  let ctx = createContext(cfg.theme);
  const chalk = require('chalk').default;

  // Custom Boot Sequence
  const BOOT_STEPS = [
    'Loading TERMS Core',
    'Starting Dashboard',
    'Loading Plugins',
    'Initializing Shell',
    'Loading Theme Engine',
    'Starting AI Module'
  ];

  for (const step of BOOT_STEPS) {
    term(chalk.hex(ctx.theme.success)('[ OK ] '));
    term(step + '\n');
    await new Promise(r => setTimeout(r, 150));
  }

  await new Promise(r => setTimeout(r, 500));

  // Load new dashboard
  const { renderDashboard } = require('../utils/dashboard');
  renderDashboard(term, ctx);

  while (true) {
    try {
      const chalk = require('chalk').default;
      const info = getSystemInfo();
      const userStr = chalk.hex(ctx.theme.accent || '#ff79c6')(info.user);
      const hostStr = chalk.hex(ctx.theme.info || '#8be9fd')(info.hostname);
      const pathStr = chalk.hex(ctx.theme.success || '#50fa7b')('~');

      // Render Linux-style prompt: user@hostname:~$
      term(`${userStr}@${hostStr}:${pathStr}$ `);

      const input = await new Promise(resolve => {
        term.inputField({ cancelable: true }, (err, input) => {
          if (err) resolve('');
          resolve(input || '');
        });
      });

      term('\n');

      if (!input.trim()) continue;

      // Parse command and args
      const spaceIdx = input.indexOf(' ');
      const cmdName = spaceIdx > 0 ? input.slice(0, spaceIdx).toLowerCase() : input.toLowerCase();
      const args = spaceIdx > 0 ? input.slice(spaceIdx + 1).trim() : '';

      // Check builtins
      if (builtins[cmdName]) {
        await builtins[cmdName](ctx, args);
        continue;
      }

      // Check alias
      const aliasCmd = configLoader.resolveAlias(cmdName);
      if (aliasCmd) {
        const fullCmd = aliasCmd + (args ? ' ' + args : '');
        const si = fullCmd.indexOf(' ');
        const aliasName = si > 0 ? fullCmd.slice(0, si).toLowerCase() : fullCmd.toLowerCase();
        const aliasArgs = si > 0 ? fullCmd.slice(si + 1) : '';
        if (builtins[aliasName]) {
          await builtins[aliasName](ctx, aliasArgs);
          continue;
        }
        if (await commands.execute(aliasName, term, ctx, aliasArgs)) continue;
      }

      // Check plugin command
      if (cmdName === 'pkg') {
        await handlePkg(ctx, args);
        continue;
      }

      // Check dashboard
      if (cmdName === 'dashboard') {
        await handleDashboard(ctx);
        continue;
      }

      // Check shell
      if (cmdName === 'shell') {
        await shell.interactive(term, ctx);
        continue;
      }

      // Check AI
      if (cmdName === 'ai') {
        await handleAI(ctx, args);
        continue;
      }

      if (cmdName === 'chat') {
        await handleChat(ctx);
        continue;
      }

      // Check music
      if (cmdName === 'music') {
        handleMusic(ctx, args);
        continue;
      }

      // Try plugin/game commands (now properly awaited)
      if (await commands.execute(cmdName, term, ctx, args)) continue;

      // Fallback: shell (now properly awaited)
      await shell.exec(term, ctx, input);

    } catch (err) {
      if (err.message === 'canceled' || err.code === 'SIGINT') {
        term.green('\nExiting...\n');
        process.exit(0);
      }
      if (err.code === 'ERR_USE_AFTER_CLOSE') process.exit(0);
      ctx.paint.error(`\nError: ${err.message}\n\n`);
    }
  }
}

// ─── Package Manager ───
async function handlePkg(ctx, args) {
  const p = ctx.paint;
  if (!args || args === 'list') {
    p.primary('📦 Installed Plugins\n\n');
    p.secondary('Plugin system active.\n');
    p.info('Use: pkg install <name>\n\n');
    return;
  }

  if (args.startsWith('install ')) {
    const pkgName = args.slice(8).trim();
    p.primary(`Installing plugin: ${pkgName}...\n\n`);
    await new Promise(r => setTimeout(r, 1000));
    p.warning('⚠ Plugin registry coming soon.\n');
    p.info(`To create a plugin, add a folder in plugins/${pkgName}/\n\n`);
    return;
  }

  if (args.startsWith('remove ')) {
    p.primary(`Removing plugin: ${args.slice(7).trim()}...\n\n`);
    p.info('Plugin removal coming soon.\n\n');
    return;
  }
}

// ─── Dashboard ───
async function handleDashboard(ctx) {
  const os = require('os');
  term.clear();
  term.hideCursor();

  return new Promise(resolve => {
    const interval = setInterval(() => {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPct = ((usedMem / totalMem) * 100).toFixed(1);
      const loadAvg = os.loadavg()[0];
      const cpuPct = ((loadAvg / os.cpus().length) * 100).toFixed(1);
      const uptime = os.uptime();
      const now = new Date();

      term.moveTo(1, 1);
      term.eraseDisplayBelow();
      ctx.paint.primary('╔══════════════════════════════════════╗\n');
      ctx.paint.primary('║       TERMS DASHBOARD');
      term('          ║\n');
      ctx.paint.primary('╠══════════════════════════════════════╣\n');

      // CPU
      term('║ ');
      ctx.paint.secondary('CPU');
      term('     ');
      const cpuFill = Math.min(Math.round(parseFloat(cpuPct) / 100 * 20), 20);
      ctx.paint.primary('█'.repeat(cpuFill));
      term('░'.repeat(20 - cpuFill));
      term(` ${cpuPct}%`.padStart(36 - 20, ' ') + '║\n');

      // RAM
      term('║ ');
      ctx.paint.secondary('RAM');
      term('     ');
      const memFill = Math.min(Math.round((usedMem / totalMem) * 20), 20);
      ctx.paint.success('█'.repeat(memFill));
      term('░'.repeat(20 - memFill));
      term(` ${memPct}%`.padStart(36 - 20, ' ') + '║\n');

      // Time
      term('║ ');
      ctx.paint.secondary('Time');
      term('     ');
      term(`${now.toLocaleTimeString()}`.padStart(40));
      term('║\n');

      // Uptime
      term('║ ');
      ctx.paint.secondary('Uptime');
      term('   ');
      term(`${formatUptime(uptime)}`.padStart(40));
      term('║\n');

      ctx.paint.primary('╚══════════════════════════════════════╝\n');
      term('Press ');
      ctx.paint.accent('CTRL+C');
      term(' to exit\n');
    }, 1000);

    // Fix: use term.on and re-listen, so non-CTRL_C keys don't break it
    const onKey = (name) => {
      if (name === 'CTRL_C') {
        term.removeListener('key', onKey);
        clearInterval(interval);
        term.showCursor();
        term.clear();
        resolve();
      }
    };
    term.on('key', onKey);
  });
}

// ─── AI Assistant ───
async function handleAI(ctx, prompt) {
  const p = ctx.paint;
  if (!prompt) {
    p.error('Usage: ai <question>\n\n');
    return;
  }

  p.primary('[AI Assistant]\n\n');
  p.info('Thinking...\n\n');

  // Simulated AI response
  await new Promise(r => setTimeout(r, 800));

  const responses = {
    'express': '1. Install Vercel CLI: npm i -g vercel\n2. vercel login\n3. vercel deploy\n4. Configure env vars\n5. Done!',
    'react': '1. npx create-react-app my-app\n2. cd my-app\n3. npm start\nFor Next.js: npx create-next-app@latest',
    'node': 'Node.js is a JS runtime. Key features:\n- Event-driven, non-blocking I/O\n- npm ecosystem\n- Great for APIs, CLIs, real-time apps',
    'python': 'Python is versatile. For:\n- Web: Flask/Django\n- Data: Pandas/NumPy\n- AI: PyTorch/TensorFlow\n- CLI: Click/Argparse',
    'docker': '1. Write Dockerfile\n2. docker build -t myapp .\n3. docker run myapp\n4. docker compose for multi-service',
  };

  const lower = prompt.toLowerCase();
  let answer = '';

  Object.keys(responses).forEach(key => {
    if (lower.includes(key)) answer = responses[key];
  });

  if (!answer) {
    answer = `Great question about "${prompt}"!\n\n` +
      `Here are general steps:\n` +
      `1. Research the topic thoroughly\n` +
      `2. Plan your approach\n` +
      `3. Implement step by step\n` +
      `4. Test and iterate\n\n` +
      `For a more specific answer, please provide more details.`;
  }

  p.secondary(answer + '\n\n');
}

async function handleChat(ctx) {
  const p = ctx.paint;
  p.primary('💬 AI Chat Mode\n');
  p.secondary('Type your messages. Type /exit to quit.\n\n');

  while (true) {
    try {
      const { Input } = require('enquirer');
      const inputPrompt = new Input({
        name: 'chat',
        message: 'You:'
      });
      const message = await inputPrompt.run();
      if (!message) continue;
      if (message.toLowerCase() === '/exit' || message.toLowerCase() === '/quit') {
        p.info('Exiting chat mode.\n\n');
        return;
      }

      p.primary('\nAI: ');
      await new Promise(r => setTimeout(r, 500));
      p.secondary(`You said: "${message}"\n`);
      p.info('AI chat requires an API key (configure via "config set ai.apiKey=<key>").\n\n');
    } catch (e) {
      if (e.message === 'canceled') return;
      throw e;
    }
  }
}

// ─── Music ───
function handleMusic(ctx, args) {
  const p = ctx.paint;
  if (!args) {
    p.primary('🎵 Music Controls\n\n');
    p.secondary('Commands:\n');
    term('  music play <song> — Play a song\n');
    term('  music stop       — Stop playback\n');
    term('  music status     — Show current track\n\n');
    p.warning('⚠ Music requires optional player integration.\n\n');
    return;
  }

  if (args === 'status') {
    p.primary('🎵 Now Playing:\n\n');
    p.secondary('No track currently playing.\n\n');
  } else if (args === 'stop') {
    p.success('⏹ Playback stopped.\n\n');
  } else if (args.startsWith('play ')) {
    const song = args.slice(5);
    p.primary(`▶ Now Playing: ${song}\n\n`);
    p.secondary('[────────────────────] 0:00 / 3:30\n\n');
    p.info('Simulated playback — real audio requires integration.\n\n');
  }
}

if (require.main === module) main();
module.exports = main;
