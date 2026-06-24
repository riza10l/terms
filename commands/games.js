const chalk = require('chalk').default;

// ─── SNAKE ───
async function snake(term, ctx) {
  term.clear();
  term.hideCursor();
  const W = 30, H = 16;
  let dir = 'RIGHT', nextDir = 'RIGHT', score = 0, gameOver = false;
  let snake = [{x:5,y:Math.floor(H/2)},{x:4,y:Math.floor(H/2)},{x:3,y:Math.floor(H/2)}];
  let food = {x:15, y:Math.floor(H/2)};

  const draw = () => {
    term.moveTo(1,1);
    term.eraseDisplayBelow();
    ctx.paint.primary(`╔${'═'.repeat(W)}╗\n`);
    for (let y = 0; y < H; y++) {
      term('║');
      for (let x = 0; x < W; x++) {
        const isSnake = snake.some(s => s.x === x && s.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;
        if (isHead) term(chalk.hex(ctx.theme.accent)('█'));
        else if (isSnake) term(chalk.hex(ctx.theme.success)('█'));
        else if (isFood) term(chalk.hex(ctx.theme.warning)('♦'));
        else term(' ');
      }
      term('║\n');
    }
    ctx.paint.primary(`╚${'═'.repeat(W)}╝\n`);
    ctx.paint.info(`Score: ${score}  `);
    ctx.paint.secondary('Arrow keys to move, Q to quit\n');
  };

  const spawnFood = () => {
    let pos;
    do {
      pos = {x: Math.floor(Math.random()*(W-2))+1, y: Math.floor(Math.random()*(H-2))+1};
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  };

  const tick = () => {
    dir = nextDir;
    const head = {...snake[0]};
    if (dir === 'UP') head.y--;
    if (dir === 'DOWN') head.y++;
    if (dir === 'LEFT') head.x--;
    if (dir === 'RIGHT') head.x++;
    if (head.x < 0 || head.x >= W || head.y < 0 || head.y >= H ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver = true;
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      spawnFood();
    } else snake.pop();
  };

  draw();
  const gameInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(gameInterval);
      term.showCursor();
      term.clear();
      ctx.paint.error(`💀 Game Over! Score: ${score}\n\n`);
      return;
    }
    tick();
    draw();
  }, 150);

  term.on('key', name => {
    if (name === 'Q' || name === 'q') {
      clearInterval(gameInterval);
      term.showCursor();
      term.clear();
      ctx.paint.info('Snake exited.\n\n');
      return;
    }
    if (name === 'UP' && dir !== 'DOWN') nextDir = 'UP';
    if (name === 'DOWN' && dir !== 'UP') nextDir = 'DOWN';
    if (name === 'LEFT' && dir !== 'RIGHT') nextDir = 'LEFT';
    if (name === 'RIGHT' && dir !== 'LEFT') nextDir = 'RIGHT';
  });
}

