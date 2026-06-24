const chalk = require('chalk').default;
const { getRandomAscii } = require('../utils/helpers');

const HACK_STEPS = [
  'Initializing connection...',
  'Bypassing firewall... ███████░░░',
  'Decrypting TLS handshake...',
  'Spoofing MAC address...',
  'Establishing secure tunnel...',
  'Injecting payload... ██████████',
  'Access Granted.',
  '',
  '┌─────────────────────────────────┐',
  '│  ACCESS LEVEL: ADMIN            │',
  '│  SYSTEM: ████████████           │',
  '│  IP: 192.168.✶.✶                │',
  '│  STATUS: Connected              │',
  '└─────────────────────────────────┘',
];

const BOOT_STEPS = [
  'TERMS v2.0 — Booting sequence initiated',
  '──────────────────────────────────────',
  '[  OK  ] Initializing hardware...',
  '[  OK  ] Loading kernel modules...',
  '[  OK  ] Starting Network Service...',
  '[  OK  ] Starting Audio Service...',
  '[  OK  ] Mounting filesystems...',
  '[  OK  ] Loading TERMS Core Engine...',
  '[  OK  ] Enabling Theme Engine...',
  '[  OK  ] Starting Plugin Manager...',
  '[  OK  ] Loading AI Assistant...',
  '[DONE  ] System ready.',
  '',
  '  Welcome to TERMS v2.0',
  '  Type \'help\' to get started.',
];

const JOKES = [
  'Why do programmers prefer dark mode? Because light attracts bugs!',
  'How many programmers does it take to change a light bulb? None — that\'s a hardware problem.',
  'Why did the developer go broke? Because he used up all his cache.',
  'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
  'What do you call a programmer from Finland? Nerdic.',
  'There are 10 types of people: those who understand binary and those who don\'t.',
  'Why was the JavaScript developer sad? Because he didn\'t Node how to Express himself.',
  'I told my computer I needed a break. It wouldn\'t stop sending me vacation ads.',
  '99 little bugs in the code, 99 little bugs. Take one down, patch it around, 117 little bugs in the code.',
];

const FACTS = [
  'The first computer virus was created in 1983 and was called "Elk Cloner".',
  'The world\'s first programmer was Ada Lovelace, who wrote the first algorithm in the 1840s.',
  'More than 80% of the world\'s data was created in the last few years.',
  'The first computer mouse was made of wood.',
  'The term "bug" came from a real moth found inside a computer in 1947.',
  'The first 1 GB hard drive in 1980 weighed over 500 pounds and cost $40,000.',
  'CAPTCHA stands for "Completely Automated Public Turing test to tell Computers and Humans Apart".',
  'The QWERTY keyboard layout was designed to slow typists down.',
  'There are over 700 programming languages in existence.',
];

const EASTER_EGGS = [
  'You found an easter egg! 🥚',
  'Did you know? TERMS was built with love for Riza Wahyu.',
  '42 is the answer to life, the universe, and everything.',
  'There is no cow level.',
  'The cake is a lie.',
  'All your base are belong to us.',
  'Konami Code: ↑↑↓↓←→←→BA',
  'You wouldn\'t download a car... but you can download TERMS!',
  '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧  Magic!',
];

const COFFEE_TYPES = [
  '☕ Espresso — Strong and bold',
  '☕ Cappuccino — Smooth and creamy',
  '☕ Latte — Warm and comforting',
  '☕ Americano — Simple and classic',
  '☕ Mocha — Sweet and indulgent',
  '☕ Macchiato — A little kick',
  '☕ Cold Brew — Smooth and chilled',
];

