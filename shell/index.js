const { spawn } = require('child_process');
const chalk = require('chalk').default;

// ─── BLOCKED DANGEROUS COMMANDS ───
const BLOCKED_PATTERNS = [
  /^rm\s+-rf\s+\//i,
  /^format\s+/i,
  /^del\s+\/f/i,
  /^rd\s+\/s/i,
  /^shutdown\s+\/r/i,
  /^taskkill\s+\/f/i,
  /^reg\s+delete/i,
  /^cipher\s+\/w/i,
  /^diskpart/i,
  /^attrib\s+-r\s+-s/i,
];

function sanitize(input) {
  // Strip control characters
  let safe = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Limit length
  if (safe.length > 4096) safe = safe.slice(0, 4096);
  return safe;
}

function isBlocked(cmd) {
  const trimmed = cmd.trim();
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  // Block commands with too many special chars (potential injection)
  const dangerous = (trimmed.match(/[&|;`$(){}\[\]]/g) || []).length;
  if (dangerous > 4) return true;
  return false;
}

module.exports = {
  interactive(term, ctx) {
    return new Promise((resolve) => {
      term.clear();
      term(chalk.hex(ctx.theme.primary)('Entering interactive shell (cmd.exe).\n'));
      term(chalk.hex(ctx.theme.info)('Type EXIT to return to TERMS.\n'));
      term(chalk.hex(ctx.theme.warning)('⚠ Security: dangerous commands are blocked.\n\n'));

      const child = spawn('cmd.exe', [], {
        stdio: [process.stdin, process.stdout, process.stderr],
        shell: true
      });

      child.on('exit', () => {
        term.green('\nReturned to TERMS.\n');
        resolve();
      });

      child.on('error', (err) => {
        term(chalk.hex(ctx.theme.error)(`Shell error: ${err.message}\n`));
        resolve();
      });
    });
  },

  exec(term, ctx, command) {
    return new Promise((resolve) => {
      const safe = sanitize(command);

      if (isBlocked(safe)) {
        term(chalk.hex(ctx.theme.error)(`⛔ Blocked: "${safe.slice(0, 60)}" is not allowed for security reasons.\n\n`));
        resolve();
        return;
      }

      // Log command to history for "last" command
      const history = global.__TERMS_HISTORY || [];
      history.push({ cmd: safe, time: new Date().toISOString() });
      if (history.length > 100) history.shift();
      global.__TERMS_HISTORY = history;

      const child = spawn('cmd.exe', ['/c', safe], {
        stdio: [process.stdin, process.stdout, process.stderr],
        // Don't use shell:true for /c mode to prevent injection
      });

      child.on('exit', (code) => {
        if (code && code !== 0) {
          term(chalk.hex(ctx.theme.secondary)(`\n[Exit code: ${code}]\n`));
        }
        resolve();
      });

      child.on('error', (err) => {
        term(chalk.hex(ctx.theme.error)(`Command error: ${err.message}\n`));
        resolve();
      });
    });
  }
};
