export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function keyFor(point) {
  return `${point.x},${point.y}`;
}

export function isOppositeDirection(current, next) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

export function setDirection(state, directionName) {
  const next = DIRECTIONS[directionName];
  if (!next) {
    return state;
  }

  if (isOppositeDirection(state.direction, next)) {
    return state;
  }

  return { ...state, nextDirection: next };
}

export function placeFood(snake, width, height, rng = Math.random) {
  const occupied = new Set(snake.map(keyFor));
  const available = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pos = { x, y };
      if (!occupied.has(keyFor(pos))) {
        available.push(pos);
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * available.length);
  return available[index];
}

export function createInitialState(config, rng = Math.random) {
  const centerX = Math.floor(config.width / 2);
  const centerY = Math.floor(config.height / 2);
  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];

  return {
    snake,
    direction: DIRECTIONS.right,
    nextDirection: DIRECTIONS.right,
    food: placeFood(snake, config.width, config.height, rng),
    score: 0,
    isOver: false,
  };
}

export function stepState(state, config, rng = Math.random) {
  if (state.isOver) {
    return state;
  }

  const direction = state.nextDirection;
  const head = state.snake[0];
  const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= config.width ||
    nextHead.y >= config.height;

  const eatsFood = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;

  const bodyToCheck = eatsFood ? state.snake : state.snake.slice(0, -1);
  const hitBody = bodyToCheck.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (hitWall || hitBody) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      isOver: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!eatsFood) {
    nextSnake.pop();
  }

  const nextFood = eatsFood ? placeFood(nextSnake, config.width, config.height, rng) : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    nextDirection: direction,
    food: nextFood,
    score: eatsFood ? state.score + 1 : state.score,
    isOver: nextFood === null ? true : false,
  };
}