module.exports = [
  {
    name: 'Hack',
    exec: async (term, ctx) => {
      term.clear();
      term.green('Initializing hack sequence...\n\n');
      for (const step of HACK_STEPS) {
        term(chalk.hex('#00ff41')(step + '\n'));
        await new Promise(r => setTimeout(r, 400));
      }
      term('\n');
    }
  },

  {
    name: 'Boot',
    exec: async (term, ctx) => {
      term.clear();
      for (const step of BOOT_STEPS) {
        if (step.startsWith('[  OK  ]')) term(chalk.hex('#00ff00')(step + '\n'));
        else if (step.startsWith('[DONE  ]')) term(chalk.hex('#00ff00').bold(step + '\n'));
        else term(step + '\n');
        await new Promise(r => setTimeout(r, 300));
      }
      term('\n');
    }
  },

  {
    name: 'Coffee',
    exec: async (term, ctx) => {
      const coffee = COFFEE_TYPES[Math.floor(Math.random() * COFFEE_TYPES.length)];
      ctx.paint.primary('(´▽`)/');
      ctx.paint.info(' Here\'s your coffee!\n\n');
      ctx.paint.secondary(`${coffee}\n\n`);
      term('Enjoy! ☕\n\n');

      // Show simulated coffee art
      term(chalk.hex('#8B4513')('  ( (\n'));
      term(chalk.hex('#6B3410')('   ) )\n'));
      term(chalk.hex('#A0522D')('  ........\n'));
      term(chalk.hex('#D2691E')('  |      |] \n'));
      term(chalk.hex('#D2691E')('  \\      / \n'));
      term(chalk.hex('#D2691E')('   `----`\n\n'));
    }
  },

  {
    name: 'Fortune',
    exec: async (term, ctx) => {
      const fortunes = [
        'A beautiful, smart, and loving person will be coming into your life.',
        'A dubious friend may be an enemy in camouflage.',
        'A fresh start will put you on your way.',
        'A lifetime of happiness lies ahead of you.',
        'Adventure awaits you around the corner.',
        'Believe in yourself and others will too.',
        'Don\'t be afraid to take that big step.',
        'Good news will come to you by mail.',
        'Happiness is around the corner, keep walking!',
        'Now is the time to try something new.',
        'The best is yet to come.',
        'You will achieve greatness in the coding world.',
        'Your code will compile on the first try.',
        'A bug-free release is in your future.',
        'Your terminal skills will impress many.',
      ];
      ctx.paint.primary('🔮 Fortune:\n\n');
      ctx.paint.secondary(fortunes[Math.floor(Math.random() * fortunes.length)] + '\n\n');
    }
  },

  {
    name: 'Joke',
    exec: async (term, ctx) => {
      ctx.paint.primary('😂 ');
      ctx.paint.info(JOKES[Math.floor(Math.random() * JOKES.length)] + '\n\n');
    }
  },

  {
    name: 'Random Fact',
    exec: async (term, ctx) => {
      ctx.paint.primary('📚 Did you know?\n\n');
      ctx.paint.secondary(FACTS[Math.floor(Math.random() * FACTS.length)] + '\n\n');
    }
  },

  {
    name: 'Easter Egg',
    exec: async (term, ctx) => {
      ctx.paint.accent('🎉 ');
      ctx.paint.info(EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)] + '\n\n');
      if (Math.random() > 0.7) {
        term(chalk.hex('#ff00ff')(getRandomAscii() + '\n\n'));
      }
    }
  },

  {
    name: 'Matrix Effect',
    exec: async (term, ctx) => {
      term.clear();
      term.hideCursor();
      term.green('Entering the Matrix... (CTRL+C to exit)\n\n');

      const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
      const columns = Math.floor(process.stdout.columns || 80);

      const interval = setInterval(() => {
        for (let i = 0; i < 5; i++) {
          const col = Math.floor(Math.random() * columns);
          const char = chars[Math.floor(Math.random() * chars.length)];
          const r = Math.floor(Math.random() * 256);
          term(chalk.hex(`#00${r.toString(16).padStart(2, '0')}00`)(char));
        }
      }, 50);

      return new Promise(resolve => {
        // Fix: use term.on so non-CTRL_C keys don't kill the listener
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
  },

  {
    name: 'Waifu',
    exec: async (term, ctx) => {
      ctx.paint.accent(getRandomAscii() + '\n\n');
      ctx.paint.info('Your waifu appeared!\n\n');
      const waifus = [
        '(◕‿◕)♡ — Senpai noticed you!',
        '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ — Magical girl power!',
        '♡ (っ˘ω˘ς) ♡ — Cute and cozy!',
        '(◣_◢) — Tsundere mode!',
        '〆(･ω･。) — Quiet and mysterious...',
      ];
      ctx.paint.secondary(waifus[Math.floor(Math.random() * waifus.length)] + '\n\n');
    }
  }
];
