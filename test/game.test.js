'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const Game = require('../src/game.js');

const { MOVES, pickComputerMove, decideOutcome, describeRound, emptyScore, addOutcome, parseScore } = Game;

test('every pairing of moves has the right outcome', () => {
  const expected = {
    rock: { rock: 'tie', paper: 'lose', scissors: 'win' },
    paper: { rock: 'win', paper: 'tie', scissors: 'lose' },
    scissors: { rock: 'lose', paper: 'win', scissors: 'tie' }
  };
  for (const player of MOVES) {
    for (const computer of MOVES) {
      assert.equal(decideOutcome(player, computer), expected[player][computer], `${player} vs ${computer}`);
    }
  }
});

test('the round is described by the rule that settled it, from either side', () => {
  assert.equal(describeRound('paper', 'rock'), 'Paper covers rock.');
  assert.equal(describeRound('rock', 'paper'), 'Paper covers rock.');
  assert.equal(describeRound('rock', 'scissors'), 'Rock crushes scissors.');
  assert.equal(describeRound('paper', 'scissors'), 'Scissors cut paper.');
  assert.equal(describeRound('rock', 'rock'), 'Rock meets rock.');
});

test('unknown moves are refused', () => {
  assert.throws(() => decideOutcome('lizard', 'rock'), /Unknown move: lizard/);
  assert.throws(() => decideOutcome('rock', 'Spock'), /Unknown move: Spock/);
});

test('the computer picks each move for its third of the random range', () => {
  assert.equal(pickComputerMove(() => 0), 'rock');
  assert.equal(pickComputerMove(() => 0.34), 'paper');
  assert.equal(pickComputerMove(() => 0.67), 'scissors');
  assert.equal(pickComputerMove(() => 0.9999999), 'scissors');
  assert.equal(pickComputerMove(() => 1), 'scissors', 'never out of range');
});

test('the computer picks every move, roughly evenly', () => {
  const counts = { rock: 0, paper: 0, scissors: 0 };
  for (let i = 0; i < 30000; i++) counts[pickComputerMove()]++;
  for (const move of MOVES) assert.ok(counts[move] > 9000 && counts[move] < 11000, `${move}: ${counts[move]}`);
});

test('adding an outcome counts it and leaves the old score untouched', () => {
  const start = emptyScore();
  const afterWin = addOutcome(start, 'win');
  assert.deepEqual(afterWin, { wins: 1, losses: 0, ties: 0 });
  assert.deepEqual(start, { wins: 0, losses: 0, ties: 0 });
  assert.deepEqual(addOutcome(addOutcome(afterWin, 'lose'), 'tie'), { wins: 1, losses: 1, ties: 1 });
  assert.throws(() => addOutcome(start, 'draw'), /Unknown outcome/);
});

test('a saved score is read back, and a missing or damaged one starts from zero', () => {
  assert.deepEqual(parseScore('{"wins":3,"losses":2,"ties":1}'), { wins: 3, losses: 2, ties: 1 });
  for (const bad of [null, '', 'not json', '{"wins":"3"}', '{"wins":-1,"losses":0,"ties":0}', '[]', 'null']) {
    assert.deepEqual(parseScore(bad), emptyScore(), String(bad));
  }
});
