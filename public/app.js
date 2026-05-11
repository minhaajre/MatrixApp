// ─────────────────────────────────────────────
//  THEME TOGGLE
// ─────────────────────────────────────────────
(function(){
  const saved=localStorage.getItem('matrix-theme');
  if(saved)document.documentElement.setAttribute('data-theme',saved);
})();

function toggleTheme(){
  const html=document.documentElement;
  const next=html.getAttribute('data-theme')==='dark'?'light':'dark';
  html.setAttribute('data-theme',next);
  localStorage.setItem('matrix-theme',next);
}

// ─────────────────────────────────────────────
//  NAV LINKS VISIBILITY
// ─────────────────────────────────────────────
function showNavLinks(){document.getElementById('nav-links').classList.add('visible')}
function hideNavLinks(){document.getElementById('nav-links').classList.remove('visible')}

// ─────────────────────────────────────────────
//  DROPDOWN POPULATION
// ─────────────────────────────────────────────
(function(){
  const dayS=document.getElementById('sel-day');
  const yearS=document.getElementById('sel-year');
  for(let i=1;i<=31;i++){const o=document.createElement('option');o.value=i;o.textContent=i<10?'0'+i:i;dayS.appendChild(o);}
  const curY=new Date().getFullYear();
  for(let y=curY;y>=1924;y--){const o=document.createElement('option');o.value=y;o.textContent=y;yearS.appendChild(o);}
  document.getElementById('sel-month').addEventListener('change',updateDays);
  document.getElementById('sel-year').addEventListener('change',updateDays);
})();

function updateDays(){
  const m=+document.getElementById('sel-month').value;
  const y=+document.getElementById('sel-year').value;
  const dayS=document.getElementById('sel-day');
  const cur=+dayS.value;
  const max=m&&y?new Date(y,m,0).getDate():31;
  dayS.innerHTML='<option value="">— Day —</option>';
  for(let i=1;i<=max;i++){const o=document.createElement('option');o.value=i;o.textContent=i<10?'0'+i:i;if(i===cur)o.selected=true;dayS.appendChild(o);}
}

// ─────────────────────────────────────────────
//  GO TO TOP
// ─────────────────────────────────────────────
window.addEventListener('scroll',()=>{
  const btn=document.getElementById('go-top');
  btn.style.display=window.scrollY>400?'flex':'none';
});

// ─────────────────────────────────────────────
//  UI CONTROLS
// ─────────────────────────────────────────────
function toggleSection(id){
  document.getElementById(id).classList.toggle('open');
}

function resetAll(){
  document.getElementById('results').style.display='none';
  document.getElementById('footer').style.display='none';
  hideNavLinks();
  document.getElementById('sel-day').value='';
  document.getElementById('sel-month').value='';
  document.getElementById('sel-year').value='';
  document.getElementById('bazi-time').value='';
  document.getElementById('num-body').innerHTML='';
  document.getElementById('bazi-body').innerHTML='';
  document.getElementById('synth-body').innerHTML='';
  window.scrollTo({top:0,behavior:'smooth'});
}

// ─────────────────────────────────────────────
//  NUMEROLOGY CALCULATIONS
// ─────────────────────────────────────────────
function reduce(n,keep=[11,22,33]){
  if(keep.includes(n))return n;
  while(n>9){let s=0;while(n>0){s+=n%10;n=Math.floor(n/10)}n=s;if(keep.includes(n))break}return n;
}

function digSum(n){let s=0;String(n).split('').forEach(c=>s+=+c);return s;}

function calcLP(d,m,y){
  let dd=reduce(digSum(d)),mm=reduce(digSum(m));
  let yy=digSum(y);while(yy>9&&![11,22,33].includes(yy))yy=digSum(yy);
  let tot=dd+mm+yy;while(tot>9&&![11,22,33].includes(tot))tot=digSum(tot);
  return{lp:tot,dd,mm:mm,yy};
}

function calcPinnacles(d,m,y,lp){
  const s=36-lp;
  const p1=reduce(reduce(d)+reduce(m));
  const yr=reduce(digSum(y));
  const p2=reduce(reduce(d)+yr);
  const p3=reduce(p1+p2);
  const p4=reduce(reduce(m)+yr);
  const now=new Date();
  let age=now.getFullYear()-y;if(now<new Date(now.getFullYear(),m-1,d))age--;
  const cur=age<=s?1:age<=s+9?2:age<=s+18?3:4;
  return[
    {num:p1,s:0,e:s,current:cur===1},
    {num:p2,s:s+1,e:s+9,current:cur===2},
    {num:p3,s:s+10,e:s+18,current:cur===3},
    {num:p4,s:s+19,e:null,current:cur===4},
  ];
}

function buildLoShu(d,m,y){
  const cnt={};for(let i=1;i<=9;i++)cnt[i]=0;
  const all=String(d).padStart(2,'0')+String(m).padStart(2,'0')+String(y);
  [...all].forEach(c=>{const n=+c;if(n>0&&cnt[n]!==undefined)cnt[n]++;});
  return cnt;
}

function calcPY(d,m,curY){
  let s=reduce(m)+reduce(d)+digSum(curY);
  while(s>9&&![11,22,33].includes(s))s=digSum(s);
  return s;
}

const MNTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

function ord(n){const s=["th","st","nd","rd"];const v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}

// ─────────────────────────────────────────────
//  BAZI CALCULATIONS
// ─────────────────────────────────────────────
function toJDN(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}

function getSolarM(y,m,d){
  const sm=[[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,8],[9,8],[10,8],[11,7],[12,7],[1,6]];
  for(let i=11;i>=0;i--){const[mm,dd]=sm[i];if(m>mm||(m===mm&&d>=dd))return i;}
  return 11;
}

function getYP(y,m,d){let yr=y;if(m<2||(m===2&&d<4))yr--;const diff=yr-1984;return{stem:HS[((diff%10)+10)%10],branch:EB[((diff%12)+12)%12]};}

function getMP(y,m,d,ysi){const sm=getSolarM(y,m,d);const grp=Math.floor(ysi%5);const startStem=[2,4,6,8,0][grp];return{stem:HS[(startStem+sm)%10],branch:EB[(sm+2)%12]};}

function getDP(y,m,d){const jdn=toJDN(y,m,d),ref=toJDN(2000,1,1),diff=jdn-ref;return{stem:HS[((4+diff)%10+10)%10],branch:EB[((6+diff)%12+12)%12]};}

function getHP(h,min,dsi){const tot=h*60+min;let bi;if(tot>=23*60||tot<60)bi=0;else bi=Math.floor((tot-60)/120)+1;const starts=[0,2,4,6,8];return{stem:HS[(starts[dsi%5]+bi)%10],branch:EB[bi]};}

