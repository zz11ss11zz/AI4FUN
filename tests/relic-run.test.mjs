import test from 'node:test';
import assert from 'node:assert/strict';
import { RUN_LENGTH, LANE_WIDTH, createRun, startRun, act, stepRun } from '../public/games/relic-run/logic.mjs';

const scenes = ['egypt', 'khmer', 'maya', 'wall', 'castle'];
const object = (kind, distance, lane = 0, id = `${kind}-${distance}`) => ({
  id, kind, distance, lane, collected: false, passed: false,
});

function isolatedRun(objects = []) {
  const state = createRun({ seed: 2026 });
  state.objects = objects;
  return startRun(state);
}

test('seeded courses are reproducible and each scene changes the layout', () => {
  const first = createRun({ scene: 'egypt', seed: 0 });
  assert.deepEqual(first, createRun({ scene: 'egypt', seed: 0 }));
  assert.notDeepEqual(first.objects, createRun({ scene: 'egypt', seed: 1 }).objects);
  const layouts = scenes.map((scene) => JSON.stringify(createRun({ scene, seed: 29 }).objects));
  assert.equal(new Set(layouts).size, scenes.length);
  assert.equal(first.status, 'ready');
  assert.equal(stepRun(first, 1).distance, 0);
});

test('lane targets stay in bounds while the physical x position moves over time', () => {
  const state = isolatedRun();
  for (let i = 0; i < 8; i++) act(state, 'right');
  assert.equal(state.lane, 1);
  assert.equal(state.x, 0);
  stepRun(state, 0.05);
  assert.ok(state.x > 0 && state.x < LANE_WIDTH);
  stepRun(state, 0.3);
  assert.equal(state.x, LANE_WIDTH);
  for (let i = 0; i < 8; i++) act(state, 'left');
  assert.equal(state.lane, -1);
  stepRun(state, 0.4);
  assert.equal(state.x, -LANE_WIDTH);
});

test('jump reaches 1.7 metres, lands after 0.95 seconds and slide expires after 0.85 seconds', () => {
  const state = isolatedRun();
  act(state, 'jump');
  stepRun(state, 0.475);
  assert.ok(Math.abs(state.jumpY - 1.7) < 0.01);
  assert.equal(state.events.filter((event) => event.type === 'jump').length, 1);
  const velocity = state.jumpVelocity;
  act(state, 'jump');
  act(state, 'slide');
  assert.equal(state.jumpVelocity, velocity, 'Jumping again in midair must not boost height');
  assert.equal(state.slide, 0, 'Sliding cannot begin in midair');
  stepRun(state, 0.475);
  assert.equal(state.jumpY, 0);
  assert.equal(state.jumpVelocity, 0);
  act(state, 'slide');
  assert.equal(state.slide, 0.85);
  act(state, 'jump');
  assert.equal(state.jumpVelocity, 0, 'A slide cannot be combined with a jump');
  stepRun(state, 0.85);
  assert.equal(state.slide, 0);
  assert.equal(state.events.filter((event) => event.type === 'slide').length, 1);
});

test('collision uses actual x rather than the requested lane, and early lane changes dodge', () => {
  const late = isolatedRun([object('barrier', 1)]);
  act(late, 'right');
  stepRun(late, 0.05);
  assert.equal(late.lane, 1);
  assert.equal(late.health, 2, 'An instantaneous target change cannot teleport through an obstacle');
  const early = isolatedRun([object('barrier', 5)]);
  act(early, 'right');
  stepRun(early, 0.7);
  assert.equal(early.health, 3);
  assert.equal(early.objects[0].passed, true);
});

test('barriers and gaps require a jump, while beams require a slide', () => {
  for (const kind of ['barrier', 'gap']) {
    const jumped = isolatedRun([object(kind, 5)]);
    act(jumped, 'jump');
    stepRun(jumped, 0.8);
    assert.equal(jumped.health, 3, `${kind} should be cleared by a correctly timed jump`);
    const slid = isolatedRun([object(kind, 5)]);
    act(slid, 'slide');
    stepRun(slid, 0.8);
    assert.equal(slid.health, 2, `Sliding must not clear ${kind}`);
  }
  const slid = isolatedRun([object('beam', 5)]);
  act(slid, 'slide');
  stepRun(slid, 0.8);
  assert.equal(slid.health, 3);
  const jumped = isolatedRun([object('beam', 5)]);
  act(jumped, 'jump');
  stepRun(jumped, 0.8);
  assert.equal(jumped.health, 2, 'Jumping into the overhead beam must still collide');
});

