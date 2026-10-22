/*
 * Rock Paper Scissors rules, with no page code in here so they can be tested
 * in Node. In the browser this file defines window.Game; in Node it is a
 * CommonJS module. It is a plain script (not an ES module) so the game still
 * works when index.html is opened straight from disk.
 */
(function (root) {
  'use strict';

  const MOVES = ['rock', 'paper', 'scissors'];

  // What each move beats, and the word for how it beats it.
  const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  const VERB = { rock: 'crushes', paper: 'covers', scissors: 'cut' };

  const OUTCOME_KEY = { win: 'wins', lose: 'losses', tie: 'ties' };

  const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);

  function assertMove(move) {
    if (!MOVES.includes(move)) throw new Error(`Unknown move: ${move}`);
  }

  /** A random move. `random` is injectable so tests can pick the move. */
  function pickComputerMove(random = Math.random) {
    const index = Math.min(MOVES.length - 1, Math.floor(random() * MOVES.length));
    return MOVES[index];
  }

  /** 'win', 'lose' or 'tie', from the player's side. */
  function decideOutcome(playerMove, computerMove) {
    assertMove(playerMove);
    assertMove(computerMove);
    if (playerMove === computerMove) return 'tie';
    return BEATS[playerMove] === computerMove ? 'win' : 'lose';
  }

  /** The rule that settled the round, e.g. "Paper covers rock." */
  function describeRound(playerMove, computerMove) {
    const outcome = decideOutcome(playerMove, computerMove);
    if (outcome === 'tie') return `${capitalise(playerMove)} meets ${playerMove}.`;
    const [winner, loser] = outcome === 'win' ? [playerMove, computerMove] : [computerMove, playerMove];
    return `${capitalise(winner)} ${VERB[winner]} ${loser}.`;
  }

  function emptyScore() {
    return { wins: 0, losses: 0, ties: 0 };
  }

  /** A new score with one more win, loss or tie. The given score is not changed. */
  function addOutcome(score, outcome) {
    const key = OUTCOME_KEY[outcome];
    if (!key) throw new Error(`Unknown outcome: ${outcome}`);
    return { ...score, [key]: score[key] + 1 };
  }

  /** Read a saved score. Anything missing or damaged starts again from zero. */
  function parseScore(text) {
    try {
      const saved = JSON.parse(text);
      const valid = saved && ['wins', 'losses', 'ties'].every(k => Number.isInteger(saved[k]) && saved[k] >= 0);
      if (valid) return { wins: saved.wins, losses: saved.losses, ties: saved.ties };
    } catch {
      // Not JSON: fall through to a fresh score.
    }
    return emptyScore();
  }

  const Game = { MOVES, pickComputerMove, decideOutcome, describeRound, emptyScore, addOutcome, parseScore };

  if (typeof module === 'object' && module.exports) module.exports = Game;
  else root.Game = Game;
})(typeof globalThis !== 'undefined' ? globalThis : this);