// ─── TETRIS ───
async function tetris(term, ctx) {
  term.clear();
  term.hideCursor();
  const COLS = 10, ROWS = 20;
  let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  let score = 0;
  let gameOver = false;

  const PIECES = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
    [[0,1,1],[1,1,0]],
    [[1,1,0],[0,1,1]],
  ];
  const COLORS = [
    '', 'cyan', 'yellow', 'purple', 'blue', 'orange', 'green', 'red'
  ];

  let piece = {shape: PIECES[0], x:3, y:0, type:1};

  const spawnPiece = () => {
    const t = Math.floor(Math.random() * PIECES.length);
    piece = {shape: PIECES[t], x: Math.floor((COLS - PIECES[t][0].length)/2), y: 0, type: t+1};
    if (collides(piece.shape, piece.x, piece.y)) gameOver = true;
  };

  const collides = (shape, px, py) => {
    for (let r = 0; r < shape.length; r++)
      for (let c = 0; c < shape[r].length; c++)
        if (shape[r][c]) {
          const nx = px + c, ny = py + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && board[ny][nx]) return true;
        }
    return false;
  };

  const lock = () => {
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c]) {
          const ny = piece.y + r, nx = piece.x + c;
          if (ny >= 0) board[ny][nx] = piece.type;
        }
    // Clear lines
    for (let r = ROWS-1; r >= 0; r--) {
      if (board[r].every(v => v)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(0));
        score += 100;
        r++;
      }
    }
    spawnPiece();
  };

  const rotate = (shape) => {
    return shape[0].map((_, i) => shape.map(r => r[i]).reverse());
  };

  const draw = () => {
    term.moveTo(1,1);
    term.eraseDisplayBelow();
    ctx.paint.primary(`╔${'═'.repeat(COLS*2)}╗\n`);
    for (let r = 0; r < ROWS; r++) {
      term('║');
      for (let c = 0; c < COLS; c++) {
        let cell = board[r][c];
        const ps = piece.shape;
        if (!gameOver && r >= piece.y && r < piece.y + ps.length &&
            c >= piece.x && c < piece.x + ps[0].length &&
            ps[r - piece.y]?.[c - piece.x]) {
          cell = piece.type;
        }
        if (cell) term(chalk.hex(ctx.theme.primary)('██'));
        else term('  ');
      }
      term('║\n');
    }
    ctx.paint.primary(`╚${'═'.repeat(COLS*2)}╝\n`);
    ctx.paint.info(`Score: ${score}  `);
    ctx.paint.secondary('Arrows: move/rotate, Q: quit\n\n');
  };

  spawnPiece();

  const gameTick = setInterval(() => {
    if (gameOver) {
      clearInterval(gameTick);
      term.showCursor();
      term.clear();
      ctx.paint.error(`💀 Tetris Over! Score: ${score}\n\n`);
      return;
    }
    if (!collides(piece.shape, piece.x, piece.y+1)) piece.y++;
    else lock();
    draw();
  }, 400);

  term.on('key', name => {
    if (name === 'Q' || name === 'q') {
      clearInterval(gameTick);
      term.showCursor();
      term.clear();
      ctx.paint.info('Tetris exited.\n\n');
      return;
    }
    if (name === 'LEFT' && !collides(piece.shape, piece.x-1, piece.y)) piece.x--;
    if (name === 'RIGHT' && !collides(piece.shape, piece.x+1, piece.y)) piece.x++;
    if (name === 'DOWN' && !collides(piece.shape, piece.x, piece.y+1)) piece.y++;
    if (name === 'UP') {
      const rotated = rotate(piece.shape);
      if (!collides(rotated, piece.x, piece.y)) piece.shape = rotated;
    }
    draw();
  });
}

