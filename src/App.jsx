import {Fragment,lazy,Suspense,useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import { Move3d } from 'lucide-react';
const ThreeScene=lazy(()=>import('./Scene'));
const MonumentViewer=lazy(()=>import('./viewer/MonumentViewer'));
function Scene(props){return <Suspense fallback={<div className={'scene scene-loading '+(props.mode||'hall')} role='status'>Opening the 3D experience…</div>}><ThreeScene {...props}/></Suspense>;}
import Chatbot from './Chatbot.jsx';
import ClockTransition from './ClockTransition.jsx';
import LiquidCursor from './LiquidCursor.jsx';
import {Chakra,MandalaRing,JaaliTexture,Marker,toDevanagari} from './Ornaments.jsx';
import {monuments} from './data';
import './App.css';

const StaticMonumentView=lazy(()=>import('./viewer/StaticMonumentView'));
const storageKey='kaal-darpan-progress-v3';
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function loadProgress(){
  try{const data=JSON.parse(localStorage.getItem(storageKey));if(!data||typeof data!=='object')return {};return Object.fromEntries(monuments.map(m=>{const entry=data[m.id];return [m.id,{visited:entry?.visited===true,hotspots:Array.isArray(entry?.hotspots)?entry.hotspots.filter(id=>m.hotspots.some(h=>h.id===id)):[],score:Number.isInteger(entry?.score)?Math.max(0,Math.min(m.quiz.length,entry.score)):null}];}));}catch{return {};}
}
const Chars=({text,className='char'})=>[...text].map((c,i)=><span key={i} className={className} aria-hidden="true" style={{'--i':i,'--n':text.length}}>{c===' '?'\u00a0':c}</span>);
const Words=({text})=>text.split(' ').map((w,i)=><Fragment key={i}>{i>0&&' '}<span className="word-mask" aria-hidden="true"><span className="word">{w}</span></span></Fragment>);

function ThemeToggle({theme,onToggle,className=''}){
  const nextTheme=theme==='dark'?'light':'dark';
  return <button type="button" className={`theme-toggle ${className}`} aria-label={`Switch to ${nextTheme} mode`} aria-pressed={theme==='light'} onClick={onToggle}>
    <span aria-hidden="true">{theme==='dark'?'☼':'☾'}</span>{nextTheme} mode
  </button>;
}
function Entrance({onEnter,onJourney,onAbout,onToggleTheme,theme,visited}){
  const root=useRef(null);
  useEffect(()=>{
    if(reducedMotion())return;
    const ctx=gsap.context(()=>{
      // Only transform + opacity are animated (no filter/blur); the eyebrow moves as one element instead of ~35 glyphs.
      // will-change is applied through .is-animating and removed when the timeline completes.
      const el=root.current;el.classList.add('is-animating');
      gsap.timeline({defaults:{ease:'expo.out',force3D:true},onComplete:()=>el.classList.remove('is-animating')})
        .from('.cover-video',{opacity:0,duration:2,ease:'power2.out'},0)
        .from('.cover-dial',{opacity:0,duration:2},.1)
        .from('.cover-eyebrow',{opacity:0,y:10,duration:.9},.35)
        .from('.cover-title .char',{yPercent:115,opacity:0,duration:1.2,stagger:.05},.5)
        .from('.cover-deva .word',{yPercent:110,opacity:0,duration:1,stagger:.12},1)
        .from('.cover-tagline .word',{yPercent:110,opacity:0,duration:.8,stagger:.025},1.15)
        .from('.museum-entry',{opacity:0,y:18,duration:.9},1.5)
        .from('.cover-top,.cover-foot',{opacity:0,duration:1},1.6);
    },root);
    return()=>ctx.revert();
  },[]);
  return <main className="cover" ref={root}>
    <video className="cover-video" src="/qutub-minar.mp4" poster="/qutub-minar-poster.jpg" autoPlay muted loop playsInline preload="auto" aria-hidden="true"/>
    <div className="cover-veil" aria-hidden="true"/>
    <div className="cover-colorwash" aria-hidden="true"/>
    <div className="cover-jaali" aria-hidden="true"><JaaliTexture/></div>
    <div className="cover-grain" aria-hidden="true"/>
    <header className="cover-top">
      <span className="cover-brand">Kaal Darpan</span>
      <nav aria-label="Main navigation"><button onClick={onJourney}>Journey <span className="count">{visited}/3</span></button><button onClick={onAbout}>About</button><ThemeToggle theme={theme} onToggle={onToggleTheme}/></nav>
    </header>
    <section className="cover-content">
      <MandalaRing className="cover-dial"/>
      <p className="cover-eyebrow" aria-label="Indian Heritage, Immersive History"><Chars text="Indian Heritage ✦ Immersive History"/></p>
      <h1 className="cover-title" aria-label="Kaal Darpan"><Chars text="KAAL DARPAN"/></h1>
      <p className="cover-deva" lang="hi" aria-label="काल दर्पण"><Words text="काल दर्पण"/></p>
      <p className="cover-tagline" aria-label="Where history echoes in motion — step through the mirror of time and walk among monuments brought back to life."><Words text="Where history echoes in motion — step through the mirror of time and walk among monuments brought back to life."/></p>
      <button className="museum-entry" onClick={onEnter}><span className="entry-label">Enter the Museum</span><span className="entry-sub">Taj Mahal · Qutub Minar · Red Fort</span></button>
    </section>
    <footer className="cover-foot"><span>Kaal Darpan / {toDevanagari('001')}</span><span>Indian Knowledge Systems</span></footer>
  </main>;
}
function Quiz({monument,onComplete}){
  const [answers,setAnswers]=useState({}),[submitted,setSubmitted]=useState(false);
  const score=monument.quiz.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);
  return <div className="quiz"><p className="muted" data-reveal>Use what you discovered in the model and history panels.</p>{monument.quiz.map((q,i)=><fieldset key={i} className="quiz-card" data-reveal style={{'--d':i}}><legend><span className="quiz-num">{toDevanagari(i+1)}</span>{q.question}</legend>{q.options.map((option,j)=><label key={j} className={'answer '+(submitted&&j===q.answer?'correct':'')}><input type="radio" name={monument.id+'-'+i} checked={answers[i]===j} disabled={submitted} onChange={()=>setAnswers({...answers,[i]:j})}/>{option}</label>)}{submitted&&<p className="feedback">{answers[i]===q.answer?'✓ Correct.':'Review: '} {q.why}</p>}</fieldset>)}{submitted?<div className="quiz-result" role="status"><strong>{score} / {monument.quiz.length} correct</strong><p>Your best score has been saved.</p><button className="secondary" onClick={()=>{setAnswers({});setSubmitted(false);}}>Try again</button></div>:<button className="explore-button" data-reveal disabled={Object.keys(answers).length<monument.quiz.length} onClick={()=>{setSubmitted(true);onComplete(score);}}>CHECK ANSWERS →</button>}</div>;
}
function useScrollReveal(rootRef,deps){
  useEffect(()=>{
    const root=rootRef.current;if(!root)return;
    const items=[...root.querySelectorAll('[data-reveal]')];
    if(reducedMotion()||!('IntersectionObserver' in window)){items.forEach(el=>el.classList.add('is-in'));return;}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    items.forEach((el,i)=>{el.style.setProperty('--stagger',(i%6)*70+'ms');io.observe(el);});
    return()=>io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },deps);
}
export default function App(){
  const [page,setPage]=useState(()=>window.location.hash==='#gallery'?'hall':'home'),[selected,setSelected]=useState(null),[transition,setTransition]=useState(null),[modal,setModal]=useState(null),[tab,setTab]=useState('architecture'),[hotspot,setHotspot]=useState(null),[zoomRequest,setZoomRequest]=useState(0),[resetCount,setResetCount]=useState(0),[progress,setProgress]=useState(loadProgress),[storageNotice,setStorageNotice]=useState(false),[learningModelState,setLearningModelState]=useState({t:1,explode:false}),[visitorMode,setVisitorMode]=useState(false);
  const [theme,setTheme]=useState(()=>{
    try{return localStorage.getItem('kaal-darpan-theme')==='light'?'light':'dark';}
    catch(error){console.warn('Unable to load the saved appearance preference.',error);return 'dark';}
  });
  const mainRef=useRef(null),dialogRef=useRef(null),panelRef=useRef(null),textureRef=useRef(null);
  const monument=monuments.find(m=>m.id===selected);
  useEffect(()=>{if(window.location.hash==='#gallery')history.replaceState(null,'',window.location.pathname+window.location.search);},[]);
  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch{queueMicrotask(()=>setStorageNotice(true));}},[progress]);
  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    try{localStorage.setItem('kaal-darpan-theme',theme);}
    catch(error){console.warn('Unable to save the appearance preference.',error);}
  },[theme]);
  useEffect(()=>{mainRef.current?.focus({preventScroll:true});},[page,selected]);
  useEffect(()=>{
    if(!modal)return;const previouslyFocused=document.activeElement;const dialog=dialogRef.current;dialog?.showModal();
    const close=e=>{e.preventDefault();setModal(null);};dialog?.addEventListener('cancel',close);
    return ()=>{dialog?.removeEventListener('cancel',close);dialog?.close();previouslyFocused?.focus();};
  },[modal]);
  useScrollReveal(panelRef,[page,selected,tab,hotspot]);
  // While the clock overlay runs, pause continuous effects and drop backdrop blurs underneath it (see App.css).
  useEffect(()=>{
    document.documentElement.classList.toggle('is-transitioning',!!transition);
    return()=>document.documentElement.classList.remove('is-transitioning');
  },[transition]);
  // Warm the heavy lazy chunks (hall/monument Scene and the timeline viewer with three/r3f) once the cover has settled.
  useEffect(()=>{
    let idleId=0;const idleSupported='requestIdleCallback' in window;
    const warm=()=>Promise.all([import('./Scene'),import('./viewer/MonumentViewer')]).catch(error=>console.error('Unable to preload the museum experience.',error));
    const timer=setTimeout(()=>{idleId=idleSupported?requestIdleCallback(warm,{timeout:3000}):setTimeout(warm,300);},2600);
    return()=>{clearTimeout(timer);if(idleSupported)cancelIdleCallback(idleId);else clearTimeout(idleId);};
  },[]);
  useEffect(()=>{
    const el=panelRef.current,tex=textureRef.current;if(!el||!tex||reducedMotion())return;
    let idle=0;
    const onScroll=()=>{tex.style.willChange='transform';tex.style.transform=`translate3d(0,${-el.scrollTop*.25}px,0)`;clearTimeout(idle);idle=setTimeout(()=>{tex.style.willChange='';},200);};
    el.addEventListener('scroll',onScroll,{passive:true});return()=>{clearTimeout(idle);el.removeEventListener('scroll',onScroll);};
  },[page,selected]);
  function patch(id,change){setProgress(old=>({...old,[id]:{...old[id],...change(old[id]||{})}}));}
  function runTransition(label,action){
    if(transition)return;
    if(reducedMotion()){action();return;}
    setTransition({label,action,key:Date.now()});
  }
  // Opening a monument starts with its construction timeline; "Notes & quiz" continues to the learning page.
  function enter(id){
    const m=monuments.find(x=>x.id===id);
    runTransition(m.name,()=>{setSelected(id);setPage('timeline');setTab('architecture');setHotspot(null);setVisitorMode(false);setResetCount(0);patch(id,()=>({visited:true}));});
  }
  function openLearning(modelState){
    runTransition(monument.name,()=>{setLearningModelState(modelState);setPage('monument');setTab('architecture');setHotspot(null);setVisitorMode(false);setResetCount(0);});
  }
  const toggleTheme=()=>setTheme(value=>value==='dark'?'light':'dark');
  function openHotspot(id){setHotspot(id);setZoomRequest(value=>value+1);setTab('architecture');patch(selected,p=>({hotspots:[...new Set([...(p.hotspots||[]),id])]}));}
  const visited=monuments.filter(m=>progress[m.id]?.visited).length;
  const tabs=['architecture','history','challenge'];
  return <>
    {page==='home'&&<Entrance theme={theme} onToggleTheme={()=>setTheme(value=>value==='dark'?'light':'dark')} visited={visited} onJourney={()=>setModal('progress')} onAbout={()=>setModal('about')} onEnter={()=>runTransition('The Heritage Hall',()=>setPage('hall'))}/>}
    {page==='hall'&&<main className="hall-page" ref={mainRef} tabIndex={-1}>
      <ThemeToggle theme={theme} onToggle={()=>setTheme(value=>value==='dark'?'light':'dark')} className="theme-toggle-floating"/>
      <Scene theme={theme} onSelect={enter}/>
      <header className="hall-heading">
        <button className="hall-brand" onClick={()=>setPage('home')}>Kaal Darpan</button>
        <h1>The Heritage Hall</h1>
        <p>Drag to look around · WASD / arrow keys to walk · Click a monument to step into its timeline</p>
      </header>
      <nav className="hall-index" aria-label="Monuments">
        <ol>{monuments.map((m,i)=><li key={m.id}><button onClick={()=>enter(m.id)}><span className="idx">0{i+1}</span><span className="nm">{m.name}</span>{progress[m.id]?.visited&&<span className="seen" aria-label="visited">✦</span>}</button></li>)}</ol>
      </nav>
    </main>}
    {page==='timeline'&&monument&&<Suspense fallback={<div className="scene scene-loading timeline-loading" role="status">Opening the timeline…</div>}><MonumentViewer monumentId={monument.viewerId||monument.id} onBack={()=>setPage('hall')} onLearn={openLearning} onToggleTheme={toggleTheme}/></Suspense>}
    {page==='monument'&&monument&&<main className="monument-page" ref={mainRef} tabIndex={-1}>
      <div className="monument-stage"><Suspense fallback={<div className="scene scene-loading" role="status">Opening the monument model…</div>}><StaticMonumentView key={monument.id} monumentId={monument.viewerId||monument.id} initial={learningModelState} hotspots={monument.hotspots} activeHotspot={hotspot} onHotspot={openHotspot} zoomRequest={zoomRequest} resetCount={resetCount} visitorMode={visitorMode}/></Suspense>
        <button type="button" className={'visitor-mode-toggle '+(visitorMode?'is-active':'')} aria-pressed={visitorMode} onClick={()=>setVisitorMode(value=>!value)}>
          <Move3d size={16}/>{visitorMode?'Exit visitor mode':'Visitor mode'}
        </button>
        {visitorMode&&<span className="visitor-mode-hint">Click the model · drag to look · WASD to walk</span>}
        <div className="model-caption"><span>Interactive scale model (simplified)</span><span>{toDevanagari(progress[selected]?.hotspots?.length||0)} / {toDevanagari(monument.hotspots.length)} features explored</span></div>
      </div>
      <div className="monument-sidebar">
        <div className="sidebar-header">
          <div className="detail-title"><div className="eyebrow">{monument.location} / {monument.period}</div><h1>{monument.name}</h1></div>
        </div>
        <div className="sidebar-nav">
          <button className="secondary" onClick={()=>setPage('hall')}>← MUSEUM</button>
          <button className="secondary" onClick={()=>setPage('timeline')}>TIMELINE</button>
          <button className="secondary" onClick={()=>{setVisitorMode(false);setResetCount(n=>n+1);}}>RESET VIEW</button>
          <ThemeToggle theme={theme} onToggle={()=>setTheme(value=>value==='dark'?'light':'dark')}/>
        </div>
      </div>
      <div className="exploration">
        <aside className="learning-panel">
          <div className="panel-tabs" role="tablist" aria-label="Learning panels" aria-orientation="vertical">{tabs.map((t,i)=><button key={t} id={'tab-'+t} role="tab" aria-selected={tab===t} aria-controls="learning-content" onClick={()=>setTab(t)}><span className="rail-num">{toDevanagari(i+1)}</span><span className="rail-label">{t}</span></button>)}</div>
          <div className="panel-scroll" ref={panelRef}>
            <div className="panel-texture" ref={textureRef}><JaaliTexture/></div>
            <div className="panel-body" id="learning-content" role="tabpanel" aria-labelledby={'tab-'+tab} key={tab}>
              <div className="panel-chakra" aria-hidden="true"><Chakra/></div>
              <div className="panel-content">
              {tab==='architecture'&&<><div className="eyebrow" data-reveal>Field notes</div><h2 data-reveal>{hotspot?monument.hotspots.find(h=>h.id===hotspot).title:'Look closer.'}</h2><hr className="gold-rule" data-reveal/><p className="field-note" data-reveal>{hotspot?monument.hotspots.find(h=>h.id===hotspot).text:'Select a glowing marker or an architectural part in the scene. Each feature opens a story about the building.'}</p><div className="feature-list">{monument.hotspots.map((h,i)=><button key={h.id} data-reveal className={hotspot===h.id?'selected':''} onClick={()=>openHotspot(h.id)}><span className="feature-number">{toDevanagari(i+1)}</span>{h.title}<span className="feature-check">{progress[selected]?.hotspots?.includes(h.id)?'✓':'↗'}</span></button>)}</div><p className="muted small" data-reveal>Note: This model is a simplified representation. For the detailed construction timeline with phased building stages, use the Timeline view.</p></>}
              {tab==='history'&&<><div className="eyebrow" data-reveal>People · Place · Time</div><h2 data-reveal>A place in history.</h2><hr className="gold-rule" data-reveal/><p data-reveal>{monument.summary}</p><ol className="timeline">{monument.timeline.map(([year,text],i)=><li key={year} data-reveal><span className="tl-marker"><Marker/><span>{toDevanagari(i+1)}</span></span><strong>{year}</strong><p>{text}</p></li>)}</ol></>}
              {tab==='challenge'&&<><div className="eyebrow" data-reveal>Your learning challenge</div><h2 data-reveal>What did you discover?</h2><hr className="gold-rule" data-reveal/><Quiz key={monument.id} monument={monument} onComplete={score=>patch(selected,p=>({score:Math.max(p.score??0,score)}))}/></>}
              <a className="source-link" data-reveal href={monument.source} target="_blank" rel="noreferrer">Historical reference: UNESCO ↗</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>}
    {storageNotice&&<p className="storage-notice" role="status">This browser is blocking saved progress. Your journey is available for this session.</p>}
    {transition&&<ClockTransition key={transition.key} label={transition.label} onMidpoint={transition.action} onDone={()=>setTransition(null)}/>}
    {modal&&<dialog className="modal" ref={dialogRef}><button className="close-button" onClick={()=>setModal(null)} aria-label="Close">×</button>{modal==='progress'?<><div className="eyebrow">YOUR HERITAGE JOURNEY</div><h2>{visited} of 3 monuments visited.</h2><p className="muted">Saved on this browser and device.</p>{monuments.map(m=><div className="journey-row" key={m.id}><div><strong>{m.name}</strong><p>{progress[m.id]?.visited?'Visited':'Not yet visited'} · {progress[m.id]?.hotspots?.length||0}/{m.hotspots.length} features</p></div><span>{progress[m.id]?.score!=null?progress[m.id].score+'/'+m.quiz.length+' correct':'Quiz pending'}</span></div>)}{storageNotice&&<p>Saving is blocked by your browser settings.</p>}</>:<><div className="eyebrow">ABOUT KAAL DARPAN</div><h2>History you can explore.</h2><p>Enter a museum of Indian heritage, choose a miniature and explore architectural form through 3D models, contextual notes, timelines and learning activities.</p><p>This first development stage uses simplified models. Detailed monument assets, walking through interiors, QR access, accounts and AR are future stages.</p></>}</dialog>}
    <Chatbot/>
    <LiquidCursor/>
  </>;
}
