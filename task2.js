(() => {
// Task 2 – Option A: Kanban board
const WIP_LIMIT = 3;
const COLS = ['todo', 'doing', 'done'];
const TITLES = { todo: 'To do', doing: 'In progress', done: 'Done' };

const tasks = [
  { id: 1, title: 'Design logo', tag: 'design', priority: 2, status: 'todo', urgent: false },
  { id: 2, title: 'Write HTML skeleton', tag: 'code', priority: 3, status: 'doing', urgent: true },
  { id: 3, title: 'Pick color palette', tag: 'design', priority: 1, status: 'done', urgent: false },
  { id: 4, title: 'Navbar with Bootstrap', tag: 'code', priority: 2, status: 'todo', urgent: false },
  { id: 5, title: 'Write About text', tag: 'content', priority: 1, status: 'todo', urgent: false },
  { id: 6, title: 'Form validation', tag: 'code', priority: 3, status: 'todo', urgent: true },
  { id: 7, title: 'Take photos', tag: 'content', priority: 2, status: 'doing', urgent: false },
  { id: 8, title: 'Mobile layout check', tag: 'code', priority: 2, status: 'todo', urgent: false },
  { id: 9, title: 'Footer design', tag: 'design', priority: 1, status: 'done', urgent: false },
  { id: 10, title: 'Prepare report', tag: 'content', priority: 3, status: 'todo', urgent: true },
  { id: 11, title: 'Deploy to GitHub Pages', tag: 'code', priority: 3, status: 'todo', urgent: false }
];

const board = document.getElementById('board');
const tagSel = document.getElementById('k-tag');
const sortBtn = document.getElementById('k-sort');
const progress = document.getElementById('k-progress');
const ptext = document.getElementById('k-ptext');
const msg = document.getElementById('k-msg');

let tagFilter = 'all', sorted = false, message = '';

// own loop: count cards in a column
function countByStatus(status) {
  let n = 0;
  for (const t of tasks) { if (t.status === status) n++; }
  return n;
}

function makeEl(tag, text, cls) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (cls) el.className = cls;
  return el;
}

function render() {
  board.textContent = '';
  let list = tasks.filter(t => tagFilter === 'all' || t.tag === tagFilter);
  if (sorted) list = [...list].sort((a, b) => b.priority - a.priority);

  for (const col of COLS) {
    const sec = makeEl('section', '', 'column');
    const limit = col === 'doing' ? '/' + WIP_LIMIT : '';
    sec.append(makeEl('h3', TITLES[col] + ' (' + countByStatus(col) + limit + ')'));
    const items = list.filter(t => t.status === col);
    if (items.length === 0) sec.append(makeEl('p', 'Nothing found.', 'empty'));

    for (const t of items) {
      const div = makeEl('div', '', 'task p' + t.priority);
      div.append(makeEl('strong', (t.urgent ? '🔥 ' : '') + t.title));
      div.append(makeEl('span', t.tag + ' · priority ' + t.priority, 'meta'));
      const row = makeEl('div', '', 'row');
      if (col !== 'todo') row.append(makeBtn('←', 'prev', t.id, 'Move back: ' + t.title));
      if (col !== 'done') row.append(makeBtn('→', 'next', t.id, 'Move forward: ' + t.title));
      div.append(row);
      sec.append(div);
    }
    board.append(sec);
  }
  progress.max = tasks.length;
  progress.value = countByStatus('done');
  ptext.textContent = countByStatus('done') + ' of ' + tasks.length + ' finished';
  msg.textContent = message;
}

function makeBtn(label, action, id, aria) {
  const b = makeEl('button', label);
  b.type = 'button';
  b.dataset.action = action;
  b.dataset.id = id;
  b.setAttribute('aria-label', aria);
  return b;
}

function move(id, dir) {
  const t = tasks.find(x => x.id === id);
  const to = COLS[COLS.indexOf(t.status) + dir];
  if (!to) message = 'Cannot move further.';
  else if (to === 'doing' && countByStatus('doing') >= WIP_LIMIT) {
    message = 'Blocked: "In progress" holds at most ' + WIP_LIMIT + ' cards. Finish one first.';
  } else { t.status = to; message = ''; }
  render();
}

// event delegation: one listener for all card buttons
board.addEventListener('click', e => {
  const b = e.target.closest('button[data-action]');
  if (!b) return;
  move(Number(b.dataset.id), b.dataset.action === 'next' ? 1 : -1);
});

tagSel.addEventListener('change', () => { tagFilter = tagSel.value; message = ''; render(); });
sortBtn.addEventListener('click', () => {
  sorted = !sorted;
  sortBtn.setAttribute('aria-pressed', String(sorted));
  sortBtn.textContent = sorted ? 'Sorted by priority ✓' : 'Sort by priority';
  render();
});

const kTitle = document.getElementById('k-title');
document.getElementById('k-form').addEventListener('submit', e => {
  e.preventDefault();
  const title = kTitle.value.trim();
  if (title.length < 3) message = 'Title must have at least 3 characters.';
  else if (tasks.some(t => t.title.toLowerCase() === title.toLowerCase())) message = 'Such a card already exists.';
  else {
    let maxId = 0;
    for (const t of tasks) { if (t.id > maxId) maxId = t.id; }
    const prio = Number(document.getElementById('k-prio').value);
    tasks.push({ id: maxId + 1, title, tag: document.getElementById('k-newtag').value, priority: prio, status: 'todo', urgent: prio === 3 });
    kTitle.value = ''; message = '';
  }
  render();
});

const tags = ['all', ...new Set(tasks.map(t => t.tag))];
for (const tg of tags) { const o = makeEl('option', tg); o.value = tg; tagSel.append(o); }
render();
})();
