/* Word Garden - a calm early reading game. */
(() => {
"use strict";
const C = window.WG_CONTENT, PH = C.phonemes;
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const main = $("#main");
const KEY = "wordgarden.v1";
const DEFAULT_STATE = {
  version:1, level:0, items:{}, sessions:[], garden:0, gardenBed:0, lastWatered:0, current:null, createdAt:Date.now(),
  settings:{ voiceRate:0.84, uppercase:false, sound:true, motion:true, showSoundReference:false }
};
const clone = o => JSON.parse(JSON.stringify(o));
function loadState(){
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const s = JSON.parse(raw);
    const merged=Object.assign(clone(DEFAULT_STATE), s, { settings:Object.assign(clone(DEFAULT_STATE.settings), s.settings||{}) });
    if(s.gardenBed===undefined) merged.gardenBed=Math.max(0,Math.floor((merged.garden-1)/12));
    return merged;
  } catch { return clone(DEFAULT_STATE); }
}
let state = loadState();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

/* speech */
let voices = [];
const refreshVoices = () => { try { voices = speechSynthesis.getVoices()||[]; } catch { voices=[]; } };
if ("speechSynthesis" in window){ refreshVoices(); speechSynthesis.onvoiceschanged = refreshVoices; }
let speakToken = 0;
function stopSpeech(){ speakToken++; try { speechSynthesis.cancel(); } catch {} }
function speak(text, opts={}){
  if (!("speechSynthesis" in window) || !text) return 0;
  const token = ++speakToken;
  try { speechSynthesis.cancel(); } catch {}
  const u = new SpeechSynthesisUtterance(text);
  if(!voices.length) refreshVoices();
  const en = voices.filter(v => /^en[-_]/i.test(v.lang));
  const score = v => (/natural|neural|premium|enhanced/i.test(v.name)?3:0)
    + (/google/i.test(v.name)?2:0)
    + (/samantha|aria|jenny|zira/i.test(v.name)?1:0)
    + (/compact|espeak|robot/i.test(v.name)?-2:0);
  const pref = en.slice().sort((a,b)=>score(b)-score(a))[0] || en[0];
  if (pref) u.voice = pref;
  u.lang = pref ? pref.lang : "en-US";
  u.rate = opts.rate ?? state.settings.voiceRate;
  u.pitch = opts.pitch ?? 1.0;
  u.text = text;
  u.volume = 0.95;
  u.onend = () => { if (token === speakToken && opts.onend) opts.onend(); };
  speechSynthesis.speak(u);
  return token;
}

/* phoneme audio */
const audioCache = {};
function phoneme(key){
  if (!state.settings.sound) return;
  const meta = PH[key];
  if (!meta) return;
  try {
    const active = audioCache.__active;
    if(active){ active.pause(); active.currentTime=0; }
    let a = audioCache[key];
    if (!a){ a = new Audio("audio/phonemes/"+meta.file+".wav"); a.preload="auto"; audioCache[key]=a; }
    audioCache.__active = a;
    a.currentTime = 0; a.play().catch(()=>{});
  } catch {}
}
function preloadPhonemes(){
  Object.keys(PH).forEach(k => {
    if (!audioCache[k]){ const a = new Audio("audio/phonemes/"+PH[k].file+".wav"); a.preload="auto"; audioCache[k]=a; }
  });
}
let actx = null;
function tone(freqs, dur=0.09, gap=0.06, vol=0.05){
  if (!state.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    freqs.forEach((f,i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      const t = actx.currentTime + i*(dur+gap);
      o.type="sine"; o.frequency.value=f;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+0.02);
    });
  } catch {}
}
const chimeGood = () => tone([660,880],0.1,0.05,0.045);
const chimeTry  = () => tone([240],0.16,0,0.03);
const chimeGrow = () => tone([523,659,784,1046],0.12,0.06,0.04);

/* ---------- phonics word splitting ---------- */
const TEAM_LIST = [
  ["ough","aw"],["igh","ie"],["air","air"],["ear","ear"],["tch","ch"],["dge","j"],
  ["ck","k"],["ll","l"],["ss","s"],["ff","f"],["zz","z"],["tt","t"],["pp","p"],
  ["bb","b"],["dd","d"],["gg","g"],["mm","m"],["nn","n"],["rr","r"],
  ["sh","sh"],["ch","ch"],["th","th"],["ng","ng"],["qu","qu"],["wh","w"],["ph","f"],
  ["kn","n"],["wr","r"],["mb","m"],
  ["ay","ay"],["ai","ay"],["ee","ee"],["ea","ee"],["oa","oa"],["oe","oa"],["oo","oo"],
  ["ou","ow"],["ow","ow"],["oi","oi"],["oy","oi"],["ue","ue"],["ew","ue"],["ui","ue"],
  ["ie","ie"],["ar","ar"],["er","er"],["ir","er"],["ur","er"],["or","or"],
  ["au","aw"],["aw","aw"],["ey","ay"]
];
const SHORT_OO = new Set(["book","look","foot","good","wood","wool","cook","hook","stood","brook","took"]);
const LONG_OW = new Set(["snow","grow","show","know","throw","slow","low","bowl","row","yellow","window"]);
const WORD_P = {};
const VOICED_TH_WORDS = new Set(["the","they","their","there","this","that","then","these","those"]);