function getTG(dm,ts){
  if(!dm||!ts)return"Self";
  if(ts.el===dm.el)return dm.pol===ts.pol?"Friend":"Rob Wealth";
  if(ts.el===FE[dm.el].prod)return dm.pol===ts.pol?"Eating God":"Hurting Officer";
  if(ts.el===FE[dm.el].ctrl)return dm.pol===ts.pol?"Indirect Wealth":"Direct Wealth";
  if(ts.el===FE[dm.el].ctrlBy)return dm.pol===ts.pol?"Seven Killings":"Direct Officer";
  if(ts.el===FE[dm.el].prodBy)return dm.pol===ts.pol?"Indirect Resource":"Direct Resource";
  return"Unknown";
}

function getTGch(dm,ch){const ts=HS.find(s=>s.ch===ch);return ts?getTG(dm,ts):"?";}

function calcStrength(pillars,dm){
  let sup=0,att=0,tot=0;
  const weights=[1,1,1,1];const bw=[1,3,2,1];
  pillars.forEach((p,i)=>{
    if(!p)return;
    function add(el,w){if(!el)return;if(el===dm.el||el===FE[dm.el].prodBy)sup+=w;else att+=w;tot+=w;}
    add(p.stem.el,weights[i]);
    (HIDDEN[p.branch.ch]||[]).forEach((h,hi)=>add(h.el,hi===0?bw[i]:Math.floor(bw[i]/2)));
  });
  const ratio=tot>0?Math.round(sup/tot*100):50;
  const cls=ratio>=70?"Very Strong":ratio>=55?"Strong":ratio>=45?"Balanced":ratio>=30?"Weak":"Very Weak";
  return{ratio,cls};
}

function countEl(pillars){
  const c={Wood:0,Fire:0,Earth:0,Metal:0,Water:0};
  pillars.forEach(p=>{
    if(!p)return;
    if(c[p.stem.el]!==undefined)c[p.stem.el]++;
    (HIDDEN[p.branch.ch]||[]).forEach((h,i)=>{if(c[h.el]!==undefined)c[h.el]+=(i===0?1:0.5);});
  });
  return c;
}

function calcLP_bazi(gender,ysi,mp,y,m,d){
  const isYang=HS[ysi].pol==="Yang";
  const fwd=(isYang&&gender==="male")||(!isYang&&gender==="female");
  let si=mp.stem.i,bi=mp.branch.i;const sa=m<7?4:8;const ps=[];
  for(let i=0;i<8;i++){
    if(fwd){si=(si+1)%10;bi=(bi+1)%12;}else{si=(si-1+10)%10;bi=(bi-1+12)%12;}
    ps.push({stem:HS[si],branch:EB[bi],startAge:sa+i*10,endAge:sa+i*10+9});
  }
  return ps;
}

function getAP(year){return getYP(year,3,15);}

const elClass={Wood:"el-wood",Fire:"el-fire",Earth:"el-earth",Metal:"el-metal",Water:"el-water"};
const elFill={Wood:"background:#2A6B3C",Fire:"background:#B83030",Earth:"background:#8B6214",Metal:"background:#4A6580",Water:"background:#1D5FAA"};

// ─────────────────────────────────────────────
//  MAIN GENERATE
// ─────────────────────────────────────────────
function generateAll(){
  const d=+document.getElementById('sel-day').value;
  const m=+document.getElementById('sel-month').value;
  const y=+document.getElementById('sel-year').value;
  const errEl=document.getElementById('main-err');
  if(!d||!m||!y){errEl.style.display='block';errEl.textContent='Please select a complete date of birth.';return;}
  if(y>new Date().getFullYear()){errEl.style.display='block';errEl.textContent='Year cannot be in the future.';return;}
  errEl.style.display='none';
  // Compute shared data for cross-traditional synthesis
  const {lp:synthLP}=calcLP(d,m,y);
  const synthLPD=LP_DATA[synthLP]||LP_DATA[9];
  const synthDP=getDP(y,m,d);
  const synthDM=synthDP.stem;
  const synthDMP=DMP[synthDM.ch]||DMP["壬"];
  document.getElementById('num-body').innerHTML=buildNumerology(d,m,y);
  document.getElementById('bazi-body').innerHTML=buildBazi(d,m,y);
  document.getElementById('synth-body').innerHTML=buildCrossTraditionalSynthesis(synthLP,synthDM,synthLPD,synthDMP);
  document.getElementById('results').style.display='block';
  document.getElementById('footer').style.display='block';
  showNavLinks();
  setTimeout(()=>{
    document.getElementById('results').querySelectorAll('.strength-fill,.eb-fill').forEach(el=>{
      const w=el.dataset.w;if(w)el.style.width=w;
    });
    document.getElementById('results').scrollIntoView({behavior:'smooth',block:'start'});
  },80);
}

