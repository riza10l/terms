const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const COMPILERS = {
  '.c':     { compile: 'gcc',     args: (f) => ['-o', f.replace(/\.c$/, '') + '.exe', f], run: (f) => f.replace(/\.c$/, '.exe'),     label: 'GCC (C)' },
  '.cpp':   { compile: 'g++',     args: (f) => ['-o', f.replace(/\.cpp$/, '') + '.exe', f], run: (f) => f.replace(/\.cpp$/, '.exe'), label: 'G++ (C++)' },
  '.cxx':   { compile: 'g++',     args: (f) => ['-o', f.replace(/\.cxx$/, '') + '.exe', f], run: (f) => f.replace(/\.cxx$/, '.exe'), label: 'G++ (C++)' },
  '.h':     { compile: 'gcc',     args: (f) => ['-o', f.replace(/\.h$/, '') + '.exe', f.replace(/\.h$/, '.c')], run: null,              label: 'GCC (Header)' },
  '.py':    { compile: null,      args: null,                                                  run: (f) => ['python', f],              label: 'Python' },
  '.py3':   { compile: null,      args: null,                                                  run: (f) => ['python3', f],             label: 'Python 3' },
  '.js':    { compile: null,      args: null,                                                  run: (f) => ['node', f],                label: 'Node.js' },
  '.mjs':   { compile: null,      args: null,                                                  run: (f) => ['node', f],                label: 'Node.js (ESM)' },
  '.ts':    { compile: 'npx',     args: (f) => ['tsc', f],                                     run: (f) => ['node', f.replace(/\.ts$/, '.js')], label: 'TypeScript' },
  '.tsx':   { compile: 'npx',     args: (f) => ['tsc', f],                                     run: (f) => ['node', f.replace(/\.tsx$/, '.js')], label: 'TSX' },
  '.java':  { compile: 'javac',   args: (f) => [f],                                            run: (f) => ['java', path.basename(f, '.java')], label: 'Java' },
  '.rs':    { compile: 'rustc',   args: (f) => [f],                                            run: (f) => [f.replace(/\.rs$/, '.exe')], label: 'Rust' },
  '.go':    { compile: 'go',      args: (f) => ['build', '-o', f.replace(/\.go$/, '.exe'), f], run: (f) => f.replace(/\.go$/, '.exe'),  label: 'Go' },
  '.cs':    { compile: 'csc',     args: (f) => [f],                                            run: (f) => [f.replace(/\.cs$/, '.exe')], label: 'C#' },
  '.rb':    { compile: null,      args: null,                                                  run: (f) => ['ruby', f],                label: 'Ruby' },
  '.php':   { compile: null,      args: null,                                                  run: (f) => ['php', f],                 label: 'PHP' },
  '.pl':    { compile: null,      args: null,                                                  run: (f) => ['perl', f],                label: 'Perl' },
  '.r':     { compile: null,      args: null,                                                  run: (f) => ['Rscript', f],             label: 'R' },
  '.swift': { compile: 'swiftc',  args: (f) => ['-o', f.replace(/\.swift$/, '') + '.exe', f],  run: (f) => f.replace(/\.swift$/, '.exe'), label: 'Swift' },
  '.kt':    { compile: 'kotlinc', args: (f) => ['-include-runtime', '-d', f.replace(/\.kt$/, '.jar'), f], run: (f) => ['java', '-jar', f.replace(/\.kt$/, '.jar')], label: 'Kotlin' },
  '.dart':  { compile: 'dart',    args: (f) => ['compile', 'exe', f],                         run: (f) => [f.replace(/\.dart$/, '.exe')], label: 'Dart' },
  '.tex':   { compile: 'pdflatex', args: (f) => ['-interaction=nonstopmode', f],                run: null,                               label: 'LaTeX' },
  '.sh':    { compile: null,      args: null,                                                  run: (f) => ['bash', f],                 label: 'Bash' },
  '.lua':   { compile: null,      args: null,                                                  run: (f) => ['lua', f],                  label: 'Lua' },
};

// Compile history
const history = [];
const HISTORY_MAX = 50;

function addHistory(entry) {
  history.push({ ...entry, timestamp: new Date().toISOString() });
  if (history.length > HISTORY_MAX) history.shift();
}

async function runCmd(cmd, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: true });
    let stdout = '', stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    child.on('error', (err) => {
      resolve({ code: -1, stdout, stderr: err.message });
    });
  });
}

