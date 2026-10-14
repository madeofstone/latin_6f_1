'use strict';
/* Stationen, Erklärkarten und Aufgaben-Generatoren */

const en = () => S.lang === 'en';
const sub = s => `<span class="sub">${s}</span>`;

// ---------- Vokabeln ----------
const gramL = g => !g ? '' : (en() ? (GRAM_EN[g] || g) : g);
const vMean = v => en() ? `${esc(v.en)} ${sub('· ' + esc(v.de))}` : esc(v.de);
function overlap(a, b) { const x = meaningSet(a.de); for (const y of meaningSet(b.de)) if (x.has(y)) return true; return false; }
function vDistract(v, n) {
  let pool = VOCAB.filter(x => x !== v && x.pos === v.pos && !overlap(x, v));
  if (pool.length < n) pool = VOCAB.filter(x => x !== v && !overlap(x, v));
  return sample(pool, n);
}
const TAGV = {de:'Vokabeln', en:'Vocabulary'};
const VT = {
  laMean: v => ({type:'mc', vid:v.id, tag:TAGV, q:{de:'Was bedeutet das Wort?', en:'What does this word mean?'}, la:v.la + (v.g ? `  (${gramL(v.g)})` : ''),
    o:[{h:vMean(v), ok:true}, ...vDistract(v, 3).map(x => ({h:vMean(x)}))]}),
  meanLa: v => ({type:'mc', vid:v.id, tag:TAGV, laOpts:true, q:{de:`Wie heißt <b>„${esc(v.de)}“</b> auf Latein?`, en:`What is <b>“${esc(v.en)}”</b> ${sub('(' + esc(v.de) + ')')} in Latin?`},
    o:[{h:esc(v.la), ok:true}, ...vDistract(v, 3).map(x => ({h:esc(x.la)}))]}),
  typeMean: v => ({type:'type', mode:'mean', vid:v.id, tag:TAGV, q:{de:'Schreibe eine deutsche Bedeutung:', en:'Type a meaning (English or German):'}, la:v.la,
    a: en() ? [v.en, v.de] : [v.de], sol:{de:esc(v.de), en:esc(v.en) + ' · ' + esc(v.de)},
    ex:{de:'Mehrere Bedeutungen? Eine richtige reicht hier. In der Arbeit lohnt es sich, alle zu kennen!', en:'Several meanings? One correct one is enough here. For the test it pays to know them all!'}}),
  typeLa: v => ({type:'type', mode:'la', vid:v.id, tag:TAGV, q:{de:`Wie heißt das auf Latein?<br><b>${esc(v.de)}</b>${v.g ? sub(' (' + v.g + ')') : ''}`, en:`What is this in Latin?<br><b>${esc(v.en)}</b> ${sub('(' + esc(v.de) + ')')}`},
    a:[v.la.replace(/[?]/g, '')], sol:esc(v.la)}),
  fremd: v => {
    if (!v.hint || v.hint.includes('(')) return VT.laMean(v);
    return {type:'mc', vid:v.id, tag:TAGV, laOpts:true, q:{de:`Wort-Detektiv: Welches lateinische Wort steckt in <b>„${esc(v.hint)}“</b>?`, en:`Word detective: which Latin word is hidden in <b>“${esc(v.hint)}”</b>?`},
      o:[{h:esc(v.la), ok:true}, ...vDistract(v, 3).map(x => ({h:esc(x.la)}))], ex:{de:`${esc(v.la)} = ${esc(v.de)}`, en:`${esc(v.la)} = ${esc(v.en)}`}};
  },
};
function vMatch(pool) {
  const chosen = [];
  shuffle(pool).forEach(v => { if (chosen.length < 5 && !chosen.some(c => overlap(c, v))) chosen.push(v); });
  if (chosen.length < 3) return null;
  return {type:'match', tag:TAGV, q:{de:'Mäusefutter: Finde die Paare! Tippe links ein Wort und rechts die Bedeutung an.', en:'Find the pairs! Tap a Latin word on the left and its meaning on the right.'},
    pairs: chosen.map(v => ({l:v.la, r: en() ? v.en : v.de}))};
}
function vSnake() {
  const ok = VOCAB.filter(v => !/[ ?,]/.test(v.la) && !['et', 'iam', 'ad', 'non', 'est', 'esse', 'sed', 'tum'].includes(v.id));
  const ws = sample(ok, 4);
  const words = ws.map(v => strip(v.la));
  return {type:'snake', tag:TAGV, q:{de:'Wörterschlange: Die Pferde rasen so schnell vorbei, dass alle Wörter zusammenkleben. Trenne die Wörter!', en:'Word snake: the horses race past so fast that all the words stick together. Split the words!'},
    words, ex:{de: ws.map(v => `<span class="la">${esc(v.la)}</span> = ${esc(v.de)}`).join(' · '), en: ws.map(v => `<span class="la">${esc(v.la)}</span> = ${esc(v.en)}`).join(' · ')}};
}
function genVocab(n = 12, pool = VOCAB) {
  const kinds = shuffle(['laMean', 'laMean', 'meanLa', 'meanLa', 'typeMean', 'typeMean', 'typeLa', 'typeLa', 'typeLa', 'fremd', 'laMean', 'typeMean']);
  const vs = shuffle(pool); const out = [];
  for (let i = 0; i < n - 2; i++) out.push(VT[kinds[i % kinds.length]](vs[i % vs.length]));
  const m = vMatch(pool); if (m) out.splice(rnd(out.length), 0, m); else out.push(VT.laMean(pick(pool)));
  if (pool === VOCAB) out.splice(rnd(out.length) + 1, 0, vSnake()); else out.push(VT.typeLa(pick(pool)));
  return out;
}

