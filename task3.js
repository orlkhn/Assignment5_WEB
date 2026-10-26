(() => {
// Task 3 – Option A: Ticket builder
const EVENTS = ['Rock Night', 'Jazz Evening', 'Stand-up Show'];
const TYPES = [
  { id: 'standard', label: 'Standard', price: 5000, seats: 20 },
  { id: 'vip', label: 'VIP', price: 12000, seats: 5 },
  { id: 'student', label: 'Student', price: 2500, seats: 8 }
];
const SOLD_OUT = ['2026-12-31', '2026-12-25', '2026-11-15'];
const PROMOS = { SAVE10: 10, STUDENT20: 20 };
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TODAY = new Date().toISOString().slice(0, 10);

const f = document.getElementById('t-form');
const E = f.elements;
f.noValidate = true;
E.date.min = TODAY;
const summary = document.getElementById('t-summary');
const result = document.getElementById('t-result');
const fields = [...f.elements].filter(el => el.name);
const touched = new Set();

const typeOf = () => TYPES.find(t => t.id === E.type.value);

// rules that HTML attributes cannot express
const RULES = {
  name: v => /^\p{L}{2,}(?: \p{L}{2,})+$/u.test(v) ? '' : 'Enter first and last name, letters only.',
  date: v => SOLD_OUT.includes(v) ? 'This date is sold out.' : '',
  quantity: v => Number(v) > typeOf().seats ? 'Only ' + typeOf().seats + ' seats left for ' + typeOf().label + '.' : '',
  promo: v => v === '' || v.toUpperCase() in PROMOS ? '' : 'Unknown promo code.',
  email: v => E.type.value === 'student' && !/\.edu(\.[a-z]{2})?$/i.test(v) ? 'Student tickets need an .edu e-mail.' : ''
};

function setError(el, m) {
  const err = document.getElementById('e-' + el.name);
  if (err) err.textContent = m;
  el.setAttribute('aria-invalid', m ? 'true' : 'false');
  el.classList.toggle('invalid', m !== '');
  el.classList.toggle('valid', m === '' && el.value !== '');
}

function check(el) {
  let m = '';
  if (el.validity.valueMissing) m = 'This field is required.';
  else if (el.validity.typeMismatch) m = 'Enter a valid value.';
  else if (el.validity.rangeUnderflow || el.validity.rangeOverflow) m = 'Value is out of the allowed range.';
  else if (el.validity.tooShort) m = 'Too short.';
  else if (RULES[el.name]) m = RULES[el.name](el.value.trim());
  setError(el, m);
  return m === '';
}

function recheck() { for (const el of fields) if (touched.has(el.name)) check(el); }

function total() {
  const code = E.promo.value.trim().toUpperCase();
  const disc = code in PROMOS ? PROMOS[code] : 0;
  const qty = Number(E.quantity.value) || 0;
  return Math.round(typeOf().price * qty * (100 - disc) / 100);
}

function preview() {
  const set = (id, v) => { document.getElementById(id).textContent = v || '—'; };
  set('p-event', E.event.value); set('p-date', E.date.value);
  set('p-type', typeOf().label); set('p-qty', E.quantity.value);
  set('p-name', E.name.value.trim());
  document.getElementById('p-total').textContent = total() + ' ₸';
}

function fillSelects() {
  for (const o of E.type.options) {
    const ty = TYPES.find(x => x.id === o.value);
    o.textContent = ty.label + ' – ' + ty.price + ' ₸ (' + ty.seats + ' left)';
  }
}

for (const el of fields) {
  el.addEventListener('blur', () => { touched.add(el.name); check(el); });
  el.addEventListener('input', () => { recheck(); preview(); });
  el.addEventListener('change', () => { recheck(); preview(); });
}

f.addEventListener('submit', e => {
  e.preventDefault();
  let count = 0, first = null;
  for (const el of fields) {
    touched.add(el.name);
    if (!check(el)) { count++; if (!first) first = el; }
  }
  if (count > 0) {
    summary.textContent = count + (count === 1 ? ' error' : ' errors') + ' – please fix them.';
    summary.classList.add('show');
    first.focus();
    return;
  }
  summary.textContent = ''; summary.classList.remove('show');
  const qty = Number(E.quantity.value), sum = total();
  const code = 'TK-' + Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  const type = typeOf();
  type.seats -= qty;

  result.textContent = '';
  const box = document.createElement('div'); box.className = 'ticket';
  const h = document.createElement('h3'); h.textContent = 'Booking ' + code;
  const lines = [E.event.value + ' – ' + E.date.value, type.label + ' × ' + qty,
                 'Holder: ' + E.name.value.trim(), 'Total paid: ' + sum + ' ₸'];
  box.append(h);
  for (const l of lines) { const p = document.createElement('p'); p.textContent = l; box.append(p); }
  result.append(box);

  f.reset(); touched.clear();
  for (const el of fields) { el.removeAttribute('aria-invalid'); el.classList.remove('invalid', 'valid'); }
  for (const s of f.querySelectorAll('.err')) s.textContent = '';
  fillSelects(); preview();
});

fillSelects(); preview();
})();