function splitWord(word){
  const w = word.toLowerCase(), g = [], p = [];
  let i = 0;
  while (i < w.length){
    let hit = null, ph = null;
    for (const [pat, sound] of TEAM_LIST){
      if (!w.startsWith(pat,i)) continue;
      if ((pat==="kn"||pat==="wr") && i!==0) continue;
      if (pat==="mb" && i+2!==w.length) continue;
      if (pat==="ey" && i+2!==w.length) continue;
      hit = pat; ph = sound; break;
    }
    if (hit){
      if (hit==="oo") ph = SHORT_OO.has(w) ? "oo_short" : "oo";
      if (hit==="ow") ph = LONG_OW.has(w) ? "oa" : "ow";
      g.push(hit); p.push(ph); i += hit.length; continue;
    }
    const ch = w[i], nxt = w[i+1]||"";
    g.push(ch);
    if (ch==="c") p.push("eiy".includes(nxt)?"s":"k");
    else if (ch==="g") p.push("eiy".includes(nxt)?"j":"g");
    else if (ch==="y") p.push(i===w.length-1 ? (w.length>3?"ee":"ie") : "y");
    else p.push(ch);
    i++;
  }
  if (g.length>2 && g[g.length-1]==="e"){
    const prev = g[g.length-2], before = g[g.length-3];
    const doubles = ["ll","ss","ff","zz","tt","pp","bb","dd","gg","mm","nn","rr","ck","tch","dge"];
    p[g.length-1] = "";
    if (!doubles.includes(prev) && "aeiou".includes(before)){
      p[g.length-3] = {a:"ay",e:"ee",i:"ie",o:"oa",u:"ue"}[before];
    }
  }
  if (VOICED_TH_WORDS.has(w)) { const i=g.indexOf("th"); if(i>=0) p[i]="th_v"; }
  if (WORD_P[w]) return { g:WORD_P[w].g || g, p:WORD_P[w].p || p };
  return { g, p };
}
function shuffle(a, seed){
  const arr = a.slice();
  let s = seed == null ? Math.floor(Math.random()*1e9) : seed;
  const rnd = () => { s = (s*1664525+1013904223)%4294967296; return s/4294967296; };
  for (let i=arr.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
const hash = str => { let h=2166136261; for (let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; };

/* ---------- catalog ---------- */
const CAT = { items:[], byLevel:[[],[],[],[],[],[]], byType:{} };
function addItem(it){
  CAT.items.push(it); CAT.byLevel[it.level].push(it);
  (CAT.byType[it.type] ||= []).push(it);
}
C.levels.forEach((lv, li) => {
  (lv.sounds||[]).forEach((s, si) => addItem({
    id:`L${li+1}-sound-${s}`, type:"sound", level:li, order:si, skill:"sound:"+s, data:{ target:s }
  }));
  (lv.words||[]).forEach(([w,img], wi) => {
    const sp = splitWord(w);
    if (img) addItem({
      id:`L${li+1}-blend-${w}`, type:"blend", level:li, order:100+wi, skill:"word:"+w,
      data:{ word:w, img, g:sp.g, p:sp.p }
    });
    addItem({
      id:`L${li+1}-spell-${w}`, type:"spell", level:li, order:200+wi, skill:"word:"+w,
      data:{ word:w, img:img||"", g:sp.g, p:sp.p }
    });
  });
});
C.heartWords.forEach((h, hi) => {
  const li = Math.max(0,(h.level||3)-1);
  addItem({ id:"H-"+h.w, type:"heart", level:li, order:300+hi, skill:"heart:"+h.w, data:h });
});
C.sentences.forEach((sn, si) => {
  const li = Math.max(0,(sn.level||2)-1);
  addItem({ id:"S-"+si, type:"sentence", level:li, order:400+si, skill:"sentence:"+si, data:sn });
});
(C.sightWords||[]).forEach((w,i)=>{
  addItem({ id:"SIGHT-"+w, type:"sight", level:2, order:1000+i, skill:"sight:"+w, data:{word:w} });
});
const CONFU = {
  s:["c","sh","z"],a:["e","i","u"],t:["d","p","k"],p:["b","t"],i:["e","a"],
  n:["m","d"],m:["n","w"],d:["b","t"],g:["j","k"],o:["u","a"],c:["k","s"],
  k:["c","g"],e:["i","a"],u:["o","a"],r:["l","w"],h:["n","b"],b:["p","d"],
  f:["v","th"],l:["r","n"],sh:["ch","s"],ch:["sh","j"],th:["f","s"],ng:["n","m"],
  ck:["k","c"],qu:["k","w"],j:["ch","g"],v:["f","b"],w:["m","r"],x:["s","k"],
  y:["w","j"],z:["s","v"],ay:["ee","a"],ee:["ay","e"],ie:["i","ay"],oa:["oo","o"],
  oo:["oa","ue"],oo_short:["oo","u"],ue:["oo","oo_short"],ow:["oa","aw"],oi:["aw","ow"],
  aw:["oi","oa"],ar:["or","er"],er:["ar","or"],or:["ar","er"],air:["ear","ar"],ear:["air","er"]
};
function graphemeLabel(key){
  const labels={oo_short:"oo", th_v:"th", ow_long:"ow",a_e:"a-e",i_e:"i-e",e_e:"e-e",o_e:"o-e",u_e:"u-e"};
  return labels[key] || key;
}
function soundChoices(target, level){
  const targetLabel=graphemeLabel(target);
  const targetAudio=PH[target]?.file;
  const pool=(C.levels[level].sounds||[]).filter(s=>s!==target && graphemeLabel(s)!==targetLabel && PH[s]?.file!==targetAudio);
  const picked=[];
  const add=c=>{
    if(c===target || graphemeLabel(c)===targetLabel || PH[c]?.file===targetAudio || picked.includes(c)) return;
    if(picked.some(x=>graphemeLabel(x)===graphemeLabel(c))) return;
    picked.push(c);
  };
  for(const c of (CONFU[target]||[])) if(pool.includes(c)) add(c);
  for(const c of shuffle(pool,hash(target+level))) if(picked.length<2) add(c);
  const any=shuffle(Object.keys(PH),hash(target));
  for(const c of any) if(picked.length<2) add(c);
  return shuffle([target,...picked.slice(0,2)],hash(target+"choices"));
}
function pictureChoices(item, count=3){
  const same = CAT.byLevel[item.level].filter(x => x.type==="blend" && x.data.word!==item.data.word);
  const others = CAT.items.filter(x => x.type==="blend" && x.level!==item.level && x.data.word!==item.data.word);
  const pool = shuffle(same, hash(item.id)).concat(shuffle(others, hash(item.id+"x")));
  const out = [item.data];
  for (const x of pool) if (out.length<count && !out.some(y=>y.word===x.data.word)) out.push(x.data);
  return shuffle(out, hash(item.id+"pics"));
}
function distractorGraphemes(g, key, n=2, level=0){
  const taught = C.levels.slice(0,level+1).flatMap(l=>l.sounds||[]);
  const pool = [...new Set(taught)].filter(x=>x!==g && x.length<=2 && !x.startsWith("silent"));
  const out = [];
  const conf = CONFU[g]||[];
  for (const c of conf) if (pool.includes(c) && !out.includes(c)) out.push(c);
  for (const c of shuffle(pool, hash(key))) if (out.length<n && !out.includes(c)) out.push(c);
  // Very early targets can lack two introduced foils; keep the choice set complete without teaching a false mapping.
  for (const c of shuffle(Object.keys(PH).filter(x=>x!==g&&x.length<=2),hash(key+"fallback")))
    if(out.length<n&&!out.includes(c)) out.push(c);
  return out.slice(0,n);
}
preloadPhonemes();

/* ---------- progress ---------- */
const blankItem = () => ({box:0,seen:0,due:0,correct:0,wrong:0});
const itemState = id => state.items[id] || blankItem();
function levelStats(li){
  const ids = CAT.byLevel[li].filter(it=>it.type!=="sight").map(i=>i.id);
  let seen=0, attempts=0, correct=0, box=0;
  ids.forEach(id => { const s=itemState(id); if(s.seen){ seen++; box+=s.box; } attempts+=s.correct+s.wrong; correct+=s.correct; });
  return { seen, total:ids.length, attempts, correct,
    accuracy: attempts ? correct/attempts : 0,
    mastery: ids.length ? box/(ids.length*4) : 0 };
}
function sightStats(){
  const ids=(CAT.byType.sight||[]).map(i=>i.id);
  let seen=0, attempts=0, correct=0, box=0;
  ids.forEach(id=>{const s=itemState(id); if(s.seen){seen++;box+=s.box;} attempts+=s.correct+s.wrong; correct+=s.correct;});
  return {seen,total:ids.length,attempts,correct,accuracy:attempts?correct/attempts:0,mastery:ids.length?box/(ids.length*4):0};
}
function overall(){
  let seen=0, attempts=0, correct=0, minutes=0;
  CAT.items.forEach(it => { const s=itemState(it.id); if(s.seen) seen++; attempts+=s.correct+s.wrong; correct+=s.correct; });
  state.sessions.forEach(s => { minutes += (s.ms||0)/60000; });
  return { seen, attempts, correct, accuracy: attempts?correct/attempts:0, minutes, sessions:state.sessions.length };
}
function weakest(limit=5){
  return CAT.items.map(it => ({it, s:itemState(it.id)}))
    .filter(x => x.s.seen && x.s.box<3)
    .sort((a,b) => (a.s.box-b.s.box) || (a.s.wrong-b.s.wrong))
    .slice(0,limit);
}
function struggling(){
  return CAT.items.map(it=>({it,s:itemState(it.id)}))
    .filter(x=>x.s.seen && x.s.wrong>0 && x.s.box===0);
}
function needsWater(){
  return struggling().length>=3 && (state.sessions.length-(state.lastWatered??-99))>=2;
}

/* ---------- session building ---------- */
let session = null, timers = [];
function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }
function later(fn,ms){ const t=setTimeout(fn,ms); timers.push(t); return t; }
function arrange(items){
  const out=[], pool=items.slice();
  let last=null;
  while(pool.length){
    let idx=pool.findIndex(x=>x.type!==last);
    if(idx<0) idx=0;
    const [x]=pool.splice(idx,1); out.push(x); last=x.type;
  }
  return out;
}
function pickSession(){
  const len = state.level<=1 ? 6 : 8;
  const now = state.sessions.length;
  const st = it => itemState(it.id);
  const due = CAT.items.filter(it => it.type!=="sight" && it.level<=state.level && st(it).seen && st(it).due<=now)
    .sort((a,b)=>(st(a).box-st(b).box) || (st(a).due-st(b).due));
  const picks=[];
  const add = it => { if(it && !picks.some(x=>x.id===it.id)) picks.push(it); };
  due.slice(0,2).forEach(add);

  const currentSounds = CAT.byLevel[state.level].filter(it=>it.type==="sound");
  const soundsReady = currentSounds.every(it=>st(it).seen>0);
  const eligible = it => {
    if(it.type==="sound") return true;
    if(!soundsReady) return false;
    if(it.level<state.level) return true;
    // Do not ask children to decode a spelling pattern before its current-level sound was practiced.
    if(it.type==="blend" || it.type==="spell"){
      const needed = (it.data.p||[]).filter(Boolean);
      const earlier = new Set(C.levels.slice(0,state.level).flatMap(l=>[...(l.sounds||[]),...(l.contextualPatterns||[])]));
      (C.levels[state.level].contextualPatterns||[]).forEach(x=>earlier.add(x));
      const current = new Set(currentSounds.filter(x=>st(x).seen>0).map(x=>x.data.target));
      return needed.every(x=>earlier.has(x)||current.has(x));
    }
    return true;
  };
  const fresh = t => CAT.byLevel[state.level].filter(it=>it.type===t && !st(it).seen && eligible(it)).sort((a,b)=>a.order-b.order);
  const lower = t => CAT.items.filter(it=>it.level<state.level && it.type===t && !st(it).seen && st(it).seen===0 && eligible(it));
  const mix = ["sound","blend","spell","heart","blend","spell","sound","sentence","spell","blend"];
  let mi=0, guard=0;
  while(picks.length<len && guard++<80){
    const t = mix[mi++ % mix.length];
    const list = fresh(t).concat(lower(t));
    add(list[0]);
    if(mi>50) break;
  }
  const seenPool = shuffle(CAT.items.filter(it=>it.type!=="sight" && it.level<=state.level && st(it).seen && !picks.some(p=>p.id===it.id)), now+7)
    .sort((a,b)=>st(a).box-st(b).box);
  for(const it of seenPool){ if(picks.length>=len) break; add(it); }
  for(const it of shuffle(CAT.byLevel[state.level].filter(it=>it.type!=="sight" && eligible(it)), now)){ if(picks.length>=len) break; add(it); }
  return arrange(picks).slice(0,len);
}
function pickSightSession(){
  const now=state.sessions.length, st=it=>itemState(it.id);
  const items=CAT.byType.sight||[];
  const due=items.filter(it=>st(it).seen && st(it).due<=now).sort((a,b)=>st(a).box-st(b).box);
  const fresh=items.filter(it=>!st(it).seen).sort((a,b)=>a.order-b.order);
  const review=items.filter(it=>st(it).seen && st(it).box<3).sort((a,b)=>st(a).box-st(b).box);
  const picks=[]; const add=it=>{if(it&&!picks.some(x=>x.id===it.id))picks.push(it);};
  due.slice(0,2).forEach(add); fresh.forEach(add); review.forEach(add);
  return arrange(picks).slice(0,6);
}
function startSession(){
  clearTimers(); stopSpeech();
  const items = pickSession();
  session = { items, idx:0, correct:0, started:Date.now(), wrong:0, done:false, firstTry:true, tries:0, kind:"read" };
  state.current = { kind:"read", idx:0, ids:items.map(i=>i.id) };
  save();
  renderItem();
}
function startSightSession(){
  clearTimers(); stopSpeech();
  const items=pickSightSession();
  if(!items.length) return startSession();
  session={items,idx:0,correct:0,started:Date.now(),wrong:0,done:false,firstTry:true,tries:0,kind:"sight"};
  state.current={kind:"sight",idx:0,ids:items.map(i=>i.id)};
  save(); renderItem();
}
function startWaterSession(){
  const items=weakest(8).map(x=>x.it).slice(0,5);
  if(!items.length) return startSession();
  clearTimers(); stopSpeech();
  session={items,idx:0,correct:0,started:Date.now(),wrong:0,done:false,firstTry:true,tries:0,kind:"water"};
  state.current={kind:"water",idx:0,ids:items.map(i=>i.id)};
  save(); renderItem();
}
function resumeSession(){
  const cur = state.current;
  if(!cur || !cur.ids) { startSession(); return; }
  const items = cur.ids.map(id=>CAT.items.find(i=>i.id===id)).filter(Boolean);
  if(!items.length){ startSession(); return; }
  clearTimers(); stopSpeech();
  session = { items, idx:cur.idx||0, correct:0, started:Date.now(), wrong:0, done:false, firstTry:true, tries:0, kind:cur.kind||"read" };
  renderItem();
}
function record(item, firstTryCorrect){
  const s = Object.assign(blankItem(), state.items[item.id]||{});
  s.seen += 1;
  if (firstTryCorrect){
    s.correct += 1; s.box = Math.min(4, s.box+1);
    s.due = state.sessions.length + [1,2,4,8][s.box];
  } else {
    s.wrong += 1; s.box = 0; s.due = state.sessions.length + 1;
  }
  state.items[item.id] = s; save();
}
function nextItem(){
  if(!session) return;
  session.idx++;
  if(state.current){ state.current.idx=session.idx; save(); }
  session.firstTry = true;
  if (session.idx >= session.items.length) finishSession();
  else renderItem();
}
function finishSession(){
  if(!session || session.done) return;
  session.done = true;
  const ms = Date.now()-session.started;
  const kind = session.kind||"read";
  const st = levelStats(state.level);
  const before = state.level;
  let leveled = false;
  if(kind==="read"){
    const requiredSounds = CAT.byLevel[state.level].filter(it=>it.type==="sound");
    const learnedSounds = requiredSounds.every(it=>itemState(it.id).seen>0);
    const wordItems = CAT.byLevel[state.level].filter(it=>it.type==="blend"||it.type==="spell");
    const wordAttempts = wordItems.reduce((n,it)=>{const s=itemState(it.id);return n+s.correct+s.wrong;},0);
    const practicedWords = wordItems.length===0 || wordAttempts>=10;
    if (learnedSounds && practicedWords && st.attempts>=18 && st.accuracy>=0.68 && state.level < C.levels.length-1){
      state.level++; leveled = true;
    }
  }
  state.sessions.push({ t:Date.now(), ms, kind, level:before, total:session.items.length, correct:session.correct, ids:session.items.map(i=>i.id) });
  if(kind!=="water"){
    state.garden = (state.garden||0)+1;
    state.gardenBed = Math.floor((state.garden-1)/12);
  } else {
    state.lastWatered = state.sessions.length;
  }
  state.current = null;
  save();
  chimeGrow();
  renderFinish(leveled, ms, kind);
}

/* ---------- garden art ---------- */
const FLOWER_COLORS = ["#D97757","#E9B44C","#C96A8A","#7FA88A","#8E7CC3","#E08A5B","#6E9BD1"];
function plant(x, i, grown, animate){
  if (!grown) {
    return `<g class="seed" transform="translate(${x},176)"><ellipse cx="0" cy="0" rx="7" ry="3" fill="#B9AE94" opacity=".55"/></g>`;
  }
  const h = 34 + ((i*29)%46);
  const c = FLOWER_COLORS[i % FLOWER_COLORS.length];
  const sway = (i%2?1:-1)*3;
  const petals = Array.from({length:5},(_,k)=>{
    const a = (k/5)*Math.PI*2;
    return `<ellipse cx="${(Math.cos(a)*9).toFixed(1)}" cy="${(Math.sin(a)*9-6).toFixed(1)}" rx="7" ry="6" fill="${c}" transform="rotate(${k*72} 0 -6)"/>`;
  }).join("");
  return `<g transform="translate(${x},176)"><g class="plant ${animate?'grow':''}" style="animation-delay:${i*60}ms">
    <path d="M0,0 C${sway},-${h*0.45} ${-sway},-${h*0.7} 0,-${h}" stroke="#5E7F52" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M0,-${h*0.45} q-18,-2 -20,-16 q18,0 20,16" fill="#7FA06D"/>
    <path d="M0,-${h*0.62} q18,-2 20,-16 q-18,0 -20,16" fill="#6E9160"/>
    <g transform="translate(0,-${h+4})">${petals}<circle r="5" fill="#E9B44C"/></g>
  </g></g>`;
}
function gardenSVG(count, animate=false, bed=0){
  const per=12, beds=Math.max(1,Math.ceil(count/per));
  bed=Math.max(0,Math.min(bed,beds-1));
  const start=bed*per, showing=Math.min(per,Math.max(0,count-start));
  const plants = Array.from({length:12},(_,i)=>plant(70+i*56,i,i<showing,animate)).join("");
  return `<svg class="garden" viewBox="0 0 760 220" role="img" aria-label="${count} plants grown, garden ${bed+1} of ${beds}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF6EA"/><stop offset="1" stop-color="#F2EAD8"/></linearGradient></defs>
    <rect width="760" height="220" rx="28" fill="url(#sky)"/>
    <circle cx="676" cy="52" r="26" fill="#F2C96B" opacity=".55"/>
    <path d="M0,176 Q190,160 380,174 T760,170 L760,220 L0,220 Z" fill="#DCE4C8"/>
    <path d="M0,190 Q190,178 380,190 T760,186 L760,220 L0,220 Z" fill="#CBD8B4"/>
    ${plants}
  </svg>`;
}

/* ---------- icons ---------- */
const ICON = {
  sound:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  mute:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  arrow:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  replay:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 6.3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M20 5v6h-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  word:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h11a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3V5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 9h7M8.5 12h7M8.5 15h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  close:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`
};

/* ---------- shared UI ---------- */
function setFeedback(kind, text){
  const f = $("#feedback"); if(!f) return;
  f.className = "feedback " + (kind||""); f.textContent = text || "";
}
function gardenMark(){
  return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27V13" stroke="#3E6B4E" stroke-width="2.6" stroke-linecap="round"/><path d="M16 17c-6 0-9-3-9-8 6 0 9 3 9 8z" fill="#6E9B6A"/><path d="M16 13c5 0 8-3 8-8-5 0-8 3-8 8z" fill="#8FB07A"/><circle cx="16" cy="8" r="3" fill="#E9B44C"/></svg>`;
}
function soundToggle(){
  const b = $("#soundToggle"); if(!b) return;
  b.innerHTML = state.settings.sound ? ICON.sound : ICON.mute;
  b.setAttribute("aria-label", state.settings.sound ? "Sound on" : "Sound off");
}
function topbar(){
  return `<header class="topbar">
    <div class="brand"><span class="mark">${gardenMark()}</span><span>Word Garden</span></div>
    <button class="icon-btn" id="soundToggle" aria-label="Sound"></button>
  </header>`;
}
function renderHome(){
  clearTimers(); stopSpeech();
  const lv = C.levels[state.level], all = overall(), started = state.sessions.length>0;
  const beds = Math.max(1, Math.ceil((state.garden||0)/12));
  const bed = Math.min(state.gardenBed||0, beds-1);
  const practiceLabel = state.level===0 ? "sounds practiced" : "sounds and words practiced";
  const lessonHint = state.level===0 ? "Hear each sound, then choose its letter." : "Blend sounds and build words. One calm step at a time.";
  main.innerHTML = `${topbar()}
  <section class="home">
    <div class="hero">
      <p class="kicker">Level ${state.level+1} · ${lv.grade}</p>
      <h1>${started ? "Your garden is growing." : "Plant a reading garden."}</h1>
      <p class="lede">${lv.intro} ${lessonHint}</p>
      <button class="play-btn" data-act="play">
        <span class="play-icon">${ICON.arrow}</span>
        <span><strong>${state.current?"Continue":"Play"}</strong><small>${state.current?"Finish your session":`${state.level<=1?6:8} little steps`}</small></span>
      </button>
      ${!state.current?`<button class="sight-btn" data-act="sight">
        <span class="sight-icon">Aa</span>
        <span><strong>Sight words</strong><small>Quick word recognition</small></span>
      </button>`:""}
      ${!state.current && needsWater()?`<div class="water-note"><span>💧</span><div><strong>Some flowers need water.</strong><p>Revisit the sounds and words that could use a little care.</p></div><button class="btn ghost" data-act="water">Water them</button></div>`:""}
      <div class="home-meta"><span>${all.seen} ${practiceLabel}</span>${started?`<span>${state.garden} plant${state.garden===1?"":"s"} grown</span>`:""}</div>
    </div>
    <div class="garden-panel">${gardenSVG(state.garden, false, bed)}
      <div class="garden-caption">${state.garden ? "Every session grows one plant." : "Finish a session to plant your first seed."}</div>
      ${beds>1?`<div class="bed-nav"><button data-bed="-1" aria-label="Previous garden">←</button><span>Garden ${bed+1} of ${beds}</span><button data-bed="1" aria-label="Next garden">→</button></div>`:""}
    </div>
  </section>
  <footer class="home-foot">
    ${state.settings.showSoundReference?`<button class="quiet" data-act="soundref">Sound reference</button>`:""}
    <button class="quiet" data-act="parent">Grown-ups</button>
  </footer>`;
  soundToggle();
  $("[data-act=play]").addEventListener("click", ()=> (state.current ? resumeSession() : startSession()));
  const sightBtn=$("[data-act=sight]"); if(sightBtn) sightBtn.addEventListener("click", startSightSession);
  const waterBtn=$("[data-act=water]"); if(waterBtn) waterBtn.addEventListener("click", startWaterSession);
  $$("[data-bed]").forEach(b=>b.addEventListener("click",()=>{
    state.gardenBed=Math.max(0,Math.min(beds-1,bed+(+b.dataset.bed))); save(); renderHome();
  }));
  $("[data-act=parent]").addEventListener("click", openParentGate);
  const soundRefButton=$("[data-act=soundref]");
  if(soundRefButton) soundRefButton.addEventListener("click",()=>{ const wrap=makeModal("","wide"); renderSoundSheet(wrap,false); });
  $("#soundToggle").addEventListener("click", () => {
    state.settings.sound = !state.settings.sound; save(); soundToggle();
    if (state.settings.sound) chimeGood();
  });
}
function renderShell(){
  const dots = session.items.map((_,i)=>`<span class="dot ${i<session.idx?"done":i===session.idx?"now":""}"></span>`).join("");
  main.innerHTML = `<section class="session">
    <div class="session-top">
      <button class="icon-btn" id="quitBtn" aria-label="Leave session">${ICON.close}</button>
      <div class="dots" aria-label="Progress">${dots}</div>
      <button class="icon-btn" id="replayBtn" aria-label="Hear again">${ICON.replay}</button>
    </div>
    <div id="stage" class="stage"></div>
    <div id="feedback" class="feedback" aria-live="polite"></div>
    <div class="session-foot"><button class="quiet" id="quitText">Stop for now</button></div>
  </section>`;
  $("#quitBtn").addEventListener("click", confirmQuit);
  $("#quitText").addEventListener("click", confirmQuit);
  $("#replayBtn").addEventListener("click", replayCurrent);
}
function replayCurrent(){
  if(!session) return;
  const it = session.items[session.idx]; if(!it) return;
  if(it.type==="sound") phoneme(it.data.target);
  else if(it.type==="blend") soundOut(it);
  else if(it.type==="heart") speak(it.data.w);
  else if(it.type==="spell") speak(it.data.word);
  else if(it.type==="sentence") speak(it.data.text, {rate:Math.max(0.65,state.settings.voiceRate-0.1)});
}
function soundOut(item){
  const parts = item.data.p.filter(x=>x);
  parts.forEach((p,i)=>later(()=>phoneme(p), i*330));
  later(()=>speak(item.data.word), parts.length*330+120);
}
function confirmQuit(){
  clearTimers(); stopSpeech();
  const wrap = document.createElement("div");
  wrap.className = "modal-wrap";
  wrap.innerHTML = `<div class="modal small" role="dialog" aria-modal="true">
    <h2>Stop for now?</h2><p>This session will not be saved, but your garden is safe.</p>
    <div class="modal-actions"><button class="btn ghost" id="keep">Keep playing</button><button class="btn primary" id="leave">Stop</button></div></div>`;
  document.body.appendChild(wrap);
  $("#keep",wrap).addEventListener("click", ()=>{ wrap.remove(); });
  $("#leave",wrap).addEventListener("click", ()=>{ wrap.remove(); session=null; renderHome(); });
}
function renderItem(){
  clearTimers(); stopSpeech();
  const item = session.items[session.idx];
  session.tries = 0; session.firstTry = true;
  renderShell();
  if(item.type==="sound") renderSound(item);
  else if(item.type==="blend") renderBlend(item);
  else if(item.type==="spell") renderSpell(item,false);
  else if(item.type==="heart") renderSpell(item,true);
  else if(item.type==="sentence") renderSentence(item);
  else if(item.type==="sight") renderSight(item);
}
function resolveCorrect(item, message, after){
  chimeGood();
  if(session.firstTry) session.correct++;
  record(item, session.firstTry);
  session.firstTry = false;
  setFeedback("good", message || "Yes.");
  later(after || nextItem, 1050);
}
function wrongTry(item, message){
  session.firstTry = false; chimeTry();
  setFeedback("try", message || "Not quite. Try again.");
}
function phonemeName(k){
  const names = {a:"ă",e:"ĕ",i:"ĭ",o:"ŏ",u:"ŭ",c:"k",ck:"k",sh:"sh",ch:"ch",th:"th",th_v:"ð",ng:"ng",qu:"kw",x:"ks",
    ay:"ā",ai:"ā",a_e:"ā",ee:"ē",ea:"ē",e_e:"ē",ie:"ī",igh:"ī",i_e:"ī",oa:"ō",oe:"ō",ow_long:"ō",o_e:"ō",
    oo:"oo",oo_short:"oo",ue:"ū",ew:"ū",u_e:"ū",ow:"ow",oi:"oy",oy:"oy",aw:"aw",au:"aw",ar:"ar",er:"er",ir:"er",ur:"er",or:"or",air:"air",ear:"ear",
    tch:"ch",ph:"f",wh:"w",kn:"n",wr:"r"};
  return names[k]||k;
}
const SOUND_EXAMPLES={
  a:"apple",e:"bed",i:"sit",o:"hot",u:"cup",b:"bat",c:"cat",d:"dog",f:"fish",g:"goat",h:"hat",j:"jam",k:"kite",l:"leg",
  m:"map",n:"net",p:"pan",r:"red",s:"sun",t:"tap",v:"van",w:"web",x:"fox",y:"yes",z:"zip",
  sh:"ship",ch:"chip",th:"thin",th_v:"this",ng:"sing",ck:"duck",qu:"queen",wh:"when",ph:"phone",
  ay:"day",ai:"rain",a_e:"cake",ee:"see",ea:"leaf",e_e:"these",ie:"pie",igh:"light",i_e:"bike",
  oa:"boat",ow_long:"snow",o_e:"home",oo:"moon",oo_short:"book",ue:"blue",ew:"new",u_e:"cube",ow:"cow",
  oi:"coin",oy:"toy",aw:"saw",au:"haul",ar:"car",er:"her",ir:"bird",ur:"turn",or:"corn",air:"hair",ear:"hear",
  tch:"catch",kn:"knot",wr:"wren",oe:"toe"
};
function renderSound(item){
  const t=item.data.target, stage=$("#stage"), label=graphemeLabel(t);
  if(!itemState(item.id).seen){
    const display=state.settings.uppercase?label.toUpperCase():label;
    stage.innerHTML=`<div class="prompt-card sound-intro">
      <p class="instruction">${label.length>1?"Meet these letters.":"Meet this letter."}</p>
      <div class="new-sound">${display}</div>
      <p class="sound-says"><span class="sound-letter">${display}</span> says <span class="sound-phoneme">/${phonemeName(t)}/</span></p>
      <p class="sound-example">As in <b>${SOUND_EXAMPLES[t]||""}</b></p>
      <div class="intro-actions">
        <button class="listen-orb compact" id="introSound">${ICON.sound}<span>Hear it</span></button>
        <button class="listen-orb compact" id="introWord">${ICON.word}<span>In a word</span></button>
      </div>
      <button class="btn primary" id="trySound">Try it</button>
    </div>`;
    later(()=>phoneme(t),250);
    $("#introSound").addEventListener("click",()=>phoneme(t));
    $("#introWord").addEventListener("click",()=>{ const ex=SOUND_EXAMPLES[t]; if(ex) speak(ex); });
    $("#trySound").addEventListener("click",()=>renderSoundQuiz(item));
    return;
  }
  renderSoundQuiz(item);
}
function renderSoundQuiz(item){
  const t = item.data.target;
  const choices = item.data.choices || soundChoices(t,item.level);
  item.data.choices = choices;
  const stage = $("#stage");
  stage.innerHTML = `<div class="prompt-card">
    <p class="instruction">${graphemeLabel(t).length>1?"Which letters make this sound?":"Which letter says this sound?"}</p>
    <button class="listen-orb" id="playSound">${ICON.sound}<span>Hear it</span></button>
    <div class="choice-row letter-row" role="group" aria-label="Letter choices">
      ${choices.map(g=>{const label=graphemeLabel(g);return `<button class="letter-tile" data-answer="${g}">${state.settings.uppercase?label.toUpperCase():label}</button>`;}).join("")}
    </div></div>`;
  later(()=>phoneme(t),300);
  $("#playSound").addEventListener("click",()=>phoneme(t));
  $$(".letter-tile",stage).forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.disabled) return;
    const answer=(btn.dataset.answer||"").toLowerCase();
    if(answer===t){
      btn.classList.add("good"); $$(".letter-tile",stage).forEach(b=>b.disabled=true);
      resolveCorrect(item,`Yes. ${graphemeLabel(t)} says /${phonemeName(t)}/, as in ${SOUND_EXAMPLES[t]||"that sound"}.`,()=>{phoneme(t);later(nextItem,500);});
    }else{
      session.tries++; btn.classList.add("bad"); btn.disabled=true;
      wrongTry(item,`Listen again. Which letters say that sound?`);
      later(()=>phoneme(t),450);
      if(session.tries>=2) $$(".letter-tile",stage).forEach(b=>{if((b.dataset.answer||"").toLowerCase()===t)b.classList.add("reveal");});
    }
  }));
}
function pickTile(sel, match){
  const list = $$(sel);
  for (const el of list){
    if (match(el)) { el.click(); return true; }
  }
  return false;
}
function renderBlend(item){
  const d = item.data, pics = pictureChoices(item), stage = $("#stage");
  stage.innerHTML = `<div class="prompt-card">
    <p class="instruction">Tap each sound. Then find the picture.</p>
    <div class="word-tiles" role="group" aria-label="Sounds in the word">
      ${d.g.map((g,i)=>`<button class="grapheme" data-i="${i}">${state.settings.uppercase?g.toUpperCase():g}</button>`).join("")}
    </div>
    <button class="quiet inline" id="hearWord">${ICON.sound} Hear the word</button>
    <div class="picture-row" role="group" aria-label="Picture choices">
      ${pics.map(p=>`<button class="picture-card" data-word="${p.word}" aria-label="picture"><span class="emoji">${p.img}</span></button>`).join("")}
    </div></div>`;
  $$(".grapheme",stage).forEach(btn=>btn.addEventListener("click", ()=>{
    const i=+btn.dataset.i; btn.classList.add("lit"); phoneme(d.p[i]||d.g[i]);
  }));
  $("#hearWord").addEventListener("click", ()=>speak(d.word));
  $$(".picture-card",stage).forEach(btn=>btn.addEventListener("click", ()=>{
    if(btn.disabled) return;
    if(btn.dataset.word===d.word){
      btn.classList.add("good"); $$(".picture-card",stage).forEach(b=>b.disabled=true);
      $$(".grapheme",stage).forEach(b=>b.classList.add("lit"));
      resolveCorrect(item, `Yes. ${d.g.join("-")} makes ${d.word}.`, ()=>{ speak(d.word); later(nextItem,650); });
    } else {
      session.tries++; btn.classList.add("bad"); btn.disabled=true;
      wrongTry(item, "That is a different picture. Sound it out again.");
      if(session.tries>=2) $$(".picture-card",stage).forEach(b=>{ if(b.dataset.word===d.word) b.classList.add("reveal"); });
    }
  }));
  later(()=>speak(d.word), 300);
}