// ---------- Substantive ----------
const TAGN = {de:'Nominativ & Akkusativ', en:'Nominative & accusative'};
const PERSON_N = NOUNS.filter(N => ['servus', 'serva', 'dominus', 'domina', 'medicus'].includes(N.la[0]));
const caseL = i => L(CASES)[i];
function nGerman(N, i) { // deutsch, ggf. mit Kasus-Hinweis
  const same = N.de.filter(x => x === N.de[i]).length > 1;
  return `<b>${esc(N.de[i])}</b>` + (en() ? ` ${sub('(' + esc(N.en[i]) + ', ' + CASES_SHORT.en[i] + ')')}` : same ? ` ${sub('(' + CASES_SHORT.de[i] + ')')}` : '');
}
const NT = {
  caseOf: () => { const N = pick(NOUNS); const i = N.la[0] === 'populus' || N.la[0] === 'victōria' ? rnd(2) : rnd(4);
    return {type:'mc', tag:TAGN, grid:true, keep:true, q:{de:'Bestimme Kasus und Numerus:', en:'Identify case and number:'}, la:N.la[i],
      o:[0, 1, 2, 3].map(j => ({h:CASES_SHORT[S.lang][j], ok:j === i})),
      hint:{de:'Endungen: -a/-us = Nom. Sg. · -am/-um = Akk. Sg. · -ae/-ī = Nom. Pl. · -ās/-ōs = Akk. Pl.', en:'Endings: -a/-us = nom. sg. · -am/-um = acc. sg. · -ae/-ī = nom. pl. · -ās/-ōs = acc. pl.'},
      ex:{de:`${laSpan(N.la[i])} = ${caseL(i)} von ${laSpan(N.la[0])} → „${esc(N.de[i])}“`, en:`${laSpan(N.la[i])} = ${caseL(i)} of ${laSpan(N.la[0])} → “${esc(N.en[i])}”`}}; },
  build: () => { const N = pick(NOUNS.filter(N => N.la[0] !== 'populus')); const i = 1 + rnd(3);
    return {type:'type', mode:'la', tag:TAGN, q:{de:`Bilde den <b>${caseL(i)}</b> von ${laSpan(N.la[0])}:`, en:`Form the <b>${caseL(i)}</b> of ${laSpan(N.la[0])}:`},
      a:[N.la[i]], sol:esc(N.la[i]), ex:{de:`→ „${esc(N.de[i])}“`, en:`→ “${esc(N.en[i])}”`}}; },
  toLa: () => { const N = pick(NOUNS.filter(N => N.la[0] !== 'populus')); const i = rnd(4);
    return {type:'type', mode:'la', tag:TAGN, q:{de:`Übersetze ins Lateinische: ${nGerman(N, i)}`, en:`Translate into Latin: ${nGerman(N, i)}`}, a:[N.la[i]], sol:esc(N.la[i]),
      ex:{de:`${caseL(i)}`, en:`${caseL(i)}`}}; },
  sort: () => {
    const items = [];
    sample(NOUNS, 4).forEach(N => { const i = N.la[0] === 'populus' || N.la[0] === 'victōria' ? rnd(2) : rnd(4); items.push({h:N.la[i], b:i % 2}); });
    sample(NAMES, 2).forEach(nm => { const b = rnd(2); items.push({h:nm[b], b}); });
    return {type:'sort', tag:TAGN, q:{de:'Nominativ oder Akkusativ? Ordne zu!', en:'Nominative or accusative? Sort them!'}, items,
      buckets:[{de:'Nominativ', en:'nominative'}, {de:'Akkusativ', en:'accusative'}],
      hint:{de:'Akkusativ endet auf -m (Singular) oder -s (Plural): -am, -um, -ās, -ōs.', en:'The accusative ends in -m (singular) or -s (plural): -am, -um, -ās, -ōs.'}};
  },
  wen: () => { const N = pick(NOUNS.filter(N => N.la[0] !== 'populus')); const pl = rnd(2) === 1; const nm = pick(NAMES.filter(x => x[0] !== 'Dāvus' || true));
    const subj = pick(['Āfra', 'Lȳdia', 'Valeria', 'Dāvus', 'Syrus']);
    return {type:'mc', tag:TAGN, laOpts:true, q:{de:`Wen sieht ${esc(subj)}? Setze das Wort in Klammern in den Akkusativ. Behalte den Numerus bei.`, en:`Whom does ${esc(subj)} see? Put the word in brackets into the accusative. Keep the number.`},
      la:`${subj} (${N.la[pl ? 2 : 0]}) videt.`, o:[0, 1, 2, 3].map(j => ({h:N.la[j], ok:j === (pl ? 3 : 1)})),
      ex:{de:`${laSpan(subj + ' ' + N.la[pl ? 3 : 1] + ' videt.')} = ${esc(subj.normalize('NFD').replace(/[̀-ͯ]/g, ''))} sieht ${esc(N.de[pl ? 3 : 1])}.`, en:`${laSpan(subj + ' ' + N.la[pl ? 3 : 1] + ' videt.')} = ${esc(strip(subj))} sees ${esc(N.en[pl ? 3 : 1])}.`}};
  },
  plural: () => {
    const [A, B] = sample(PERSON_N.concat([NOUNS[5]]), 2); const V = pick(VERBS.filter(v => ['vidēre', 'spectāre'].includes(v.inf)));
    const right = `${cap(A.la[2])} ${B.la[3]} ${V.la[5]}.`;
    const o = [right, `${cap(A.la[2])} ${B.la[3]} ${V.la[2]}.`, `${cap(A.la[2])} ${B.la[2]} ${V.la[5]}.`, `${cap(A.la[3])} ${B.la[3]} ${V.la[5]}.`];
    return {type:'mc', tag:TAGN, laOpts:true, q:{de:'Setze alle Substantive in den Plural. Welche Veränderung ergibt sich noch?', en:'Put all nouns into the plural. What else has to change?'},
      la:`${cap(A.la[0])} ${B.la[1]} ${V.la[2]}.`, o:o.map((h, k) => ({h:esc(h), ok:k === 0})),
      ex:{de:`Auch das Verb muss in den Plural! → „${cap(A.de[2])} ${V.de[5]} ${B.de[3]}.“`, en:`The verb must become plural too! → “${cap(A.en[2])} ${V.en[5]} ${B.en[3]}.”`}};
  },
  role: () => {
    const [A, B] = sample(PERSON_N.concat([NOUNS[5]]), 2); const V = pick(VERBS.filter(v => ['vidēre', 'spectāre'].includes(v.inf)));
    const ai = pick([0, 2]), bi = pick([1, 3]); const vi = ai === 0 ? 2 : 5;
    const lg = en() ? 'en' : 'de';
    const mk = (Sb, si, Ob, oi) => `${cap(Sb[lg][si])} ${V[lg][si === 0 ? 2 : 5]} ${Ob[lg][oi]}.`;
    const right = mk(A, ai, B, bi);
    const traps = [mk(B, bi === 1 ? 0 : 2, A, ai === 0 ? 1 : 3), mk(A, ai, B, bi === 1 ? 3 : 1), mk(A, ai === 0 ? 2 : 0, B, bi)];
    const uniq = [...new Set(traps.filter(x => x !== right))];
    return {type:'mc', tag:TAGN, q:{de:'Vorsicht Falle! Wer tut was? Wähle die richtige Übersetzung.', en:'Watch out! Who does what? Pick the correct translation.'},
      la:`${cap(B.la[bi])} ${A.la[ai]} ${V.la[vi]}.`, o:[{h:esc(right), ok:true}, ...uniq.map(h => ({h:esc(h)}))],
      hint:{de:'Das erste Wort muss nicht das Subjekt sein! Suche den Nominativ.', en:'The first word does not have to be the subject! Look for the nominative.'},
      ex:{de:`${laSpan(B.la[bi])} = Akkusativ (Objekt), ${laSpan(A.la[ai])} = Nominativ (Subjekt).`, en:`${laSpan(B.la[bi])} = accusative (object), ${laSpan(A.la[ai])} = nominative (subject).`}};
  },
};
function genNoun(n = 10) {
  const k = ['caseOf', 'caseOf', 'build', 'toLa', 'sort', 'wen', 'plural', 'role', 'role', 'build', 'caseOf', 'toLa'];
  return shuffle(k.slice(0, n).map(x => NT[x]()));
}

