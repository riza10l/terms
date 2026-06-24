const systemCmds = require('./system');
const funCmds = require('./fun');
const productivityCmds = require('./productivity');
const gameCmds = require('./games');

// Build a flat registry: { commandName: { name, exec } }
const registry = {};

function register(cmd) {
  if (cmd.aliases) {
    cmd.aliases.forEach(a => { registry[a] = cmd; });
  }
}

// Name-based mapping (no fragile index-based assignment)
const nameToAlias = {
  'Fetch System Info': ['fetch'],
  'Device Info': ['device'],
  'Uptime': ['uptime'],
  'Process List': ['process'],
  'Disk Usage': ['disk'],
  'Ping': ['ping'],
  'Network Info': ['network'],
  'Battery': ['battery'],
  'Open Ports': ['ports'],
  'Weather': ['weather'],
  'Matrix Effect': ['matrix'],
  'Waifu': ['waifu'],
  'Hack': ['hack'],
  'Boot': ['boot'],
  'Coffee': ['coffee'],
  'Fortune': ['fortune'],
  'Joke': ['joke'],
  'Random Fact': ['randomfact'],
  'Easter Egg': ['easteregg'],
  'Notes': ['notes'],
  'Todo': ['todo'],
  'Calendar': ['calendar'],
  'Timer': ['timer'],
  'Stopwatch': ['stopwatch'],
  'QR Generate': ['qr'],
};

// Register all commands by name
[...systemCmds, ...funCmds, ...productivityCmds, ...gameCmds].forEach(cmd => {
  const aliases = nameToAlias[cmd.name];
  if (aliases) {
    cmd.aliases = aliases;
  } else {
    // Fallback: use command name as alias
    cmd.aliases = [cmd.name.toLowerCase().replace(/\s+/g, '')];
  }
  register(cmd);
});

function get(name) {
  return registry[name.toLowerCase()];
}

function list() {
  return Object.keys(registry).filter((v, i, a) => a.indexOf(v) === i).sort();
}

function getDescriptions() {
  const desc = {};
  [...systemCmds, ...funCmds, ...productivityCmds, ...gameCmds].forEach(cmd => {
    if (cmd.aliases) desc[cmd.aliases[0]] = cmd.name + (cmd.desc ? ` — ${cmd.desc}` : '');
  });
  return desc;
}

// Fix: execute is now async and properly awaits cmd.exec()
async function execute(name, term, ctx, args) {
  const cmd = get(name);
  if (!cmd) return false;
  await cmd.exec(term, ctx, args);
  return true;
}

module.exports = { get, list, getDescriptions, execute, registry };