/* spell and heart words */
function graphemeSound(g){
  if(PH[g]) return g;
  const map = {c:"k",g:"g",kn:"n",wr:"r",mb:"m",tch:"ch",dge:"j",ll:"l",ss:"s",ff:"f",zz:"z",tt:"t",pp:"p",bb:"b",dd:"d",gg:"g",mm:"m",nn:"n",rr:"r",wh:"w",ph:"f"};
  return map[g]||g;
}
function renderSpell(item, heart){
  const d = heart ? Object.assign({}, item.data, {
    word: item.data.w,
    g: Array.isArray(item.data.g) ? item.data.g : item.data.g.split(/\s+/)
  }) : item.data;
  const stage = $("#stage");
  const heartIdx = heart ? (d.heart||[]) : [];
  const chosen = new Array(d.g.length).fill(null);
  const bank = d.g.map((g,i)=>({ g, id:"c"+i, correct:true }));
  const extras = distractorGraphemes(d.g[0]||"", item.id+"-bank", 3, item.level);
  extras.forEach((g,i)=>bank.push({ g, id:"x"+i, correct:false }));
  const tokens = shuffle(bank, hash(item.id+"bank"));
  let tries = 0, revealed = false;
  const wordCard = heart ? `<div class="heart-word" aria-label="${d.word}">
      ${d.g.map((g,i)=>`<span class="hw ${heartIdx.includes(i)?"has-heart":""}">${state.settings.uppercase?g.toUpperCase():g}${heartIdx.includes(i)?"<i class='heart-dot'>♥</i>":""}</span>`).join("")}
    </div><p class="phrase">${d.phrase||""}</p>` : "";
  stage.innerHTML = `<div class="prompt-card spell-card">
    <p class="instruction">${heart?"Build the word. The heart part is tricky.":"Build the word you hear."}</p>
    ${wordCard}
    <div class="spell-top">
      <div class="picture-mini">${d.img?`<span class="emoji">${d.img}</span>`:`<span class="mini-orb">${ICON.sound}</span>`}</div>
      <button class="listen-pill" id="playWord">${ICON.sound} Hear it</button>
    </div>
    <div class="sound-boxes" id="boxes" aria-label="Word boxes"></div>
    <div class="letter-bank" id="bank" aria-label="Letter choices"></div>
    <div class="spell-actions">
      <button class="btn ghost" id="hintBtn" hidden>First sound</button>
      <button class="btn primary" id="checkBtn" disabled>Check</button>
    </div>
  </div>`;
  function drawBoxes(){
    const b = $("#boxes");
    b.innerHTML = chosen.map((t,i)=>{
      const silent = d.p[i]==="";
      const ghost = revealed ? d.g[i] : "";
      const rawContent = t ? t.g : (ghost || "·");
      const content = state.settings.uppercase ? rawContent.toUpperCase() : rawContent;
      return `<button class="sound-box ${t?"filled":""} ${silent?"silent":""} ${revealed&&!t?"ghost":""} ${heartIdx.includes(i)?"heart-box":""}" data-box="${i}">
        ${content}${silent&&t?'<em>silent</em>':''}</button>`;
    }).join("");
    $$("[data-box]",b).forEach(btn=>btn.addEventListener("click", ()=>{
      if(revealed) return;
      const i=+btn.dataset.box;
      if(chosen[i]){ chosen[i]=null; drawBoxes(); drawBank(); updateCheck(); }
    }));
  }
  function drawBank(){
    const b = $("#bank");
    const used = new Set(chosen.filter(Boolean).map(t=>t.id));
    b.innerHTML = tokens.filter(t=>!used.has(t.id)).map(t=>`<button class="bank-tile" data-tok="${t.id}">${state.settings.uppercase?t.g.toUpperCase():t.g}</button>`).join("");
    $$("[data-tok]",b).forEach(btn=>btn.addEventListener("click", ()=>{
      if(revealed) return;
      const tok = tokens.find(t=>t.id===btn.dataset.tok); if(!tok) return;
      const slot = chosen.findIndex(x=>!x); if(slot<0) return;
      chosen[slot]=tok; drawBoxes(); drawBank(); updateCheck();
      phoneme(tok.g===d.g[slot] ? (d.p[slot]||graphemeSound(tok.g)) : graphemeSound(tok.g));
    }));
  }
  function updateCheck(){
    const btn=$("#checkBtn"); if(btn) btn.disabled = chosen.some(x=>!x);
    const hint=$("#hintBtn"); if(hint) hint.hidden = tries<1 || chosen[0] || revealed;
  }
  function check(){
    if(chosen.some(x=>!x)) return;
    const got = chosen.map(t=>t.g).join("|"), want = d.g.join("|");
    if(got===want){
      $$(".sound-box").forEach(b=>b.classList.add("good"));
      resolveCorrect(item, `Yes. ${d.word}.`, ()=>{ speak(d.word); later(nextItem,600); });
    } else {
      tries++; session.tries++;
      $$(".sound-box").forEach(b=>b.classList.add("bad"));
      wrongTry(item, "Listen to each sound and try again.");
      later(()=>{
        $$(".sound-box").forEach(b=>b.classList.remove("bad"));
        if(tries>=2){
          revealed=true; drawBoxes(); drawBank(); updateCheck();
          setFeedback("try", `This word is ${d.word}.`);
          speak(d.word);
          record(item,false);
          later(nextItem, 2100);
        }
      }, 700);
    }
  }
  $("#playWord").addEventListener("click", ()=>speak(d.word));
  $("#checkBtn").addEventListener("click", check);
  $("#hintBtn").addEventListener("click", ()=>{
    const slot = chosen.findIndex(x=>!x); if(slot<0) return;
    const tok = tokens.find(t=>!chosen.some(c=>c&&c.id===t.id) && t.g===d.g[slot]);
    if(tok){ chosen[slot]=tok; drawBoxes(); drawBank(); updateCheck(); phoneme(d.p[slot]||graphemeSound(tok.g)); }
  });
  drawBoxes(); drawBank(); updateCheck();
  later(()=>speak(d.word), 350);
}