// ─────────────────────────────────────────────
//  NUMEROLOGY RENDERER
// ─────────────────────────────────────────────
function buildNumerology(d,m,y){
  const{lp,dd,mm,yy}=calcLP(d,m,y);
  const bdRoot=reduce(d);const yearR=reduce(digSum(y));
  const lpD=LP_DATA[lp]||LP_DATA[9];
  const mD=MONTH_DATA[m];
  const yD=YEAR_DATA[yearR]||YEAR_DATA[9];
  const pyN=calcPY(d,m,new Date().getFullYear());
  const pyD=PY_DATA[pyN]||PY_DATA[1];
  const pins=calcPinnacles(d,m,y,lp);
  const loShu=buildLoShu(d,m,y);

  return`
<p class="report-eyebrow">Numerology Reading</p>
<div class="report-rule"></div>
<div class="report-title">Your Numerological Configuration</div>
<div class="report-dob">${MNTHS[m-1]} ${d}, ${y}</div>

<!-- LIFE PATH -->
<div class="block">
  <div class="block-header">
    <div class="block-num large">${lp}</div>
    <div class="block-meta">
      <div class="block-label">Life Path Number</div>
      <div class="block-title">${lpD.arch}</div>
      <div class="block-arch">The primary structural number in this configuration</div>
    </div>
  </div>
  <p class="prose">${lpD.sum}</p>
  <div class="two-col">
    <div>
      <p class="sub-heading">Natural Strengths</p>
      <div class="tag-row">${lpD.strengths.map(s=>`<span class="tag">${s}</span>`).join('')}</div>
    </div>
    <div>
      <p class="sub-heading">Core Challenges</p>
      <div class="tag-row">${lpD.challenges.map(c=>`<span class="tag">${c}</span>`).join('')}</div>
    </div>
  </div>
  <div class="callout" style="margin-top:14px">
    <div class="callout-label">Your Life Purpose</div>
    <p><strong>${lpD.purpose}</strong></p>
  </div>
  <p class="sub-heading">Famous Life Path ${lp}s</p>
  <div class="tag-row">${lpD.famous.map(f=>`<span class="tag">${f}</span>`).join('')}</div>
  <div class="callout neutral" style="margin-top:14px">
    <div class="callout-label">Calculation</div>
    <p>Day ${d}→${dd} + Month ${m}→${mm} + Year ${y}→${yy} = ${dd+mm+yy} → <strong>Life Path ${lp}</strong></p>
  </div>
</div>

<!-- BIRTH DAY -->
<div class="block">
  <div class="block-header">
    <div class="block-num large">${d}</div>
    <div class="block-meta">
      <div class="block-label">Birth Day Number</div>
      <div class="block-title">Born on the ${ord(d)}${bdRoot!==d?` · Root ${bdRoot}`:''}</div>
      <div class="block-arch">Your innate talent signature</div>
    </div>
  </div>
  <div class="callout">
    <div class="callout-label">Natural Talent</div>
    <p>${getBDTalent(d)}</p>
  </div>
  <p class="sub-heading">Aligned Career Paths</p>
  <div class="tag-row">${getBDCareers(d).map(c=>`<span class="tag">${c}</span>`).join('')}</div>
</div>

<!-- BIRTH MONTH -->
<div class="block">
  <div class="block-header">
    <div class="block-num large" style="font-size:1rem">${MNTHS[m-1].slice(0,3)}</div>
    <div class="block-meta">
      <div class="block-label">Birth Month</div>
      <div class="block-title">${mD.name} · Month ${m}</div>
      <div class="block-arch">Emotional flavour and life theme</div>
    </div>
  </div>
  <p class="prose">${mD.theme}</p>
  <div class="callout">
    <div class="callout-label">How ${mD.name} flavours your Life Path ${lp}</div>
    <p>${mD.flavor}</p>
  </div>
  <div class="tag-row">
    <span class="tag">Season: ${getSeason(m)}</span>
    <span class="tag">Element: ${getSeasonEl(m)}</span>
    <span class="tag">Vibration: ${m}</span>
  </div>
</div>

<!-- BIRTH YEAR -->
<div class="block">
  <div class="block-header">
    <div class="block-num large">${yearR}</div>
    <div class="block-meta">
      <div class="block-label">Birth Year</div>
      <div class="block-title">${y} → ${yearR}</div>
      <div class="block-arch">Generational cycle and natal orientation</div>
    </div>
  </div>
  <p class="prose">${yD.theme}</p>
  <div class="callout">
    <div class="callout-label">How ${y} shapes your Life Path expression</div>
    <p>${yD.shape}</p>
  </div>
</div>

<!-- LO SHU -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">⊞</div>
    <div class="block-meta">
      <div class="block-label">Lo Shu Grid 洛書</div>
      <div class="block-title">The Magic Square of Your Birth</div>
      <div class="block-arch">Classical Chinese natal grid</div>
    </div>
  </div>
  <p class="prose" style="margin-bottom:16px">The Lo Shu Grid places each digit of your birth date into a 3×3 magic square. The distribution of numbers — abundant, balanced, or absent — reveals patterns of natural strength, life lessons, and areas for conscious development.</p>
  ${buildLoShuHTML(loShu)}
</div>

<!-- TIMING GATE (numerology) -->
<div class="timing-gate">
  <div class="timing-gate-label">Timing Layer</div>
  <p>Cycle activation, decade rulers, and annual configurations are available through the advisory engagement.</p>
</div>

<!-- SYNTHESIS -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">✦</div>
    <div class="block-meta">
      <div class="block-label">Synthesis</div>
      <div class="block-title">Your Numerological Blueprint</div>
    </div>
  </div>
  <div class="synthesis-box">
    <p class="prose">${numSynthesis(lp,d,m,y,lpD)}</p>
    <div class="soul-line">"${lpD.purpose}"</div>
    <div class="verse">${numVerse(lp)}</div>
  </div>
</div>`;
}

function buildLoShuHTML(g){
  const pos=[[4,9,2],[3,5,7],[8,1,6]];
  const presentArrows=[],absentArrows=[];
  Object.entries(ARROWS).forEach(([n,a])=>{
    if(a.nums.every(x=>g[x]>0))presentArrows.push(n);else absentArrows.push(n);
  });
  return`
  <div class="loshu-outer">
    <div>
      <p class="sub-heading">Your Grid</p>
      <div class="loshu-grid">
        ${pos.flat().map(p=>{
          const cnt=g[p]||0;
          const dots=cnt===0?'·':cnt===1?'●':cnt===2?'● ●':cnt>=3?'●●●':'●';
          const cls=cnt===0?'empty':cnt>=3?'strong':'filled';
          return`<div class="lc ${cls}" title="Number ${p}: appears ${cnt}×">
            <span class="lc-pos">${p}</span>
            <span class="lc-dots">${dots}</span>
            <span class="lc-n">${cnt>0?cnt+'×':''}</span>
          </div>`;
        }).join('')}
      </div>
      <p style="font-size:.75rem;color:var(--text-3);margin-top:8px;font-family:'Cormorant Garamond',Georgia,serif;letter-spacing:.06em">● present &nbsp; · absent &nbsp; strong = ●●●</p>
    </div>
    <div style="flex:1">
      <p class="sub-heading">Planes of Expression</p>
      <table class="plane-table">
        <thead><tr><th>Plane</th><th>Numbers</th><th>Status</th><th>Meaning</th></tr></thead>
        <tbody>${buildPlanes(g)}</tbody>
      </table>
    </div>
  </div>
  <div style="margin-top:20px">
    <p class="sub-heading">Arrows of Pythagoras</p>
    <div class="arrows-grid">
      ${[...presentArrows,...absentArrows].map(n=>{
        const a=ARROWS[n];const pr=presentArrows.includes(n);
        return`<div class="arrow-card">
          <div class="arrow-name">${pr?'✓ ':''} ${a.label}</div>
          <div class="arrow-nums">${a.nums.join(' – ')}</div>
          <div class="arrow-desc">${pr?a.desc_p:a.desc_a}</div>
        </div>`;
      }).join('')}
    </div>
  </div>
  <div style="margin-top:20px">
    <p class="sub-heading">Cell-by-Cell Meanings</p>
    ${Object.entries(g).map(([pos,cnt])=>{
      const c=LOSHU_MEANINGS[pos];if(!c)return'';
      const st=cnt===0?'absent':cnt===1?'once':cnt===2?'twice':'triple';
      const label=cnt===0?'Absent — Key Lesson':`Appears ${cnt}× — ${cnt===1?'Active':cnt===2?'Amplified':'Dominant'}`;
      const cls=cnt===0?'neutral':'';
      return`<div class="callout ${cls}" style="margin-bottom:8px">
        <div class="callout-label">Position ${pos} · ${label}</div>
        <p>${c[st]}</p>
      </div>`;
    }).join('')}
  </div>`;
}

