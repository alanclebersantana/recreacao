/* ===== Recreação · Congregação Sul de Marialva — código comum ===== */
const OPC=['#d1453b','#2e6db4','#e09b1a','#2f8a4c'];
const SHP=['▲','◆','●','■'];
const COLORS=['#C1561A','#2e6db4','#2f8a4c','#d1453b','#6b3fa0','#0f8a8a','#b8860b'];
const ROOT='recreacao';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const arr=v=>Array.isArray(v)?v.filter(x=>x!=null):(v&&typeof v==='object'?Object.values(v):[]);
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

let db=null,offset=0;
const now=()=>Date.now()+offset;
const ref=p=>db.ref(p?ROOT+'/'+p:ROOT);

async function initFirebase(){
  const c=window.FIREBASE_CONFIG;
  if(!c||!c.apiKey||/COLE/.test(c.apiKey)||!c.databaseURL||/SEU-PROJETO/.test(c.databaseURL)){
    $('#app').innerHTML=`<div class="card center"><div style="font-size:52px">⚙️</div><div class="big">Falta configurar o Firebase</div><p class="muted" style="font-size:17px">Preencha o arquivo <b>config.js</b> com os dados do seu projeto (veja o LEIA-ME).</p></div>`;
    throw new Error('config');
  }
  firebase.initializeApp(c);
  db=firebase.database();
  db.ref('.info/serverTimeOffset').on('value',s=>offset=s.val()||0);
  await firebase.auth().signInAnonymously();
}
function showError(e){
  if(e&&e.message==='config')return;
  console.error(e);
  $('#app').innerHTML=`<div class="card center"><div style="font-size:52px">⚠️</div><div class="big">Não foi possível conectar</div><p class="muted">${esc(e&&e.message||e)}</p><button class="btn" onclick="location.reload()">Tentar de novo</button></div>`;
}

/* ---------- conteúdo ---------- */
function N(t,o,c,tempo=20){return{texto:t,ops:o,certa:c,tempo}}
const DEFAULT_CONTENT={
  sessoes:[
    {tema:'Personagens do Antigo Testamento',cor:'#C1561A',perguntas:[
      N('Quem construiu a arca?',['Moisés','Noé','Abraão','Davi'],1),
      N('Quem derrotou o gigante Golias?',['Saul','Jônatas','Davi','Sansão'],2),
      N('Qual profeta foi engolido por um grande peixe?',['Jonas','Elias','Daniel','Isaías'],0),
      N('Quem foi lançado na cova dos leões?',['José','Daniel','Jeremias','Ezequiel'],1)]},
    {tema:'Livros da Bíblia',cor:'#2e6db4',perguntas:[
      N('Qual é o primeiro livro da Bíblia?',['Êxodo','Gênesis','Mateus','Salmos'],1),
      N('Qual livro tem mais capítulos?',['Isaías','Salmos','Jeremias','Gênesis'],1),
      N('Qual é o último livro da Bíblia?',['Judas','Apocalipse','Malaquias','Atos'],1),
      N('Quantos livros têm as Escrituras Gregas Cristãs?',['27','39','66','21'],0)]}
  ],
  livro:{tema:'Livro Aberto',cor:'#6b3fa0',perguntas:[
    {texto:'Qual é o seu personagem bíblico favorito e por quê?'},
    {texto:'Qual texto bíblico mais te encoraja?'},
    {texto:'Que relato da Bíblia você gostaria de ter visto acontecer?'},
    {texto:'O que você perguntaria a um personagem bíblico na ressurreição?'}]}
};
function norm(j){
  j=j||{};
  const l=j.livro||{};
  return{
    sessoes:arr(j.sessoes).map(s=>({tema:s.tema||'',cor:s.cor||COLORS[0],
      perguntas:arr(s.perguntas).map(q=>{const o=arr(q.ops);while(o.length<4)o.push('');
        return{texto:q.texto||'',ops:o.slice(0,4),certa:+q.certa||0,tempo:+q.tempo||20}})})),
    livro:{tema:l.tema||'Livro Aberto',cor:l.cor||'#6b3fa0',perguntas:arr(l.perguntas).map(q=>({texto:q.texto||''}))}
  };
}
function buildSeq(j){
  const seq=[],pool=j.livro.perguntas;let n=0,li=0;
  j.sessoes.forEach((s,si)=>{if(!s.perguntas.length)return;seq.push({t:'tema',si});
    s.perguntas.forEach((q,qi)=>{seq.push({t:'q',si,qi});n++;
      if(n%4===0&&pool.length)seq.push({t:'livro',li:(li++)%pool.length})})});
  seq.push({t:'fim'});return seq;
}
function qFrom(G,it){
  if(!it)return null;
  if(it.t==='livro')return G.livro.perguntas[it.li]||null;
  if(it.t==='q')return (G.sessoes[it.si]||{perguntas:[]}).perguntas[it.qi]||null;
  return null;
}
function nextLabelFor(seq,step){
  const t=(seq[step+1]||{}).t;
  return {q:'Próxima pergunta ▶',tema:'Próxima sessão ▶',livro:'📖 Livro Aberto ▶',fim:'🏆 Ver ranking final'}[t]||'Próxima ▶';
}

