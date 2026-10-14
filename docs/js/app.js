'use strict';
/* Bildschirme: Start, Station, Runde, Ergebnis, Probetest, Vokabel-Trainer, Checkliste */

const main = document.getElementById('main');
const hdr = document.getElementById('hdr');
const TEST_DATE = new Date(2026, 9, 16);
const TEAMS = {
  green: {de:'Grüne', en:'Greens', la:'Prasina', c:'#2e8b57'},
  blue: {de:'Blaue', en:'Blues', la:'Veneta', c:'#2a6fb0'},
  red: {de:'Rote', en:'Reds', la:'Russata', c:'#c0392b'},
  white: {de:'Weiße', en:'Whites', la:'Albata', c:'#7d7462'},
};
let current = homeView;
function show(fn) { current = fn; fn(); window.scrollTo(0, 0); }
function refresh() { applyTeam(); drawHeader(); current(); }
function applyTeam() { document.documentElement.style.setProperty('--team', (TEAMS[S.team] || TEAMS.green).c); document.documentElement.lang = S.lang; }

function drawHeader() {
  hdr.innerHTML = `<button class="brand" title="${t('home')}"><span class="logo">🏛️</span><span><b>${t('title')}</b><small>${t('subtitle')}</small></span></button>
    <div class="langsw" role="group" aria-label="Sprache / Language">
      <button data-l="de" class="${S.lang === 'de' ? 'on' : ''}">DE</button><button data-l="en" class="${S.lang === 'en' ? 'on' : ''}">EN</button></div>`;
  hdr.querySelector('.brand').onclick = () => show(homeView);
  hdr.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { S.lang = b.dataset.l; save(); refresh(); });
}

// ---------- Start ----------
function countdown() {
  const now = new Date(); const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const n = Math.round((TEST_DATE - d0) / 864e5);
  if (n > 1) return t('daysLeft').replace('{n}', n);
  if (n === 1) return t('oneDay');
  if (n === 0) return t('today');
  return t('past');
}
function stBest(id) { return (S.prog[id] && S.prog[id].best) || 0; }
function homeView() {
  const laps = STATIONS.map(st => stars(stBest(st.id)) >= 2);
  main.innerHTML = `
    <section class="hero">
      <div class="count">📅 ${countdown()}</div>
      <div class="x2box">⚖️ ${t('x2')}</div>
      <div class="laps"><div class="lapt">${t('laps')}: <b>${laps.filter(Boolean).length} / 7</b></div>
        <div class="dolph">${laps.map((on, i) => `<span class="d ${on ? 'on' : ''}" title="${esc(L(STATIONS[i].title))}">${on ? '🐬' : '🥚'}</span>`).join('')}</div>
        <div class="note">${t('lapsHint')}</div></div>
      <div class="teams"><span>${t('team')}:</span>${Object.entries(TEAMS).map(([k, v]) => `<button data-team="${k}" class="teamb ${S.team === k ? 'on' : ''}" style="--c:${v.c}"><i></i>${L(v)} <small class="la">${v.la}</small></button>`).join('')}</div>
    </section>
    <h2>${t('stations')}</h2>
    <div class="cards">${STATIONS.map((st, i) => `
      <button class="card st ${st.x2 ? 'x2' : ''}" data-st="${st.id}">
        <span class="num">${i + 1}</span><span class="ic">${st.icon}</span>
        <span class="ct"><b>${esc(L(st.title))}</b><small>${st.pages}</small></span>
        <span class="stars">${starStr(stars(stBest(st.id)))}</span>
        ${st.x2 ? `<span class="badge">× 2 ${t('x2badge')}</span>` : ''}
      </button>`).join('')}</div>
    <h2>${t('more')}</h2>
    <div class="cards">
      <button class="card big pt" data-go="pt"><span class="ic">📝</span><span class="ct"><b>${t('probetest')}</b><small>${t('ptDesc')}</small></span></button>
      <button class="card big" data-go="vt"><span class="ic">🃏</span><span class="ct"><b>${t('vocabTrainer')}</b><small>${t('vtDesc')}</small></span>${Object.keys(S.hard).length ? `<span class="badge soft">${Object.keys(S.hard).length} ⚠️</span>` : ''}</button>
      <button class="card big" data-go="cl"><span class="ic">✅</span><span class="ct"><b>${t('checklist')}</b><small>${t('clDesc')}</small></span></button>
    </div>
    <footer><button class="btn small ghost" id="reset">${t('reset')}</button>
      <p class="note">${S.lang === 'en' ? 'Progress is saved only in this browser. No account, no tracking.' : 'Der Fortschritt wird nur in diesem Browser gespeichert. Kein Konto, kein Tracking.'}</p></footer>`;
  main.querySelectorAll('[data-team]').forEach(b => b.onclick = () => { S.team = b.dataset.team; save(); refresh(); });
  main.querySelectorAll('[data-st]').forEach(b => b.onclick = () => show(() => stationView(STATIONS.find(s => s.id === b.dataset.st))));
  main.querySelector('[data-go="pt"]').onclick = () => show(ptSelectView);
  main.querySelector('[data-go="vt"]').onclick = () => show(() => vtView('cards'));
  main.querySelector('[data-go="cl"]').onclick = () => show(checklistView);
  const rb = main.querySelector('#reset'); let armed = false;
  rb.onclick = () => { if (!armed) { armed = true; rb.textContent = t('resetSure'); rb.classList.add('danger'); return; }
    S.prog = {}; S.pt = {}; S.hard = {}; S.check = {}; save(); refresh(); };
}

