// ── Clock ─────────────────────────────────────────────────────────────────────
setInterval(()=>{
  document.getElementById('clk').textContent =
    new Date().toISOString().replace('T',' ').slice(0,19)+' UTC';
},1000);

// ── Log ───────────────────────────────────────────────────────────────────────
function lg(msg, t='info'){
  const b=document.getElementById('log');
  const ts=new Date().toISOString().slice(11,19);
  const cm={ok:'lok',err:'lerr',info:'linf',warn:'lwrn'};
  const lm={ok:'OK  ',err:'ERR ',info:'INFO',warn:'WARN'};
  const d=document.createElement('div'); d.className='ll';
  d.innerHTML=`<span class="lt">${ts}</span><span class="${cm[t]||'linf'}">${lm[t]||'INFO'}</span><span>${msg}</span>`;
  b.appendChild(d); b.scrollTop=b.scrollHeight;
}
function clearLog(){ document.getElementById('log').innerHTML=''; lg('Log cleared.','info'); }

// ── Status ────────────────────────────────────────────────────────────────────
function setSt(state,txt){
  const d=document.getElementById('sdot'), t=document.getElementById('stxt');
  d.className=`dot ${state}`; t.textContent=txt;
  t.style.color=state==='live'?'var(--bull)':state==='error'?'var(--bear)':'var(--dim)';
}

// ── Overlay ───────────────────────────────────────────────────────────────────
function showOv(id,v){ document.getElementById(id+'-ov').classList.toggle('hidden',!v); }

// ── Charts ────────────────────────────────────────────────────────────────────
const CH={};
function dch(id){ if(CH[id]){ CH[id].destroy(); delete CH[id]; } }

