const chalk = require('chalk').default;
const SaveManager = require('./SaveManager');

class GameManager {
  constructor() {
    this.games = new Map();
  }

  register(game) {
    if (!game.id || !game.name || !game.play) {
      throw new Error(`Game must have id, name, and play(): ${JSON.stringify(game)}`);
    }
    this.games.set(game.id, game);
  }

  get(id) {
    return this.games.get(id);
  }

  list() {
    return Array.from(this.games.values());
  }

  async showMenu(term, ctx) {
    const p = ctx.paint;
    term.clear();
    term.hideCursor();

    // ─── Header ───
    p.primary('╔══════════════════════════════════════════╗\n');
    p.primary('║           TERMS GAME CENTER              ║\n');
    p.primary('╚══════════════════════════════════════════╝\n\n');

    // Profile summary
    const profile = SaveManager.loadProfile();
    p.secondary(`Player: `);
    term(chalk.hex(ctx.theme.accent)(profile.username));
    term(`  |  `);
    p.secondary(`Level: `);
    term(chalk.hex(ctx.theme.info)(String(profile.level)));
    term(`  |  `);
    p.secondary(`XP: `);
    term(chalk.hex(ctx.theme.warning)(String(profile.xp)));
    term(`  |  `);
    p.secondary(`Rank: `);
    term(chalk.hex(ctx.theme.success)(profile.rank));
    term('\n\n');

    // ─── Game List ───
    const games = this.list();
    p.primary('Available Games:\n\n');

    games.forEach((game, index) => {
      const num = `${index + 1}.`.padEnd(3);
      p.secondary(`  ${num}`);
      term(chalk.hex(ctx.theme.accent)(game.name.padEnd(22)));
      term(game.desc || '');
      term('\n');

      // Show high score if exists
      const hs = SaveManager.getHighScore(game.id);
      if (hs) {
        term('      ');
        p.secondary(`Best: ${hs.score} `);
        term(`(${hs.username}, ${new Date(hs.date).toLocaleDateString()})\n`);
      }
    });
    term('\n');

    // ─── Achievements ───
    const achievements = SaveManager.loadAchievements();
    const unlocked = achievements.unlocked.length;
    const total = SaveManager.ACHIEVEMENT_DEFS.length;
    p.primary(`Achievements: `);
    term(chalk.hex(ctx.theme.warning)(`${unlocked}/${total}`));
    term('  |  ');
    p.primary(`Games Played: `);
    const allScores = SaveManager.getLeaderboard(null, 1000);
    term(chalk.hex(ctx.theme.info)(String(allScores.length)));
    term('\n\n');

    // ─── Quick commands ───
    p.secondary('Commands:\n');
    p.info('  game play <name>   ');
    term('Play a game\n');
    p.info('  game list          ');
    term('Show this menu\n');
    p.info('  game achievements  ');
    term('View achievements\n');
    p.info('  game leaderboard   ');
    term('View leaderboard\n');
    p.info('  game profile       ');
    term('View profile\n\n');
  }

  async showAchievements(term, ctx) {
    const p = ctx.paint;
    term.clear();
    p.primary('╔══════════════════════════════════════════╗\n');
    p.primary('║              ACHIEVEMENTS                ║\n');
    p.primary('╚══════════════════════════════════════════╝\n\n');

    const data = SaveManager.loadAchievements();
    const unlocked = data.unlocked;

    SaveManager.ACHIEVEMENT_DEFS.forEach(a => {
      const done = unlocked.includes(a.id);
      const icon = done ? chalk.hex(ctx.theme.success)('█') : chalk.hex('#3b3b3b')('█');
      const name = done ? chalk.hex(ctx.theme.success)(a.title) : chalk.hex('#555')(a.title);
      const desc = done ? chalk.hex('#aaa')(a.desc) : chalk.hex('#444')(a.desc);
      term(`  ${icon} ${name} — ${desc}\n`);
    });

    term(`\n  ${chalk.hex(ctx.theme.warning)(`${unlocked.length}/${SaveManager.ACHIEVEMENT_DEFS.length}`)} `);
    p.secondary('achievements unlocked\n\n');
  }

  async showLeaderboard(term, ctx) {
    const p = ctx.paint;
    term.clear();
    p.primary('╔══════════════════════════════════════════╗\n');
    p.primary('║              LEADERBOARD                 ║\n');
    p.primary('╚══════════════════════════════════════════╝\n\n');

    const entries = SaveManager.getLeaderboard(null, 20);
    if (entries.length === 0) {
      p.secondary('No scores yet. Play some games first!\n\n');
      return;
    }

    p.primary('All Games\n\n');
    entries.forEach((e, i) => {
      const rank = `${i + 1}.`.padEnd(4);
      const color = i === 0 ? ctx.theme.warning : i < 3 ? ctx.theme.info : ctx.theme.secondary;
      term(chalk.hex(color)(`  ${rank}`));
      term(chalk.hex(ctx.theme.accent)(e.username.padEnd(18)));
      term(chalk.hex(ctx.theme.success)(String(e.score).padEnd(8)));
      p.secondary(e.gameId.padEnd(18));
      term(chalk.hex('#666')(new Date(e.date).toLocaleDateString()));
      term('\n');
    });
    term('\n');
  }

  async showProfile(term, ctx) {
    const p = ctx.paint;
    term.clear();
    p.primary('╔══════════════════════════════════════════╗\n');
    p.primary('║              PLAYER PROFILE              ║\n');
    p.primary('╚══════════════════════════════════════════╝\n\n');

    const profile = SaveManager.loadProfile();
    p.secondary('Username'.padEnd(20));
    term(chalk.hex(ctx.theme.accent)(profile.username) + '\n');
    p.secondary('Level'.padEnd(20));
    term(chalk.hex(ctx.theme.info)(String(profile.level)) + '\n');
    p.secondary('XP'.padEnd(20));
    term(chalk.hex(ctx.theme.warning)(String(profile.xp)) + '\n');
    p.secondary('Rank'.padEnd(20));
    term(chalk.hex(ctx.theme.success)(profile.rank) + '\n');
    p.secondary('Games Played'.padEnd(20));
    const count = SaveManager.getLeaderboard(null, 1000).length;
    term(chalk.hex('#aaa')(String(count)) + '\n');
    p.secondary('Achievements'.padEnd(20));
    term(chalk.hex(ctx.theme.info)(`${SaveManager.getUnlockedCount()}/${SaveManager.ACHIEVEMENT_DEFS.length}`) + '\n');
    p.secondary('Favorite Game'.padEnd(20));
    term(chalk.hex('#aaa')(profile.favoriteGame || '-') + '\n');
    p.secondary('Last Played'.padEnd(20));
    term(chalk.hex('#666')(new Date(profile.lastPlayed).toLocaleString()) + '\n\n');
  }

  async play(term, ctx, gameId) {
    const game = this.games.get(gameId);
    if (!game) {
      ctx.paint.error(`Game "${gameId}" not found.\n`);
      ctx.paint.secondary('Available: ');
      term(Array.from(this.games.keys()).join(', ') + '\n\n');
      return;
    }

    // Track first game
    const profile = SaveManager.loadProfile();
    if (!profile.favoriteGame) {
      profile.favoriteGame = game.name;
      SaveManager.saveProfile(profile);
    }

    // Unlock first game achievement
    SaveManager.unlockAchievement('first-game');

    // Night coder check
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) {
      SaveManager.unlockAchievement('night-coder');
    }

    await game.play(term, ctx);
  }
}

module.exports = GameManager;