// ---------- Station ----------
function stationView(st) {
  const b = stBest(st.id);
  main.innerHTML = `<button class="btn ghost back">${t('back')}</button>
    <h1>${st.icon} ${esc(L(st.title))}</h1>
    <p class="pages">📖 ${st.pages}${st.x2 ? ` · <span class="badge">× 2 ${t('x2badge')}</span>` : ''}</p>
    <details class="learn" open><summary>${t('learn')}</summary><div class="lc">${LEARN[st.id]()}</div></details>
    ${st.id === 'trans' && S.lang === 'en' ? `<div class="tgtsw">${t('tgt')}: <button data-t="de" class="${S.tgt === 'de' ? 'on' : ''}">${t('tgtDe')}</button><button data-t="en" class="${S.tgt === 'en' ? 'on' : ''}">${t('tgtEn')}</button><div class="note">${t('tgtNote')}</div></div>` : ''}
    <div class="startrow"><button class="btn primary big go">▶ ${t('start')} (${st.n} ${t('tasks')})</button>
      <span class="bestl">${t('best')}: <b>${Math.round(b * 100)} %</b> <span class="stars">${starStr(stars(b))}</span></span></div>
    ${st.id === 'trans' ? `<button class="btn ghost topt">📝 ${t('probetest')} →</button>` : ''}`;
  main.querySelector('.back').onclick = () => show(homeView);
  main.querySelector('.go').onclick = () => startRound({id:st.id, title:st.title, tasks:st.gen(st.n), save:true, back:() => show(() => stationView(st)), again:() => startRound(null, st)});
  main.querySelectorAll('[data-t]').forEach(x => x.onclick = () => { S.tgt = x.dataset.t; save(); stationView(st); });
  const tp = main.querySelector('.topt'); if (tp) tp.onclick = () => show(ptSelectView);
}