/* sight words */
function renderSight(item){
  const w=item.data.word;
  const all=(CAT.byType.sight||[]).map(x=>x.data.word).filter(x=>x!==w);
  const similar=all.filter(x=>x[0].toLowerCase()===w[0].toLowerCase()||x.length===w.length);
  const distract=shuffle(similar.length>=2?similar:all,hash(w)).slice(0,2);
  const choices=shuffle([w,...distract],hash(w+"choices"));
  const stage=$("#stage");
  stage.innerHTML=`<div class="prompt-card sight-card">
    <p class="instruction">Find the word you hear.</p>
    <button class="listen-orb" id="playSight">${ICON.sound}<span>Hear it</span></button>
    <div class="choice-row sight-row" role="group" aria-label="Word choices">
      ${choices.map(x=>`<button class="sight-tile" data-word="${x}">${x}</button>`).join("")}
    </div>
    <p class="sight-hint">Sight words are words we learn to know by sight.</p>
  </div>`;
  later(()=>speak(w,{rate:Math.max(0.7,state.settings.voiceRate-0.05)}),280);
  $("#playSight").addEventListener("click",()=>speak(w,{rate:Math.max(0.7,state.settings.voiceRate-0.05)}));
  $$(".sight-tile",stage).forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.disabled)return;
    if(btn.dataset.word===w){
      btn.classList.add("good"); $$(".sight-tile",stage).forEach(b=>b.disabled=true);
      resolveCorrect(item,`Yes. ${w}.`,()=>{speak(w);later(nextItem,650);});
    }else{
      session.tries++; btn.classList.add("bad"); btn.disabled=true;
      wrongTry(item,"Listen again. Which word is it?");
      later(()=>speak(w,{rate:Math.max(0.7,state.settings.voiceRate-0.05)}),450);
      if(session.tries>=2) $$(".sight-tile",stage).forEach(b=>{if(b.dataset.word===w)b.classList.add("reveal");});
    }
  }));
}
/* sentence reading */
function renderSentence(item){
  const d=item.data, stage=$("#stage");
  const words=d.text.split(" ");
  stage.innerHTML = `<div class="prompt-card sentence-card">
    <p class="instruction">Read the sentence. Then answer the question.</p>
    <div class="sentence" id="sentence">
      ${words.map(w=>`<button class="sent-word" data-w="${w.replace(/[^A-Za-z']/g,"")}">${w}</button>`).join(" ")}
    </div>
    <button class="quiet inline" id="readSentence">${ICON.sound} Read it to me</button>
    <p class="question">${d.q}</p>
    <div class="picture-row answer-row" role="group" aria-label="Answers">
      ${d.options.map((o,i)=>`<button class="answer-card" data-i="${i}"><span class="emoji">${o[0]}</span><span class="answer-label">${o[1]}</span></button>`).join("")}
    </div></div>`;
  $$(".sent-word",stage).forEach(b=>b.addEventListener("click", ()=>{
    b.classList.add("tapped");
    speak(b.dataset.w, {rate:Math.max(0.65,state.settings.voiceRate-0.08)});
  }));
  $("#readSentence").addEventListener("click", ()=>speak(d.text,{rate:Math.max(0.65,state.settings.voiceRate-0.1)}));
  $$(".answer-card",stage).forEach(btn=>btn.addEventListener("click", ()=>{
    if(btn.disabled) return;
    if(+btn.dataset.i===d.answer){
      btn.classList.add("good"); $$(".answer-card",stage).forEach(b=>b.disabled=true);
      resolveCorrect(item, "Yes. You read it.", ()=>{ speak(d.text,{rate:Math.max(0.65,state.settings.voiceRate-0.1)}); later(nextItem,900); });
    } else {
      session.tries++; btn.classList.add("bad"); btn.disabled=true;
      wrongTry(item, "Read the sentence again. What happened?");
      if(session.tries>=2) $$(".answer-card",stage).forEach(b=>{ if(+b.dataset.i===d.answer) b.classList.add("reveal"); });
    }
  }));
  later(()=>speak(d.text,{rate:Math.max(0.65,state.settings.voiceRate-0.1)}), 450);
}