function mkC(id, type, labels, datasets, opts={}){
  dch(id);
  const ctx=document.getElementById(id).getContext('2d');
  CH[id]=new Chart(ctx,{
    type, data:{labels,datasets},
    options:{
      responsive:true, animation:{duration:500},
      plugins:{
        legend:{ display:datasets.length>1, labels:{color:'#3a5a70',font:{family:'PressStart',size:7},boxWidth:8,padding:6} },
        tooltip:{ backgroundColor:'#0d1820',borderColor:'#25415e',borderWidth:1, titleColor:'#b8d4e0',bodyColor:'#3a5a70', titleFont:{family:'PressStart',size:7}, bodyFont:{family:'PressStart',size:7} }
      },
      scales:{
        x:{ ticks:{color:'#25415e',font:{family:'PressStart',size:6},maxTicksLimit:8,maxRotation:0}, grid:{color:'#0d1820'} },
        y:{ ticks:{color:'#25415e',font:{family:'PressStart',size:6},maxTicksLimit:5}, grid:{color:'rgba(22,35,51,0.6)'} },
        ...(opts.y2?{y2:{position:'right',display:true,ticks:{color:'#25415e',font:{family:'PressStart',size:6},maxTicksLimit:4},grid:{drawOnChartArea:false}}}:{})
      }
    }
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const clamp=(v,lo=-1,hi=1)=>Math.max(lo,Math.min(hi,v));
function fN(n,d=2){ if(n==null||isNaN(n))return'–'; const a=Math.abs(n); if(a>=1e9)return(n/1e9).toFixed(2)+'B'; if(a>=1e6)return(n/1e6).toFixed(2)+'M'; if(a>=1e3)return(n/1e3).toFixed(2)+'K'; return n.toFixed(d); }
function fP(n,d=4){ return n==null||isNaN(n)?'–':(n*100).toFixed(d)+'%'; }
function tsL(t){ return new Date(t*1000).toISOString().slice(11,16); }
function getSeries(data){ return data[0]?.history||data?.history||data||[]; }

function setEl(id,txt,cls){
  const e=document.getElementById(id); if(!e)return;
  e.textContent=txt; e.className='sval'+(cls?' '+cls:'');
}
function setPill(id,txt,cls){
  const e=document.getElementById(id); if(!e)return;
  e.textContent=txt; e.className='pill'+(cls?' '+cls:'');
}

// ── API call ──────────────────────────────────────────────────────────────────
async function cz(ep, params, key){
  const u=new URL(`https://api.coinalyze.net/v1/${ep}`);
  Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
  const r=await fetch(u.toString(),{headers:{'api_key':key}});
  if(!r.ok){ const e=await r.text(); throw new Error(`HTTP ${r.status}: ${e}`); }
  return r.json();
}

// ── Scores ────────────────────────────────────────────────────────────────────
const SC={oi:null,fr:null,ls:null,cvd:null,vwap:null};

// ── OI ────────────────────────────────────────────────────────────────────────
async function fetchOI(key,iv,lim){
  showOv('oi',true);
  try {
    const data=await cz('open-interest-history',{symbols:'BTCUSDT_PERP.A',interval:iv,limit:lim},key);
    const s=getSeries(data); if(!s.length) throw new Error('Empty response');
    lg(`OI: ${s.length} bars loaded`,'ok');
    const labels=s.map(d=>tsL(d.t));
    const vals=s.map(d=>d.c??d.v??d.value);
    const cur=vals[vals.length-1], first=vals[0];
    const delta=cur-first, dpct=((delta/first)*100).toFixed(2);
    const rising=delta>first*0.005, falling=delta<-first*0.005;
    const cls=rising?'bull':falling?'bear':'neutral';
    const read=rising?'OI RISING':falling?'OI FALLING':'OI FLAT';
    setEl('oi-cur',fN(cur),''); setEl('oi-d',(delta>0?'+':'')+dpct+'%',cls); setEl('oi-read',read,cls);
    setPill('oi-pill',read,cls);
    SC.oi=clamp(delta/(first*0.06));
    const color=rising?'#00ff88':'#ff3060';
    const g=document.getElementById('oi-chart').getContext('2d').createLinearGradient(0,0,0,180);
    g.addColorStop(0,rising?'rgba(0,255,136,0.22)':'rgba(255,48,96,0.22)'); g.addColorStop(1,'rgba(0,0,0,0)');
    mkC('oi-chart','line',labels,[{label:'Agg OI',data:vals,borderColor:color,backgroundColor:g,borderWidth:1.5,pointRadius:0,fill:true,tension:0.3}]);
  } catch(e){ lg(`OI: ${e.message}`,'err'); setPill('oi-pill','ERR','bear'); }
  finally{ showOv('oi',false); }
}

// ── FUNDING ───────────────────────────────────────────────────────────────────
async function fetchFR(key,iv,lim){
  showOv('fr',true);
  try {
    const data=await cz('funding-rate-history',{symbols:'BTCUSDT_PERP.A',interval:iv,limit:lim},key);
    const s=getSeries(data); if(!s.length) throw new Error('Empty response');
    lg(`Funding: ${s.length} bars`,'ok');
    const labels=s.map(d=>tsL(d.t));
    const vals=s.map(d=>d.c??d.v??d.rate);
    const cur=vals[vals.length-1];
    const avg8=vals.slice(-8).reduce((a,b)=>a+b,0)/Math.min(8,vals.length);
    // High +ve funding = longs pay premium. Could be crowding OR basis trade harvesting. Negative = shorts pay, potential squeeze OR hedger cost.
    // Negative = shorts paying, squeeze pressure
    const cls=avg8>0.0003?'bear':avg8<-0.0001?'bull':'neutral';
    const read=avg8>0.0003?'HIGH FUNDING':avg8<-0.0001?'NEGATIVE FUNDING':'NEUTRAL';
    setEl('fr-cur',fP(cur,4),cls); setEl('fr-avg',fP(avg8,4),cls); setEl('fr-read',read,cls);
    setPill('fr-pill',read,cls);
    SC.fr=clamp(-(avg8/0.0004));
    const bc=vals.map(v=>v>=0?'rgba(255,48,96,0.65)':'rgba(0,255,136,0.65)');
    mkC('fr-chart','bar',labels,[{label:'Funding Rate',data:vals,backgroundColor:bc,borderWidth:0}]);
  } catch(e){ lg(`Funding: ${e.message}`,'err'); setPill('fr-pill','ERR','bear'); }
  finally{ showOv('fr',false); }
}

// ── L/S ───────────────────────────────────────────────────────────────────────
async function fetchLS(key,iv,lim){
  showOv('ls',true);
  try {
    const data=await cz('long-short-ratio-history',{symbols:'BTCUSDT_PERP.A',interval:iv,limit:lim},key);
    const s=getSeries(data); if(!s.length) throw new Error('Empty response');
    lg(`L/S: ${s.length} bars`,'ok');
    const labels=s.map(d=>tsL(d.t));
    const ratios=s.map(d=>d.c??d.v??d.long_short_ratio??d.ratio);
    const lPcts=ratios.map(r=>(r/(1+r))*100);
    const sPcts=ratios.map(r=>(1/(1+r))*100);
    const cur=ratios[ratios.length-1];
    const lP=lPcts[lPcts.length-1], sP=sPcts[sPcts.length-1];
    // Extreme long skew = retail long-heavy. Stops clustered below. Extreme short skew = retail short-heavy. Squeeze potential above. Large players not captured here.
    // Extreme short skew = squeeze fuel above
    const skew=cur-1;
    const cls=skew>0.2?'bear':skew<-0.2?'bull':'neutral';
    const read=skew>0.3?'RETAIL LONG SKEW':skew<-0.3?'RETAIL SHORT SKEW':'BALANCED';
    setEl('ls-cur',cur.toFixed(3),cls); setEl('ls-l',lP.toFixed(1)+'%','bull'); setEl('ls-s',sP.toFixed(1)+'%','bear'); setEl('ls-read',read,cls);
    setPill('ls-pill',read,cls);
    SC.ls=clamp(-skew/0.35);
    mkC('ls-chart','line',labels,[
      {label:'Longs %',data:lPcts,borderColor:'#00ff88',borderWidth:1.5,pointRadius:0,fill:false,tension:0.3},
      {label:'Shorts %',data:sPcts,borderColor:'#ff3060',borderWidth:1.5,pointRadius:0,fill:false,tension:0.3},
    ]);
  } catch(e){ lg(`L/S: ${e.message}`,'err'); setPill('ls-pill','ERR','bear'); }
  finally{ showOv('ls',false); }
}

// ── CVD ───────────────────────────────────────────────────────────────────────
async function fetchCVD(key,iv,lim){
  showOv('cvd',true);
  try {
    const data=await cz('buy-sell-volume-history',{symbols:'BTCUSDT_PERP.A',interval:iv,limit:lim},key);
    const s=getSeries(data); if(!s.length) throw new Error('Empty response');
    lg(`Volume: ${s.length} bars`,'ok');
    const labels=s.map(d=>tsL(d.t));
    const buys=s.map(d=>d.bv??d.buy_volume??d.buy);
    const sells=s.map(d=>d.sv??d.sell_volume??d.sell);
    const deltas=buys.map((b,i)=>b-sells[i]);
    const cvd=deltas.reduce((acc,d,i)=>{acc.push((acc[i-1]||0)+d);return acc;},[]);
    const slope=(cvd[cvd.length-1]-cvd[0])/cvd.length;
    const totB=buys.reduce((a,b)=>a+b,0), totS=sells.reduce((a,b)=>a+b,0);
    const cls=slope>0?'bull':'bear';
    const read=slope>0?'NET BUY AGGRESSION':'NET SELL AGGRESSION';
    setEl('cvd-b',fN(totB),'bull'); setEl('cvd-s',fN(totS),'bear'); setEl('cvd-read',read,cls);
    setPill('cvd-pill',read,cls);
    const maxB=Math.max(...buys)||1;
    SC.cvd=clamp((slope/maxB)*60);
    const g=document.getElementById('cvd-chart').getContext('2d').createLinearGradient(0,0,0,160);
    g.addColorStop(0,slope>=0?'rgba(0,255,136,0.18)':'rgba(255,48,96,0.18)'); g.addColorStop(1,'rgba(0,0,0,0)');
    mkC('cvd-chart','line',labels,[
      {label:'Buy', data:buys,  borderColor:'#00ff88',borderWidth:1,pointRadius:0,tension:0.3,yAxisID:'y'},
      {label:'Sell',data:sells, borderColor:'#ff3060',borderWidth:1,pointRadius:0,tension:0.3,yAxisID:'y'},
      {label:'CVD', data:cvd,   borderColor:'#00e5ff',backgroundColor:g,borderWidth:2,pointRadius:0,tension:0.3,fill:true,yAxisID:'y2'},
    ],{y2:true});
  } catch(e){ lg(`CVD: ${e.message}`,'err'); setPill('cvd-pill','ERR','bear'); }
  finally{ showOv('cvd',false); }
}

// ── VWAP (volume-proxy, free tier) ────────────────────────────────────────────
// Coinalyze free tier does not expose OHLCV candlesticks reliably.
// We approximate VWAP using buy/sell volume history + OI price proxy:
//   - OI delta between bars gives a directional price proxy
//   - Total volume per bar = buy + sell volume
//   - Price proxy per bar reconstructed from cumulative OI change anchored to latest OI value
//   - VWAP = Σ(price_proxy × total_volume) / Σ(total_volume)
// This is an ESTIMATE — not a true OHLCV VWAP. Deviation direction is reliable;
// absolute deviation magnitude should be treated as approximate.
async function fetchVWAP(key,iv,lim){
  showOv('vwap',true);
  try {
    // Fetch both OI and buy/sell volume — need both for the proxy
    const [oiData, volData] = await Promise.all([
      cz('open-interest-history',    {symbols:'BTCUSDT_PERP.A',interval:iv,limit:lim}, key),
      cz('buy-sell-volume-history',  {symbols:'BTCUSDT_PERP.A',interval:iv,limit:lim}, key),
    ]);

    const oi  = getSeries(oiData);
    const vol = getSeries(volData);
    if(!oi.length||!vol.length) throw new Error('Empty response');

    // Align series by timestamp
    const oiMap = Object.fromEntries(oi.map(d=>[d.t, d.c??d.v??d.value]));
    const aligned = vol.filter(d=>oiMap[d.t]!=null);
    if(aligned.length < 2) throw new Error('Insufficient aligned bars for VWAP proxy');

    lg(`VWAP proxy: ${aligned.length} bars from OI + volume`,'ok');

    const labels   = aligned.map(d=>tsL(d.t));
    const oiVals   = aligned.map(d=>oiMap[d.t]);
    const totalVol = aligned.map(d=>(d.bv??d.buy_volume??d.buy??0)+(d.sv??d.sell_volume??d.sell??0));

    // Reconstruct price proxy:
    // OI changes proportionally reflect leveraged price movement direction.
    // Anchor: assume last OI value ≈ last price (we normalise relative to itself).
    // Use OI as a price-level index scaled to its own range.
    const oiMin = Math.min(...oiVals), oiMax = Math.max(...oiVals);
    const oiRange = oiMax - oiMin || 1;

    // We don't have absolute price, so we work in normalised OI-space.
    // All VWAP deviation readings will be relative (%).
    const normOI = oiVals.map(v=>(v-oiMin)/oiRange); // 0–1 scale

    // Cumulative volume-weighted OI proxy (VWAP in OI-space)
    let cumWt=0, cumVol=0;
    const vwapProxy = aligned.map((_,i)=>{
      cumWt  += normOI[i] * (totalVol[i]||1);
      cumVol += (totalVol[i]||1);
      return cumWt/cumVol;
    });

    const lastOI   = normOI[normOI.length-1];
    const lastVWAP = vwapProxy[vwapProxy.length-1];
    const dev = ((lastOI - lastVWAP) / (lastVWAP||1)) * 100;

    const cls  = dev < -2 ? 'bull' : dev > 2 ? 'bear' : 'neutral';
    const read = dev < -2 ? 'BELOW PROXY VWAP' : dev > 2 ? 'ABOVE PROXY VWAP' : 'NEAR PROXY VWAP';

    // Show raw OI values for the price line, vwap proxy rescaled back
    const vwapRescaled = vwapProxy.map(v=>oiMin + v*oiRange);

    setEl('vwap-price', fN(oiVals[oiVals.length-1]), '');
    setEl('vwap-val',   fN(vwapRescaled[vwapRescaled.length-1]), 'vwap');
    setEl('vwap-dev',   (dev>=0?'+':'')+dev.toFixed(2)+'%', cls);
    setEl('vwap-read',  read+'  ⚠ PROXY', cls);
    setPill('vwap-pill', read, cls);

    SC.vwap = clamp(-dev/5);

    mkC('vwap-chart','line',labels,[
      {label:'OI (price proxy)', data:oiVals,         borderColor:'#b8d4e0',borderWidth:1.5,pointRadius:0,tension:0.3,fill:false},
      {label:'Vol-Wtd VWAP proxy',data:vwapRescaled,  borderColor:'#c084fc',borderDash:[5,3],borderWidth:2,pointRadius:0,tension:0.3,fill:false},
    ]);
  } catch(e){ lg(`VWAP proxy: ${e.message}`,'err'); setPill('vwap-pill','ERR','bear'); }
  finally{ showOv('vwap',false); }
}

// ── Composite signal ──────────────────────────────────────────────────────────
function refreshBars(){
  const keys=['oi','fr','ls','cvd','vwap'];
  keys.forEach(k=>{
    if(SC[k]===null)return;
    const s=SC[k], pct=((s+1)/2*100).toFixed(1);
    const col=s>0.2?'var(--bull)':s<-0.2?'var(--bear)':'var(--neutral)';
    document.getElementById('bar-'+k).style.cssText=`width:${pct}%;background:${col}`;
    const v=document.getElementById('val-'+k);
    v.textContent=s.toFixed(3); v.style.color=col;
  });
  const valid=keys.map(k=>SC[k]).filter(v=>v!==null);
  if(!valid.length) return;
  const comp=valid.reduce((a,b)=>a+b,0)/valid.length;
  const cpct=((comp+1)/2*100).toFixed(1);
  const cc=comp>0.25?'var(--bull)':comp<-0.25?'var(--bear)':'var(--neutral)';
  document.getElementById('bar-comp').style.cssText=`width:${cpct}%;background:${cc}`;
  const vc=document.getElementById('val-comp'); vc.textContent=comp.toFixed(3); vc.style.color=cc;

  // Signal card
  const card=document.getElementById('sig-card'), hl=document.getElementById('sig-hl');
  const sub=document.getElementById('sig-sub'), rs=document.getElementById('sig-rs');
  let bias,cls,subTxt;
  if(comp>0.5)       {bias='PRESSURE TO UPSIDE';   cls='bull';    subTxt='Most metrics lean bullish. Counterparty composition and passive flow unknown — treat as directional pressure, not confirmation.';}
  else if(comp>0.3)  {bias='MILD UPSIDE LEAN';     cls='bull';    subTxt='Slight bullish edge across metrics. Ambiguity remains — no metric here can confirm who is behind the move.';}
  else if(comp<-0.5) {bias='PRESSURE TO DOWNSIDE'; cls='bear';    subTxt='Most metrics lean bearish. Does not distinguish distribution from hedging or passive absorption — use with caution.';}
  else if(comp<-0.3) {bias='MILD DOWNSIDE LEAN';   cls='bear';    subTxt='Slight bearish lean. Signal is weak and ambiguous at this level — conditions can reverse quickly.';}
  else               {bias='NO DIRECTIONAL EDGE';  cls='neutral'; subTxt='Metrics are mixed or flat. No meaningful read available from this data set right now.';}
  card.className=`sig-card ${cls}`; hl.className=`sig-hl ${cls}`;
  hl.textContent=bias; sub.textContent=subTxt;
  rs.innerHTML='';
  [
    {k:'oi',   l:'Net OI',       pos:'OI rising — new contracts opened. Direction and composition unknown.',
                                  neg:'OI falling — positions closed or liquidated.',
                                  neu:'OI flat — no meaningful net change in open contracts.'},
    {k:'fr',   l:'Funding',      pos:'Funding neutral or negative — longs not paying a premium. Could indicate healthy conditions or short overcrowding.',
                                  neg:'Funding elevated positive — longs paying a premium. May indicate crowding OR active basis trade harvesting.',
                                  neu:'Funding within normal range — no strong signal either way.'},
    {k:'ls',   l:'Retail L/S',   pos:'More retail shorts visible — retail skewed short. Squeeze risk if price moves up.',
                                  neg:'More retail longs visible — retail skewed long. Stop-hunt risk if price moves down.',
                                  neu:'Retail positioning roughly balanced.'},
    {k:'cvd',  l:'CVD',          pos:'Net aggressive buying. Passive side unknown — may be absorption by larger player.',
                                  neg:'Net aggressive selling. Passive side unknown — may be accumulation by larger player.',
                                  neu:'Aggressive flow balanced — no clear initiator dominance.'},
    {k:'vwap', l:'OI/Vol proxy', pos:'OI below volume-weighted mean — proxy suggests mild discount.',
                                  neg:'OI above volume-weighted mean — proxy suggests mild premium.',
                                  neu:'OI near volume-weighted mean.'},
  ].forEach(r=>{
    if(SC[r.k]===null)return;
    const s=SC[r.k], dc=s>0.2?'var(--bull)':s<-0.2?'var(--bear)':'var(--neutral)';
    const desc=s>0.2?r.pos:s<-0.2?r.neg:r.neu;
    const row=document.createElement('div'); row.className='sig-r';
    row.innerHTML=`<div class="sig-dot" style="background:${dc}"></div><span style="color:var(--dim)">${r.l}:</span><span>${desc}</span>`;
    rs.appendChild(row);
  });
}

// ── FETCH ALL ─────────────────────────────────────────────────────────────────
async function fetchAll(){
  const key=document.getElementById('api-key').value.trim();
  if(!key){ lg('No API key entered.','err'); return; }
  const iv=document.getElementById('interval').value;
  const lim=document.getElementById('limit').value;
  setSt('live','FETCHING…');
  lg(`Fetch started — interval=${iv}s bars=${lim}`,'info');
  Object.keys(SC).forEach(k=>SC[k]=null);
  await Promise.allSettled([
    fetchOI(key,iv,lim), fetchFR(key,iv,lim), fetchLS(key,iv,lim),
    fetchCVD(key,iv,lim), fetchVWAP(key,iv,lim)
  ]);
  refreshBars();
  setSt('live','LIVE');
  lg('All indicators loaded. Composite signal computed.','ok');
}

// ── CLEAR ─────────────────────────────────────────────────────────────────────
function clearAll(){
  ['oi','fr','ls','cvd','vwap'].forEach(id=>{ dch(id+'-chart'); setPill(id+'-pill','–',''); });
  ['oi-cur','oi-d','oi-read','fr-cur','fr-avg','fr-read','ls-cur','ls-l','ls-s','ls-read',
   'cvd-b','cvd-s','cvd-read','vwap-price','vwap-val','vwap-dev','vwap-read'].forEach(id=>setEl(id,'–',''));
  Object.keys(SC).forEach(k=>SC[k]=null);
  ['oi','fr','ls','cvd','vwap','comp'].forEach(id=>{
    const b=document.getElementById('bar-'+id); if(b){b.style.width='50%';b.style.background='var(--neutral)';}
    const v=document.getElementById('val-'+id);  if(v){v.textContent='–';v.style.color='';}
  });
  document.getElementById('sig-hl').textContent='AWAITING DATA';
  document.getElementById('sig-hl').className='sig-hl neutral';
  document.getElementById('sig-sub').textContent='Fetch data to generate signal.';
  document.getElementById('sig-card').className='sig-card neutral';
  document.getElementById('sig-rs').innerHTML='';
  setSt('idle','IDLE');
  lg('Dashboard cleared.','info');
}
