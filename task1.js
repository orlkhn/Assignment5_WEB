(() => {
// Task 1 – Option A: Higher or Lower
const LIVES = 3, MIN_VALUE = 1, MAX_VALUE = 10, WIN_STREAK = 8;
const NAMES = ['Inception', 'Up', 'Heat', 'Alien', 'Fargo', 'Joker', 'Coco', 'Her', 'Se7en', 'Gladiator'];

const card = document.getElementById('g-card');
const stats = document.getElementById('g-stats');
const status = document.getElementById('g-status');
const restartBtn = document.getElementById('g-restart');

let lives, streak, best = 0, current, over;

// whole number from min to max, both included
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick() { return { name: NAMES[rand(0, NAMES.length - 1)], value: rand(MIN_VALUE, MAX_VALUE) }; }

function render(text, cls) {
  card.textContent = current.name + ': ' + current.value + ' / ' + MAX_VALUE;
  stats.textContent = 'Lives: ' + lives + '  |  Streak: ' + streak + '  |  Best: ' + best;
  status.textContent = text;
  status.className = cls || '';
  restartBtn.hidden = !over;
}

function start() {
  lives = LIVES; streak = 0; over = false; current = pick();
  render('New game. Make your guess!', '');
}

function guess(choice) {
  if (over) { render('Game is over – press Restart.', 'bad'); return; }
  if (choice !== 'higher' && choice !== 'lower') { render('Invalid move.', 'bad'); return; }
  const next = pick();
  const right = (choice === 'higher' && next.value >= current.value) ||
                (choice === 'lower' && next.value <= current.value);
  let text, cls;
  if (right) {
    streak++;
    if (streak > best) best = streak;
    text = 'Right! Next was ' + next.value + '.'; cls = 'ok';
  } else {
    lives--;
    streak = 0;
    text = 'Wrong! Next was ' + next.value + '.'; cls = 'bad';
  }
  current = next;
  if (streak === WIN_STREAK) { over = true; text = 'You win! Streak ' + WIN_STREAK + '!'; cls = 'win'; }
  else if (lives === 0) { over = true; text = 'Game over – no lives left.'; cls = 'loss'; }
  render(text, cls);
}

document.getElementById('g-higher').addEventListener('click', () => guess('higher'));
document.getElementById('g-lower').addEventListener('click', () => guess('lower'));
restartBtn.addEventListener('click', start);
const gInput = document.getElementById('g-input');
document.getElementById('g-form').addEventListener('submit', e => {
  e.preventDefault();
  const v = gInput.value.trim().toLowerCase();
  gInput.value = '';
  const map = { h: 'higher', higher: 'higher', l: 'lower', lower: 'lower' };
  if (!Object.hasOwn(map, v)) { render('Invalid input: type "higher" or "lower" (or h / l).', 'bad'); return; }
  guess(map[v]);
});
start();
})();
