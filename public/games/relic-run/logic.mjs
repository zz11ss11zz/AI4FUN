/** Pure runner simulation. Distances are metres and all durations are seconds. */
export const RUN_LENGTH = 720;
export const LANE_WIDTH = 1.85;

const LANES = [-1, 0, 1];
const START_SPEED = 11;
const TOP_SPEED = 16;
const LATERAL_SPEED = 10.5;
const PHYSICS_STEP = 1 / 120;
const JUMP_HEIGHT = 1.7;
const JUMP_DURATION = 0.95;
const GRAVITY = 8 * JUMP_HEIGHT / JUMP_DURATION ** 2;
const JUMP_VELOCITY = 4 * JUMP_HEIGHT / JUMP_DURATION;
const SLIDE_DURATION = 0.85;
const INVINCIBILITY_DURATION = 1.4;
const CONTACT_HALF_LENGTH = { barrier: 0.7, beam: 0.7, gap: 1.55, relic: 1 };
const CONTACT_HALF_WIDTH = 0.8;
const RELIC_HEIGHT = 1.05;
const EPSILON = 1e-9;

function hashSeed(scene, seed) {
  const text = `${scene}|${String(seed)}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

function randomGenerator(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let n = Math.imul(value ^ (value >>> 15), value | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function createCourse(scene, seed) {
  const random = randomGenerator(hashSeed(scene, seed));
  const objects = [];
  let serial = 0;
  const add = (kind, distance, lane) => {
    objects.push({ id: `${kind}-${serial++}`, kind, distance, lane, collected: false, passed: false });
  };

  // A quiet opening teaches lane changes before the first obstacle at 52–58 m.
  for (const distance of [14, 22, 30]) add('relic', distance, 0);
  let safeLane = 0;
  let distance = 52 + Math.floor(random() * 7);
  let row = 0;
  let lastRow = 30;
  while (distance <= RUN_LENGTH - 40) {
    const reachable = LANES.filter((lane) => Math.abs(lane - safeLane) <= 1);
    safeLane = reachable[Math.floor(random() * reachable.length)];
    const blocked = LANES.filter((lane) => lane !== safeLane);
    if (random() < 0.5) blocked.reverse();
    const count = row < 3 || random() < 0.3 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      const kind = row === 0 ? 'barrier' : ['barrier', 'beam', 'gap'][Math.floor(random() * 3)];
      add(kind, distance, blocked[i]);
    }

    // The relic chain identifies an unobstructed lane through every row.
    // Adjacent rows change that lane by at most one lane width.
    for (const offset of [-16, -8, 0, 8]) add('relic', distance + offset, safeLane);
    lastRow = distance;
    distance += 32 + Math.floor(random() * 9);
    row++;
  }
  for (let finish = lastRow + 16; finish < RUN_LENGTH - 6; finish += 8) add('relic', finish, safeLane);
  return objects.sort((a, b) => a.distance - b.distance || a.lane - b.lane);
}

export function createRun({ scene = 'egypt', seed = Math.floor(Math.random() * 4294967296) } = {}) {
  return {
    scene, seed,
    status: 'ready', distance: 0, speed: START_SPEED,
    lane: 0, x: 0, jumpY: 0, jumpVelocity: 0, slide: 0,
    health: 3, relics: 0, score: 0, elapsed: 0,
    invincible: 0, hitFlash: 0,
    objects: createCourse(scene, seed), events: [], _pendingEvents: [],
  };
}

export function startRun(state) {
  if (state.status === 'ready') {
    state.status = 'running';
    state.events = [];
  }
  return state;
}

export function act(state, action) {
  if (action === 'pause') {
    if (state.status === 'running') state.status = 'paused';
    return state;
  }
  if (action === 'resume') {
    if (state.status === 'paused') state.status = 'running';
    return state;
  }
  if (state.status !== 'running') return state;
  if (action === 'left') state.lane = Math.max(-1, state.lane - 1);
  else if (action === 'right') state.lane = Math.min(1, state.lane + 1);
  else if (action === 'jump' && state.jumpY === 0 && state.jumpVelocity === 0 && state.slide === 0) {
    state.jumpVelocity = JUMP_VELOCITY;
    state._pendingEvents.push({ type: 'jump' });
  } else if (action === 'slide' && state.jumpY === 0 && state.jumpVelocity === 0 && state.slide === 0) {
    state.slide = SLIDE_DURATION;
    state._pendingEvents.push({ type: 'slide' });
  }
  return state;
}

function decrement(value, dt) {
  return value - dt > EPSILON ? value - dt : 0;
}

function advanceBody(state, dt) {
  const targetX = state.lane * LANE_WIDTH;
  const displacement = targetX - state.x;
  state.x += Math.sign(displacement) * Math.min(Math.abs(displacement), LATERAL_SPEED * dt);

  if (state.jumpY > 0 || state.jumpVelocity > 0) {
    const nextY = state.jumpY + state.jumpVelocity * dt - 0.5 * GRAVITY * dt * dt;
    state.jumpVelocity -= GRAVITY * dt;
    if (nextY <= EPSILON && state.jumpVelocity < 0) {
      state.jumpY = 0;
      state.jumpVelocity = 0;
    } else state.jumpY = Math.max(0, nextY);
  }
  state.slide = decrement(state.slide, dt);
  state.invincible = decrement(state.invincible, dt);
  state.hitFlash = decrement(state.hitFlash, dt);
}

function touchesObstacle(state, object) {
  if (object.kind === 'barrier') return state.jumpY < 1;
  if (object.kind === 'gap') return state.jumpY < 0.5;
  if (object.kind === 'beam') return state.jumpY + (state.slide > 0 ? 0.75 : 1.6) > 1.05;
  return false;
}

function checkObjects(state) {
  for (const object of state.objects) {
    if (object.passed || object.collected) continue;
    const halfLength = CONTACT_HALF_LENGTH[object.kind];
    const ahead = object.distance - state.distance;
    if (ahead < -halfLength) {
      object.passed = true;
      continue;
    }
    if (ahead > halfLength || Math.abs(state.x - object.lane * LANE_WIDTH) > CONTACT_HALF_WIDTH) continue;

    if (object.kind === 'relic') {
      const bodyHeight = state.slide > 0 ? 0.75 : 1.6;
      if (RELIC_HEIGHT < state.jumpY - 0.35 || RELIC_HEIGHT > state.jumpY + bodyHeight + 0.35) continue;
      object.collected = true;
      object.passed = true;
      state.relics++;
      state.events.push({ type: 'collect', id: object.id, lane: object.lane, distance: object.distance, total: state.relics });
    } else if (touchesObstacle(state, object)) {
      object.passed = true;
      if (state.invincible > 0) continue;
      state.health = Math.max(0, state.health - 1);
      state.invincible = INVINCIBILITY_DURATION;
      state.hitFlash = 0.35;
      state.events.push({ type: 'hit', id: object.id, kind: object.kind, distance: state.distance, health: state.health });
      if (state.health === 0) {
        state.status = 'over';
        break;
      }
    }
  }
}

export function stepRun(state, dt) {
  state.events = [];
  if (state.status !== 'running' || !Number.isFinite(dt) || dt <= 0) return state;
  state.events = state._pendingEvents.splice(0);
  let remaining = dt;
  // Small physics steps prevent low frame rates from skipping collisions or a jump's arc.
  while (remaining > EPSILON && state.status === 'running') {
    const delta = Math.min(PHYSICS_STEP, remaining);
    advanceBody(state, delta);
    state.speed = START_SPEED + (TOP_SPEED - START_SPEED) * state.distance / RUN_LENGTH;
    state.distance = Math.min(RUN_LENGTH, state.distance + state.speed * delta);
    state.elapsed += delta;
    checkObjects(state);
    state.score = Math.floor(state.distance * 10) + state.relics * 100;
    if (state.status === 'running' && state.distance >= RUN_LENGTH) {
      state.speed = TOP_SPEED;
      state.status = 'won';
      state.events.push({ type: 'complete', distance: state.distance, score: state.score, elapsed: state.elapsed });
    }
    remaining -= delta;
  }
  return state;
}