async function exec(term, ctx, args) {
  const p = ctx.paint;

  if (!args) {
    p.primary('📦 Compiler — Usage\n\n');
    p.secondary('  compile <file>          — Compile & run source file\n');
    p.secondary('  compile build <file>    — Compile only (no run)\n');
    p.secondary('  compile run <file>      — Run without compiling\n');
    p.secondary('  compile list            — Show supported languages\n');
    p.secondary('  compile history         — Show compile history\n');
    p.secondary('  compile clean           — Delete compiled .exe files\n\n');
    p.info('Supported: C, C++, Python, Node.js, TypeScript, Java, Rust, Go, C#,\n');
    p.info('          Ruby, PHP, Perl, R, Swift, Kotlin, Dart, LaTeX, Bash, Lua\n\n');
    return;
  }

  const parts = args.trim().split(/\s+/);
  let mode = 'auto';
  let fileArg = parts[0];

  if (fileArg === 'list') {
    p.primary('📦 Supported Languages\n\n');
    Object.entries(COMPILERS).forEach(([ext, cfg]) => {
      p.secondary(`  ${ext.padEnd(8)} ${cfg.label.padEnd(20)}`);
      term(`${cfg.compile ? 'compile + ' : '         '}run\n`);
    });
    term('\n');
    return;
  }

  if (fileArg === 'history') {
    p.primary('📜 Compile History\n\n');
    if (!history.length) {
      p.secondary('No compile history yet.\n\n');
      return;
    }
    history.slice().reverse().forEach((h, i) => {
      const icon = h.success ? '✔' : '✗';
      const col = h.success ? ctx.theme.success : ctx.theme.error;
      term(chalk.hex(col)(`${icon} `));
      p.secondary(`${h.file.padEnd(25)} ${h.lang.padEnd(15)} ${h.mode}\n`);
    });
    term('\n');
    return;
  }

  if (fileArg === 'clean') {
    let cleaned = 0;
    const cwd = process.cwd();
    const files = fs.readdirSync(cwd);
    files.forEach(f => {
      if (/\.(exe|out|class|jar|o)$/i.test(f)) {
        try { fs.unlinkSync(path.join(cwd, f)); cleaned++; } catch {}
      }
    });
    ctx.paint.success(`✔ Cleaned ${cleaned} compiled files.\n\n`);
    return;
  }

  if (fileArg === 'build' || fileArg === 'run') {
    mode = fileArg;
    fileArg = parts[1];
    if (!fileArg) {
      p.error(`Usage: compile ${mode} <file>\n\n`);
      return;
    }
  }

  const fullPath = path.resolve(process.cwd(), fileArg);

  if (!fs.existsSync(fullPath)) {
    p.error(`✗ File not found: ${fileArg}\n\n`);
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  const compiler = COMPILERS[ext];

  if (!compiler) {
    p.error(`✗ Unsupported file type: ${ext}\n\n`);
    p.info('Run "compile list" to see supported languages.\n\n');
    return;
  }

  const basename = path.basename(fullPath);
  const dir = path.dirname(fullPath);

  term('\n');
  p.primary(`╭─ ${basename}\n`);
  p.secondary(`│ Language: ${compiler.label}\n`);

  // --- BUILD phase ---
  if (compiler.compile && mode !== 'run') {
    p.secondary(`│ Compiler: ${compiler.compile}\n`);
    term('│\n');
    p.info('│ Building...\n');

    const buildResult = await runCmd(compiler.compile, compiler.args(fullPath), dir);

    if (buildResult.code !== 0) {
      p.primary('╰─ ❌ COMPILATION FAILED\n\n');
      if (buildResult.stderr) {
        // Strip path noise
        const cleanErr = buildResult.stderr.split('\n').map(l => l.replace(dir+path.sep, '')).join('\n');
        p.error(cleanErr + '\n');
      }
      if (buildResult.stdout) {
        term(buildResult.stdout + '\n');
      }
      addHistory({ file: basename, lang: compiler.label, mode: 'build', success: false });
      term('\n');
      return;
    }

    if (buildResult.stderr) p.warning(buildResult.stderr + '\n');
    p.success('│ ✔ Build successful!\n');
  }

  // --- RUN phase ---
  if (compiler.run && mode !== 'build') {
    const runCmdArgs = compiler.run(fullPath);
    const runProg = Array.isArray(runCmdArgs) ? runCmdArgs[0] : runCmdArgs;
    const runArgs = Array.isArray(runCmdArgs) ? runCmdArgs.slice(1) : [];

    p.secondary('│\n');
    p.primary('╰─▶ Output:\n\n');

    const runResult = await runCmd(runProg, runArgs, dir);

    if (runResult.stdout) term(runResult.stdout);
    if (runResult.stderr) p.warning(runResult.stderr + '\n');

    if (runResult.code !== 0) {
      p.error(`\n✗ Exited with code ${runResult.code}\n\n`);
    } else {
      term('\n');
      p.success(`✔ Done (exit: ${runResult.code})\n\n`);
    }

    addHistory({ file: basename, lang: compiler.label, mode: mode === 'build' ? 'build' : 'compile+run', success: runResult.code === 0 });
  } else if (!compiler.run && mode !== 'build') {
    p.info('│ Run not supported.\n\n');
  } else {
    term('\n');
    p.success('✔ Build complete.\n\n');
    addHistory({ file: basename, lang: compiler.label, mode: 'build', success: true });
  }
}

module.exports = { exec, name: 'compile', desc: 'Compile & run source code (C, C++, Python, Java, etc.)' };
