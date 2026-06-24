module.exports = function help(term, ctx) {
  const p = ctx.paint;
  term('\n');
  p.primary('╔══════════════════════════════════════════╗\n');
  p.primary('║            TERMS v2 — Linux Mode         ║\n');
  p.primary('╚══════════════════════════════════════════╝\n\n');

  p.secondary('Usage: type a command and press Enter.\n');
  p.info('Tab completion available for file paths.\n\n');

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
      ['compile',    'Compile & run source code (c, cpp, py, js, java, rs, go, ...)'],
      ['compile build <file>', 'Compile only (no run)'],
      ['compile run <file>',   'Run without recompiling'],
      ['compile list',         'Show all supported languages'],
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
      term(`  ${p.secondary(cmd.padEnd(22))} ${desc}\n`);
    });
    term('\n');
  });

  p.secondary('─'.repeat(50) + '\n');
  p.info('Any unrecognized command is passed to the system shell.\n');
  p.info('Tip: Use Tab to autocomplete file paths.\n\n');
};