// ─── 2048 ───
async function game2048(term, ctx) {
  term.clear();
  term.hideCursor();
  let grid = Array.from({length:4}, () => Array(4).fill(0));
  let score = 0;

  const addTile = () => {
    const empties = [];
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        if (!grid[r][c]) empties.push({r,c});
    if (!empties.length) return false;
    const {r,c} = empties[Math.floor(Math.random()*empties.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  };

  const slide = (row) => {
    const f = row.filter(v => v);
    for (let i = 0; i < f.length-1; i++) {
      if (f[i] === f[i+1]) { f[i] *= 2; score += f[i]; f.splice(i+1,1); }
    }
    while (f.length < 4) f.push(0);
    return f;
  };

  const rotate = (g) => g[0].map((_, i) => g.map(r => r[i]).reverse());

  const move = (dir) => {
    let g = grid.map(r => [...r]);
    if (dir === 'UP') g = rotate(rotate(rotate(g)));
    else if (dir === 'DOWN') g = rotate(g);
    else if (dir === 'LEFT') g = rotate(rotate(g));
    g = g.map(slide);
    if (dir === 'UP') g = rotate(g);
    else if (dir === 'DOWN') g = rotate(rotate(rotate(g)));
    else if (dir === 'LEFT') g = rotate(rotate(g));
    const changed = JSON.stringify(g) !== JSON.stringify(grid);
    grid = g;
    return changed;
  };

  const hasMoves = () => {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        if (!grid[r][c]) return true;
        if (c < 3 && grid[r][c] === grid[r][c+1]) return true;
        if (r < 3 && grid[r][c] === grid[r+1][c]) return true;
      }
    return false;
  };

  const TILE_COLORS = {
    0: '#1a1b26', 2: '#7aa2f7', 4: '#bb9af7', 8: '#f7768e',
    16: '#e0af68', 32: '#f7768e', 64: '#ff5555', 128: '#9ece6a',
    256: '#73daca', 512: '#89dceb', 1024: '#c0caf5', 2048: '#ffd700'
  };

  const draw = () => {
    term.moveTo(1,1);
    term.eraseDisplayBelow();
    ctx.paint.primary('╔══════════════╗\n');
    for (let r = 0; r < 4; r++) {
      term('║');
      for (let c = 0; c < 4; c++) {
        const v = grid[r][c];
        const col = TILE_COLORS[v] || '#ff0000';
        const s = v ? String(v).padStart(4) : '    ';
        term(chalk.hex(col)(s));
        if (c < 3) term('│');
      }
      term('║');
      term(chalk.hex(ctx.theme.info)(`  ${r === 1 ? `Score: ${score}` : ''}`));
      term('\n');
      if (r < 3) { ctx.paint.primary('╟──┼──┼──┼──╢\n'); }
    }
    ctx.paint.primary('╚══════════════╝\n\n');
    ctx.paint.secondary('Arrow keys to move, Q to quit\n\n');
  };

  addTile(); addTile(); draw();

  term.on('key', name => {
    if (name === 'Q' || name === 'q') {
      term.showCursor();
      term.clear();
      ctx.paint.info('2048 exited.\n\n');
      return;
    }
    if (['UP','DOWN','LEFT','RIGHT'].includes(name)) {
      if (move(name)) {
        addTile();
        draw();
        if (!hasMoves()) {
          term.showCursor();
          setTimeout(() => {
            term.clear();
            ctx.paint.error(`💀 Game Over! Final Score: ${score}\n\n`);
          }, 300);
        }
      }
    }
  });
}

// ─── ASCII PONG ───
async function pong(term, ctx) {
  term.clear();
  term.hideCursor();
  const W = 60, H = 20;
  let ball = {x: Math.floor(W/2), y: Math.floor(H/2), dx: 1, dy: 1};
  let p1 = Math.floor(H/2)-2, p2 = Math.floor(H/2)-2;
  let s1 = 0, s2 = 0;
  const PADDLE_H = 4;
  let interval = null;

  const draw = () => {
    term.moveTo(1,1);
    term.eraseDisplayBelow();
    ctx.paint.primary(`╔${'═'.repeat(W+1)}╗\n`);
    for (let y = 0; y < H; y++) {
      term('║');
      for (let x = 0; x < W; x++) {
        if (x === ball.x && y === ball.y) term(chalk.hex(ctx.theme.accent)('●'));
        else if (x === 1 && y >= p1 && y < p1+PADDLE_H) term(chalk.hex(ctx.theme.success)('█'));
        else if (x === W-2 && y >= p2 && y < p2+PADDLE_H) term(chalk.hex(ctx.theme.info)('█'));
        else term(' ');
      }
      term('║\n');
    }
    ctx.paint.primary(`╚${'═'.repeat(W+1)}╝\n`);
    ctx.paint.secondary(`P1: ${s1}`.padEnd(W/2));
    ctx.paint.info(`P2: ${s2}\n\n`);
    ctx.paint.secondary('W/S: P1 up/down  ▲/▼: P2 up/down  Q: quit\n\n');
  };

  const tick = () => {
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.y <= 0 || ball.y >= H-1) ball.dy = -ball.dy;
    if (ball.x === 2 && ball.y >= p1 && ball.y < p1+PADDLE_H) ball.dx = -ball.dx;
    else if (ball.x === W-3 && ball.y >= p2 && ball.y < p2+PADDLE_H) ball.dx = -ball.dx;
    if (ball.x <= 0) { s2++; reset(); }
    if (ball.x >= W-1) { s1++; reset(); }
    draw();
  };

  const reset = () => {
    ball = {x: Math.floor(W/2), y: Math.floor(H/2), dx: ball.dx > 0 ? -1 : 1, dy: Math.random() > 0.5 ? 1 : -1};
  };

  draw();
  interval = setInterval(tick, 80);

  term.on('key', name => {
    if (name === 'Q' || name === 'q') {
      clearInterval(interval);
      term.showCursor();
      term.clear();
      ctx.paint.info(`Pong exited. Final: ${s1} - ${s2}\n\n`);
      return;
    }
    if (name === 'w' && p1 > 0) p1--;
    if (name === 's' && p1 < H-PADDLE_H) p1++;
  });
}

module.exports = [
  { name: 'Snake', aliases: ['snake'], exec: async (term, ctx) => snake(term, ctx) },
  { name: 'Tetris', aliases: ['tetris'], exec: async (term, ctx) => tetris(term, ctx) },
  { name: '2048', aliases: ['2048'], exec: async (term, ctx) => game2048(term, ctx) },
  { name: 'Pong', aliases: ['pong'], exec: async (term, ctx) => pong(term, ctx) },
];
