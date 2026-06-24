const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk').default;
const { formatUptime } = require('../utils/helpers');

const DATA_DIR = path.join(os.homedir(), '.terms');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const TODO_FILE = path.join(DATA_DIR, 'todo.json');
const CALENDAR_FILE = path.join(DATA_DIR, 'calendar.json');

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return []; }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = [
  {
    name: 'Notes',
    exec: async (term, ctx, args) => {
      const notes = readJSON(NOTES_FILE);
      if (!args || args === 'list') {
        ctx.paint.primary('📝 Notes:\n\n');
        if (!notes.length) {
          ctx.paint.secondary('No notes yet. Use: notes add <text>\n\n');
          return;
        }
        notes.forEach((n, i) => {
          term(`${String(i + 1).padEnd(3)} `);
          ctx.paint.secondary(`${n}\n`);
        });
        term('\n');
      } else if (args.startsWith('add ')) {
        const text = args.slice(4);
        notes.push(text);
        writeJSON(NOTES_FILE, notes);
        ctx.paint.success('✓ Note added!\n\n');
      } else if (args.startsWith('rm ')) {
        const idx = parseInt(args.slice(3)) - 1;
        if (idx >= 0 && idx < notes.length) {
          notes.splice(idx, 1);
          writeJSON(NOTES_FILE, notes);
          ctx.paint.success('✓ Note removed!\n\n');
        } else {
          ctx.paint.error('Invalid note number.\n\n');
        }
      } else if (args === 'clear') {
        writeJSON(NOTES_FILE, []);
        ctx.paint.success('✓ All notes cleared!\n\n');
      }
    }
  },

  {
    name: 'Todo',
    exec: async (term, ctx, args) => {
      const todos = readJSON(TODO_FILE);
      if (!args || args === 'list') {
        ctx.paint.primary('📋 Todo List:\n\n');
        if (!todos.length) {
          ctx.paint.secondary('No tasks. Use: todo add <task>\n\n');
          return;
        }
        todos.forEach((t, i) => {
          const mark = t.done ? '✓' : '○';
          const color = t.done ? ctx.theme.success : ctx.theme.secondary;
          term(chalk.hex(color)(`${String(i + 1).padEnd(3)} ${mark} ${t.text}\n`));
        });
        term('\n');
      } else if (args.startsWith('add ')) {
        const text = args.slice(4);
        todos.push({ text, done: false, createdAt: new Date().toISOString() });
        writeJSON(TODO_FILE, todos);
        ctx.paint.success('✓ Task added!\n\n');
      } else if (args.startsWith('done ')) {
        const idx = parseInt(args.slice(5)) - 1;
        if (idx >= 0 && idx < todos.length) {
          todos[idx].done = true;
          writeJSON(TODO_FILE, todos);
          ctx.paint.success('✓ Task marked done!\n\n');
        } else {
          ctx.paint.error('Invalid task number.\n\n');
        }
      } else if (args.startsWith('rm ')) {
        const idx = parseInt(args.slice(3)) - 1;
        if (idx >= 0 && idx < todos.length) {
          todos.splice(idx, 1);
          writeJSON(TODO_FILE, todos);
          ctx.paint.success('✓ Task removed!\n\n');
        } else {
          ctx.paint.error('Invalid task number.\n\n');
        }
      } else if (args === 'clear') {
        writeJSON(TODO_FILE, []);
        ctx.paint.success('✓ All tasks cleared!\n\n');
      }
    }
  },

  {
    name: 'Timer',
    exec: async (term, ctx, args) => {
      const secs = parseInt(args);
      if (!secs || secs < 1) {
        ctx.paint.error('Usage: timer <seconds>\n\n');
        return;
      }
      ctx.paint.primary(`⏱ Timer set for ${secs}s\n\n`);
      for (let i = secs; i > 0; i--) {
        term.eraseLine();
        ctx.paint.info(`Time remaining: ${formatUptime(i)}\n`);
        await new Promise(r => setTimeout(r, 1000));
      }
      term.eraseLine();
      ctx.paint.success('⏰ Time\'s up!\n\n');
    }
  },

  {
    name: 'Stopwatch',
    exec: async (term, ctx) => {
      ctx.paint.primary('⏱ Stopwatch started. Press any key to stop.\n\n');
      const start = Date.now();

      const display = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        term.eraseLine();
        ctx.paint.info(`Elapsed: ${formatUptime(elapsed)}\n`);
      }, 200);

      await new Promise(resolve => {
        // Fix: accept any key to stop (not just ENTER)
        const onKey = () => {
          term.removeListener('key', onKey);
          clearInterval(display);
          const final = Math.floor((Date.now() - start) / 1000);
          term.eraseLine();
          ctx.paint.success(`⏱ Stopped at ${formatUptime(final)}\n\n`);
          resolve();
        };
        term.once('key', onKey);
      });
    }
  },

  {
    name: 'Calendar',
    exec: async (term, ctx, args) => {
      const now = new Date();
      const year = args ? parseInt(args) || now.getFullYear() : now.getFullYear();
      const month = now.getMonth();

      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

      ctx.paint.primary(`${months[month]} ${year}\n`);
      ctx.paint.secondary('Su Mo Tu We Th Fr Sa\n');

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = now.getDate();
      const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

      let line = '   '.repeat(firstDay);
      for (let d = 1; d <= daysInMonth; d++) {
        if (isCurrentMonth && d === today) {
          line += chalk.hex(ctx.theme.accent)(` ${String(d).padStart(2)}`);
        } else {
          line += ` ${String(d).padStart(2)}`;
        }
        if ((firstDay + d) % 7 === 0) {
          term(line + '\n');
          line = '';
        }
      }
      if (line) term(line + '\n');
      term('\n');
    }
  },

  {
    name: 'QR Generate',
    exec: async (term, ctx, args) => {
      if (!args) {
        ctx.paint.error('Usage: qr <text>\n\n');
        return;
      }
      ctx.paint.warning('⚠ QR generation requires optional "qrcode" package.\n');
      ctx.paint.secondary('Install with: npm install qrcode\n\n');
      ctx.paint.info(`QR requested for: ${args}\n\n`);

      try {
        const qrcode = require('qrcode');
        const out = await qrcode.toString(args, { type: 'terminal', small: true });
        term(out + '\n');
      } catch {
        ctx.paint.secondary('┌──────────────────────────┐\n');
        ctx.paint.secondary('│                          │\n');
        ctx.paint.secondary('│   [QR Code Placeholder]  │\n');
        ctx.paint.secondary('│                          │\n');
        ctx.paint.secondary('│   npm install qrcode     │\n');
        ctx.paint.secondary('│                          │\n');
        ctx.paint.secondary('└──────────────────────────┘\n');
        ctx.paint.info(`Data: ${args}\n\n`);
      }
    }
  }
];
