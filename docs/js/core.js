'use strict';
/* Sprache, Speicher, Hilfsfunktionen und Aufgabentypen */

// ---------- Speicher ----------
const STORE = 'latein_l12_v1';
const DEF = {lang:'de', team:'green', tgt:'de', prog:{}, pt:{}, hard:{}, check:{}};
let S;
try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { S = Object.assign({}, DEF); }
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }

// ---------- Sprache ----------
const L = x => x == null ? '' : (typeof x === 'object' && !Array.isArray(x) ? (x[S.lang] != null ? x[S.lang] : x.de) : x);
const T = {
  title: {de:'Ad Victoriam!', en:'Ad Victoriam!'},
  subtitle: {de:'Latein-Training · Lektion 1 + 2', en:'Latin training · Lessons 1 + 2'},
  daysLeft: {de:'Noch {n} Tage bis zur Lateinarbeit (Fr., 16.10.)', en:'{n} days until the Latin test (Fri, 16 Oct)'},
  oneDay: {de:'Morgen ist die Lateinarbeit! Bonum eventum!', en:'The Latin test is tomorrow! Bonum eventum!'},
  today: {de:'Heute ist die Lateinarbeit. Bonum eventum!', en:'The Latin test is today. Bonum eventum!'},
  past: {de:'Lateinarbeit Lektion 1 + 2', en:'Latin test lessons 1 + 2'},
  x2: {de:'Die Übersetzung zählt doppelt so viel wie die Aufgaben (2 : 1). Übe sie besonders oft!', en:'The translation counts twice as much as the exercises (2 : 1). Practise it the most!'},
  laps: {de:'Deine Runden im Circus', en:'Your laps in the Circus'},
  lapsHint: {de:'Jede Station mit mindestens 2 ★ dreht einen Delfin um. 7 Delfine = Rennen gewonnen!', en:'Every station with at least 2 ★ flips a dolphin. 7 dolphins = race won!'},
  stations: {de:'Stationen (wie auf der Checkliste)', en:'Stations (as on the checklist)'},
  more: {de:'Training & Test', en:'Training & test'},
  team: {de:'Dein Rennstall', en:'Your team'},
  start: {de:'Übungsrunde starten', en:'Start practice round'},
  again: {de:'Neue Runde (andere Aufgaben)', en:'New round (different tasks)'},
  back: {de:'← Zurück', en:'← Back'},
  home: {de:'Startseite', en:'Home'},
  next: {de:'Weiter →', en:'Next →'},
  check: {de:'Prüfen', en:'Check'},
  learn: {de:'Das musst du wissen', en:'What you need to know'},
  tasks: {de:'Aufgaben', en:'tasks'},
  best: {de:'Bestes Ergebnis', en:'Best result'},
  task: {de:'Aufgabe', en:'Task'},
  of: {de:'von', en:'of'},
  tryAgain: {de:'Noch nicht ganz. Versuch es nochmal!', en:'Not quite. Try again!'},
  solution: {de:'Lösung', en:'Solution'},
  wasRight: {de:'Meine Antwort war doch richtig', en:'My answer was right after all'},
  result: {de:'Ergebnis', en:'Result'},
  points: {de:'Punkte', en:'points'},
  x2badge: {de:'zählt doppelt', en:'counts double'},
  probetest: {de:'Probetest', en:'Practice test'},
  ptDesc: {de:'Wie die echte Arbeit: Teil A Übersetzung (zählt doppelt), Teil B Aufgaben. 6 Versionen mit verschiedenen Texten.', en:'Like the real test: part A translation (counts double), part B exercises. 6 versions with different texts.'},
  version: {de:'Version', en:'Version'},
  partA: {de:'Teil A · Übersetzung', en:'Part A · Translation'},
  partB: {de:'Teil B · Aufgaben', en:'Part B · Exercises'},
  ptAIntro: {de:'Übersetze den Text ins Deutsche. Schreib auf ein Blatt oder in die Felder. Erst wenn du fertig bist, schaust du dir die Lösung an und prüfst dich selbst. Am besten schaut ein Erwachsener mit drauf!', en:'Translate the text into German (in the real test it is German!). Write on paper or in the boxes. Only when you are finished, look at the solution and check yourself. Even better: ask a grown-up to check with you!'},
  showSol: {de:'Fertig – Lösung zeigen', en:'Done – show solution'},
  ptCheck: {de:'Hake ab, was du richtig hast:', en:'Tick what you got right:'},
  toPartB: {de:'Weiter zu Teil B →', en:'Continue to part B →'},
  ptBIntro: {de:'12 Aufgaben, jeweils nur ein Versuch – wie in der echten Arbeit.', en:'12 tasks, only one try each – like in the real test.'},
  total: {de:'Gesamt (Übersetzung × 2 + Aufgaben) ÷ 3', en:'Total (translation × 2 + exercises) ÷ 3'},
  yourTr: {de:'Deine Übersetzung', en:'Your translation'},
  model: {de:'Musterlösung', en:'Model answer'},
  vocabTrainer: {de:'Vokabel-Trainer', en:'Vocabulary trainer'},
  vtDesc: {de:'Karteikarten, Paare finden und deine schwierigen Wörter', en:'Flashcards, matching pairs and your tricky words'},
  cards: {de:'Karteikarten', en:'Flashcards'},
  pairs: {de:'Paare finden', en:'Match the pairs'},
  hard: {de:'Meine schwierigen Wörter', en:'My tricky words'},
  hardNone: {de:'Noch keine schwierigen Wörter – super! Wörter, bei denen du Fehler machst, landen automatisch hier.', en:'No tricky words yet – great! Words you get wrong end up here automatically.'},
  all: {de:'Alle', en:'All'},
  dirLa: {de:'Latein → Deutsch', en:'Latin → meaning'},
  dirDe: {de:'Deutsch → Latein', en:'meaning → Latin'},
  tapFlip: {de:'Tippe auf die Karte zum Umdrehen', en:'Tap the card to flip it'},
  knew: {de:'Wusste ich ✓', en:'Knew it ✓'},
  notYet: {de:'Noch nicht ✗', en:'Not yet ✗'},
  cardsDone: {de:'Alle Karten geschafft! 🎉', en:'All cards done! 🎉'},
  left: {de:'übrig', en:'left'},
  checklist: {de:'Checkliste', en:'Checklist'},
  clDesc: {de:'Wie sicher fühlst du dich? Kreuze an wie auf dem Blatt.', en:'How confident do you feel? Tick it like on the sheet.'},
  reset: {de:'Fortschritt löschen', en:'Reset progress'},
  resetSure: {de:'Wirklich? Nochmal tippen zum Löschen', en:'Really? Tap again to reset'},
  tgt: {de:'Übersetzen ins', en:'Translate into'},
  tgtDe: {de:'Deutsche', en:'German'},
  tgtEn: {de:'Englische', en:'English'},
  tgtNote: {de:'', en:'The test is in German. Switch to German translations once you understand the sentences!'},
  inTest: {de:'', en:'In German (as in the test):'},
  footnote: {de:'Fußnote', en:'Footnote'},
  tipsTitle: {de:'Lerntipps aus dem Begleitband', en:'Study tips from the companion book'},
};
const t = k => (T[k] ? L(T[k]) : k);
const PRAISE = ['Bene! 🎉', 'Optime! ⭐', 'Richtig! 👍', 'Super! 🏆', 'Euge! 🐎'];
const PRAISE_EN = ['Bene! 🎉', 'Optime! ⭐', 'Correct! 👍', 'Great! 🏆', 'Euge! 🐎'];

