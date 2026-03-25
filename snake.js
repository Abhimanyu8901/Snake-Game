import {
  createInitialState,
  setDirection,
  stepState,
} from './snakeLogic.js';

const config = {
  width: 20,
  height: 20,
  tickMs: 120,
};

const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const speedSelect = document.getElementById('speedSelect');
const controlButtons = Array.from(document.querySelectorAll('[data-dir]'));

let state = createInitialState(config);
let paused = false;
let timerId = null;
let tickMs = config.tickMs;

function createBoard() {
  board.innerHTML = '';
  const total = config.width * config.height;

  for (let i = 0; i < total; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    board.appendChild(cell);
  }
}

function pointToIndex(point) {
  return point.y * config.width + point.x;
}

function vectorToClass(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 1) return 'dir-right';
  if (dx === -1) return 'dir-left';
  if (dy === 1) return 'dir-down';
  return 'dir-up';
}

function setStatusText() {
  if (state.isOver) {
    statusEl.textContent = 'Game Over';
    return;
  }

  statusEl.textContent = paused ? 'Paused' : 'Running';
}

function render() {
  const cells = board.children;
  for (let i = 0; i < cells.length; i += 1) {
    cells[i].className = 'cell';
  }

  if (state.food) {
    const foodIndex = pointToIndex(state.food);
    cells[foodIndex].classList.add('food');
  }

  const snakeLength = state.snake.length;
  for (let i = 0; i < snakeLength; i += 1) {
    const segment = state.snake[i];
    const index = pointToIndex(segment);
    const cell = cells[index];

    if (i === 0) {
      const neck = state.snake[i + 1] ?? segment;
      cell.classList.add('snake-head', vectorToClass(neck, segment));
    } else if (i === snakeLength - 1) {
      const beforeTail = state.snake[i - 1] ?? segment;
      cell.classList.add('snake-tail', vectorToClass(beforeTail, segment));
    } else {
      cell.classList.add('snake-body');
    }
  }

  scoreEl.textContent = String(state.score);
  setStatusText();
}

function tick() {
  if (paused || state.isOver) {
    return;
  }

  state = stepState(state, config);
  render();
}

function restartTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
  }
  timerId = window.setInterval(tick, tickMs);
}

function resetGame() {
  state = createInitialState(config);
  paused = false;
  pauseBtn.textContent = 'Pause';
  render();
}

function togglePause() {
  if (state.isOver) {
    return;
  }

  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  render();
}

function handleDirection(directionName) {
  state = setDirection(state, directionName);
}

function onSpeedChange(event) {
  const nextTick = Number.parseInt(event.target.value, 10);
  if (!Number.isFinite(nextTick) || nextTick <= 0) {
    return;
  }

  tickMs = nextTick;
  restartTimer();
}

function onKeydown(event) {
  const key = event.key.toLowerCase();

  if (key === ' ' || key === 'spacebar') {
    event.preventDefault();
    togglePause();
    return;
  }

  if (state.isOver && key === 'enter') {
    resetGame();
    return;
  }

  const map = {
    arrowup: 'up',
    w: 'up',
    arrowdown: 'down',
    s: 'down',
    arrowleft: 'left',
    a: 'left',
    arrowright: 'right',
    d: 'right',
  };

  const direction = map[key];
  if (direction) {
    event.preventDefault();
    handleDirection(direction);
  }
}

function start() {
  createBoard();
  render();

  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', resetGame);
  if (speedSelect) {
    speedSelect.value = String(tickMs);
    speedSelect.addEventListener('change', onSpeedChange);
  }

  for (const button of controlButtons) {
    button.addEventListener('click', () => handleDirection(button.dataset.dir));
  }

  document.addEventListener('keydown', onKeydown);
  restartTimer();
}

start();