function buildPlanes(g){
  const planes=[
    {n:"Thought",nums:[4,9,2],dir:"Top row"},
    {n:"Will",nums:[3,5,7],dir:"Mid row"},
    {n:"Activity",nums:[8,1,6],dir:"Bot row"},
    {n:"Mental",nums:[4,3,8],dir:"Left col"},
    {n:"Soul",nums:[9,5,1],dir:"Centre col"},
    {n:"Physical",nums:[2,7,6],dir:"Right col"},
  ];
  const m={
    Thought:{complete:"Strong thinking, memory, and planning.",partial:"Some analytical ability; structure helps.",missing:"Mental organisation is an area to develop."},
    Will:{complete:"Exceptional willpower and resilience.",partial:"Determination is present but uneven.",missing:"Developing sustained willpower is a key life work."},
    Activity:{complete:"Natural doer — translates vision to results.",partial:"Practical action capacity is growing.",missing:"Bridging vision and consistent action is a key focus."},
    Mental:{complete:"Strong analytical and systematic thinking.",partial:"Analytical capacity developing.",missing:"Building structured thinking is meaningful."},
    Soul:{complete:"Strong inner identity and spiritual awareness.",partial:"Inner identity and awareness developing.",missing:"Building a strong spiritual foundation is a central journey."},
    Physical:{complete:"Intuition and practical wisdom work together.",partial:"Intuition and practicality integrating.",missing:"Developing intuition and embodied wisdom matters."},
  };
  return planes.map(p=>{
    const filled=p.nums.filter(n=>g[n]>0).length;
    const st=filled===3?'complete':filled>0?'partial':'missing';
    const cls='status-pill';
    return`<tr>
      <td style="font-family:'Cormorant Garamond',Georgia,serif;font-size:.8rem;letter-spacing:.06em">${p.n}<br><span style="color:var(--text-3);font-size:.65rem">${p.dir}</span></td>
      <td style="font-family:'Cormorant Garamond',Georgia,serif;font-size:.8rem;letter-spacing:.06em">${p.nums.join('·')}</td>
      <td><span class="status-pill ${cls}">${st}</span></td>
      <td style="font-size:.82rem;line-height:1.6;color:var(--text-2)">${m[p.n][st]}</td>
    </tr>`;
  }).join('');
}

function getBDTalent(d){
  const t={1:"You carry the gift of original thought and leadership. Your instinct to initiate — to be first, to begin, to take point — is a natural superpower.",2:"Your talent lies in your extraordinary sensitivity to others — their feelings, needs, and unspoken words. You are a natural mediator and keeper of harmony.",3:"Creative expression is your birthright. Words, images, music, or ideas — something in this family flows from you with unusual ease and power.",4:"Your gift is the ability to build things that last. Where others dream, you plan. Where others plan, you execute. Reliability is not a trait you practise — it is who you are.",5:"Versatility and the ability to connect across worlds are your greatest gifts. You adapt, understand, and communicate across boundaries that stop others cold.",6:"Your gift is an innate understanding of beauty, harmony, and what people need to feel cared for. You are a natural healer and creator of safe spaces.",7:"Analysis, research, and the ability to go deeper than anyone else in the room are your defining gifts. Where others see the surface, you see the system underneath.",8:"Your gift is an uncommon understanding of power, money, and the mechanics of large-scale achievement. You think in systems and lead with natural authority.",9:"Your gift is emotional breadth — the ability to hold space for the full spectrum of human experience with compassion and wisdom rather than judgement."};
  return t[d%9||9]||t[1];
}

function getBDCareers(d){
  const c={1:["Entrepreneurship","Executive leadership","Creative director","Independent consulting","Pioneering fields"],2:["Counselling & therapy","Diplomatic roles","Human resources","Mediation","Partnership management"],3:["Writing & communication","Performing arts","Teaching","Marketing & branding","Creative industries"],4:["Project management","Engineering","Architecture","Finance","Law & government"],5:["Journalism & media","Sales & marketing","Travel industry","Entrepreneurship","Communications technology"],6:["Healthcare & healing","Teaching","Interior design","Counselling","Community leadership"],7:["Research & academia","Philosophy","Technology","Psychology","Spiritual guidance"],8:["Business leadership","Finance & investment","Real estate","Law","Executive consulting"],9:["Humanitarian work","Creative arts","International relations","Healing professions","Non-profit leadership"]};
  return c[d%9||9]||c[1];
}

function getSeason(m){return m>=3&&m<=5?"Spring":m>=6&&m<=8?"Summer":m>=9&&m<=11?"Autumn":"Winter";}
function getSeasonEl(m){return m>=3&&m<=5?"Wood":m>=6&&m<=8?"Fire":m>=9&&m<=11?"Metal":"Water";}

function numSynthesis(lp,d,m,y,lpD){
  return`This numerological configuration weaves four distinct structural threads: the Life Path ${lp} (${lpD.arch}), the Birth Day ${d} talent signature, the ${MONTH_DATA[m].name} birth month's elemental flavour, and the generational current of ${y}. Together these four produce a configuration that is at once particular and embedded in the larger patterns of the period into which this person arrived.<br><br>Within the numerological framework, the central orientation identified by this configuration is toward: ${lpD.purpose.toLowerCase()} The configuration does not determine outcome — it indicates a structural tendency and a field of most productive engagement.`;
}

function numVerse(lp){
  const v={1:"<span class='verse-line'>You did not come here to fit.</span><span class='verse-line'>You came here to forge a path</span><span class='verse-line'>that others will one day follow —</span><span class='verse-line'>calling it the obvious road.</span>",2:"<span class='verse-line'>The softest voice in the room</span><span class='verse-line'>is often the one that decides.</span><span class='verse-line'>You were born to know this</span><span class='verse-line'>before the room does.</span>",3:"<span class='verse-line'>Somewhere between your laugh</span><span class='verse-line'>and your deepest knowing</span><span class='verse-line'>lives the art the world was waiting for.</span><span class='verse-line'>Give it freely.</span>",4:"<span class='verse-line'>Stone by stone, year by year —</span><span class='verse-line'>what you build with honest hands</span><span class='verse-line'>outlasts the loud and the fast.</span><span class='verse-line'>Build on.</span>",5:"<span class='verse-line'>You were born for the open road,</span><span class='verse-line'>the next horizon, the uncharted pass.</span><span class='verse-line'>Freedom is not where you are going.</span><span class='verse-line'>It is what you carry within.</span>",6:"<span class='verse-line'>Love called you here before your name did.</span><span class='verse-line'>Everything you tend toward wholeness</span><span class='verse-line'>ripples outward in ways</span><span class='verse-line'>you will never fully see.</span>",7:"<span class='verse-line'>The answer you seek</span><span class='verse-line'>was never in the noise.</span><span class='verse-line'>It was in the silence you kept avoiding</span><span class='verse-line'>before you learned to love it.</span>",8:"<span class='verse-line'>You were given the blueprint for power</span><span class='verse-line'>before you knew what power was.</span><span class='verse-line'>Now you are learning what to build with it.</span><span class='verse-line'>Build something worthy of your name.</span>",9:"<span class='verse-line'>You have seen what the world is.</span><span class='verse-line'>You came back anyway, with your arms open.</span><span class='verse-line'>That is not foolishness.</span><span class='verse-line'>That is the rarest courage.</span>",11:"<span class='verse-line'>You arrived already lit.</span><span class='verse-line'>The work was never to become radiant —</span><span class='verse-line'>it was to trust</span><span class='verse-line'>that the world can hold your light.</span>",22:"<span class='verse-line'>The cathedral you are building</span><span class='verse-line'>will stand long after you are gone.</span><span class='verse-line'>Build it true. Build it broad.</span><span class='verse-line'>Build it for everyone.</span>",33:"<span class='verse-line'>You did not come to be loved.</span><span class='verse-line'>You came to love —</span><span class='verse-line'>without condition, without count,</span><span class='verse-line'>without end.</span>"};
  return`<div class="verse">${v[lp]||v[9]}</div>`;
}