// ---------- Hilfsfunktionen ----------
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pick = a => a[Math.floor(Math.random() * a.length)];
const sample = (a, n) => shuffle(a).slice(0, n);
const rnd = n => Math.floor(Math.random() * n);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function strip(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function normLa(s) { return strip(s).toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim(); }
function normDe(s) { return s.toLowerCase().replace(/ß/g, 'ss').replace(/[.,;:!?„“”"'’»«()\-–…¹²]/g, ' ').replace(/\s+/g, ' ').trim(); }
const ART = /^(der|die|das|den|dem|ein|eine|einen|er|sie|es|zu|to|the|a|an)\s+/;
function meaningSet(m) {
  const out = new Set();
  const add = p => { p = normDe(p); if (!p) return; out.add(p); out.add(p.replace(ART, '')); };
  add(m.replace(/[()]/g, ''));
  m.replace(/\(.*?\)/g, ' ').split(/[,;\/!?·]/).forEach(add);
  return out;
}
function meaningOk(ans, meanings) {
  const set = new Set(); meanings.forEach(m => meaningSet(m).forEach(x => set.add(x)));
  return ans.split(/[,;\/]/).some(a => { a = normDe(a); return a && (set.has(a) || set.has(a.replace(ART, ''))); });
}
function stars(p) { return p >= 0.9 ? 3 : p >= 0.7 ? 2 : p >= 0.4 ? 1 : 0; }
function starStr(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }
function laSpan(s) { return `<span class="la">${esc(s)}</span>`; }

// ---------- Aufgaben-Rahmen ----------
// task: {type, q, la?, fn?, ex?, hint?, sol?, ...}
function runTask(task, root, opt, onDone) {
  const tries = opt.tries || 2;
  let attempt = 1, finished = false, score = 0;
  root.innerHTML = `<div class="task">
    ${task.tag ? `<div class="ttag">${esc(L(task.tag))}</div>` : ''}
    <div class="tq">${L(task.q)}</div>
    ${task.la ? `<div class="tla la">${task.laHtml ? task.la : esc(task.la)}</div>` : ''}
    ${task.fn ? `<div class="tfn">${esc(L(task.fn))}</div>` : ''}
    <div class="tbody"></div>
    <div class="fb" aria-live="polite"></div>
    <div class="actions"><button class="btn primary chk">${t('check')}</button><button class="btn primary nxt hidden">${t('next')}</button></div>
  </div>`;
  const body = root.querySelector('.tbody'), fb = root.querySelector('.fb');
  const chk = root.querySelector('.chk'), nxt = root.querySelector('.nxt');
  const api = { submit, finish };
  const R = RENDER[task.type](task, body, api);
  if (!R.needsCheck) chk.classList.add('hidden');
  chk.onclick = submit;
  nxt.onclick = () => onDone(score);

  function submit() {
    if (finished) return;
    const res = R.check();
    if (res === null || res === undefined) return;
    if (res === true) {
      fb.className = 'fb good';
      fb.innerHTML = `<b>${pick(S.lang === 'en' ? PRAISE_EN : PRAISE)}</b>${exHtml()}`;
      finish(attempt === 1 ? 1 : 0.5, true);
    } else if (attempt < tries) {
      attempt++;
      fb.className = 'fb bad';
      fb.innerHTML = `<b>${t('tryAgain')}</b>${task.hint ? `<div class="hint">💡 ${L(task.hint)}</div>` : ''}`;
      if (R.retry) R.retry();
    } else {
      if (R.reveal) R.reveal();
      fb.className = 'fb bad';
      const sol = task.sol && !Array.isArray(task.sol) ? `<div class="sol">${t('solution')}: <b>${L(task.sol)}</b></div>` : '';
      fb.innerHTML = `${sol}${exHtml()}`;
      if (R.override) {
        const b = document.createElement('button'); b.className = 'btn small ghost'; b.textContent = t('wasRight');
        b.onclick = () => { score = attempt === 1 ? 1 : 0.5; b.remove(); fb.className = 'fb good'; };
        fb.appendChild(b);
      }
      finish(0, true);
    }
  }
  function exHtml() { return task.ex ? `<div class="ex">${L(task.ex)}</div>` : ''; }
  function finish(s, fromSubmit) {
    finished = true; score = s;
    if (!fromSubmit) { fb.className = 'fb ' + (s >= 0.99 ? 'good' : s > 0 ? 'mid' : 'bad'); fb.innerHTML = `<b>${s >= 0.99 ? pick(S.lang === 'en' ? PRAISE_EN : PRAISE) : Math.round(s * 100) + ' %'}</b>${exHtml()}`; }
    if (R.lock) R.lock();
    chk.classList.add('hidden'); nxt.classList.remove('hidden');
    setTimeout(() => nxt.focus({preventScroll: true}), 30);
  }
}

// ---------- Aufgabentypen ----------
const RENDER = {
  // Multiple Choice: o = [{h, ok}]
  mc(task, body, api) {
    const opts = task.keep ? task.o : shuffle(task.o);
    const wrap = document.createElement('div');
    wrap.className = 'opts' + (task.grid ? ' grid' : '');
    body.appendChild(wrap);
    let chosen = null;
    opts.forEach(o => {
      const b = document.createElement('button');
      b.className = 'opt' + (task.laOpts ? ' la' : '');
      b.innerHTML = L(o.h);
      b.onclick = () => { if (b.disabled) return; chosen = o; api.submit(); };
      o._b = b; wrap.appendChild(b);
    });
    return {
      check() { if (!chosen) return null; const c = chosen; chosen = null;
        if (c.ok) { c._b.classList.add('good'); return true; }
        c._b.classList.add('bad'); c._b.disabled = true; return false; },
      reveal() { opts.forEach(o => { if (o.ok) o._b.classList.add('good'); }); },
      lock() { opts.forEach(o => o._b.disabled = true); },
    };
  },
  // Eingabe: a = Antworten, mode = 'la' | 'mean' | 'de'
  type(task, body, api) {
    body.innerHTML = `<input class="inp${task.mode === 'la' ? ' la' : ''}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${esc(L(task.ph) || '…')}">
      ${task.mode === 'la' ? `<div class="note">${S.lang === 'en' ? 'Long marks (ā, ē …) are optional.' : 'Längenstriche (ā, ē …) musst du nicht tippen.'}</div>` : ''}`;
    const inp = body.querySelector('input');
    setTimeout(() => inp.focus({preventScroll: true}), 60);
    inp.onkeydown = e => { if (e.key === 'Enter') api.submit(); };
    const ok = v => task.mode === 'mean' ? meaningOk(v, task.a)
      : task.mode === 'la' ? task.a.some(a => normLa(a) === normLa(v))
      : task.a.some(a => normDe(a) === normDe(v));
    return {
      needsCheck: true, override: task.mode === 'mean',
      check() { const v = inp.value.trim(); if (!v) return null; const r = ok(v); inp.classList.toggle('good', r); inp.classList.toggle('bad', !r); return r; },
      retry() { inp.select(); },
      lock() { inp.disabled = true; },
    };
  },
  // Wort-Baukasten: tiles = Wörter (inkl. Ablenker), sol = [[…], …], anyOrder
  tiles(task, body) {
    const items = shuffle(task.tiles.map((w, i) => ({w, i})));
    body.innerHTML = `<div class="line"></div><div class="pool"></div>`;
    const line = body.querySelector('.line'), pool = body.querySelector('.pool');
    let chosen = [], locked = false;
    const nrm = task.lat ? normLa : normDe;
    function draw() {
      line.innerHTML = chosen.length ? '' : `<span class="ph">${S.lang === 'en' ? 'Tap the words in the right order' : 'Tippe die Wörter in der richtigen Reihenfolge an'}</span>`;
      chosen.forEach((it, k) => { const b = document.createElement('button'); b.className = 'tile in' + (task.lat ? ' la' : ''); b.textContent = it.w;
        b.onclick = () => { if (locked) return; chosen.splice(k, 1); draw(); }; line.appendChild(b); });
      pool.innerHTML = '';
      items.forEach(it => { const b = document.createElement('button'); b.className = 'tile' + (task.lat ? ' la' : ''); b.textContent = it.w;
        if (chosen.includes(it)) b.classList.add('used');
        b.onclick = () => { if (locked || chosen.includes(it)) return; chosen.push(it); line.classList.remove('good', 'bad'); draw(); }; pool.appendChild(b); });
    }
    draw();
    return {
      needsCheck: true,
      check() {
        if (!chosen.length) return null;
        const got = chosen.map(c => nrm(c.w));
        const ok = task.sol.some(s => { const want = s.map(nrm);
          if (task.anyOrder) return want.length === got.length && want.slice().sort().join('|') === got.slice().sort().join('|');
          return want.join(' ') === got.join(' '); });
        line.classList.toggle('good', ok); line.classList.toggle('bad', !ok); return ok;
      },
      reveal() { const d = document.createElement('div'); d.className = 'solline' + (task.lat ? ' la' : ''); d.textContent = task.sol[0].join(' '); body.appendChild(d); },
      lock() { locked = true; },
    };
  },
  // Wörter antippen: tokens, e = richtige Indizes, opt = erlaubte Extras, single = sofort prüfen
  tap(task, body, api) {
    const wrap = document.createElement('div'); wrap.className = 'tapline' + (task.lat ? ' la' : ''); body.appendChild(wrap);
    const sel = new Set(); let locked = false;
    const btns = task.tokens.map((w, i) => { const b = document.createElement('button'); b.className = 'tok'; b.textContent = w;
      b.onclick = () => { if (locked || b.disabled) return; if (task.single) { sel.clear(); btns.forEach(x => x.classList.remove('sel')); }
        sel.has(i) ? sel.delete(i) : sel.add(i); b.classList.toggle('sel'); if (task.single) api.submit(); };
      wrap.appendChild(b); return b; });
    return {
      needsCheck: !task.single,
      check() {
        if (!sel.size) return null;
        const allowed = new Set([...task.e, ...(task.opt || [])]);
        const ok = task.e.every(i => sel.has(i)) && [...sel].every(i => allowed.has(i));
        if (!ok && task.single) { sel.forEach(i => { btns[i].classList.add('bad'); btns[i].disabled = true; btns[i].classList.remove('sel'); }); sel.clear(); }
        if (ok) task.e.forEach(i => btns[i].classList.add('good'));
        return ok;
      },
      reveal() { btns.forEach(b => b.classList.remove('sel')); task.e.forEach(i => btns[i].classList.add('good')); },
      lock() { locked = true; },
    };
  },
  // Wörterschlange: words → Trennstellen setzen
  snake(task, body) {
    const letters = task.words.join('').toUpperCase().split('');
    const want = new Set(); let p = 0; task.words.slice(0, -1).forEach(w => { p += w.length; want.add(p - 1); });
    const cuts = new Set(); let locked = false;
    const wrap = document.createElement('div'); wrap.className = 'snake'; body.appendChild(wrap);
    const note = document.createElement('div'); note.className = 'note';
    note.textContent = S.lang === 'en' ? 'Tap a letter to put a cut after it. Tap again to remove it.' : 'Tippe auf einen Buchstaben, um danach zu trennen. Nochmal tippen nimmt den Strich weg.';
    body.appendChild(note);
    function draw() {
      wrap.innerHTML = '';
      letters.forEach((ch, i) => { const s = document.createElement('button'); s.className = 'sl' + (cuts.has(i) ? ' cut' : ''); s.textContent = ch;
        s.onclick = () => { if (locked || i === letters.length - 1) return; cuts.has(i) ? cuts.delete(i) : cuts.add(i); draw(); }; wrap.appendChild(s); });
    }
    draw();
    return {
      needsCheck: true,
      check() { if (!cuts.size) return null; const ok = cuts.size === want.size && [...want].every(i => cuts.has(i)); wrap.classList.toggle('bad', !ok); wrap.classList.toggle('good', ok); return ok; },
      reveal() { cuts.clear(); want.forEach(i => cuts.add(i)); draw(); wrap.classList.remove('bad'); },
      lock() { locked = true; },
    };
  },
  // Paare finden: pairs = [{l, r}]
  match(task, body, api) {
    body.innerHTML = '<div class="match"><div class="mcol l"></div><div class="mcol r"></div></div>';
    const lc = body.querySelector('.l'), rc = body.querySelector('.r');
    let selL = null, selR = null, done = 0, miss = 0;
    const mk = (col, txt, side, k, la) => { const b = document.createElement('button'); b.className = 'mbtn' + (la ? ' la' : ''); b.innerHTML = txt; b.dataset.k = k;
      b.onclick = () => { if (b.disabled) return; col.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        if (side === 'l') selL = b; else selR = b; test(); }; col.appendChild(b); };
    task.pairs.forEach((p, k) => mk(lc, esc(p.l), 'l', k, true));
    shuffle(task.pairs.map((p, k) => ({p, k}))).forEach(({p, k}) => mk(rc, esc(p.r), 'r', k, false));
    function test() {
      if (!selL || !selR) return;
      const a = selL, b = selR; selL = selR = null;
      a.classList.remove('sel'); b.classList.remove('sel');
      if (a.dataset.k === b.dataset.k) { a.classList.add('good'); b.classList.add('good'); a.disabled = b.disabled = true; done++;
        if (done === task.pairs.length) api.finish(Math.max(0, 1 - miss * 0.15)); }
      else { miss++; a.classList.add('shake'); b.classList.add('shake'); setTimeout(() => { a.classList.remove('shake'); b.classList.remove('shake'); }, 450); }
    }
    return { lock() {} };
  },
  // Sortieren: items = [{h, b}], buckets = [label…]
  sort(task, body) {
    const items = shuffle(task.items); const ch = new Map(); let locked = false;
    const wrap = document.createElement('div'); wrap.className = 'sortlist'; body.appendChild(wrap);
    items.forEach(it => {
      const row = document.createElement('div'); row.className = 'srow';
      row.innerHTML = `<span class="sitem la">${esc(it.h)}</span><span class="sbtns"></span>`;
      const bs = row.querySelector('.sbtns');
      task.buckets.forEach((lab, bi) => { const b = document.createElement('button'); b.className = 'sb'; b.textContent = L(lab);
        b.onclick = () => { if (locked) return; ch.set(it, bi); row.classList.remove('good', 'bad'); bs.querySelectorAll('.sb').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); };
        bs.appendChild(b); });
      it._row = row; it._bs = bs; wrap.appendChild(row);
    });
    return {
      needsCheck: true,
      check() { if (ch.size < items.length) return null; let ok = true;
        items.forEach(it => { const r = ch.get(it) === it.b; it._row.classList.toggle('good', r); it._row.classList.toggle('bad', !r); if (!r) ok = false; }); return ok; },
      reveal() { items.forEach(it => { it._bs.querySelectorAll('.sb').forEach((x, bi) => x.classList.toggle('sel', bi === it.b)); it._row.classList.remove('bad'); it._row.classList.add('good'); }); },
      lock() { locked = true; },
    };
  },
  // Tabelle ausfüllen: rows = [{label, a, given?}]
  table(task, body) {
    const wrap = document.createElement('div'); wrap.className = 'ctable'; body.appendChild(wrap);
    const inputs = task.rows.map(r => {
      const row = document.createElement('div'); row.className = 'crow';
      row.innerHTML = `<span class="clab">${esc(L(r.label))}</span>` + (r.given ? `<span class="la cgiven">${esc(r.a)}</span>` : `<input class="inp la" autocomplete="off" autocapitalize="off" spellcheck="false">`);
      wrap.appendChild(row); return row.querySelector('input');
    });
    const first = inputs.find(Boolean); if (first) setTimeout(() => first.focus({preventScroll: true}), 60);
    return {
      needsCheck: true,
      check() { if (inputs.every(i => !i || !i.value.trim())) return null; let ok = true;
        inputs.forEach((inp, k) => { if (!inp) return; const r = normLa(inp.value) === normLa(task.rows[k].a); inp.classList.toggle('good', r); inp.classList.toggle('bad', !r); if (!r) ok = false; });
        return ok; },
      reveal() { inputs.forEach((inp, k) => { if (inp && !inp.classList.contains('good')) { inp.value = task.rows[k].a; inp.classList.remove('bad'); inp.classList.add('fixed'); } }); },
      lock() { inputs.forEach(i => i && (i.disabled = true)); },
    };
  },
};