// ---------- Runde ----------
function startRound(cfg, st) {
  if (!cfg) cfg = {id:st.id, title:st.title, tasks:st.gen(st.n), save:true, back:() => show(() => stationView(st)), again:() => startRound(null, st)};
  const R = Object.assign({i:0, scores:[], tries:2}, cfg);
  show(() => roundView(R));
}
function roundView(R) {
  const n = R.tasks.length;
  main.innerHTML = `<div class="rhead"><button class="btn ghost back">${t('back')}</button><span class="rtitle">${esc(L(R.title))}</span>
      <span class="rcount">${t('task')} ${R.i + 1} ${t('of')} ${n}</span></div>
    <div class="track"><div class="fill" style="width:${(R.i / n) * 100}%"></div><span class="horse" style="left:calc(${(R.i / n) * 100}% - 14px)">🐎</span><span class="goal">🏁</span></div>
    <div id="taskbox"></div>`;
  main.querySelector('.back').onclick = R.back;
  runTask(R.tasks[R.i], main.querySelector('#taskbox'), {tries:R.tries}, score => {
    const task = R.tasks[R.i];
    if (task.vid) { const c = (S.hard[task.vid] || 0) + (score < 1 ? 1 : -1); if (c > 0) S.hard[task.vid] = c; else delete S.hard[task.vid]; save(); }
    R.scores.push(score); R.i++;
    if (R.i < n) { roundView(R); window.scrollTo(0, 0); } else R.onEnd ? R.onEnd(R) : show(() => resultView(R));
  });
}
function resultView(R) {
  const p = R.scores.reduce((a, b) => a + b, 0) / R.scores.length;
  const st = stars(p);
  let newBest = false;
  if (R.save && !R.saved) { R.saved = true; const old = stBest(R.id); if (p > old) { S.prog[R.id] = {best:p}; newBest = true; } save(); }
  const msg = st === 3 ? (S.lang === 'en' ? 'Victoria! You won the race! 🏆' : 'Victoria! Du hast das Rennen gewonnen! 🏆')
    : st === 2 ? (S.lang === 'en' ? 'Great lap! A little more practice and you’ll win.' : 'Starke Runde! Noch ein bisschen üben, dann gewinnst du.')
    : (S.lang === 'en' ? 'Keep going! Read the “What you need to know” card again and try a new round.' : 'Weiter so! Lies dir die Karte „Das musst du wissen“ nochmal durch und starte eine neue Runde.');
  main.innerHTML = `<div class="result">
    <div class="chariot">🏇</div>
    <h1>${t('result')}: ${Math.round(p * 100)} %</h1>
    <div class="bigstars">${starStr(st)}</div>
    <p>${msg}${newBest ? `<br><b>${S.lang === 'en' ? 'New personal best!' : 'Neuer Rekord!'}</b>` : ''}</p>
    <div class="dots">${R.scores.map(s => `<span class="dot ${s >= 1 ? 'g' : s > 0 ? 'm' : 'b'}"></span>`).join('')}</div>
    <div class="actions"><button class="btn primary again">🔄 ${t('again')}</button><button class="btn ghost back">${t('back')}</button></div></div>`;
  main.querySelector('.again').onclick = R.again;
  main.querySelector('.back').onclick = R.back;
}

