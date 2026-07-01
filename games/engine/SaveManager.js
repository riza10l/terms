const fs = require('fs');
const path = require('path');

const SAVE_DIR = path.join(__dirname, '..', '..', '.terms', 'save');
const PROFILE_PATH = path.join(SAVE_DIR, 'profile.json');
const ACHIEVEMENTS_PATH = path.join(SAVE_DIR, 'achievements.json');
const LEADERBOARD_PATH = path.join(SAVE_DIR, 'leaderboard.json');
const GAMES_DIR = path.join(SAVE_DIR, 'games');

function ensureDirs() {
  [SAVE_DIR, GAMES_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

// ─── Profile ───
const DEFAULT_PROFILE = {
  username: 'Player',
  level: 1,
  xp: 0,
  rank: 'Script Kiddie',
  favoriteGame: '',
  createdAt: new Date().toISOString(),
  lastPlayed: new Date().toISOString()
};

const RANKS = [
  { minXp: 0,     title: 'Script Kiddie' },
  { minXp: 100,   title: 'CLI Crafter' },
  { minXp: 300,   title: 'Automation Engineer' },
  { minXp: 700,   title: 'AI Orchestrator' },
  { minXp: 1500,  title: 'Terminal Archmage' },
  { minXp: 3000,  title: 'Developer Overlord' },
];

function getRank(xp) {
  let rank = RANKS[0].title;
  for (const r of RANKS) {
    if (xp >= r.minXp) rank = r.title;
  }
  return rank;
}

function getLevel(xp) {
  return Math.min(Math.floor(xp / 100) + 1, 100);
}

function loadProfile() {
  ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
  } catch {
    const profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString(), lastPlayed: new Date().toISOString() };
    saveProfile(profile);
    return profile;
  }
}

function saveProfile(profile) {
  ensureDirs();
  profile.level = getLevel(profile.xp);
  profile.rank = getRank(profile.xp);
  profile.lastPlayed = new Date().toISOString();
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf8');
}

function addXp(amount) {
  const profile = loadProfile();
  profile.xp += amount;
  saveProfile(profile);
  return profile;
}

// ─── Achievements ───
const ACHIEVEMENT_DEFS = [
  { id: 'first-command',     title: 'First Command',        desc: 'Jalankan command pertama',            icon: '▶' },
  { id: 'first-game',        title: 'First Game',           desc: 'Mainkan game pertama',                icon: '🎮' },
  { id: 'bug-slayer',        title: 'Bug Slayer',           desc: 'Selesaikan 50 bug challenge',         icon: '🐛' },
  { id: 'json-master',       title: 'JSON Master',          desc: 'Selesaikan JSON Escape Room 1x',      icon: '📋' },
  { id: 'shell-racer',       title: 'Shell Racer',          desc: 'Mainkan Shell Racer 1x',              icon: '⚡' },
  { id: 'high-speed',        title: 'High Speed',           desc: 'Shell Racer — 60+ WPM',               icon: '🔥' },
  { id: 'streak-5',          title: 'Streak Master',         desc: 'Dapat streak 5 di game apa pun',      icon: '💫' },
  { id: 'level-5',           title: 'Level 5',               desc: 'Capai level 5',                       icon: '⭐' },
  { id: 'level-10',          title: 'Level 10',              desc: 'Capai level 10',                      icon: '🌟' },
  { id: 'night-coder',       title: 'Night Coder',           desc: 'Main lewat jam 00:00',                icon: '🌙' },
  { id: 'theme-addict',      title: 'Theme Addict',          desc: 'Ganti tema 5 kali',                   icon: '🎨' },
  { id: 'first-achievement', title: 'Achievement Unlocked',  desc: 'Dapatkan achievement pertama',         icon: '🏆' },
];

function loadAchievements() {
  ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(ACHIEVEMENTS_PATH, 'utf8'));
  } catch {
    const data = { unlocked: [], lastUnlock: null };
    saveAchievements(data);
    return data;
  }
}

function saveAchievements(data) {
  ensureDirs();
  fs.writeFileSync(ACHIEVEMENTS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function unlockAchievement(achievementId) {
  const data = loadAchievements();
  if (data.unlocked.includes(achievementId)) return null;
  data.unlocked.push(achievementId);
  data.lastUnlock = achievementId;
  saveAchievements(data);
  const def = ACHIEVEMENT_DEFS.find(a => a.id === achievementId);
  if (def) {
    addXp(50);
    // Auto-unlock first-achievement
    if (achievementId !== 'first-achievement') {
      unlockAchievement('first-achievement');
    }
  }
  return def || null;
}

function isUnlocked(achievementId) {
  const data = loadAchievements();
  return data.unlocked.includes(achievementId);
}

function getUnlockedCount() {
  return loadAchievements().unlocked.length;
}

// ─── Leaderboard ───
function loadLeaderboard() {
  ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(LEADERBOARD_PATH, 'utf8'));
  } catch {
    const data = { entries: [], updatedAt: new Date().toISOString() };
    saveLeaderboard(data);
    return data;
  }
}

function saveLeaderboard(data) {
  ensureDirs();
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function addScore(gameId, username, score, details = '') {
  const lb = loadLeaderboard();
  lb.entries.push({ gameId, username, score, details, date: new Date().toISOString() });
  lb.entries.sort((a, b) => b.score - a.score);
  if (lb.entries.length > 100) lb.entries = lb.entries.slice(0, 100);
  saveLeaderboard(lb);
  // Check for high score achievement (top 3)
  const idx = lb.entries.findIndex(e => e.username === username && e.gameId === gameId);
  return { rank: idx + 1, total: lb.entries.filter(e => e.gameId === gameId).length };
}

function getLeaderboard(gameId, limit = 10) {
  const lb = loadLeaderboard();
  const filtered = lb.entries.filter(e => !gameId || e.gameId === gameId);
  return filtered.slice(0, limit);
}

function getHighScore(gameId) {
  const lb = loadLeaderboard();
  const filtered = lb.entries.filter(e => e.gameId === gameId);
  return filtered.length > 0 ? filtered[0] : null;
}

// ─── Game Saves ───
function saveGameState(gameId, data) {
  ensureDirs();
  const p = path.join(GAMES_DIR, `${gameId}.json`);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function loadGameState(gameId) {
  ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(path.join(GAMES_DIR, `${gameId}.json`), 'utf8'));
  } catch {
    return null;
  }
}

module.exports = {
  loadProfile, saveProfile, addXp, getRank, getLevel,
  ACHIEVEMENT_DEFS, loadAchievements, saveAchievements,
  unlockAchievement, isUnlocked, getUnlockedCount,
  loadLeaderboard, saveLeaderboard, addScore, getLeaderboard, getHighScore,
  saveGameState, loadGameState,
  ensureDirs, PROFILE_PATH, ACHIEVEMENTS_PATH, LEADERBOARD_PATH
};
