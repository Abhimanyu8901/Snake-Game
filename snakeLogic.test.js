import assert from 'node:assert/strict';

import {
  createInitialState,
  setDirection,
  stepState,
  placeFood,
} from './snakeLogic.js';

const cfg = { width: 8, height: 8, tickMs: 120 };

function run(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

run('snake moves one cell in current direction', () => {
  const state = createInitialState(cfg, () => 0);
  const next = stepState(state, cfg, () => 0);

  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake[0].y, state.snake[0].y);
  assert.equal(next.snake.length, state.snake.length);
});

run('snake cannot reverse direction in a single tick', () => {
  const state = createInitialState(cfg, () => 0);
  const reversed = setDirection(state, 'left');

  assert.equal(reversed.nextDirection.x, state.nextDirection.x);
  assert.equal(reversed.nextDirection.y, state.nextDirection.y);
});

run('eating food grows snake and increases score', () => {
  const state = {
    snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 3, y: 2 },
    score: 0,
    isOver: false,
  };

  const next = stepState(state, cfg, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
});

run('wall collision ends game', () => {
  const state = {
    snake: [{ x: 7, y: 0 }, { x: 6, y: 0 }, { x: 5, y: 0 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 0, y: 0 },
    score: 0,
    isOver: false,
  };

  const next = stepState(state, cfg, () => 0);
  assert.equal(next.isOver, true);
});

run('food placement avoids snake body', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = placeFood(snake, 3, 2, () => 0);
  assert.notDeepEqual(food, { x: 0, y: 0 });
  assert.notDeepEqual(food, { x: 1, y: 0 });
  assert.notDeepEqual(food, { x: 2, y: 0 });
});

if (process.exitCode) {
  process.exit(process.exitCode);
}