// ─────────────────────────────────────────────
//  BAZI RENDERER
// ─────────────────────────────────────────────
function buildBazi(d,m,y){
  const tVal=document.getElementById('bazi-time').value;
  const gender=document.getElementById('bazi-gender').value;
  const hasTime=!!tVal;let h=null,min=null;
  if(hasTime){const[hh,mm]=tVal.split(':');h=+hh;min=+mm;}
  const yP=getYP(y,m,d);
  const mP=getMP(y,m,d,yP.stem.i);
  const dP=getDP(y,m,d);
  const hP=hasTime?getHP(h,min,dP.stem.i):null;
  const dm=dP.stem;
  const dmp=DMP[dm.ch]||DMP["壬"];
  const pillars=[yP,mP,dP,hP];
  const str=calcStrength(pillars,dm);
  const elC=countEl(pillars);
  const luckPs=calcLP_bazi(gender,yP.stem.i,mP,y,m,d);
  const now=new Date();
  const age=now.getFullYear()-y-(now<new Date(now.getFullYear(),m-1,d)?1:0);
  const curLP=luckPs.find(lp=>age>=lp.startAge&&age<=lp.endAge)||luckPs[0];

  const pCfg=[
    {p:hP,label:"Hour 时",isDay:false,show:hasTime},
    {p:dP,label:"Day 日",isDay:true,show:true},
    {p:mP,label:"Month 月",isDay:false,show:true},
    {p:yP,label:"Year 年",isDay:false,show:true},
  ];

  return`
<p class="report-eyebrow">BaZi Four Pillars Reading</p>
<div class="report-rule"></div>
<div class="report-title">Your BaZi Configuration Chart 四柱命盤</div>
<div class="report-dob">${MNTHS[m-1]} ${d}, ${y}${hasTime?` · ${tVal}`:''} · ${gender.charAt(0).toUpperCase()+gender.slice(1)}</div>

<div class="info-box" style="margin-bottom:20px">
  <p><strong>What is BaZi?</strong> BaZi (八字, "Eight Characters") is a classical Chinese configuration system over 2,000 years old. Your birth date and time create four "pillars" — Year, Month, Day, and Hour — each with a Heavenly Stem (天干) and Earthly Branch (地支). The <strong>Day Stem is your Day Master</strong>, representing your core self. Everything else in the chart is interpreted in relation to your Day Master. The Ten Gods (十神) reveal what each element means in terms of wealth, relationships, career, and wisdom.</p>
</div>

<!-- FOUR PILLARS -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">柱</div>
    <div class="block-meta">
      <div class="block-label">四柱 The Four Pillars</div>
      <div class="block-title">Your Eight Characters</div>
    </div>
  </div>
  <div class="pillars-wrap">
    <table class="pillars-table">
      <thead><tr>
        ${pCfg.filter(c=>c.show).map(c=>`<th>${c.label}</th>`).join('')}
      </tr></thead>
      <tbody><tr>
        ${pCfg.filter(c=>c.show).map(c=>c.p?`<td>${buildPillarCard(c.p,dm,c.isDay)}</td>`:`<td><div class="pillar-card"><span style="font-size:.8rem;color:var(--text-3)">—</span></div></td>`).join('')}
      </tr></tbody>
    </table>
  </div>
  <div class="callout neutral" style="margin-top:10px">
    <div class="callout-label">Reading note</div>
    <p>Hidden Stems (藏干) are the secondary energies stored inside each Earthly Branch. The <strong>Main stem</strong> is the dominant energy, <strong>Secondary</strong> is influential, and <strong>Residual</strong> is a background flavour. All are expressed as Ten Gods relative to your Day Master.</p>
  </div>
</div>

<!-- DAY MASTER -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">日</div>
    <div class="block-meta">
      <div class="block-label">日主 Day Master — Your Core Self</div>
      <div class="block-title">${dm.ch} ${dm.py} · ${dm.pol} ${dm.el}</div>
    </div>
  </div>
  <div class="dm-hero">
    <span class="dm-char-big ${elClass[dm.el]}">${dm.ch}</span>
    <div class="dm-name">${dmp.name}</div>
    <div class="dm-arch">${dmp.arch}</div>
    <div class="dm-elem-badge ${elClass[dm.el]}" style="border-color:currentColor;opacity:.8">${dm.sym} ${dm.pol} ${dm.el}</div>
  </div>
  <p class="prose">${dmp.core}</p>
  <div class="two-col">
    <div>
      <p class="sub-heading">Natural Strengths</p>
      <div class="tag-row">${dmp.strengths.map(s=>`<span class="tag">${s}</span>`).join('')}</div>
    </div>
    <div>
      <p class="sub-heading">Core Challenges</p>
      <div class="tag-row">${dmp.challenges.map(c=>`<span class="tag">${c}</span>`).join('')}</div>
    </div>
  </div>
  <p class="sub-heading">How to Strengthen Your Day Master</p>
  <div class="two-col">
    <div>
      <div class="callout">
        <div class="callout-label">Supporting Elements</div>
        <div class="tag-row">${dmp.strengthen.el.map(e=>`<span class="tag">${e}</span>`).join('')}</div>
      </div>
      <div class="callout">
        <div class="callout-label">Elements to Moderate</div>
        <div class="tag-row">${dmp.strengthen.avoid.map(e=>`<span class="tag">${e}</span>`).join('')}</div>
      </div>
    </div>
    <div>
      <div class="callout">
        <div class="callout-label">Power Colours &amp; Directions</div>
        <p>${dmp.strengthen.colors.join(', ')} · ${dmp.strengthen.dirs.join(', ')}</p>
      </div>
      <div class="callout">
        <div class="callout-label">Nourishing Foods</div>
        <p>${dmp.strengthen.foods.join(', ')}</p>
      </div>
    </div>
  </div>
  <div class="callout neutral">
    <div class="callout-label">Daily Practice Advice</div>
    <p>${dmp.strengthen.advice}</p>
  </div>
  <p class="sub-heading">Aligned Career Paths</p>
  <div class="tag-row">${dmp.career.split(',').map(c=>`<span class="tag">${c.trim()}</span>`).join('')}</div>
</div>

<!-- STRENGTH -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">強</div>
    <div class="block-meta">
      <div class="block-label">身強身弱 Day Master Strength</div>
      <div class="block-title">${str.cls}</div>
    </div>
  </div>
  <div class="strength-wrap">
    <div class="strength-track">
      <div class="strength-fill" data-w="${str.ratio}%" style="width:0%"></div>
    </div>
    <div class="strength-label">${str.ratio}% support ratio — <strong>${str.cls}</strong></div>
  </div>
  <p class="prose">${getDMStrengthMsg(str.cls,dm)}</p>
  <div class="info-box">
    <p>A <strong>Strong Day Master</strong> benefits from elements that challenge and consume it (Wealth, Output, Officer/Killing energies). A <strong>Weak Day Master</strong> benefits from elements that support and produce it (Resource, Friend energies). This governs which Luck Pillars and Annual Pillars are most favourable.</p>
  </div>
</div>

<!-- ELEMENT BALANCE -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">五</div>
    <div class="block-meta">
      <div class="block-label">五行 Five Element Balance</div>
      <div class="block-title">Elemental Distribution in Your Chart</div>
    </div>
  </div>
  <div class="elem-bars">
    ${Object.entries(elC).map(([el,cnt])=>{
      const total=Object.values(elC).reduce((a,b)=>a+b,0)||1;
      const pct=Math.max(Math.round(cnt/total*100),2);
      return`<div class="eb-row">
        <div class="eb-label ${elClass[el]}">${el}</div>
        <div class="eb-track"><div class="eb-fill" data-w="${pct}%" style="width:0%;${elFill[el]}"></div></div>
        <div class="eb-num">${cnt.toFixed(1)}</div>
      </div>`;
    }).join('')}
  </div>
  ${buildElBalance(elC,dm)}
</div>

<!-- TEN GODS -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">神</div>
    <div class="block-meta">
      <div class="block-label">十神 The Ten Gods</div>
      <div class="block-title">What Each Pillar Means For You</div>
      <div class="block-arch">All stems interpreted relative to your Day Master</div>
    </div>
  </div>
  ${buildTenGods(pillars,dm,hasTime)}
</div>

<!-- TIMING GATE (bazi) -->
<div class="timing-gate">
  <div class="timing-gate-label">Timing Layer</div>
  <p>Cycle activation, decade rulers, and annual configurations are available through the advisory engagement.</p>
</div>

<!-- STARS -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">星</div>
    <div class="block-meta">
      <div class="block-label">神煞 Auspicious &amp; Growth Stars</div>
      <div class="block-title">Special Configurations in Your Chart</div>
    </div>
  </div>
  ${buildStars(dP,yP)}
</div>

<!-- SYNTHESIS -->
<div class="block">
  <div class="block-header">
    <div class="block-num sm">總</div>
    <div class="block-meta">
      <div class="block-label">總論 BaZi Synthesis</div>
      <div class="block-title">Your Complete Reading</div>
    </div>
  </div>
  <div class="synthesis-box">
    <p class="prose">${baziSynth(dm,dmp,str,elC,curLP)}</p>
    <div class="soul-line">"${dmp.core.split('.')[0]}."</div>

    <div class="verse">${baziVerse(dm.ch)}</div>
  </div>
  <div class="callout neutral" style="margin-top:16px">
    <div class="callout-label">Disclaimer</div>
    <p>CCIAF is a structured interpretive framework drawing on multiple intellectual traditions. It is decision-support, not prediction. It is not a substitute for medical, psychiatric, legal, or financial advice. Users in distress should consult qualified professionals.</p>
  </div>
</div>`;
}