// ---------- Präpositionen ----------
const TAGP = {de:'Präpositionen', en:'Prepositions'};
const PREP_N = NOUNS.filter(N => ['servus', 'serva', 'dominus', 'domina', 'equus', 'medicus'].includes(N.la[0]));
function dePhrase(p, N, pl) {
  const art = N.dat[pl ? 1 : 0];
  if (p === 'ad') return pl ? 'zu ' + art : art.replace(/^dem /, 'zum ').replace(/^der /, 'zur ');
  if (p === 'post') return (N.la[0] === 'victōria' ? 'nach ' : 'hinter ') + art;
  return 'vor ' + art;
}
function enPhrase(p, N, pl) { return ({ad:'to', ante:'in front of', post: N.la[0] === 'victōria' ? 'after' : 'behind'})[p] + ' ' + N.en[pl ? 2 : 0]; }
const phrase = (p, N, pl) => en() ? enPhrase(p, N, pl) : dePhrase(p, N, pl);
function sceneSVG(pos) {
  const x = pos === 'ante' ? 48 : pos === 'post' ? 262 : 296;
  const arrow = pos === 'ad' ? `<path d="M276 96 H246" stroke="currentColor" stroke-width="4" marker-end="url(#ah)"/><path d="M304 132 l10 0 M300 124 l12 0" stroke="currentColor" stroke-width="2" opacity=".5"/>` : '';
  return `<svg class="scene" viewBox="0 0 330 160" role="img" aria-label="scene">
    <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor"/></marker></defs>
    <line x1="0" y1="142" x2="330" y2="142" stroke="#c9b48a" stroke-width="3"/>
    <g fill="#a8713f" stroke="#5b3a1e" stroke-width="2">
      <rect x="130" y="92" width="8" height="48" rx="3"/><rect x="146" y="92" width="8" height="48" rx="3"/><rect x="196" y="92" width="8" height="48" rx="3"/><rect x="210" y="92" width="8" height="48" rx="3"/>
      <ellipse cx="172" cy="80" rx="56" ry="24"/>
      <path d="M128 72 L104 30 L124 22 L142 66 Z"/>
      <ellipse cx="100" cy="34" rx="22" ry="11"/>
      <path d="M116 22 L121 8 L127 22 Z"/>
    </g>
    <path d="M226 74 q24 8 16 50" stroke="#5b3a1e" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M110 24 q12 20 26 40" stroke="#5b3a1e" stroke-width="5" fill="none"/>
    <circle cx="93" cy="31" r="2.5" fill="#222"/>
    <g stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none">
      <circle cx="${x}" cy="70" r="9" fill="#f3d9b1"/><line x1="${x}" y1="79" x2="${x}" y2="112"/><line x1="${x - 12}" y1="92" x2="${x + 12}" y2="92"/>
      <line x1="${x}" y1="112" x2="${x - 9}" y2="139"/><line x1="${x}" y1="112" x2="${x + 9}" y2="139"/>
    </g>
    <text x="${x}" y="52" text-anchor="middle" font-size="14" font-family="Georgia, serif" fill="currentColor">Dāvus</text>${arrow}</svg>`;
}
const PT = {
  scene: () => { const pos = pick(['ante', 'post', 'ad']); const L3 = {ante:'Dāvus ante equum stat.', post:'Dāvus post equum stat.', ad:'Dāvus ad equum venit.'};
    return {type:'mc', tag:TAGP, laOpts:true, q:{de:'Welcher Satz passt zum Bild? (Das Pferd schaut nach links.)', en:'Which sentence fits the picture? (The horse is facing left.)'} , la:sceneSVG(pos), laHtml:true,
      o:['ante', 'post', 'ad'].map(p => ({h:L3[p], ok:p === pos})),
      ex:{de:'ante = vor · post = hinter · ad = zu (hin)', en:'ante = in front of · post = behind · ad = to (towards)'}}; },
  tr: () => { const N = pick(PREP_N); const pl = rnd(2) === 1; const p = pick(['ante', 'post', 'ad']);
    const right = phrase(p, N, pl);
    const others = ['ante', 'post', 'ad'].filter(x => x !== p).map(x => phrase(x, N, pl)).concat([phrase(p, N, !pl)]);
    return {type:'mc', tag:TAGP, q:{de:'Übersetze:', en:'Translate:'}, la:`${p} ${N.la[pl ? 3 : 1]}`,
      o:[{h:esc(right), ok:true}, ...[...new Set(others)].filter(x => x !== right).map(h => ({h:esc(h)}))],
      ex:{de:`Lateinisch Akkusativ (${esc(N.la[pl ? 3 : 1])}), im Deutschen Dativ („${esc(dePhrase(p, N, pl))}“).`, en:`Latin uses the accusative (${esc(N.la[pl ? 3 : 1])}).${' German: „' + esc(dePhrase(p, N, pl)) + '“'}`}}; },
  toLa: () => { const N = pick(PREP_N); const pl = rnd(2) === 1; const p = pick(['ante', 'post', 'ad']);
    return {type:'type', mode:'la', tag:TAGP, q:{de:`Übersetze ins Lateinische: <b>„${esc(dePhrase(p, N, pl))}“</b>`, en:`Translate into Latin: <b>“${esc(enPhrase(p, N, pl))}”</b> ${sub('(' + esc(dePhrase(p, N, pl)) + ')')}`},
      a:[`${p} ${N.la[pl ? 3 : 1]}`], sol:esc(`${p} ${N.la[pl ? 3 : 1]}`), hint:{de:'Nach ad, ante, post steht der Akkusativ: -am, -um, -ās, -ōs.', en:'After ad, ante, post comes the accusative: -am, -um, -ās, -ōs.'}}; },
  form: () => { const N = pick(PREP_N); const pl = rnd(2) === 1; const subj = pick(['Āfra', 'Dāvus', 'Syrus', 'Lȳdia']);
    const [p, verb] = pick([['ad', 'venit'], ['ante', 'stat'], ['post', 'stat']]);
    return {type:'mc', tag:TAGP, laOpts:true, q:{de:`Setze die richtige Form ein: <span class="la">${esc(subj)} ${p} ___ ${verb}.</span> ${sub('(' + N.la[0] + ', ' + (pl ? 'Plural' : 'Singular') + ')')}`, en:`Fill in the correct form: <span class="la">${esc(subj)} ${p} ___ ${verb}.</span> ${sub('(' + N.la[0] + ', ' + (pl ? 'plural' : 'singular') + ')')}`},
      o:[0, 1, 2, 3].map(j => ({h:N.la[j], ok:j === (pl ? 3 : 1)})), ex:{de:`${p} + Akkusativ → „${esc(dePhrase(p, N, pl))}“`, en:`${p} + accusative → “${esc(enPhrase(p, N, pl))}”`}}; },
  victory: () => ({type:'mc', tag:TAGP, q:{de:'Was heißt <span class="la">post victōriam</span>?', en:'What does <span class="la">post victōriam</span> mean?'},
    o:[{h:en() ? 'after the victory' : 'nach dem Sieg', ok:true}, {h:en() ? 'behind the victory' : 'hinter dem Sieg'}, {h:en() ? 'before the victory' : 'vor dem Sieg'}, {h:en() ? 'to the victory' : 'zum Sieg'}],
    ex:{de:'post kann „hinter“ (Ort) oder „nach“ (Zeit) bedeuten. Bei einem Sieg passt nur „nach“.', en:'post can mean “behind” (place) or “after” (time). With a victory only “after” fits.'}}),
  kasus: () => ({type:'mc', tag:TAGP, q:{de:'Welcher Kasus steht im Lateinischen nach <span class="la">ad, ante, post</span>?', en:'Which case follows <span class="la">ad, ante, post</span> in Latin?'},
    o:[{h:en() ? 'accusative' : 'Akkusativ', ok:true}, {h:en() ? 'nominative' : 'Nominativ'}, {h:en() ? 'dative' : 'Dativ'}],
    ex:{de:'Achtung: Im Deutschen steht danach oft der Dativ („vor dem Pferd“), im Lateinischen immer der Akkusativ (ante equum).', en:'Careful: German often uses the dative after these (“vor dem Pferd”), Latin always the accusative (ante equum).'}}),
};
function genPrep(n = 8) {
  const k = ['scene', 'scene', 'tr', 'tr', 'toLa', 'toLa', 'form', pick(['victory', 'kasus']), 'tr', 'form'];
  return shuffle(k.slice(0, n).map(x => PT[x]()));
}