test('damage grants 1.4 seconds of invincibility and three separate hits end the run', () => {
  const state = isolatedRun([5, 8, 30, 55].map((distance) => object('barrier', distance)));
  stepRun(state, 6);
  assert.equal(state.status, 'over');
  assert.equal(state.health, 0);
  assert.equal(state.invincible, 1.4);
  assert.equal(state.events.filter((event) => event.type === 'hit').length, 3);
  assert.ok(state.objects[1].passed, 'The nearby second obstacle is passed during invincibility');
  const distance = state.distance;
  const elapsed = state.elapsed;
  stepRun(state, 2);
  assert.equal(state.distance, distance);
  assert.equal(state.elapsed, elapsed);
  assert.deepEqual(state.events, []);
});

test('relics collect only once on physical contact and step events never repeat', () => {
  const state = isolatedRun([object('relic', 1), object('relic', 1, 1)]);
  stepRun(state, 0.2);
  assert.equal(state.relics, 1);
  assert.equal(state.objects[0].collected, true);
  assert.equal(state.objects[1].collected, false);
  assert.equal(state.events.filter((event) => event.type === 'collect').length, 1);
  const events = state.events;
  stepRun(state, 0.5);
  assert.notStrictEqual(state.events, events);
  assert.deepEqual(state.events, []);
  assert.equal(state.relics, 1);
  assert.equal(state.score, Math.floor(state.distance * 10) + 100);
});

test('pausing freezes travel, jump, timers and inputs until resume', () => {
  const state = isolatedRun();
  act(state, 'jump');
  act(state, 'right');
  stepRun(state, 0.1);
  act(state, 'pause');
  const physics = (s) => [s.distance, s.elapsed, s.speed, s.lane, s.x, s.jumpY, s.jumpVelocity, s.slide, s.invincible];
  const frozen = physics(state);
  act(state, 'left');
  act(state, 'slide');
  stepRun(state, 3);
  assert.equal(state.status, 'paused');
  assert.deepEqual(physics(state), frozen);
  act(state, 'resume');
  stepRun(state, 0.1);
  assert.equal(state.status, 'running');
  assert.ok(state.distance > frozen[0]);
});

test('a run completes at 720 metres within 90 seconds and emits completion once', () => {
  const state = isolatedRun();
  stepRun(state, 90);
  assert.equal(state.status, 'won');
  assert.equal(state.distance, RUN_LENGTH);
  assert.equal(state.speed, 16);
  assert.ok(state.elapsed < 90 && state.elapsed > 40);
  assert.equal(state.events.filter((event) => event.type === 'complete').length, 1);
  const elapsed = state.elapsed;
  stepRun(state, 3);
  assert.equal(state.elapsed, elapsed);
  assert.deepEqual(state.events, []);
});

test('new runs allocate independent objects, events and player state', () => {
  const first = createRun({ scene: 'maya', seed: 14 });
  const second = createRun({ scene: 'maya', seed: 14 });
  startRun(first);
  first.objects[0].collected = true;
  act(first, 'jump');
  stepRun(first, 0.1);
  assert.equal(second.status, 'ready');
  assert.equal(second.distance, 0);
  assert.equal(second.objects[0].collected, false);
  assert.deepEqual(second.events, []);
  assert.deepEqual(second._pendingEvents, []);
});

test('every seeded scene has a quiet opening, 20 metre safety windows and a reachable relic route', () => {
  const halfLength = {barrier: 0.7, beam: 0.7, gap: 1.55};
  for (const scene of scenes) {
    const state = createRun({ scene, seed: 704 });
    const obstacles = state.objects.filter((item) => item.kind !== 'relic');
    assert.ok(obstacles.every((item) => item.distance >= 35));
    const rows = [...new Set(obstacles.map((item) => item.distance))].map((distance) => {
      const members = obstacles.filter((item) => item.distance === distance);
      const relic = state.objects.find((item) => item.kind === 'relic' && item.distance === distance);
      assert.ok(members.length <= 2);
      assert.ok(relic && members.every((item) => item.lane !== relic.lane));
      return {distance, safeLane: relic.lane, half: Math.max(...members.map((item) => halfLength[item.kind]))};
    });
    for (let i = 1; i < rows.length; i++) {
      assert.ok(rows[i].distance - rows[i].half - rows[i - 1].distance - rows[i - 1].half >= 20);
      assert.ok(Math.abs(rows[i].safeLane - rows[i - 1].safeLane) <= 1);
    }
    startRun(state);
    let rowIndex = 0;
    for (let frame = 0; frame < 1800 && state.status === 'running'; frame++) {
      while (rowIndex < rows.length - 1 && state.distance > rows[rowIndex].distance + 4) rowIndex++;
      const targetLane = rows[rowIndex].safeLane;
      if (state.lane < targetLane) act(state, 'right');
      else if (state.lane > targetLane) act(state, 'left');
      stepRun(state, 0.05);
    }
    assert.equal(state.status, 'won', `${scene} must have a complete route without jumping or damage`);
    assert.equal(state.health, 3);
  }
});