/* ---------- cronômetro ---------- */
const CIRC=2*Math.PI*40;
function timeLeft(sala){return Math.max(0,Math.ceil(((sala.endsAt||0)-now())/1000))}
function timerHTML(left,total){
  return `<div class="timer ${left<=5?'urg':''}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="tbg"/><circle cx="50" cy="50" r="40" class="tfg" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC*(1-left/(total||1))}"/></svg><span class="tnum">${left}</span></div>`;
}
function tickTimers(left,total){
  document.querySelectorAll('.timer').forEach(el=>{el.classList.toggle('urg',left<=5);
    el.querySelector('.tnum').textContent=left;
    el.querySelector('.tfg').style.strokeDashoffset=CIRC*(1-left/(total||1))});
}

/* ---------- peças de tela ---------- */
function metaBar(G,it){const s=G.sessoes[it.si];
  return `<div class="meta"><span class="pill">📖 ${esc(s.tema)}</span><span class="pill">${it.qi+1}/${s.perguntas.length}</span></div>`}
function qBoxHTML(q,timer){return `<div class="qbox">${timer||''}<div class="qtext">${esc(q.texto)}</div></div>`}
function optsHTML(q,o={}){
  return `<div class="opts">${q.ops.map((t,i)=>{let c='opt';
    if(o.mode==='part'&&o.my!=null)c+=o.my===i?' pick':' dim';
    if(o.mode==='result'){c+=i===q.certa?' ok':' dim';if(o.my===i)c+=' pick'}
    const cnt=o.showCounts?`<span class="cnt">${(o.counts||[])[i]||0} 👤</span>`:'';
    const click=o.mode==='part'&&o.my==null?`onclick="answer(${i})"`:'';
    return `<button class="${c}" style="background:${OPC[i]}" ${click}><span class="sh">${SHP[i]}</span><span>${esc(t)}</span>${cnt}</button>`}).join('')}</div>`}
function themeHTML(G,it){const s=G.sessoes[it.si],tot=G.sessoes.filter(x=>x.perguntas.length).length,num=G.sessoes.slice(0,it.si+1).filter(x=>x.perguntas.length).length;
  return `<div class="theme" style="background:${s.cor}"><div class="e">📖</div><div class="n">SESSÃO ${num} DE ${tot}</div><div class="t">${esc(s.tema)}</div><div class="s">${s.perguntas.length} perguntas · múltipla escolha</div></div>`}
function livroCardHTML(G){return `<div class="theme" style="background:${G.livro.cor}"><div class="e">📖</div><div class="t">${esc(G.livro.tema)}</div><div class="s">Pergunta pessoal · resposta em voz alta<br>não vale pontos</div></div>`}
function livroBannerHTML(G){return `<div class="banner" style="background:${G.livro.cor}">📖 ${esc(G.livro.tema)} · responda em voz alta</div>`}
function livroQHTML(q){return `<div class="qbox livro"><div style="font-size:44px">💬</div><div class="qtext">${esc(q.texto)}</div></div>`}
function namesHTML(called,myPid,sm){
  return `<div class="names ${sm?'sm':''}">${arr(called).map((c,i)=>`<div class="nm ${c.pid===myPid?'meN':''}" style="background:${OPC[i%4]};animation-delay:${i*.25}s">${esc(c.nome)}</div>`).join('')}</div>`}
function palmasHTML(called){return `<div class="palmas"><div class="claps"><span>👏</span><span>👏</span><span>👏</span></div><div class="pt">Salva de palmas!</div><div class="ps">${arr(called).map(c=>esc(c.nome)).join(' · ')}</div></div>`}
function playersList(jog){return Object.entries(jog||{}).filter(([,p])=>p&&p.nome).map(([id,p])=>({id,nome:p.nome,pts:+p.pts||0,online:p.online!==false}))}
function ranked(jog){return playersList(jog).sort((a,b)=>b.pts-a.pts||a.nome.localeCompare(b.nome))}
function rankingHTML(jog,myPid){const r=ranked(jog),p=[r[1],r[0],r[2]],h=[110,150,80],m=['🥈','🥇','🥉'],col=['#d9d4cc','#f2c14e','#e3a06b'];
  return `<div class="rtitle">🏆 Ranking final</div>
  <div class="podium">${p.map((x,i)=>x?`<div class="pod"><div class="who">${m[i]}<br>${esc(x.nome)}</div><div class="bar" style="height:${h[i]}px;background:${col[i]}">${x.pts}</div></div>`:'').join('')}</div>
  <div class="card">${r.map((x,i)=>`<div class="rk ${x.id===myPid?'me':''}"><span>${i+1}º ${esc(x.nome)}</span><span>${x.pts} pts</span></div>`).join('')||'<div class="muted center">Ninguém pontuou</div>'}</div>`}

/* ---------- som de palmas ---------- */
let AC=null;
function unlockAudio(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
document.addEventListener('pointerdown',unlockAudio);
function clapSound(){unlockAudio();if(!AC)return;try{
  for(let i=0;i<90;i++){const t=AC.currentTime+Math.random()*2.8,len=Math.floor(AC.sampleRate*.05),b=AC.createBuffer(1,len,AC.sampleRate),d=b.getChannelData(0);
    for(let j=0;j<len;j++)d[j]=(Math.random()*2-1)*Math.pow(1-j/len,3);
    const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1000+Math.random()*1500;
    const g=AC.createGain();g.gain.value=.25+Math.random()*.35;s.connect(f).connect(g).connect(AC.destination);s.start(t)}}catch(e){}}