// ---------- Verben ----------
const TAGVB = {de:'Verben', en:'Verbs'};
const vForm = (V, i) => `${PRON[S.lang][i]} ${V[S.lang][i]}`;
const VBT = {
  pers: () => { const V = pick(VERBS); const i = rnd(6);
    return {type:'mc', tag:TAGVB, grid:true, keep:true, q:{de:'Bestimme Person und Numerus:', en:'Identify person and number:'}, la:V.la[i],
      o:PERS[S.lang].map((h, j) => ({h, ok:j === i})),
      hint:{de:'-ō/-m = ich · -s = du · -t = er/sie/es · -mus = wir · -tis = ihr · -nt = sie', en:'-ō/-m = I · -s = you · -t = he/she/it · -mus = we · -tis = you (pl.) · -nt = they'},
      ex:{de:`${laSpan(V.la[i])} = ${esc(vForm(V, i))} (${V.inf})`, en:`${laSpan(V.la[i])} = ${esc(vForm(V, i))} (${V.inf})`}}; },
  tr: () => { const V = pick(VERBS); const i = rnd(6); const others = sample([0, 1, 2, 3, 4, 5].filter(j => j !== i), 3);
    return {type:'mc', tag:TAGVB, q:{de:'Übersetze die Verbform:', en:'Translate the verb form:'}, la:V.la[i],
      o:[{h:esc(vForm(V, i)), ok:true}, ...others.map(j => ({h:esc(vForm(V, j))}))], ex:{de:`Infinitiv: ${laSpan(V.inf)} = ${esc(V.deI)}`, en:`Infinitive: ${laSpan(V.inf)} = ${esc(V.enI)}`}}; },
  build: () => { const V = pick(VERBS); const i = rnd(6);
    return {type:'type', mode:'la', tag:TAGVB, q:{de:`Bilde die Form: ${laSpan(V.inf)} → <b>${PERS.de[i]}</b>`, en:`Form: ${laSpan(V.inf)} → <b>${PERS.en[i]}</b>`},
      a:[V.la[i]], sol:esc(V.la[i]), hint:{de:`${L(KONJ[V.k])}. Endungen: -ō, -s, -t, -mus, -tis, -nt`, en:`${L(KONJ[V.k])}. Endings: -ō, -s, -t, -mus, -tis, -nt`}, ex:{de:`= ${esc(vForm(V, i))}`, en:`= ${esc(vForm(V, i))}`}}; },
  gespann: () => { const V = pick(VERBS); const i = rnd(6); const j = (i + 3) % 6;
    return {type:'type', mode:'la', tag:TAGVB, q:{de:`Verb-Gespann: Ergänze das Gegenstück im ${i < 3 ? 'Plural' : 'Singular'} (gleiche Person).`, en:`Verb pair: give the matching form in the ${i < 3 ? 'plural' : 'singular'} (same person).`},
      la:`${V.la[i]}  ·  ?`, a:[V.la[j]], sol:esc(V.la[j]), ex:{de:`${esc(V.la[i])} = ${esc(vForm(V, i))} · ${esc(V.la[j])} = ${esc(vForm(V, j))}`, en:`${esc(V.la[i])} = ${esc(vForm(V, i))} · ${esc(V.la[j])} = ${esc(vForm(V, j))}`}}; },
  odd: () => { let A, B; do { [A, B] = sample(VERBS, 2); } while (A.k === 'esse' && B.k === 'esse');
    const fa = sample([0, 1, 2, 3, 4, 5], 3).map(i => A.la[i]); const fb = B.la[rnd(6)];
    return {type:'mc', tag:TAGVB, laOpts:true, q:{de:'An der Tränke: Welches Pferd gehört nicht zur Herde (zum selben Verb)?', en:'At the water trough: which horse does not belong to the herd (the same verb)?'},
      o:[{h:'🐴 ' + fb, ok:true}, ...fa.map(h => ({h:'🐴 ' + h}))], ex:{de:`Die Herde ist ${laSpan(A.inf)}. ${laSpan(fb)} gehört zu ${laSpan(B.inf)}.`, en:`The herd is ${laSpan(A.inf)}. ${laSpan(fb)} belongs to ${laSpan(B.inf)}.`}}; },
  table: () => { const V = pick(VERBS);
    return {type:'table', tag:TAGVB, q:{de:`Scorpus ist verletzt! Konjugiere ${laSpan(V.inf)} (${esc(V.deI)}), dann darfst du ihn vertreten.`, en:`Scorpus is injured! Conjugate ${laSpan(V.inf)} (${esc(V.enI)}) and you can take his place.`},
      rows:V.la.map((a, i) => ({label:vForm(V, i), a})), sol:esc(V.la.join(', '))}; },
  konj: () => { const V = pick(VERBS.filter(v => v.k !== 'esse'));
    return {type:'mc', tag:TAGVB, q:{de:`Zu welcher Konjugation gehört ${laSpan(V.inf)}?`, en:`Which conjugation does ${laSpan(V.inf)} belong to?`},
      keep:true, o:['a', 'e', 'i', 'esse'].map(k => ({h:L(KONJ[k]), ok:k === V.k})), hint:{de:'Schau auf den Vokal vor -re: -āre, -ēre, -īre.', en:'Look at the vowel before -re: -āre, -ēre, -īre.'}}; },
  deLa: () => { const V = pick(VERBS); const i = rnd(6);
    return {type:'type', mode:'la', tag:TAGVB, q:{de:`Wie heißt <b>„${esc(PRON.de[i])} ${esc(V.de[i])}“</b> auf Latein?`, en:`What is <b>“${esc(PRON.en[i])} ${esc(V.en[i])}”</b> in Latin?`}, a:[V.la[i]], sol:esc(V.la[i])}; },
};
function genVerb(n = 10) {
  const k = ['pers', 'pers', 'tr', 'tr', 'build', 'gespann', 'odd', 'table', 'deLa', 'konj', 'build', 'tr'];
  return shuffle(k.slice(0, n).map(x => VBT[x]()));
}

// ---------- Infinitiv ----------
const TAGI = {de:'Infinitiv', en:'Infinitive'};
const IT = {
  find: () => { const s = pick(INF_SENT);
    return {type:'tap', single:true, lat:true, tag:TAGI, q:{de:'Tippe auf den Infinitiv:', en:'Tap the infinitive:'}, tokens:s.la, e:[s.i], fn:s.fn,
      ex:{de:`„${esc(s.de)}“`, en:`“${esc(s.en)}”`}}; },
  which: () => { const V = pick(VERBS); const fs = sample(V.la, 3);
    return {type:'mc', tag:TAGI, laOpts:true, q:{de:'Welche Form ist der Infinitiv?', en:'Which form is the infinitive?'}, o:[{h:V.inf, ok:true}, ...fs.map(h => ({h}))],
      ex:{de:'Der Infinitiv endet auf -re (bei esse/adesse: -se).', en:'The infinitive ends in -re (esse/adesse: -se).'}}; },
  form: () => { const V = pick(VERBS); const i = rnd(6);
    return {type:'type', mode:'la', tag:TAGI, q:{de:`Wie heißt der Infinitiv zu ${laSpan(V.la[i])}?`, en:`What is the infinitive of ${laSpan(V.la[i])}?`}, a:[V.inf], sol:esc(V.inf),
      ex:{de:`${esc(V.inf)} = ${esc(V.deI)}`, en:`${esc(V.inf)} = ${esc(V.enI)}`}}; },
  tr: () => { const s = pick(INF_SENT);
    return {type:'mc', tag:TAGI, q:{de:'Welche Übersetzung ist richtig?', en:'Which translation is correct?'}, la:s.la.join(' '), fn:s.fn,
      o:[{h:esc(en() ? s.en : s.de), ok:true}, ...(en() ? s.trEn : s.trDe).map(h => ({h:esc(h)}))],
      ex:{de:'debēre + Infinitiv = müssen (ohne „zu“) · audēre/dubitāre + Infinitiv = wagen/zögern zu …', en:'debēre + infinitive = must · audēre/dubitāre + infinitive = dare/hesitate to …'}}; },
  mean: () => { const V = pick(VERBS); const others = sample(VERBS.filter(x => x !== V), 3);
    return {type:'mc', tag:TAGI, q:{de:`Was bedeutet der Infinitiv ${laSpan(V.inf)}?`, en:`What does the infinitive ${laSpan(V.inf)} mean?`},
      o:[{h:esc(en() ? V.enI : '(zu) ' + V.deI), ok:true}, ...others.map(x => ({h:esc(en() ? x.enI : '(zu) ' + x.deI)}))]}; },
};
function genInf(n = 8) {
  const k = ['find', 'find', 'which', 'form', 'form', 'tr', 'tr', 'mean', 'tr', 'find'];
  return shuffle(k.slice(0, n).map(x => IT[x]()));
}