function buildPillarCard(p,dm,isDay){
  const god=isDay?null:getTG(dm,p.stem);
  const hidden=HIDDEN[p.branch.ch]||[];
  return`<div class="pillar-card ${isDay?'dm':''}">
    <span class="p-stem ${elClass[p.stem.el]}">${p.stem.ch}</span>
    <div class="p-stem-info">${p.stem.py}<br>${p.stem.pol} ${p.stem.el}</div>
    <span class="p-branch ${elClass[p.branch.el]}">${p.branch.ch}</span>
    <div class="p-branch-info">${p.branch.py}<br>${p.branch.an} · ${p.branch.el}</div>
    <div class="${isDay?'p-god-badge self':'p-god-badge'}">${isDay?'☯ Self / Day Master':god}</div>
    ${hidden.length?`<div class="hidden-stems-block">
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:.7rem;font-weight:300;color:var(--text-3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.18em">Hidden Stems</div>
      ${hidden.map(hs=>{
        const g=getTGch(dm,hs.ch);
        const tgd=TGD[g]||{};
        return`<div class="hs-row">
          <span class="hs-char ${elClass[hs.el]}">${hs.ch}</span>
          <div class="hs-info">${hs.py} · ${hs.pol} ${hs.el}<br><span style="color:var(--coral);font-weight:500">${g}</span> · ${hs.role}<br><span style="font-size:.6rem">${tgd.life||''}</span></div>
        </div>`;
      }).join('')}
    </div>`:''}
  </div>`;
}

function buildElBalance(cnt,dm){
  const sorted=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
  const dom=sorted[0][0];const lac=sorted[sorted.length-1][0];
  const msgs={
    Wood:{dom:"Wood energy brings growth-orientation, idealism, ambition, and a strong moral sense. Watch for rigidity and the inability to bend when life requires flexibility.",lac:"Low Wood may create challenges around initiating and setting long-term direction. Green colours, leafy greens, sour foods, time in nature, and new projects can supplement this."},
    Fire:{dom:"Strong Fire brings warmth, expressiveness, charisma, and inspiration. Burnout, overextension, and emotional volatility are the shadows to watch.",lac:"Low Fire may show as difficulty maintaining enthusiasm or motivation. Red and orange colours, warming foods, creative expression, and social connection help supplement this."},
    Earth:{dom:"Dominant Earth brings groundedness, stability, and practical instinct. Stubbornness and over-caution are potential shadows when Earth is very strong.",lac:"Scarce Earth can make it challenging to stay grounded or finish what you start. Root vegetables, warm cooked foods, natural earth environments, and consistent routines bring grounding."},
    Metal:{dom:"Strong Metal brings precision, authority, justice, and clarity. Rigidity and difficulty with emotional expression are the shadows.",lac:"Limited Metal may show as difficulty with boundaries or letting go. White colours, breathing exercises, structured environments, and practices of release support Metal energy."},
    Water:{dom:"Abundant Water brings depth, wisdom, adaptability, and intuition. Over-analysis, indecision, and inconsistency are the shadows.",lac:"Scarce Water may show as reduced intuition and adaptability. Black and blue colours, rest, deep reflection, and kidney-nourishing foods help supplement this."},
  };
  return`<div class="two-col" style="margin-top:12px">
    <div class="callout coral">
      <div class="callout-label">Most Abundant: ${dom}</div>
      <p>${msgs[dom]?.dom||''}</p>
    </div>
    <div class="callout">
      <div class="callout-label">Least Present: ${lac}</div>
      <p>${msgs[lac]?.lac||''}</p>
    </div>
  </div>`;
}

function buildTenGods(pillars,dm,hasTime){
  const cfgs=[
    {p:pillars[0],label:"Year Pillar",show:true},
    {p:pillars[1],label:"Month Pillar",show:true},
    {p:pillars[2],label:"Day Pillar (Self)",show:true},
    {p:pillars[3],label:"Hour Pillar",show:hasTime},
  ];
  let html='';
  cfgs.filter(c=>c.show&&c.p).forEach(c=>{
    const isDay=c.label.includes("Day");
    const stemGod=isDay?"Self (Day Master)":getTG(dm,c.p.stem);
    const hidden=HIDDEN[c.p.branch.ch]||[];
    const tgd=TGD[stemGod];
    if(!isDay&&tgd){
      html+=`<div class="tg-card">
        <div class="tg-header">
          <span class="tg-ch ${elClass[c.p.stem.el]}">${c.p.stem.ch}</span>
          <span class="tg-name">${stemGod}</span>
          <span class="tg-py">${tgd.ch} · ${tgd.py}</span>
          <span class="tg-location">${c.label} stem</span>
        </div>
        <div class="tg-life">${tgd.life}</div>
        <div class="tg-desc">${tgd.desc}</div>
      </div>`;
    } else if(isDay){
      html+=`<div class="tg-card" style="border-color:var(--coral-mid);background:var(--coral-light)">
        <div class="tg-header">
          <span class="tg-ch ${elClass[dm.el]}">${dm.ch}</span>
          <span class="tg-name" style="color:var(--text)">Self — Day Master 日主</span>
          <span class="tg-location">Day Pillar stem</span>
        </div>
        <div class="tg-desc">The Day Stem is your core self — your identity, how you process the world, and your fundamental nature. Everything in this chart is read in relationship to this character.</div>
      </div>`;
    }
    hidden.forEach((hs,hi)=>{
      const g=getTGch(dm,hs.ch);
      const td=TGD[g];if(!td)return;
      html+=`<div class="tg-card" style="margin-left:20px;background:var(--surface2)">
        <div class="tg-header">
          <span class="tg-ch ${elClass[hs.el]}">${hs.ch}</span>
          <span class="tg-name">${g}</span>
          <span class="tg-py">${td.ch} · ${td.py}</span>
          <span class="tg-location">${c.label} hidden (${hs.role})</span>
        </div>
        <div class="tg-life">${td.life}</div>
        <div class="tg-desc" style="font-size:.84rem;opacity:.85">${td.desc}</div>
      </div>`;
    });
  });
  return html||'<p class="prose">Ten God analysis computed relative to your Day Master.</p>';
}

function getDMStrengthMsg(cls,dm){
  const m={
    "Very Strong":`Your Day Master ${dm.ch} (${dm.el}) is exceptionally well-supported in your chart. You are most fulfilled when facing challenges and taking on responsibility — your natural energy needs a worthy outlet. Favourable Luck Pillars are those bringing Wealth (${FE[dm.el].ctrl}), Output (${FE[dm.el].prod}), or Officer (${FE[dm.el].ctrlBy}) energies to productively channel your power.`,
    "Strong":`Your Day Master ${dm.ch} (${dm.el}) is well-supported. You have a strong foundation of natural energy and resilience. Look for Luck Pillars that bring Wealth or Officer energy to channel this strength productively.`,
    "Balanced":`Your Day Master ${dm.ch} (${dm.el}) holds a balanced position — neither overwhelmingly strong nor significantly weak. This flexibility means you can adapt to a wide range of Luck Pillar energies. Your fortune is determined more by specific configurations and timing than by a fixed imbalance.`,
    "Weak":`Your Day Master ${dm.ch} (${dm.el}) needs support in your chart. Favourable periods are those bringing Resource (${FE[dm.el].prodBy}) or Friend (${dm.el}) energies — pillars that nurture and strengthen you. Avoid overextension during years when controlling energies are strongly activated.`,
    "Very Weak":`Your Day Master ${dm.ch} (${dm.el}) carries a sensitive, light quality. You work best with support systems, collaboration, and alignment rather than force. The most transformative Luck Pillars are those rich in ${FE[dm.el].prodBy} (Resource) energy — periods of learning, being mentored, and building inner foundation.`,
  };
  return m[cls]||m["Balanced"];
}

function buildCurLP(lp,dm,age){
  const god=getTG(dm,lp.stem);
  const td=TGD[god]||{};
  const yr=lp.endAge-age;
  return`<div class="callout" style="margin-top:14px">
    <div class="callout-label">★ Your Current Luck Pillar — Age ${lp.startAge}–${lp.endAge} · ${yr} years remaining</div>
    <p style="font-family:'Noto Serif SC',serif;font-size:1.6rem;color:var(--coral);margin:6px 0">${lp.stem.ch}${lp.branch.ch}</p>
    <p><strong>${god} Decade</strong> · ${td.life||''}</p>
    <p style="margin-top:6px;line-height:1.8">${td.desc||''}</p>
    <p style="margin-top:8px;font-style:italic;color:var(--text-3)">The branch ${lp.branch.ch} (${lp.branch.py}, ${lp.branch.an}) adds ${lp.branch.el} energy — ${elQuality(lp.branch.el)} — as an undertone to this decade.</p>
  </div>`;
}

function elQuality(el){
  const q={Wood:"growth and new directions",Fire:"passion and transformation",Earth:"stability and accumulation",Metal:"precision and refinement",Water:"depth and adaptability"};
  return q[el]||"its elemental character";
}

function annualTheme(god){
  const t={"Friend":"Independence & entrepreneurship","Rob Wealth":"Financial discernment needed","Eating God":"Talent recognised & creativity flows","Hurting Officer":"Bold moves & unconventional paths","Indirect Wealth":"Windfalls & speculative opportunities","Direct Wealth":"Steady income & financial discipline","Seven Killings":"Transformation & power dynamics","Direct Officer":"Career advancement & reputation","Indirect Resource":"Learning, research & inner wisdom","Direct Resource":"Support, mentorship & education","Self":"Personal renewal","Unknown":"Mixed activations"};
  return t[god]||"Significant life activations";
}

function buildStars(dP,yP){
  const lucky=[
    {name:"Heavenly Noble Person",ch:"天乙貴人",desc:"The most auspicious star in Chinese astrology. Its presence indicates powerful benefactors, mentors, and hidden helpers who appear at critical turning points in life. Within the BaZi system, this pattern correlates with periods of external support and benefactor activation.",advice:"Cultivate relationships with gratitude and openness. Support figures may arrive in unexpected forms.",present:true},
    {name:"Academic Star",ch:"文昌",desc:"The star of intelligence, literary talent, and scholarly recognition. Its presence indicates a natural inclination toward learning, writing, and intellectual achievement. Success through study and mental mastery is supported.",advice:"Honour your intellectual gifts through study and expression. Your mind is one of your greatest assets.",present:Math.random()>0.4},
    {name:"Peach Blossom",ch:"桃花",desc:"The star of romantic magnetism, social charm, and artistic talent. Its presence indicates a natural capacity to attract others, and your social world tends to be rich and varied. Can also indicate artistic recognition or public appeal.",advice:"This configuration associates with social magnetism — engage it deliberately and with integrity in both relational and professional spheres.",present:Math.random()>0.5},
    {name:"Sky Horse",ch:"驛馬",desc:"The star of movement, travel, and dynamic career opportunity. Often indicates career paths involving mobility, international work, or frequent and rewarding life changes.",advice:"Embrace movement rather than resist it. Your fortune often arrives through change of scene or circumstance.",present:Math.random()>0.5},
  ];
  const challenge=[
    {name:"Void / Empty Space",ch:"空亡",desc:"Areas of life connected to the void branches tend to feel elusive or spiritually-oriented rather than materially rewarding. The void does not represent failure — it indicates a domain where meaning must be sought inwardly rather than externally.",advice:"What falls in void is transformed, not lost. Seek depth and meaning in this area rather than conventional outcomes."},
    {name:"Solitary Star",ch:"孤辰寡宿",desc:"Associated with a deep sense of independence that can tip into isolation. Even surrounded by people, there may be an underlying feeling of aloneness. This depth often produces great wisdom and spiritual insight.",advice:"Your solitude is a creative and spiritual resource. Honour it consciously rather than fighting it."},
  ];
  let html='<p class="sub-heading" style="color:var(--green)">✓ Auspicious Stars</p>';
  lucky.filter(s=>s.present).forEach(s=>{
    html+=`<div class="star-card">
      <div class="star-name">✨ ${s.name}</div>
      <div class="star-ch">${s.ch}</div>
      <div class="star-desc">${s.desc}</div>
      <div class="star-advice">"${s.advice}"</div>
    </div>`;
  });
  html+='<p class="sub-heading" style="color:var(--amber);margin-top:16px">◎ Growth Stars — Areas for Conscious Development</p>';
  challenge.forEach(s=>{
    html+=`<div class="star-card">
      <div class="star-name">⚬ ${s.name}</div>
      <div class="star-ch">${s.ch}</div>
      <div class="star-desc">${s.desc}</div>
      <div class="star-advice">"${s.advice}"</div>
    </div>`;
  });
  return html;
}


function baziSynth(dm,dmp,str,elC,curLP){
  const god=curLP?getTG(dm,curLP.stem):"";
  const td=TGD[god]||{};
  return`Within the BaZi system, this chart identifies a ${dm.pol} ${dm.el} Day Master — ${dm.ch} (${dm.py}), the ${dmp.arch}. This is a structural map of the qualities present in this configuration, not a prescription for identity.<br><br>With a <strong>${str.cls} Day Master</strong>, the most productive orientation ${str.cls.includes("Strong")?"runs through channelling natural strength into worthy challenges and responsibilities — this configuration associates with orientation toward pressure and structured accountability":"runs through building inner foundation through support, learning, and strategic alliances — this configuration associates with orientation toward depth and sustained inner work"}. ${curLP?`Your current Luck Pillar (Age ${curLP.startAge}–${curLP.endAge}) brings <strong>${god}</strong> energy — ${td.life||'significant activations'} — as the prevailing theme of this decade. ${td.desc||''}`:''}<br><br>The elemental balance of your chart, with ${Object.entries(elC).sort((a,b)=>b[1]-a[1])[0][0]} as the dominant force, shapes the flavour of how all your other qualities express. Work with this energy rather than against it, and you will find the path of least resistance to your fullest expression.`;
}

// ─────────────────────────────────────────────
//  CROSS-TRADITIONAL SYNTHESIS RENDERER
// ─────────────────────────────────────────────
function buildCrossTraditionalSynthesis(lp, dm, lpD, dmp){
  const dmStmt = SYNTH_DM[dm.ch] || '';
  const lpStmt = SYNTH_LP[lp] || SYNTH_LP[9];
  const crossKey = dm.el + '-' + lp;
  const crossStmt = SYNTH_CROSS[crossKey] || SYNTH_CROSS[dm.el + '-9'] || '';

  return`
<p class="report-eyebrow">Cross-Traditional Synthesis</p>
<div class="report-rule"></div>
<div class="report-title">Where the Two Traditions Intersect</div>
<div class="report-dob">${dm.ch} ${dm.py} · ${dm.pol} ${dm.el} &nbsp;×&nbsp; Life Path ${lp} · ${lpD.arch}</div>

<div class="block">
  <div class="block-header">
    <div class="block-num sm" style="background:var(--coral-light);color:var(--coral)">✦</div>
    <div class="block-meta">
      <div class="block-label">Cross-Traditional Reading</div>
      <div class="block-title">BaZi ${dm.ch} (${dm.el}) × Life Path ${lp}</div>
      <div class="block-arch">One finding neither tradition produces independently</div>
    </div>
  </div>
  <div class="synth-stmts">
    <p class="prose">${dmStmt}</p>
    <p class="prose" style="margin-top:12px">${lpStmt}</p>
  </div>
  <div class="callout" style="margin-top:18px;border-left-width:3px">
    <div class="callout-label">Intersection — What Neither System Produces Alone</div>
    <p style="line-height:1.9">${crossStmt}</p>
  </div>
  <div class="callout neutral" style="margin-top:14px">
    <div class="callout-label">Disclaimer</div>
    <p>CCIAF is a structured interpretive framework drawing on multiple intellectual traditions. It is decision-support, not prediction. It is not a substitute for medical, psychiatric, legal, or financial advice. Users in distress should consult qualified professionals.</p>
  </div>
</div>`;
}

function baziVerse(ch){
  const v={"甲":"<span class='verse-line'>You reach for the light not because someone asked you to.</span><span class='verse-line'>You reach because it is what trees do.</span><span class='verse-line'>Grow on. The forest needs your height.</span>","乙":"<span class='verse-line'>You find the way around</span><span class='verse-line'>what the oak cannot move through.</span><span class='verse-line'>What they call flexibility,</span><span class='verse-line'>the vine calls wisdom.</span>","丙":"<span class='verse-line'>You rose this morning</span><span class='verse-line'>before anyone asked you to.</span><span class='verse-line'>The world has always run</span><span class='verse-line'>on light that did not wait for permission.</span>","丁":"<span class='verse-line'>You illuminate the small radius</span><span class='verse-line'>better than the sun ever could.</span><span class='verse-line'>Up close, in the quiet,</span><span class='verse-line'>you change everything.</span>","戊":"<span class='verse-line'>Mountains do not justify their existence.</span><span class='verse-line'>They simply are.</span><span class='verse-line'>You are that kind of necessary.</span>","己":"<span class='verse-line'>What grows in you</span><span class='verse-line'>grows in others.</span><span class='verse-line'>You are the field —</span><span class='verse-line'>do not forget to tend yourself too.</span>","庚":"<span class='verse-line'>You were forged in heat</span><span class='verse-line'>and sharpened by years.</span><span class='verse-line'>Now you are precisely</span><span class='verse-line'>what the moment needs.</span>","辛":"<span class='verse-line'>Perfection is not the absence of flaws.</span><span class='verse-line'>It is the light</span><span class='verse-line'>that catches the facets</span><span class='verse-line'>only you can see.</span>","壬":"<span class='verse-line'>You are not the wave.</span><span class='verse-line'>You are the ocean</span><span class='verse-line'>pretending to be a wave</span><span class='verse-line'>for a little while.</span>","癸":"<span class='verse-line'>The rain does not ask</span><span class='verse-line'>if it is welcome.</span><span class='verse-line'>It simply falls,</span><span class='verse-line'>and everything grows.</span>"};
  return`<div class="verse">${v[ch]||v["壬"]}</div>`;
}
