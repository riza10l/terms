const chalk = require('chalk').default;
const SaveManager = require('../engine/SaveManager');

const COMMAND_SETS = {
  linux: [
    'ls -la',
    'ps aux | grep node',
    'chmod +x script.sh',
    'grep -r "error" /var/log',
    'sudo systemctl restart nginx',
    'tail -f /var/log/syslog',
    'find . -name "*.js" -type f',
    'df -h --total',
    'rsync -avz source/ dest/',
    'tar -czvf backup.tar.gz ./data',
  ],
  git: [
    'git status',
    'git add . && git commit -m "fix"',
    'git push origin main',
    'git checkout -b feature/ai',
    'git log --oneline -10',
    'git rebase -i HEAD~3',
    'git stash list',
    'git diff --cached',
    'git reset --soft HEAD~1',
    'git merge --no-ff feature-branch',
  ],
  docker: [
    'docker compose up -d',
    'docker ps -a --format "table"',
    'docker logs -f container_name',
    'docker exec -it container bash',
    'docker system prune -af',
    'docker build -t myapp:latest .',
    'docker compose down --volumes',
    'docker image ls --all',
    'docker network ls',
    'docker volume inspect data_vol',
  ],
  node: [
    'npm init -y',
    'node --experimental-modules app.mjs',
    'npm run build && npm test',
    'npx create-next-app@latest my-app',
    'npm outdated --depth=0',
    'node --inspect-brk index.js',
    'npx eslint src/ --fix',
    'npm ci --only=production',
    'node --max-old-space-size=4096 app.js',
    'npx ts-node --transpile-only src/index.ts',
    'npm audit --production',
    'npx prisma migrate dev --name init',
  ],
  n8n: [
    'n8n start --tunnel',
    'n8n export workflow --id=abc123',
    'n8n import workflow --file=workflow.json',
    'n8n update --channel=nightly',
    'n8n execute workflow --id=abc --wait',
    'n8n export --all --output=./backup',
    'n8n import credential --file=cred.json',
    'n8n start --config=config/n8n.env',
  ],
};

const ALL_COMMANDS = Object.values(COMMAND_SETS).flat();
const MODES = ['linux', 'git', 'docker', 'node', 'n8n'];

