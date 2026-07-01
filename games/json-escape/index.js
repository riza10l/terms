const chalk = require('chalk').default;
const SaveManager = require('../engine/SaveManager');

const CHALLENGES = [
  {
    name: 'Missing Comma',
    desc: 'Ada koma yang hilang di antara dua key',
    broken: '{\n  "name": "Document Agent"\n  "nodes": []\n}',
    fixed: '{"name":"Document Agent","nodes":[]}',
    hint: 'Cari dua key yang dempet tanpa koma'
  },
  {
    name: 'Trailing Comma',
    desc: 'Ada koma kelebihan di akhir object',
    broken: '{\n  "name": "AI Agent",\n  "version": "1.0",\n}',
    fixed: '{"name":"AI Agent","version":"1.0"}',
    hint: 'Item terakhir dalam object ga boleh pakai koma'
  },
  {
    name: 'Missing Quote',
    desc: 'Ada key tanpa kutip ganda',
    broken: '{\n  name: "Agent",\n  "version": "1.0"\n}',
    fixed: '{"name":"Agent","version":"1.0"}',
    hint: 'Key JSON harus pakai kutip ganda ("key")'
  },
  {
    name: 'Single Quote',
    desc: 'String pake kutip satu, harus kutip ganda',
    broken: "{\n  'name': 'Agent',\n  'version': '1.0'\n}",
    fixed: '{"name":"Agent","version":"1.0"}',
    hint: 'JSON cuma terima double quotes ("), bukan single (\')'
  },
  {
    name: 'Extra Bracket',
    desc: 'Ada kurung tutup kebanyakan',
    broken: '{\n  "name": "Agent"\n}}',
    fixed: '{"name":"Agent"}',
    hint: 'Hitung jumlah kurung kurawal buka dan tutup'
  },
  {
    name: 'Wrong Bracket',
    desc: 'Pake bracket salah, harus kurung kurawal',
    broken: '[\n  "name": "Agent"\n]',
    fixed: '{"name":"Agent"}',
    hint: 'Object pake {} bukan []'
  },
  {
    name: 'n8n Trailing Comma',
    desc: 'Koma di akhir node array',
    broken: '{\n  "nodes": [\n    {\n      "name": "AI Agent",\n      "type": "n8n-nodes-base.httpRequest"\n    },\n  ]\n}',
    fixed: '{"nodes":[{"name":"AI Agent","type":"n8n-nodes-base.httpRequest"}]}',
    hint: 'Cek koma setelah kurung tutup object terakhir di array'
  },
  {
    name: 'Boolean Typo',
    desc: 'Boolean value pake huruf kapital',
    broken: '{\n  "active": true,\n  "debug": True\n}',
    fixed: '{"active":true,"debug":true}',
    hint: 'Boolean di JSON harus lowercase: true / false'
  },
  {
    name: 'Number in Quote',
    desc: 'Angka dikutip jadi string',
    broken: '{\n  "port": "3000",\n  "timeout": "5000"\n}',
    fixed: '{"port":3000,"timeout":5000}',
    hint: 'Angka tanpa kutip — kecuali emang string'
  },
  {
    name: 'Null Value',
    desc: 'Null salah format (capitalized)',
    broken: '{\n  "error": null,\n  "data": Null\n}',
    fixed: '{"error":null,"data":null}',
    hint: 'Null di JSON harus lowercase: null'
  },
  {
    name: 'n8n Expression',
    desc: 'Expression n8n di dalam string JSON ga boleh broken',
    broken: '{\n  "expression": "{{ $json.data }"\n}',
    fixed: '{"expression":"{{ $json.data }}"}',
    hint: 'Cek kurung kurawal expression-nya'
  },
  {
    name: 'All Mixed Up',
    desc: 'Banyak error: single quotes, trailing comma, missing quote',
    broken: "{\n  'name': 'Agent',\n  'version': '1.0',\n  'active': True,\n}",
    fixed: '{"name":"Agent","version":"1.0","active":true}',
    hint: 'Perbaiki semua kutip, koma, dan boolean'
  },
];