// ---------- Probetest ----------
function ptSelectView() {
  main.innerHTML = `<button class="btn ghost back">${t('back')}</button>
    <h1>📝 ${t('probetest')}</h1><p>${t('ptDesc')}</p><div class="x2box">⚖️ ${t('x2')}</div>
    <div class="cards">${TEXTS.map((tx, i) => { const b = S.pt[i] || 0;
      return `<button class="card st" data-v="${i}"><span class="num">${i + 1}</span><span class="ct"><b>${t('version')} ${i + 1}: ${esc(L(tx.title))}</b><small>${b ? `${t('best')}: ${Math.round(b * 100)} %` : '—'}</small></span><span class="stars">${starStr(stars(b))}</span></button>`; }).join('')}</div>`;
  main.querySelector('.back').onclick = () => show(homeView);
  main.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const P = {v:+b.dataset.v, ans:[], checks:{}, solved:false}; show(() => ptAView(P)); });
}
function ptAView(P) {
  const tx = TEXTS[P.v];
  let total = 0; tx.s.forEach(s => total += s.c.length);
  const scoreA = () => Object.values(P.checks).filter(Boolean).length / total;
  main.innerHTML = `<button class="btn ghost back">${t('back')}</button>
    <h1>${t('version')} ${P.v + 1} · ${t('partA')}</h1>
    <div class="x2box small">⚖️ ${S.lang === 'en' ? 'Counts double!' : 'Zählt doppelt!'}</div>
    <p class="note">${t('ptAIntro')}</p>
    <div class="ptext"><h3 class="la">${esc(L(tx.title))}</h3>
      ${tx.s.map((s, i) => `<div class="pline" data-i="${i}">
        <div class="pla la"><span class="ln">${i + 1}</span>${esc(s.la)}</div>
        <textarea rows="2" placeholder="${t('yourTr')} …" ${P.solved ? 'readonly' : ''}>${esc(P.ans[i] || '')}</textarea>
        ${P.solved ? `<div class="psol"><div class="model"><b>${t('model')}:</b> ${esc(s.de)}${s.alt ? ` <span class="sub">(${S.lang === 'en' ? 'or' : 'auch'}: ${esc(s.alt)})</span>` : ''}${S.lang === 'en' ? `<div class="sub">${esc(s.en)}</div>` : ''}</div>
          <div class="pchk">${t('ptCheck')}${s.c.map((c, k) => `<label><input type="checkbox" data-k="${i}_${k}" ${P.checks[i + '_' + k] ? 'checked' : ''}> ${esc(L(c))}</label>`).join('')}</div></div>` : ''}
      </div>`).join('')}
      ${tx.fn ? `<div class="tfn">${esc(L(tx.fn))}</div>` : ''}
    </div>
    <div class="actions">${P.solved ? `<span class="ascore">${t('partA')}: <b id="as">${Math.round(scoreA() * 100)} %</b></span><button class="btn primary nextB">${t('toPartB')}</button>` : `<button class="btn primary sol">${t('showSol')}</button>`}</div>`;
  main.querySelector('.back').onclick = () => show(ptSelectView);
  main.querySelectorAll('textarea').forEach((ta, i) => ta.oninput = () => { P.ans[i] = ta.value; });
  const sb = main.querySelector('.sol'); if (sb) sb.onclick = () => { P.solved = true; ptAView(P); };
  main.querySelectorAll('[data-k]').forEach(cb => cb.onchange = () => { P.checks[cb.dataset.k] = cb.checked; main.querySelector('#as').textContent = Math.round(scoreA() * 100) + ' %'; });
  const nb = main.querySelector('.nextB'); if (nb) nb.onclick = () => {
    P.a = scoreA();
    startRound({id:'ptB', title:{de:`${t('probetest')} ${P.v + 1} · Teil B`, en:`Practice test ${P.v + 1} · part B`}, tasks:genPartB(), tries:1, save:false,
      back:() => show(ptSelectView), onEnd:R => show(() => ptResultView(P, R))});
  };
}
function ptResultView(P, R) {
  const b = R.scores.reduce((x, y) => x + y, 0) / R.scores.length;
  const tot = (2 * P.a + b) / 3;
  if (!P.saved) { P.saved = true; if (tot > (S.pt[P.v] || 0)) S.pt[P.v] = tot; save(); }
  const tip = P.a < b ? (S.lang === 'en' ? 'Tip: your translation is weaker than the exercises – and it counts double. Do the “Translating” station again!' : 'Tipp: Deine Übersetzung war schwächer als die Aufgaben – und sie zählt doppelt. Übe nochmal die Station „Übersetzen“!')
    : (S.lang === 'en' ? 'Tip: practise the stations where you lost points in part B.' : 'Tipp: Übe die Stationen, bei denen du in Teil B Punkte verloren hast.');
  main.innerHTML = `<div class="result"><div class="chariot">🏇</div>
    <h1>${t('probetest')} ${P.v + 1}</h1>
    <table class="gt res"><tbody>
      <tr><td>${t('partA')} (× 2)</td><td><b>${Math.round(P.a * 100)} %</b></td></tr>
      <tr><td>${t('partB')} (× 1)</td><td><b>${Math.round(b * 100)} %</b></td></tr>
      <tr class="tot"><td>${t('total')}</td><td><b>${Math.round(tot * 100)} %</b></td></tr></tbody></table>
    <div class="bigstars">${starStr(stars(tot))}</div>
    <p>${tip}</p>
    <div class="actions"><button class="btn primary nxt">${S.lang === 'en' ? 'Next version' : 'Nächste Version'} →</button><button class="btn ghost back">${t('back')}</button></div></div>`;
  main.querySelector('.back').onclick = () => show(ptSelectView);
  main.querySelector('.nxt').onclick = () => { const Q = {v:(P.v + 1) % TEXTS.length, ans:[], checks:{}, solved:false}; show(() => ptAView(Q)); };
}