async function shellRacer(term, ctx) {
  const p = ctx.paint;

  // ─── Mode Selection ───
  p.primary('╔══════════════════════════════════════════╗\n');
  p.primary('║            SHELL RACER                  ║\n');
  p.primary('╚══════════════════════════════════════════╝\n\n');
  p.secondary('Pilih mode:\n\n');
  MODES.forEach((m, i) => p.info(`  [${i + 1}] ${m.padEnd(10)}`));
  term(`\n  [${MODES.length + 1}] `);
  p.info('Mixed (all commands)\n\n');
  p.secondary('Pilih mode (1-6) atau Q untuk quit:\n');

  let selectedMode = null;
  let modeKey = null;

  // Get mode via input
  term.inputField({ cancelable: true }, (err, input) => {
    if (err || !input) {
      term.clear();
      return;
    }
    const choice = parseInt(input.trim());
    if (choice >= 1 && choice <= MODES.length) {
      selectedMode = MODES[choice - 1];
      modeKey = selectedMode;
    } else if (choice === MODES.length + 1) {
      selectedMode = ALL_COMMANDS;
      modeKey = 'mixed';
    } else {
      selectedMode = ALL_COMMANDS;
      modeKey = 'mixed';
    }
    startGame();
  });

  function startGame() {
    const commands = selectedMode === ALL_COMMANDS
      ? ALL_COMMANDS.sort(() => Math.random() - 0.5)
      : [...COMMAND_SETS[selectedMode]].sort(() => Math.random() - 0.5);

    const totalCommands = Math.min(commands.length, 10);
    let current = 0;
    let correctChars = 0;
    let totalChars = 0;
    let startTime = Date.now();
    let gameOver = false;

    const showPrompt = () => {
      if (current >= totalCommands || gameOver) {
        finishGame();
        return;
      }

      term.clear();
      term.hideCursor();

      p.primary('╔══════════════════════════════════════════╗\n');
      p.primary('║            SHELL RACER                  ║\n');
      p.primary('╚══════════════════════════════════════════╝\n\n');

      p.info(`Mode: ${chalk.hex(ctx.theme.accent)(modeKey.padEnd(12))}`);
      p.secondary(`Round: ${current + 1}/${totalCommands}\n\n`);

      // Show the command to type
      p.warning('Type this command:\n\n');
      term(chalk.hex('#00ff88')(`  $ ${commands[current]}`) + '\n\n\n');

      p.secondary('Ketik command di atas, lalu tekan Enter:\n');
      p.secondary('(q to quit)\n\n');
    };

    const finishGame = () => {
      gameOver = true;
      term.showCursor();
      term.clear();

      const elapsed = (Date.now() - startTime) / 1000;
      const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
      const wpm = elapsed > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0;
      const rawScore = Math.round(wpm * (accuracy / 100) * 10);
      const profile = SaveManager.loadProfile();
      const oldXp = profile.xp;

      SaveManager.addXp(rawScore);
      SaveManager.addScore('shell-racer', profile.username, rawScore, `${wpm}wpm`);

      SaveManager.unlockAchievement('shell-racer');
      if (wpm >= 60) SaveManager.unlockAchievement('high-speed');
      if (profile.level >= 5) SaveManager.unlockAchievement('level-5');
      if (profile.level >= 10) SaveManager.unlockAchievement('level-10');

      p.primary('╔══════════════════════════════════════════╗\n');
      p.primary('║            SHELL RACER — DONE            ║\n');
      p.primary('╚══════════════════════════════════════════╝\n\n');

      p.info(`WPM      : ${chalk.hex(ctx.theme.accent)(String(wpm))}\n`);
      p.info(`Accuracy : ${chalk.hex(ctx.theme.success)(`${accuracy}%`)}\n`);
      p.info(`Rounds   : ${current}/${totalCommands}\n`);
      p.info(`Score    : ${rawScore}\n`);
      p.warning(`XP gained: +${rawScore}\n`);
      p.secondary(`XP       : ${oldXp} → ${profile.xp}\n\n`);

      // Grade
      let grade = 'F';
      if (wpm >= 90) grade = 'S';
      else if (wpm >= 75) grade = 'A';
      else if (wpm >= 60) grade = 'B';
      else if (wpm >= 45) grade = 'C';
      else if (wpm >= 30) grade = 'D';
      p.primary(`Grade: `);
      const gradeColors = { S: '#ffd700', A: '#00ff88', B: '#00aaff', C: '#ffaa00', D: '#ff6600', F: '#ff4444' };
      term(chalk.hex(gradeColors[grade] || '#ff4444')(`${grade}\n\n`));
    };

    const nextRound = () => {
      if (current >= totalCommands || gameOver) return finishGame();
      showPrompt();

      const cmd = commands[current];

      term.inputField({ cancelable: true }, (err, input) => {
        if (err) { gameOver = true; finishGame(); return; }
        if (input == null) { gameOver = true; finishGame(); return; }

        const typed = input.trim();
        if (!typed) { nextRound(); return; }

        // Calculate accuracy
        const minLen = Math.min(typed.length, cmd.length);
        for (let i = 0; i < minLen; i++) {
          if (typed[i] === cmd[i]) correctChars++;
          totalChars++;
        }
        totalChars += Math.abs(typed.length - cmd.length);

        if (typed === cmd) {
          p.success('\n✅ Perfect!\n');
          current++;
          setTimeout(nextRound, 400);
        } else {
          p.error('\n❌ Tidak cocok. Coba lagi!\n');
          p.secondary(`Expected: ${chalk.hex('#ff6b6b')(cmd)}\n`);
          p.secondary(`Got:      ${chalk.hex('#ffaa00')(typed)}\n\n`);
          // Still move on after showing the difference
          current++;
          setTimeout(nextRound, 1000);
        }
      });
    };

    nextRound();
  }
}

module.exports = { play: shellRacer };