const EASY = CHALLENGES.slice(0, 5);
const NORMAL = CHALLENGES.slice(0, 10);
const HARD = CHALLENGES;

async function jsonEscape(term, ctx) {
  const p = ctx.paint;
  let score = 0;
  let streak = 0;
  let maxStreak = 0;
  let round = 0;
  const totalRounds = 5;

  // Pick 5 random challenges
  const shuffled = [...CHALLENGES].sort(() => Math.random() - 0.5).slice(0, totalRounds);

  const showChallenge = () => {
    term.clear();
    term.hideCursor();

    p.primary('╔══════════════════════════════════════════╗\n');
    p.primary('║           JSON ESCAPE ROOM              ║\n');
    p.primary('╚══════════════════════════════════════════╝\n\n');

    p.info(`Round ${round + 1}/${totalRounds}  |  `);
    p.secondary(`Score: ${score}  |  `);
    if (streak >= 2) p.warning(`Streak: ${streak}🔥\n\n`);
    else p.info(`Streak: ${streak}\n\n`);

    const ch = shuffled[round];
    p.warning(`📛 ${ch.name}\n`);
    p.secondary(`${ch.desc}\n\n`);
    term(chalk.hex('#ff6b6b')(ch.broken) + '\n\n');

    p.info('Ketik jawaban (JSON yang sudah diperbaiki):\n\n');
  };

  const finishGame = () => {
    term.showCursor();
    term.clear();

    const bonus = maxStreak >= 5 ? 50 : 0;
    const totalScore = score + bonus;
    const profile = SaveManager.loadProfile();
    const oldXp = profile.xp;

    SaveManager.addXp(totalScore);
    SaveManager.addScore('json-escape', profile.username, totalScore);

    if (round >= totalRounds) SaveManager.unlockAchievement('json-master');
    if (streak >= 5) SaveManager.unlockAchievement('streak-5');
    if (profile.level >= 5) SaveManager.unlockAchievement('level-5');
    if (profile.level >= 10) SaveManager.unlockAchievement('level-10');

    p.primary('╔══════════════════════════════════════════╗\n');
    p.primary(`║          ${round >= totalRounds ? 'GAME COMPLETE!' : 'GAME OVER'}              ║\n`);
    p.primary('╚══════════════════════════════════════════╝\n\n');
    p.info(`Rounds  : ${round}/${totalRounds}\n`);
    p.info(`Score   : ${score}\n`);
    if (bonus > 0) p.info(`Streak Bonus: +${bonus}\n`);
    p.warning(`Total XP: +${totalScore}\n`);
    p.secondary(`XP      : ${oldXp} → ${profile.xp}\n\n`);

    if (round >= totalRounds) p.success('🎉 Semua JSON berhasil diperbaiki!\n\n');
    else p.error('⏰ Permainan selesai!\n\n');
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      finishGame();
      return;
    }
    showChallenge();

    term.inputField({ cancelable: true }, (err, input) => {
      if (err) { finishGame(); return; }
      if (input == null) { finishGame(); return; }

      const answer = input.trim();
      if (!answer) { nextRound(); return; }

      const ch = shuffled[round];
      const chFixed = ch.fixed;

      // Normalize: strip whitespace for comparison
      const user = answer.replace(/\s+/g, '');
      const expected = chFixed.replace(/\s+/g, '');

      if (user === expected) {
        p.success('\n✅ Benar! +20 XP\n');
        score += 20;
        streak++;
        if (streak > maxStreak) maxStreak = streak;
      } else {
        // Check if it's valid JSON at least
        try {
          JSON.parse(answer);
          p.warning('\n⚠ JSON valid, tapi beda dari yang diharapkan.\n');
          p.secondary('Coba lagi dengan format yang lebih tepat.\n');
          streak = 0;
          nextRound();
          return;
        } catch {
          p.error('\n❌ JSON masih rusak. Coba lagi!\n');
          p.secondary('Perhatikan: koma, kutip ganda, bracket, true/false/null\n');
          streak = 0;
          nextRound();
          return;
        }
      }

      round++;
      setTimeout(nextRound, 800);
    });
  };

  nextRound();
}

module.exports = { play: jsonEscape };