// ---------- Vokabel-Trainer ----------
const VT_STATE = {pk:'all', dir:'la', queue:null, cur:null, flipped:false, done:0};
function vtPool(pk) { return pk === 'all' ? VOCAB : pk === 'hard' ? VOCAB.filter(v => S.hard[v.id]) : VOCAB.filter(v => v.pk === pk); }
function vtView(tab) {
  const tabs = `<div class="tabs">${[['cards', t('cards')], ['pairs', t('pairs')], ['hard', t('hard')]].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  main.innerHTML = `<button class="btn ghost back">${t('back')}</button><h1>🃏 ${t('vocabTrainer')}</h1>${tabs}<div id="vt"></div>`;
  main.querySelector('.back').onclick = () => show(homeView);
  main.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => show(() => vtView(b.dataset.tab)));
  const box = main.querySelector('#vt');
  if (tab === 'cards') vtCards(box);
  if (tab === 'pairs') {
    box.innerHTML = `<p>${S.lang === 'en' ? '5 rounds of matching pairs with random words.' : '5 Runden Paare finden mit zufälligen Wörtern.'}</p><button class="btn primary big go">▶ ${t('start')}</button>`;
    const go = () => startRound({id:'pairs', title:{de:'Paare finden', en:'Match the pairs'}, tasks:[0, 1, 2, 3, 4].map(() => vMatch(VOCAB)), save:false,
      back:() => show(() => vtView('pairs')), again:go});
    box.querySelector('.go').onclick = go;
  }
  if (tab === 'hard') {
    const hs = VOCAB.filter(v => S.hard[v.id]).sort((a, b) => S.hard[b.id] - S.hard[a.id]);
    if (!hs.length) { box.innerHTML = `<p class="note">${t('hardNone')}</p>`; return; }
    box.innerHTML = `<table class="gt vt"><tbody>${hs.map(v => `<tr><td class="la">${esc(v.la)}</td><td>${S.lang === 'en' ? esc(v.en) + ' ' + sub(esc(v.de)) : esc(v.de)}</td><td class="g">${'⚠️'.repeat(Math.min(3, S.hard[v.id]))}</td></tr>`).join('')}</tbody></table>
      <button class="btn primary big go">▶ ${S.lang === 'en' ? 'Practise these words' : 'Diese Wörter üben'}</button>`;
    box.querySelector('.go').onclick = () => startRound({id:'hard', title:{de:t('hard'), en:t('hard')}, tasks:genVocab(Math.max(6, Math.min(12, hs.length * 2)), hs), save:false,
      back:() => show(() => vtView('hard')), again:() => show(() => vtView('hard'))});
  }
}
function vtCards(box) {
  const V = VT_STATE;
  const pks = [['all', t('all')], ['L1 A', 'L1 A'], ['L1 B', 'L1 B'], ['L1 C', 'L1 C'], ['L1 T', 'L1 T'], ['L2 ★', 'L2 ★'], ['hard', '⚠️']];
  if (!V.queue) { V.queue = shuffle(vtPool(V.pk)); V.done = 0; V.flipped = false; }
  const v = V.queue[0];
  const front = v ? (V.dir === 'la' ? `<div class="la cbig">${esc(v.la)}</div><div class="g">${esc(gramL(v.g))}</div>` : `<div class="cbig">${S.lang === 'en' ? esc(v.en) + `<div class="sub">${esc(v.de)}</div>` : esc(v.de)}</div>`) : '';
  const back = v ? (V.dir === 'la' ? `<div class="cbig">${S.lang === 'en' ? esc(v.en) + `<div class="sub">${esc(v.de)}</div>` : esc(v.de)}</div>${v.hint ? `<div class="g">→ ${esc(v.hint)}</div>` : ''}` : `<div class="la cbig">${esc(v.la)}</div><div class="g">${esc(gramL(v.g))}</div>`) : '';
  box.innerHTML = `<div class="chips">${pks.map(([k, l]) => `<button data-pk="${k}" class="${V.pk === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="chips"><button data-dir="la" class="${V.dir === 'la' ? 'on' : ''}">${t('dirLa')}</button><button data-dir="de" class="${V.dir === 'de' ? 'on' : ''}">${t('dirDe')}</button></div>
    ${v ? `<div class="fcard ${V.flipped ? 'flipped' : ''}"><div class="face">${V.flipped ? back : front}</div><div class="note">${V.flipped ? '' : t('tapFlip')}</div></div>
      <div class="actions ${V.flipped ? '' : 'hidden'}"><button class="btn bad no">${t('notYet')}</button><button class="btn good yes">${t('knew')}</button></div>
      <p class="note center">${V.queue.length} ${t('left')} · ✓ ${V.done}</p>`
    : `<div class="result"><h2>${vtPool(V.pk).length ? t('cardsDone') : t('hardNone')}</h2>${vtPool(V.pk).length ? `<button class="btn primary again">🔄 ${t('again')}</button>` : ''}</div>`}`;
  box.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { V.pk = b.dataset.pk; V.queue = null; vtCards(box); });
  box.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => { V.dir = b.dataset.dir; V.queue = null; vtCards(box); });
  const fc = box.querySelector('.fcard'); if (fc) fc.onclick = () => { V.flipped = !V.flipped; vtCards(box); };
  const yes = box.querySelector('.yes'), no = box.querySelector('.no');
  if (yes) yes.onclick = () => { const w = V.queue.shift(); V.done++; if (S.hard[w.id]) { S.hard[w.id]--; if (!S.hard[w.id]) delete S.hard[w.id]; save(); } V.flipped = false; vtCards(box); };
  if (no) no.onclick = () => { const w = V.queue.shift(); V.queue.splice(Math.min(V.queue.length, 3 + rnd(3)), 0, w); S.hard[w.id] = (S.hard[w.id] || 0) + 1; save(); V.flipped = false; vtCards(box); };
  const ag = box.querySelector('.again'); if (ag) ag.onclick = () => { V.queue = null; vtCards(box); };
}

