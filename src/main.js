/* Page behaviour: buttons, keyboard shortcuts, auto play and the saved score. Rules live in game.js. */
(function () {
  'use strict';

  const { MOVES, pickComputerMove, decideOutcome, describeRound, emptyScore, addOutcome, parseScore } = window.Game;

  const STORAGE_KEY = 'score';
  const AUTO_PLAY_MS = 1000;
  const KEYS = { r: 'rock', p: 'paper', s: 'scissors' };
  const VERDICT = { win: 'You win', lose: 'You lose', tie: 'Tie' };

  // localStorage can be unavailable (private windows, blocked site data); the game still works, it just forgets.
  const storage = {
    read() {
      try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
    },
    write(score) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(score)); } catch { /* not saved */ }
    },
    clear() {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* nothing to clear */ }
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const ui = {
    you: $('[data-slot="you"]'),
    computer: $('[data-slot="computer"]'),
    phrase: $('.phrase'),
    outcome: $('.outcome'),
    moveButtons: document.querySelectorAll('[data-move]'),
    score: {
      wins: $('[data-score="wins"]'),
      losses: $('[data-score="losses"]'),
      ties: $('[data-score="ties"]')
    },
    autoPlay: $('.auto-play'),
    reset: $('.reset-score')
  };

  let score = parseScore(storage.read());
  let autoPlayTimer = null;

  function renderScore() {
    for (const key of Object.keys(ui.score)) ui.score[key].textContent = score[key];
  }

  function showHand(slot, move) {
    const img = document.createElement('img');
    img.src = `images/${move}-emoji.png`;
    img.alt = move;
    slot.replaceChildren(img);
    // Restart the landing animation for every throw, even the same move twice.
    slot.classList.remove('is-thrown');
    void slot.offsetWidth;
    slot.classList.add('is-thrown');
  }

  function play(playerMove) {
    const computerMove = pickComputerMove();
    const outcome = decideOutcome(playerMove, computerMove);

    score = addOutcome(score, outcome);
    storage.write(score);

    showHand(ui.you, playerMove);
    showHand(ui.computer, computerMove);
    ui.phrase.textContent = describeRound(playerMove, computerMove);
    ui.outcome.textContent = VERDICT[outcome];
    ui.outcome.dataset.outcome = outcome;
    ui.outcome.hidden = false;
    renderScore();
  }

  function setAutoPlay(on) {
    if (on && !autoPlayTimer) {
      autoPlayTimer = setInterval(() => play(pickComputerMove()), AUTO_PLAY_MS);
    } else if (!on && autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
    ui.autoPlay.setAttribute('aria-pressed', String(on));
    ui.autoPlay.textContent = on ? 'Stop auto play' : 'Auto play';
  }

  function resetScore() {
    score = emptyScore();
    storage.clear();
    renderScore();
  }

  for (const button of ui.moveButtons) {
    button.addEventListener('click', () => play(button.dataset.move));
  }
  ui.autoPlay.addEventListener('click', () => setAutoPlay(!autoPlayTimer));
  ui.reset.addEventListener('click', resetScore);

  document.addEventListener('keydown', (event) => {
    // Leave browser shortcuts alone (Ctrl+R reloads, Ctrl+P prints) and ignore a held-down key.
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const move = KEYS[event.key.toLowerCase()];
    if (move && MOVES.includes(move)) play(move);
  });

  renderScore();
})();