/* finish */
function renderFinish(leveled, ms, kind="read"){
  clearTimers(); stopSpeech();
  const lv=C.levels[state.level], n=session?session.items.length:0;
  const soundCount=session?session.items.filter(i=>i.type==="sound").length:0;
  const sightCount=session?session.items.filter(i=>i.type==="sight").length:0;
  const activityCount=n-soundCount;
  let practiceSummary=activityCount===0?`${soundCount} sounds`:soundCount===0?`${activityCount} word activities`:`${soundCount} sounds and ${activityCount} word activities`;
  if(kind==="sight") practiceSummary=`${sightCount} sight words`;
  if(kind==="water") practiceSummary=`${n} sounds and words reviewed`;
  const title=kind==="water"?"Your garden feels better.":kind==="sight"?"Sight words are getting easier.":leveled?"A new path is open.":"You grew a plant.";
  const visitorIndex=Math.floor(((state.garden||0)-3)/3)%2;
  const visitor=VISITORS[visitorIndex];
  const celebrate=kind!=="water" && state.garden>0 && state.garden%3===0;
  main.innerHTML = `${topbar()}
  <section class="finish">
    <div class="finish-art">${gardenSVG(state.garden, state.settings.motion, state.gardenBed||0)}</div>
    <p class="kicker">Session complete</p>
    <h1>${title}</h1>
    ${celebrate?`<div class="visitor-card"><span class="visitor-emoji">${visitor.emoji}</span><div><strong>A ${visitor.name} stopped by.</strong><p>You’re so capable! You should be proud of yourself. Keep up the hard work!</p></div></div>`:""}
    <p class="lede">You practiced ${practiceSummary}${leveled?` and opened Level ${state.level+1}: ${lv.title}`:""}. Your garden has ${state.garden} plant${state.garden===1?"":"s"}.</p>
    <div class="finish-actions">
      <button class="play-btn" data-act="again"><span class="play-icon">${ICON.arrow}</span><span><strong>${kind==="water"?"Water again":"Play again"}</strong><small>One more calm session</small></span></button>
      <button class="btn ghost big" data-act="home">Back to the garden</button>
    </div>
  </section>
  <footer class="home-foot"><button class="quiet" data-act="parent">Grown-ups</button></footer>`;
  soundToggle();
  $("[data-act=again]").addEventListener("click", ()=>{ state.current=null; save(); kind==="sight"?startSightSession():kind==="water"?startWaterSession():startSession(); });
  $("[data-act=home]").addEventListener("click", renderHome);
  $("[data-act=parent]").addEventListener("click", openParentGate);
  $("#soundToggle").addEventListener("click", ()=>{ state.settings.sound=!state.settings.sound; save(); soundToggle(); });
}
const VISITORS=[{emoji:"🦄",name:"unicorn"},{emoji:"🧜‍♀️",name:"mermaid"}];

