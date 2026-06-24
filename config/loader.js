const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'user.json');
const DEFAULT_PATH = path.join(__dirname, 'default.json');

let config = null;

function load() {
  if (config) return config;

  const defaults = JSON.parse(fs.readFileSync(DEFAULT_PATH, 'utf8'));

  try {
    const user = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    config = { ...defaults, ...user };
  } catch {
    config = { ...defaults };
  }

  return config;
}

function save(newConfig) {
  config = { ...load(), ...newConfig };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function get(key) {
  return load()[key];
}

function set(key, value) {
  const c = load();
  c[key] = value;
  save(c);
}

function getAliases() {
  return load().aliases || {};
}

function addAlias(name, command) {
  const c = load();
  if (!c.aliases) c.aliases = {};
  c.aliases[name] = command;
  save(c);
}

function removeAlias(name) {
  const c = load();
  if (c.aliases) delete c.aliases[name];
  save(c);
}

function resolveAlias(input) {
  const aliases = getAliases();
  return aliases[input] || null;
}

module.exports = { load, save, get, set, getAliases, addAlias, removeAlias, resolveAlias };