// ---------- Checkliste ----------
function checklistView() {
  const lv = S.lang === 'en' ? ['confident', 'fairly confident', 'unsure', 'very unsure'] : ['sicher', 'ziemlich sicher', 'unsicher', 'sehr unsicher'];
  const em = ['😀', '🙂', '😕', '😟'];
  main.innerHTML = `<button class="btn ghost back">${t('back')}</button><h1>✅ ${t('checklist')}</h1><p>${t('clDesc')}</p>
    <div class="clist">${STATIONS.map(st => `<div class="crow2"><div class="cl"><b>${st.icon} ${esc(L(st.title))}</b><small>${st.pages} · ${t('best')}: ${starStr(stars(stBest(st.id)))}</small></div>
      <div class="clb">${lv.map((l, k) => `<button data-c="${st.id}" data-k="${k}" class="${S.check[st.id] === k ? 'on' : ''}" title="${l}">${em[k]}<small>${l}</small></button>`).join('')}</div>
      <button class="btn small ghost gost" data-st="${st.id}">${S.lang === 'en' ? 'Practise' : 'Üben'} →</button></div>`).join('')}</div>
    <p class="note">${S.lang === 'en' ? 'From the teacher’s sheet: “You don’t have to redo every exercise if you already can do it.”' : 'Von der Checkliste: „Wenn du es kannst, musst du nicht alle Aufgaben wiederholen.“'}</p>`;
  main.querySelector('.back').onclick = () => show(homeView);
  main.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { S.check[b.dataset.c] = +b.dataset.k; save(); checklistView(); });
  main.querySelectorAll('[data-st]').forEach(b => b.onclick = () => show(() => stationView(STATIONS.find(s => s.id === b.dataset.st))));
}

// ---------- Los geht's ----------
applyTeam(); drawHeader(); show(homeView);