/* ---------- grown-ups ---------- */
function makeModal(html, cls=""){
  const wrap=document.createElement("div");
  wrap.className="modal-wrap";
  wrap.innerHTML=`<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(wrap);
  wrap.addEventListener("click", e=>{ if(e.target===wrap) wrap.remove(); });
  return wrap;
}
function openParentGate(){
  stopSpeech();
  const wrap=makeModal(`<button class="modal-x" aria-label="Close">${ICON.close}</button>
    <p class="kicker">Grown-ups</p><h2>Parent settings</h2>
    <p class="muted">Press and hold the leaf for two seconds.</p>
    <button class="hold-leaf" id="holdLeaf">${gardenMark()}<span>Hold</span></button>
    <div class="hold-track"><i id="holdBar"></i></div>`,"small");
  $(".modal-x",wrap).addEventListener("click", ()=>wrap.remove());
  const leaf=$("#holdLeaf",wrap), bar=$("#holdBar",wrap);
  let t0=0, raf=0, done=false;
  const stop=()=>{ t0=0; cancelAnimationFrame(raf); bar.style.width="0%"; leaf.classList.remove("holding"); };
  const tick=()=>{
    if(!t0) return;
    const p=Math.min(1,(performance.now()-t0)/1600);
    bar.style.width=(p*100)+"%";
    if(p>=1 && !done){ done=true; stop(); mathGate(wrap); return; }
    raf=requestAnimationFrame(tick);
  };
  const start=e=>{ if(e.cancelable) e.preventDefault(); if(done) return; t0=performance.now(); leaf.classList.add("holding"); raf=requestAnimationFrame(tick);
    setTimeout(()=>{ if(t0 && !done){ done=true; stop(); mathGate(wrap); } }, 1650); };
  leaf.addEventListener("pointerdown",start);
  leaf.addEventListener("pointerup",stop);
  leaf.addEventListener("pointerleave",stop);
  leaf.addEventListener("pointercancel",stop);
  leaf.addEventListener("mousedown",start);
  leaf.addEventListener("mouseup",stop);
  leaf.addEventListener("mouseleave",stop);
  leaf.addEventListener("touchstart",start,{passive:false});
  leaf.addEventListener("touchend",stop);
  leaf.addEventListener("touchcancel",stop);
}
function mathGate(wrap){
  const a=6+(Math.floor(Math.random()*3)), b=6+(Math.floor(Math.random()*3)), ans=a*b;
  const opts=shuffle([ans, ans+a, ans-b], Date.now());
  wrap.innerHTML=`<div class="modal small"><button class="modal-x" aria-label="Close">${ICON.close}</button>
    <p class="kicker">Grown-ups</p><h2>What is ${a} × ${b}?</h2>
    <div class="math-row">${opts.map(n=>`<button class="btn ghost math" data-n="${n}">${n}</button>`).join("")}</div></div>`;
  $(".modal-x",wrap).addEventListener("click",()=>wrap.remove());
  $$("[data-n]",wrap).forEach(b=>b.addEventListener("click",()=>{
    if(+b.dataset.n===ans) renderParentPanel(wrap);
    else { b.classList.add("bad"); b.disabled=true; }
  }));
}
function humanSkill(skill){
  const [k,v]=skill.split(":");
  if(k==="sound") return `Letter sound “${v}”`;
  if(k==="word") return `Word: ${v}`;
  if(k==="heart") return `Heart word: ${v}`;
  if(k==="sight") return `Sight word: ${v}`;
  if(k==="sentence") return "Sentence reading";
  return skill;
}
function renderParentPanel(wrap){
  const all=overall(), sight=sightStats();
  const rows=C.levels.map((lv,i)=>{
    const s=levelStats(i);
    return `<div class="level-row ${i===state.level?"current":""}">
      <div class="level-name"><b>${i+1}. ${lv.title}</b><span>${s.seen}/${s.total} practiced</span></div>
      <div class="bar"><i style="width:${Math.round(s.accuracy*100)}%"></i></div>
      <span class="pct">${s.attempts?Math.round(s.accuracy*100)+"%":"—"}</span>
    </div>`;
  }).join("");
  const weak=weakest(6).map(x=>`<li>${humanSkill(x.it.skill)} <span>${x.s.correct}/${x.s.correct+x.s.wrong}</span></li>`).join("") || "<li>No review items yet.</li>";
  wrap.innerHTML=`<div class="modal"><button class="modal-x" aria-label="Close">${ICON.close}</button>
    <p class="kicker">Grown-ups</p><h2>Progress</h2>
    <div class="stat-grid">
      <div><b>${all.sessions}</b><span>sessions</span></div>
      <div><b>${all.seen}</b><span>items practiced</span></div>
      <div><b>${all.attempts?Math.round(all.accuracy*100)+"%":"—"}</b><span>first-try accuracy</span></div>
      <div><b>${Math.round(all.minutes)}</b><span>minutes</span></div>
    </div>
    <h3>Levels</h3><div class="levels">${rows}
      <div class="level-row"><div class="level-name"><b>Sight words</b><span>${sight.seen}/${sight.total} practiced</span></div><div class="bar"><i style="width:${Math.round(sight.accuracy*100)}%"></i></div><span class="pct">${sight.attempts?Math.round(sight.accuracy*100)+"%":"—"}</span></div>
    </div>
    <h3>Worth reviewing</h3><ul class="review-list">${weak}</ul>
    <h3>Settings</h3>
    <label class="setting"><span>Start at level</span>
      <select id="startLevel">${C.levels.map((lv,i)=>`<option value="${i}" ${i===state.level?"selected":""}>${i+1}. ${lv.title} · ${lv.grade}</option>`).join("")}</select>
    </label>
    <p class="setting-help">Choose a starting point for an advanced reader; earlier skills will be treated as known.</p>
    <label class="setting check"><input id="showSoundReference" type="checkbox" ${state.settings.showSoundReference?"checked":""}><span>Show sound reference on the home screen</span></label>
    <label class="setting"><span>Voice speed</span><input id="rate" type="range" min="0.7" max="1" step="0.05" value="${state.settings.voiceRate}"><output id="rateOut">${state.settings.voiceRate.toFixed(2)}×</output></label>
    <label class="setting check"><input id="uppercase" type="checkbox" ${state.settings.uppercase?"checked":""}><span>Show uppercase letters</span></label>
    <label class="setting check"><input id="soundOn" type="checkbox" ${state.settings.sound?"checked":""}><span>Sound effects</span></label>
    <label class="setting check"><input id="motion" type="checkbox" ${state.settings.motion?"checked":""}><span>Garden animations</span></label>
    <div class="modal-actions wrap">
      <button class="btn ghost" id="soundSheet">Sounds reference</button>
      <button class="btn ghost" id="sightSheet">Sight words</button>
      <button class="btn ghost" id="imageList">Word &amp; image list</button>
      <button class="btn ghost" id="unlock">Unlock next level</button>
      <button class="btn ghost danger" id="reset">Reset progress</button>
      <button class="btn primary" id="done">Done</button>
    </div></div>`;
  $("#soundSheet",wrap).addEventListener("click",()=>renderSoundSheet(wrap));
  $("#sightSheet",wrap).addEventListener("click",()=>renderSightSheet(wrap));
  $("#imageList",wrap).addEventListener("click",()=>window.open("docs/image-review.html","_blank"));
  $(".modal-x",wrap).addEventListener("click",()=>{wrap.remove();renderHome();});
  $("#done",wrap).addEventListener("click",()=>{wrap.remove();renderHome();});
  $("#startLevel",wrap).addEventListener("change",e=>{
    state.level=+e.target.value; state.current=null; save(); renderParentPanel(wrap);
  });
  $("#showSoundReference",wrap).addEventListener("change",e=>{
    state.settings.showSoundReference=e.target.checked; save();
  });
  $("#rate",wrap).addEventListener("input",e=>{
    state.settings.voiceRate=+e.target.value; $("#rateOut",wrap).textContent=(+e.target.value).toFixed(2)+"×"; save();
  });
  $("#rate",wrap).addEventListener("change",()=>speak("This is how I sound."));
  $("#uppercase",wrap).addEventListener("change",e=>{ state.settings.uppercase=e.target.checked; save(); });
  $("#soundOn",wrap).addEventListener("change",e=>{ state.settings.sound=e.target.checked; save(); });
  $("#motion",wrap).addEventListener("change",e=>{ state.settings.motion=e.target.checked; document.body.classList.toggle("no-motion",!state.settings.motion); save(); });
  $("#unlock",wrap).addEventListener("click",()=>{ state.level=Math.min(C.levels.length-1,state.level+1); save(); renderParentPanel(wrap); });
  $("#reset",wrap).addEventListener("click",()=>{
    wrap.innerHTML=`<div class="modal small"><button class="modal-x" aria-label="Close">${ICON.close}</button>
      <p class="kicker">Grown-ups</p><h2>Reset everything?</h2>
      <p>This clears the garden, all progress, and settings on this tablet. It cannot be undone.</p>
      <div class="modal-actions"><button class="btn ghost" id="cancel">Cancel</button><button class="btn primary danger" id="yes">Reset</button></div></div>`;
    $(".modal-x",wrap).addEventListener("click",()=>wrap.remove());
    $("#cancel",wrap).addEventListener("click",()=>renderParentPanel(wrap));
    $("#yes",wrap).addEventListener("click",()=>{ state=clone(DEFAULT_STATE); save(); wrap.remove(); renderHome(); });
  });
}

function renderSoundSheet(wrap,parentView=true){
  const sorted = keys => keys.slice().sort((a,b)=>graphemeLabel(a).localeCompare(graphemeLabel(b)));
  const groups=[
    {name:"Single letters", id:"single", keys:sorted(["a","e","i","o","u","b","c","d","f","g","h","j","k","l","m","n","p","r","s","t","v","w","x","y","z"])},
    {name:"Consonant teams", id:"consonant", keys:["sh","ch","th","th_v","ng","ck","qu","tch","ph","wh","kn","wr"]},
    {name:"Long A", id:"longA", keys:["ay","ai","a_e"]},
    {name:"Long I", id:"longI", keys:["ie","igh","i_e"]},
    {name:"Long E", id:"longE", keys:["ee","ea","e_e"]},
    {name:"Long O", id:"longO", keys:["oa","oe","ow_long","o_e"]},
    {name:"Long U", id:"longU", keys:["ue","ew","u_e"]},
    {name:"Other sounds", id:"other", keys:["oo","oo_short","ow","oi","oy","aw","au","ar","er","ir","ur","or","air","ear"]}
  ];
  const show = state.settings.referenceGroups || { single:true, consonant:true, longA:true, longI:true, longE:true, longO:true, longU:true, other:true };
  state.settings.referenceGroups = show;
  const groupControls=parentView?`<div class="sheet-toggles">
      ${groups.map(g=>`<label class="chip-toggle"><input type="checkbox" data-group="${g.id}" ${show[g.id]?"checked":""}><span>${g.name}</span></label>`).join("")}
    </div>`:"";
  const seen=new Set();
  const valid=k=>PH[k] && !seen.has(k) && (seen.add(k), true);
  const html=groups.filter(g=>show[g.id]).map(g=>{
    const keys=g.keys.filter(valid);
    if(!keys.length) return "";
    return `<h3 id="group-${g.id}">${g.name}</h3><div class="sound-grid">${keys.map(k=>`<div class="sound-card" data-ph="${k}">
        <span class="sound-cell-label">${graphemeLabel(k)}</span>
        <span class="sound-cell-phoneme">/${phonemeName(k)}/</span>
        <span class="sound-cell-example">as in ${SOUND_EXAMPLES[k]||""}</span>
        <div class="sound-cell-actions">
          <button class="mini-play" data-play="sound" aria-label="Hear the sound">${ICON.sound}<span>Sound</span></button>
          <button class="mini-play word" data-play="word" aria-label="Hear the example word">${ICON.word}<span>Word</span></button>
        </div>
      </div>`).join("")}</div>`;
  }).join("");
  wrap.innerHTML=`<div class="modal"><button class="modal-x" aria-label="Close">${ICON.close}</button>
    <p class="kicker">${parentView?"Grown-ups":"Reference"}</p><h2>Sounds reference</h2>
    <p class="muted">Each card plays the sound or its example word separately. “ng” is shown in context as in <em>sing</em>, not as a standalone letter. This sheet is for testing, not a lesson.</p>
    ${groupControls}
    ${html}
    <div class="modal-actions"><button class="btn primary" id="backPanel">Back</button></div></div>`;
  $(".modal-x",wrap).addEventListener("click",()=>{wrap.remove();renderHome();});
  $("#backPanel",wrap).addEventListener("click",()=>{if(parentView)renderParentPanel(wrap);else{wrap.remove();renderHome();}});
  if(parentView) $$ ("[data-group]",wrap).forEach(cb=>cb.addEventListener("change",()=>{
    state.settings.referenceGroups[cb.dataset.group]=cb.checked; save(); renderSoundSheet(wrap,true);
  }));
  $$(".sound-card",wrap).forEach(card=>{
    card.querySelector('[data-play="sound"]').addEventListener("click",()=>phoneme(card.dataset.ph));
    card.querySelector('[data-play="word"]').addEventListener("click",()=>{
      const ex=SOUND_EXAMPLES[card.dataset.ph]; if(ex) speak(ex);
    });
  });
}
function renderSightSheet(wrap,parentView=true){
  const words=(C.sightWords||[]).slice();
  const st=id=>itemState(id);
  const rows=words.map((w,i)=>{
    const s=st("SIGHT-"+w);
    return `<div class="sight-card" data-word="${w}">
      <span class="sight-word">${w}</span>
      <span class="sight-meta">${s.seen?`${s.correct}/${s.correct+s.wrong} correct`:"not practiced yet"}</span>
      <div class="sight-actions">
        <button class="mini-play" data-play="sound">${ICON.sound}<span>Hear it</span></button>
        <button class="mini-play word" data-play="word">${ICON.word}<span>In a phrase</span></button>
      </div>
    </div>`;
  }).join("");
  wrap.innerHTML=`<div class="modal"><button class="modal-x" aria-label="Close">${ICON.close}</button>
    <p class="kicker">${parentView?"Grown-ups":"Sight words"}</p><h2>Sight words</h2>
    <p class="muted">Tap to hear a word, or hear it used in a short phrase. These are the Fry words from the provided Grade 1 practice list.</p>
    <div class="sheet-toggles"><label class="chip-toggle"><input id="sightSearch" type="search" placeholder="Search words"><span>Search</span></label></div>
    <div class="sound-grid" id="sightGrid">${rows}</div>
    <div class="modal-actions"><button class="btn primary" id="startSightPractice">Practice sight words</button>${parentView?`<button class="btn ghost" id="backPanel">Back</button>`:""}</div></div>`;
  const bind=()=>{
    $$(".sight-card",wrap).forEach(card=>{
      card.querySelector('[data-play="sound"]').addEventListener("click",()=>speak(card.dataset.word));
      card.querySelector('[data-play="word"]').addEventListener("click",()=>speak(SIGHT_PHRASES[card.dataset.word]||card.dataset.word));
    });
  };
  bind();
  const search=$("#sightSearch",wrap);
  search.addEventListener("input",()=>{
    const q=search.value.trim().toLowerCase();
    $$(".sight-card",wrap).forEach(card=>card.style.display=card.dataset.word.toLowerCase().includes(q)?"":"none");
  });
  $(".modal-x",wrap).addEventListener("click",()=>{wrap.remove();renderHome();});
  $("#startSightPractice",wrap).addEventListener("click",()=>{wrap.remove();startSightSession();});
  const back=$("#backPanel",wrap); if(back) back.addEventListener("click",()=>{wrap.remove();renderParentPanel(wrap);});
}
const SIGHT_PHRASES={
  the:"the cat",of:"a cup of milk",and:"and it is",a:"a bug",to:"to the park",in:"in the box",is:"the sun is hot",you:"you can do it",
  that:"that is a hat",it:"it is big",he:"he can run",was:"the dog was wet",for:"for the hen",on:"on the mat",are:"the bugs are wet",
  as:"as red as fire",with:"with my hat",his:"his hat",they:"they can run",I:"I can run",at:"at the park",be:"be kind",this:"this is a map",
  have:"I have a map",from:"from the bus",or:"red or blue",one:"one sun",had:"the hen had a nest",by:"by the tree",words:"kind words",
  but:"but it is wet",not:"not now",what:"what is that",all:"all the bugs",were:"the bugs were wet",we:"we can sit",when:"when can we go",
  your:"your red hat",can:"I can do it",said:"the man said",there:"the cat is there",use:"use the map",an:"an apple",each:"each bug",
  which:"which one",she:"she has a hat",do:"I can do it",how:"how can I help",their:"their dog",if:"if it is wet",word:"the big word"
};
/* ---------- keyboard ---------- */
document.addEventListener("keydown", e=>{
  if(!session) return;
  if(e.key===" " || e.key==="r"){ e.preventDefault(); replayCurrent(); return; }
  const n=parseInt(e.key,10);
  if(n>=1 && n<=3){
    const choices=$$("#stage .letter-tile, #stage .picture-card, #stage .answer-card").filter(b=>!b.disabled);
    if(choices[n-1]) choices[n-1].click();
  }
});
document.addEventListener("visibilitychange", ()=>{ if(document.hidden) stopSpeech(); });

/* ---------- boot ---------- */
if(!state.settings.motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.body.classList.add("no-motion");
renderHome();
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}
})();