// ---------- Übersetzen ----------
const TAGT = {de:'Übersetzen', en:'Translation'};
const tgt = () => en() ? S.tgt : 'de';
const toks = s => s.split(/\s+/).map(w => w.replace(/[.,;:!?„“"]/g, '')).filter(Boolean);
function testNote(s) { return en() && S.tgt === 'en' ? `<div class="detest">${t('inTest')} <b>${esc(s.de)}</b></div>` : ''; }
const TT = {
  mc: s => ({type:'mc', tag:TAGT, q:{de:'Welche Übersetzung ist richtig?', en:'Which translation is correct?'}, la:s.la,
    o:[{h:esc(s[tgt()]), ok:true}, ...(tgt() === 'en' ? s.trEn : s.trDe).map(h => ({h:esc(h)}))], ex:{de:esc(s.w.de), en:esc(s.w.en) + testNote(s)}}),
  tiles: s => {
    const lg = tgt(); const right = toks(s[lg]);
    const alts = (lg === 'en' ? s.altEn : s.alt) || [];
    const have = new Set(right.map(normDe));
    const extra = [...new Set((lg === 'en' ? s.trEn : s.trDe).flatMap(toks).filter(w => !have.has(normDe(w))))];
    return {type:'tiles', tag:TAGT, q:{de:'Satz-Baukasten: Baue die deutsche Übersetzung. Achtung, es sind auch falsche Wörter dabei!', en:`Sentence builder: build the ${lg === 'en' ? 'English' : 'German'} translation. Careful, there are some wrong words too!`},
      la:s.la, tiles:right.concat(sample(extra, Math.min(3, extra.length))), sol:[right, ...alts.map(toks)], ex:{de:esc(s.w.de), en:esc(s.w.en) + testNote(s)}};
  },
  teacher: it => ({type:'tap', tag:TAGT, q:{de:'Du darfst der Lehrer sein! Ein Mitschüler hat übersetzt. Tippe alle falschen Wörter an.', en:'You are the teacher! A classmate translated this into German. Tap all the wrong words.'},
    la:it.la, tokens:it.s.split(' '), e:it.e, opt:it.opt, sol:esc(it.fix), ex:{de:esc(it.why.de), en:esc(it.why.en)}}),
  toLa: it => ({type:'tiles', lat:true, anyOrder:true, tag:TAGT, q:{de:`Übersetze ins Lateinische: <b>„${esc(it.de)}“</b>`, en:`Translate into Latin: <b>“${esc(it.en)}”</b> ${sub('(' + esc(it.de) + ')')}`},
    tiles:it.la.concat(it.d), sol:[it.la], ex:{de:'Im Lateinischen steht das Verb meistens am Ende.', en:'In Latin the verb usually comes at the end.'}}),
  context: c => ({type:'mc', tag:TAGT, q:{de:`Kontext entscheidet: Was bedeutet <b class="la">${c.w}</b> in diesem Satz?`, en:`Context decides: what does <b class="la">${c.w}</b> mean in this sentence?`}, la:c.la, fn:c.fn,
    o:[{h:L(c.ok), ok:true}, {h:L(c.bad)}], ex:c.why}),
  pron: p => ({type:'mc', tag:TAGT, grid:true, keep:true, q:{de:'Personalpronomen ergänzen: Welches Wort musst du im zweiten Satz dazuschreiben?', en:'Add the personal pronoun: which word do you have to add in the second sentence?'}, la:p.la,
    o:(en() ? ['he', 'she', 'it', 'they'] : ['er', 'sie', 'es', 'wir']).map(w => ({h:w, ok:w === (en() ? p.okEn : p.ok)})), ex:{de:esc(p.de), en:esc(p.en) + ` ${sub('(' + esc(p.de) + ')')}`}}),
};
function genTrans(n = 10) {
  const ss = shuffle(SENT);
  const [t1, t2] = sample(TEACHER, 2);
  const out = [TT.mc(ss[0]), TT.mc(ss[1]), TT.mc(ss[2]), TT.tiles(ss[3]), TT.tiles(ss[4]), TT.teacher(t1), TT.teacher(t2), TT.toLa(pick(TO_LA)), TT.context(pick(CONTEXT)), TT.pron(pick(PRONOUN))];
  return shuffle(out).slice(0, n);
}

// ---------- Circus ----------
const TAGC = {de:'Circus Maximus', en:'Circus Maximus'};
const CT = q => ({type:'mc', tag:TAGC, q:q.q, o:[...q.a.map(h => ({h:esc(L(h)), ok:true})), ...q.o.map(h => ({h:esc(L(h))}))]});
function genCircus(n = 10) { return sample(CIRCUS, n).map(CT); }

// ---------- Probetest Teil B ----------
function genPartB() {
  const vs = sample(VOCAB.filter(v => v.pos !== 'x' || v.id === 'sed'), 3);
  return [VT.typeMean(vs[0]), VT.typeLa(vs[1]), VT.laMean(vs[2]), NT.caseOf(), NT.build(), PT.tr(), VBT.pers(), VBT.build(), VBT.tr(), IT.form(), CT(pick(CIRCUS)), NT.role()];
}

// ---------- Erklärkarten ----------
const tbl = (head, rows, cls = '') => `<table class="gt ${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const E = (stem, end) => `<span class="la">${stem}<b class="end">${end}</b></span>`;
const LEARN = {
  circus: () => en() ? `
    <ul class="facts">
      <li>🏁 Chariot races were hugely popular with <b>everyone</b>: young and old, men and women, nobles and slaves. Fans bet on winners and losers, cursed the rival teams and supported their own no matter what.</li>
      <li>🎨 There were <b>4 racing teams (factiones)</b>: <b>White, Red, Blue and Green</b>. They rented out horses, charioteers and helpers (trainers, grooms, doctors for people and animals) to the organiser – in Rome usually the <b>emperor</b>.</li>
      <li>🐎 <b>Two-horse or four-horse chariots</b> (four = <i>quadriga</i>) raced against each other. The most famous track was the <b>Circus Maximus</b>. <b>Entry was free.</b></li>
      <li>🏟️ It was <b>U-shaped</b>, at the foot of the <b>Palatine</b> where the emperors’ palaces stood – from there the emperor showed himself and his power to the people.</li>
      <li>👥 About <b>250,000 spectators</b> sat on rising <b>stone steps</b>.</li>
      <li>🚦 On the straight short side were <b>12 starting gates</b> – <b>3 per team</b>.</li>
      <li>🗿 In the middle a <b>barrier</b> divided the track. At each end stood <b>three cone-shaped columns as turning posts</b>. In between: altars, statues and <b>two obelisks</b>. <b>Seven gilded eggs and dolphins</b> showed how many laps had been completed.</li>
      <li>💼 The teams were mainly <b>businesses</b> run by a <b>director</b>: workrooms, storerooms, living quarters, stables and workshops for the chariots.</li>
      <li>⛓️ Charioteers were mostly <b>slaves</b>. Successful ones were adored by fans, could get <b>rich</b> and <b>buy their freedom</b>.</li>
      <li>⬅️ The horse on the <b>far left</b> was the <b>lead horse</b>: it had to steer the others as tightly as possible around the two turning posts. Famous lead horses were known by everyone.</li>
      <li>📖 In the book: <b>Scorpus</b> = famous charioteer of the Greens · <b>Incitatus</b> (“hothead”) = his new lead horse · <b>Crescens</b> = charioteer of the Blues, his rival · <b>Crassus</b> = team owner · <b>Davus, Syrus</b> = slaves/stable boys · <b>Afra, Lydia</b> = slave girls · <b>Symmachus</b> = vet, <b>Lydus</b> = his helper.</li>
    </ul>` : `
    <ul class="facts">
      <li>🏁 Wagenrennen waren in Rom bei <b>allen</b> sehr beliebt: Junge und Alte, Männer und Frauen, Adlige und Sklaven. Man schloss Wetten ab, verfluchte die gegnerischen Rennställe und unterstützte bedingungslos den eigenen.</li>
      <li>🎨 Es gab <b>4 Rennställe (factiones)</b>: die <b>Weißen, Roten, Blauen und Grünen</b>. Sie vermieteten Pferde, Wagenlenker und Helfer (Trainer, Tierpfleger, Ärzte für Mensch und Tier) an den Veranstalter – in Rom meist der <b>Kaiser</b>.</li>
      <li>🐎 <b>Zwei- oder Vierspänner</b> (Vierspänner = <i>Quadriga</i>) traten gegeneinander an. Die bekannteste Rennstrecke war der <b>Circus Maximus</b>. Der <b>Eintritt war frei</b>.</li>
      <li>🏟️ Er war <b>u-förmig</b> und lag <b>am Fuß des Palatin</b>, wo die Kaiserpaläste standen. Von dort zeigte der Kaiser dem Volk sich und seine Macht.</li>
      <li>👥 Etwa <b>250.000 Zuschauer</b> saßen auf ansteigenden <b>Steinstufen</b>.</li>
      <li>🚦 An der geraden Schmalseite: <b>12 Startboxen</b>, <b>3 für jeden Rennstall</b>.</li>
      <li>🗿 In der Mitte gab es eine <b>Abtrennung</b>. An beiden Enden standen je <b>drei kegelförmige Säulen als Wendemarken</b>. Dazwischen: Altäre, Statuen und <b>zwei Obelisken</b>. <b>Sieben vergoldete Eier und Delfine</b> zeigten, wie viele Runden schon gefahren waren.</li>
      <li>💼 Die Rennställe waren in erster Linie <b>Wirtschaftsunternehmen</b> mit einem <b>Direktor</b>: Arbeits-, Lager- und Wohnräume, Ställe und Werkstätten für die Wagen.</li>
      <li>⛓️ Die Wagenlenker waren meist <b>Sklaven</b>. Erfolgreiche Lenker wurden von ihren Fans verehrt, konnten ein <b>Vermögen</b> anhäufen und sich <b>freikaufen</b>.</li>
      <li>⬅️ Das Pferd <b>links außen</b> war das <b>Leitpferd</b>: Es musste die anderen möglichst eng um die Wendemarken führen. Die Namen berühmter Leitpferde kannte jeder.</li>
      <li>📖 Im Buch: <b>Scorpus</b> = berühmter Wagenlenker der Grünen · <b>Incitatus</b> („Heißsporn“) = sein neues Leitpferd · <b>Crescens</b> = Wagenlenker der Blauen, sein Rivale · <b>Crassus</b> = Rennstallbesitzer · <b>Davus, Syrus</b> = Sklaven/Stallburschen · <b>Afra, Lydia</b> = Sklavinnen · <b>Symmachus</b> = Tierarzt, <b>Lydus</b> = sein Gehilfe.</li>
    </ul>`,
  vok: () => `<p>${en() ? 'All words of lesson 1 (packs A, B, C, T) plus the <b>★ words of lesson 2</b>: <span class="la">post, ante, ad</span> (all + accusative).' : 'Alle Wörter der Lektion 1 (Päckchen A, B, C, T) und die <b>★-Vokabeln der Lektion 2</b>: <span class="la">post, ante, ad</span> (alle mit Akkusativ).'}</p>
    <div class="vlist">${['L1 A', 'L1 B', 'L1 C', 'L1 T', 'L2 ★'].map(pk => `<h4>${pk}</h4><table class="gt vt"><tbody>${VOCAB.filter(v => v.pk === pk).map(v => `<tr><td class="la">${esc(v.la)}</td><td class="g">${esc(gramL(v.g))}</td><td>${en() ? esc(v.en) + ' ' + sub(esc(v.de)) : esc(v.de)}</td><td class="g">${v.hint ? '→ ' + esc(v.hint) : ''}</td></tr>`).join('')}</tbody></table>`).join('')}</div>
    <h4>${t('tipsTitle')}</h4><ul>${en() ? `
      <li><b>Cover-up method:</b> cover the Latin, read the meaning, say the Latin word. Then the other way round. Pack by pack.</li>
      <li><b>Flashcards:</b> sort out the words you don’t know yet and do them again (the trainer here does that for you: “My tricky words”).</li>
      <li><b>Connections:</b> Video ← vidēre, Medizin ← medicus, people ← populus, victory ← victōria, Gaudi ← gaudēre.</li>
      <li><b>Memory hooks:</b> <span class="la">tandem</span> – “All the other bikes are already here. <i>Finally</i> the tandem arrives too.”</li>
      <li><b>Be exact:</b> learn every letter, and the extra info (m, f, Präp. m. Akk.).</li>` : `
      <li><b>Abdeckmethode:</b> Latein abdecken, Bedeutung lesen, lateinisches Wort sagen. Dann umgekehrt. „Päckchen“ für „Päckchen“.</li>
      <li><b>Vokabelkarten:</b> Wörter, die du noch nicht kannst, aussortieren und nochmal üben (macht der Trainer hier automatisch: „Meine schwierigen Wörter“).</li>
      <li><b>An Bekanntes anknüpfen:</b> Video ← vidēre, Medizin ← medicus, populär/people ← populus, Gaudi ← gaudēre, Spektakel ← spectāre.</li>
      <li><b>Eselsbrücken:</b> <span class="la">tandem</span> – „Alle anderen Fahrräder sind schon da. <i>Endlich</i> kommt auch das Tandem.“</li>
      <li><b>Genauigkeit:</b> Jeden Buchstaben lernen und die Angaben in der zweiten Spalte (m, f, Präp. m. Akk.).</li>`}</ul>`,
  nom: () => `${tbl(['', 'Singular', 'Plural'], [
      [en() ? '<b>a-decl.</b> Nom.' : '<b>a-Dekl.</b> Nom.', E('serv', 'a') + sub(en() ? ' the slave girl' : ' die Sklavin'), E('serv', 'ae') + sub(en() ? ' the slave girls' : ' die Sklavinnen')],
      [en() ? 'Acc.' : 'Akk.', E('serv', 'am') + sub(en() ? ' the slave girl' : ' die Sklavin'), E('serv', 'ās') + sub(en() ? ' the slave girls' : ' die Sklavinnen')],
      [en() ? '<b>o-decl.</b> Nom.' : '<b>o-Dekl.</b> Nom.', E('serv', 'us') + sub(en() ? ' the slave' : ' der Sklave'), E('serv', 'ī') + sub(en() ? ' the slaves' : ' die Sklaven')],
      [en() ? 'Acc.' : 'Akk.', E('serv', 'um') + sub(en() ? ' the slave' : ' den Sklaven'), E('serv', 'ōs') + sub(en() ? ' the slaves' : ' die Sklaven')]])}
    <ul>${en() ? `
      <li><b>Nominative</b> = subject. Ask: <i>who or what?</i> &nbsp; <b>Accusative</b> = object. Ask: <i>whom or what?</i></li>
      <li>Trick: the accusative ends in <b>-m</b> (singular) or <b>-s</b> (plural).</li>
      <li><span class="la">Dominus servam videt.</span> = The master sees the slave girl. &nbsp; <span class="la">Servam dominus videt.</span> = the same! The first word is <b>not</b> always the subject.</li>
      <li>Names work the same way: <span class="la">Dāvus → Dāvum, Āfra → Āfram</span>.</li>
      <li>German: masculine words get “den” in the accusative (<i>den Herrn, den Sklaven</i>); feminine/neuter look the same in nom. and acc. (<i>die Sklavin, das Pferd</i>) – so you must look at the Latin ending!</li>` : `
      <li><b>Nominativ</b> = Subjekt. Frage: <i>Wer oder was?</i> &nbsp; <b>Akkusativ</b> = Objekt. Frage: <i>Wen oder was?</i></li>
      <li>Merktrick: Der Akkusativ endet auf <b>-m</b> (Singular) oder <b>-s</b> (Plural).</li>
      <li><span class="la">Dominus servam videt.</span> = Der Herr sieht die Sklavin. &nbsp; <span class="la">Servam dominus videt.</span> = genau dasselbe! Das erste Wort ist <b>nicht</b> immer das Subjekt.</li>
      <li>Namen gehen genauso: <span class="la">Dāvus → Dāvum, Āfra → Āfram</span>.</li>
      <li>Im Deutschen sehen „die Sklavin“ oder „das Pferd“ im Nominativ und Akkusativ gleich aus. Deshalb immer auf die <b>lateinische Endung</b> schauen!</li>
      <li>Wenn das Subjekt im Plural steht, muss auch das <b>Verb im Plural</b> stehen: <span class="la">Servī rīdent.</span></li>`}</ul>`,
  prep: () => `<div class="scenes">${['ad', 'ante', 'post'].map(p => `<figure>${sceneSVG(p)}<figcaption><span class="la">${{ad:'ad equum venīre', ante:'ante equum stāre', post:'post equum stāre'}[p]}</span><br>${en() ? {ad:'to come to the horse', ante:'to stand in front of the horse', post:'to stand behind the horse'}[p] : {ad:'zum Pferd kommen', ante:'vor dem Pferd stehen', post:'hinter dem Pferd stehen'}[p]}</figcaption></figure>`).join('')}</div>
    ${tbl(en() ? ['Latin', 'meaning', 'example'] : ['Latein', 'Bedeutung', 'Beispiel'], [
      ['<span class="la">ad</span> + Akk.', en() ? 'to, towards, at, by' : 'zu, bei, nach, an', `<span class="la">ad equōs</span> – ${en() ? 'to the horses' : 'zu den Pferden'}`],
      ['<span class="la">ante</span> + Akk.', en() ? 'in front of, before' : 'vor', `<span class="la">ante Incitātum</span> – ${en() ? 'in front of Incitatus' : 'vor Incitatus'}`],
      ['<span class="la">post</span> + Akk.', en() ? 'behind, after' : 'hinter, nach', `<span class="la">post equum</span> – ${en() ? 'behind the horse' : 'hinter dem Pferd'}<br><span class="la">post victōriam</span> – ${en() ? 'after the victory' : 'nach dem Sieg'}`]])}
    <ul>${en() ? `<li>After <span class="la">ad, ante, post</span> Latin <b>always uses the accusative</b>. German often uses the <b>dative</b> instead: <i>vor <b>dem</b> Pferd, zu <b>den</b> Pferden</i>.</li>
      <li>A preposition + noun tells you <b>where / when</b> something happens (an adverbial).</li>` :
      `<li>Nach <span class="la">ad, ante, post</span> steht im Lateinischen <b>immer der Akkusativ</b>. Im Deutschen steht oft der <b>Dativ</b>: vor <b>dem</b> Pferd, zu <b>den</b> Pferden.</li>
      <li>Präposition + Substantiv = <b>Präpositionalausdruck</b>. Er ist meistens ein <b>Adverbiale</b> (sagt wo oder wann).</li>`}</ul>`,
  verb: () => `${tbl(['', 'a: <span class="la">clāmāre</span>', 'e: <span class="la">rīdēre</span>', 'i: <span class="la">venīre</span>', '<span class="la">esse</span>', '<span class="la">adesse</span>'],
      [0, 1, 2, 3, 4, 5].map(i => [PRON[S.lang][i], ...[VERBS[2], VERBS[6], VERBS[11], VERBS[12], VERBS[13]].map(V => `<span class="la">${V.la[i]}</span>`)]), 'conj')}
    <p class="endings">${en() ? 'Endings' : 'Endungen'}: <b>-ō/-m</b> ${en() ? 'I' : 'ich'} · <b>-s</b> ${en() ? 'you' : 'du'} · <b>-t</b> ${en() ? 'he/she/it' : 'er/sie/es'} · <b>-mus</b> ${en() ? 'we' : 'wir'} · <b>-tis</b> ${en() ? 'you (pl.)' : 'ihr'} · <b>-nt</b> ${en() ? 'they' : 'sie'}</p>
    <ul>${en() ? `
      <li>The ending already tells you the person: <span class="la">rīdēmus</span> = we laugh. Latin usually leaves out the pronoun – <b>you must add it</b> in German/English: <span class="la">Rīdent.</span> = <i>They laugh.</i></li>
      <li>a-conjugation: <span class="la">clām-ō</span> (the a disappears!). i-conjugation 3rd pl.: <span class="la">ven-iu-nt</span>.</li>
      <li>Verbs of the lesson: a: <span class="la">stāre, cōgitāre, clāmāre, spectāre, dubitāre, ōrāre</span> · e: <span class="la">rīdēre, dēbēre, gaudēre, vidēre, audēre</span> · i: <span class="la">venīre</span></li>
      <li>German: <span class="la">gaudēre</span> = <i>sich freuen</i> → ich freue <b>mich</b>, du freust <b>dich</b>, wir freuen <b>uns</b>, ihr freut <b>euch</b>.</li>` : `
      <li>Die Endung verrät die Person: <span class="la">rīdēmus</span> = wir lachen. Personalpronomen stehen im Lateinischen meistens nicht. <b>Im Deutschen musst du sie ergänzen</b>: <span class="la">Rīdent.</span> = <i>Sie</i> lachen.</li>
      <li>a-Konjugation: <span class="la">clām-ō</span> (das a verschwindet!). i-Konjugation 3. Pl.: <span class="la">ven-iu-nt</span>.</li>
      <li>Verben der Lektion: a: <span class="la">stāre, cōgitāre, clāmāre, spectāre, dubitāre, ōrāre</span> · e: <span class="la">rīdēre, dēbēre, gaudēre, vidēre, audēre</span> · i: <span class="la">venīre</span></li>
      <li><span class="la">gaudēre</span> = sich freuen → ich freue <b>mich</b>, du freust <b>dich</b>, er freut <b>sich</b>, wir freuen <b>uns</b>, ihr freut <b>euch</b>, sie freuen <b>sich</b>.</li>`}</ul>`,
  inf: () => `${tbl(en() ? ['', 'infinitive', 'meaning'] : ['', 'Infinitiv', 'Bedeutung'], [
      ['a-' + (en() ? 'conj.' : 'Konj.'), E('clāmā', 're'), en() ? 'to shout' : '(zu) schreien'],
      ['e-' + (en() ? 'conj.' : 'Konj.'), E('rīdē', 're'), en() ? 'to laugh' : '(zu) lachen'],
      ['i-' + (en() ? 'conj.' : 'Konj.'), E('venī', 're'), en() ? 'to come' : '(zu) kommen'],
      [en() ? 'auxiliary' : 'Hilfsverb', E('es', 'se'), en() ? 'to be' : '(zu) sein']])}
    <ul>${en() ? `
      <li>The infinitive (basic form) always ends in <b>-re</b>; for <span class="la">esse</span>/<span class="la">adesse</span> in <b>-se</b>. In the vocabulary list the infinitive always comes first.</li>
      <li>Infinitives often go with <span class="la">dēbēre, audēre, dubitāre</span>:<br>
        <span class="la">Dāvus venīre dēbet.</span> = Davus must come. (German: <i>muss kommen</i> – no “zu”!)<br>
        <span class="la">Syrus clāmāre nōn audet.</span> = Syrus doesn’t dare to shout. (German: <i>wagt nicht <b>zu</b> schreien</i>)<br>
        <span class="la">Medicus adesse dubitat.</span> = The doctor hesitates to help. (German: <i>zögert <b>zu</b> helfen</i>)</li>` : `
      <li>Der Infinitiv (die Grundform) endet bei allen Konjugationen auf <b>-re</b>, bei <span class="la">esse</span>/<span class="la">adesse</span> auf <b>-se</b>. Im Wortschatz steht immer zuerst der Infinitiv.</li>
      <li>Infinitive stehen oft bei <span class="la">dēbēre, audēre, dubitāre</span>:<br>
        <span class="la">Dāvus venīre dēbet.</span> = Davus muss kommen. (<b>ohne</b> „zu“)<br>
        <span class="la">Syrus clāmāre nōn audet.</span> = Syrus wagt nicht <b>zu</b> schreien.<br>
        <span class="la">Medicus adesse dubitat.</span> = Der Arzt zögert <b>zu</b> helfen.</li>`}</ul>`,
  trans: () => `<div class="x2box">⚖️ ${t('x2')}</div>
    <h4>${en() ? 'Translation route map' : 'Übersetzungs-Fahrplan'}</h4>
    <ol class="plan">${en() ? `
      <li><b>Find the verb</b> (often at the end). Ending → who? (<i>-t</i> he/she/it, <i>-nt</i> they, <i>-mus</i> we …)</li>
      <li><b>Find the subject</b>: a nominative that fits the verb (singular/plural). No subject? → <b>add a pronoun</b> (er/sie/es/sie).</li>
      <li><b>Find the object</b>: accusative (-am, -um, -ās, -ōs). Ask “whom or what?”</li>
      <li><b>The rest</b>: prepositions (ad/ante/post + acc.), small words (iam, tum, tandem, nōndum, etiam, itaque …).</li>
      <li><b>Write good German</b>: German word order, check the footnotes, choose the meaning that fits the context.</li>` : `
      <li><b>Prädikat (Verb) suchen</b> – oft am Satzende. Endung → Wer? (<i>-t</i> er/sie/es, <i>-nt</i> sie, <i>-mus</i> wir …)</li>
      <li><b>Subjekt suchen</b>: Nominativ, der zum Verb passt (Singular/Plural). Kein Subjekt da? → <b>Personalpronomen ergänzen</b> (er/sie/es/sie).</li>
      <li><b>Objekt suchen</b>: Akkusativ (-am, -um, -ās, -ōs). Frage „Wen oder was?“</li>
      <li><b>Den Rest</b>: Präpositionen (ad/ante/post + Akk.), kleine Wörter (iam, tum, tandem, nōndum, etiam, itaque …).</li>
      <li><b>In gutes Deutsch bringen</b>: deutsche Satzstellung, Fußnoten benutzen, passende Bedeutung wählen.</li>`}</ol>
    <h4>${en() ? 'Watch out for these traps' : 'Vorsicht Falle!'}</h4>
    <ul class="traps">${en() ? `
      <li>The first word is not always the subject: <span class="la">Servam dominus videt.</span> = The master sees the slave girl.</li>
      <li><span class="la">populus</span> is singular: <span class="la">Populus clāmat.</span> = Das Volk schreit. → pronoun “es”.</li>
      <li><span class="la">sed</span> = <i>aber</i> – but after a negative often <i>sondern</i>: <span class="la">Nōn rīdeō, sed clāmō.</span> = Ich lache nicht, sondern schreie.</li>
      <li><span class="la">adesse</span> = <i>da sein</i> or <i>helfen</i> – the context decides.</li>
      <li><span class="la">post</span> = <i>hinter</i> (place) or <i>nach</i> (time: <span class="la">post victōriam</span>).</li>
      <li><span class="la">ibi</span> = there, <span class="la">hūc</span> = (to) here · <span class="la">iam</span> = already, <span class="la">nōndum</span> = not yet · <span class="la">tum</span> = then, <span class="la">tandem/postrēmō</span> = finally.</li>
      <li>Singular or plural? <span class="la">-ae, -ī, -nt</span> are plural signals!</li>` : `
      <li>Das erste Wort ist nicht immer das Subjekt: <span class="la">Servam dominus videt.</span> = Der Herr sieht die Sklavin.</li>
      <li><span class="la">populus</span> ist Singular: <span class="la">Populus clāmat.</span> = Das Volk schreit. → Pronomen „es“.</li>
      <li><span class="la">sed</span> = aber – nach einer Verneinung oft „sondern“: <span class="la">Nōn rīdeō, sed clāmō.</span> = Ich lache nicht, sondern schreie.</li>
      <li><span class="la">adesse</span> = da sein <b>oder</b> helfen – der Kontext entscheidet.</li>
      <li><span class="la">post</span> = hinter (Ort) oder nach (Zeit: <span class="la">post victōriam</span> = nach dem Sieg).</li>
      <li><span class="la">ibi</span> = dort, <span class="la">hūc</span> = hierher · <span class="la">iam</span> = schon, <span class="la">nōndum</span> = noch nicht · <span class="la">tum</span> = da, dann, <span class="la">tandem/postrēmō</span> = endlich, schließlich.</li>
      <li>Singular oder Plural? <span class="la">-ae, -ī, -nt</span> sind Plural-Signale!</li>
      <li>Lies am Ende deine Übersetzung nochmal: Klingt sie wie richtiges Deutsch?</li>`}</ul>`,
};

// ---------- Stationen ----------
const STATIONS = [
  {id:'circus', icon:'🏟️', title:{de:'Wagenrennen im Circus Maximus', en:'Chariot racing in the Circus Maximus'}, pages:'TB S. 14, 16', gen:genCircus, n:10},
  {id:'vok', icon:'📜', title:{de:'Vokabeln Lektion 1 + Sternchenvokabeln Lektion 2', en:'Vocabulary lesson 1 + ★ words of lesson 2'}, pages:'BB S. 10–12, 16–18 · AH S. 8–9', gen:genVocab, n:12},
  {id:'nom', icon:'🏛️', title:{de:'Nominativ & Akkusativ (a- und o-Deklination)', en:'Nominative & accusative (a- and o-declension)'}, pages:'TB S. 19 A1–A3 · BB S. 19 A · AH S. 12 A2', gen:genNoun, n:10},
  {id:'prep', icon:'🐎', title:{de:'Präpositionen mit Akkusativ', en:'Prepositions with the accusative'}, pages:'TB S. 19 B · BB S. 19 B · AH S. 12 B', gen:genPrep, n:8},
  {id:'verb', icon:'⚙️', title:{de:'Verben: a-, e-, i-Konjugation, esse & adesse', en:'Verbs: a-, e-, i-conjugation, esse & adesse'}, pages:'TB S. 19 C1–C3 · BB S. 20 C · AH S. 13', gen:genVerb, n:10},
  {id:'inf', icon:'🔤', title:{de:'Der Infinitiv', en:'The infinitive'}, pages:'TB S. 13 C · BB S. 15 C · AH S. 7 C', gen:genInf, n:8},
  {id:'trans', icon:'✍️', title:{de:'Lateinische Texte übersetzen', en:'Translating Latin texts'}, pages:'TB S. 12, 15, 18 · AH S. 10–11', gen:genTrans, n:10, x2:true},
];
