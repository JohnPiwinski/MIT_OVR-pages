/* Draw the group orbit of one marked point and play a selected group action. */
(function(){
  const NS='http://www.w3.org/2000/svg';
  function apply(m,p){return [m[0]*p[0]+m[1]*p[1]+m[4],m[2]*p[0]+m[3]*p[1]+m[5]]}
  function label(m){
    const [a,b,d,e,x,y]=m,det=a*e-b*d;
    if(det<0){const gx=(a+1)*x+b*y,gy=d*x+(e+1)*y;return Math.hypot(gx,gy)<.01?'Reflection':'Glide reflection'}
    if(Math.abs(a-1)+Math.abs(e-1)+Math.abs(b)+Math.abs(d)<.001)return Math.hypot(x,y)<.01?'Identity':`Translation (${x.toFixed(1)}, ${y.toFixed(1)})`;
    return `Rotation ${(Math.atan2(d,a)*180/Math.PI+360)%360 < 180 ? Math.round((Math.atan2(d,a)*180/Math.PI+360)%360) : Math.round((Math.atan2(d,a)*180/Math.PI+360)%360-360)}°`;
  }
  function svgMatrix(m){return `matrix(${m[0]} ${m[2]} ${m[1]} ${m[3]} ${m[4]} ${m[5]})`}
  function animateMatrix(m,t){
    const [a,b,d,e,x,y]=m,det=a*e-b*d;
    if(det>0){
      const angle=Math.atan2(d,a),den=(1-a)*(1-e)-b*d;
      if(Math.abs(angle)>.00001 && Math.abs(den)>1e-9){const cx=((1-e)*x+b*y)/den,cy=(d*x+(1-a)*y)/den;return `translate(${cx} ${cy}) rotate(${angle*t*180/Math.PI}) translate(${-cx} ${-cy})`}
      return `translate(${x*t} ${y*t})`;
    }
    return svgMatrix([1+(a-1)*t,b*t,d*t,1+(e-1)*t,x*t,y*t]);
  }
  function element(name,attrs){const e=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e}
  window.installOrbit=function({canvas,data,copies,pattern,showImmediately=false}){
    const toggle=document.querySelector('#orbit-toggle');if(!toggle)return;
    const panel=document.querySelector('#orbit-options'),choice=document.querySelector('#orbit-choice'),play=document.querySelector('#orbit-play'),message=document.querySelector('#orbit-message'),build=document.querySelector('#build-tiling');
    const seed=data.orbitSeed,oldView=canvas.getAttribute('viewBox');let running=0,assemblyFrame=0,assembly=null,groups=[],selected=null;
    if(!seed){toggle.hidden=true;return}
    const background=element('g',{opacity:'0','pointer-events':'none'}),layer=element('g',{'aria-label':'Orbit points'}),motion=element('g',{opacity:'0'});
    const scale=Math.max(Math.hypot(...data.lattice.a),Math.hypot(...data.lattice.b)),radius=scale*1.65,center=data.domainCenter||seed;
    const colors=['#6eaaa0','#d99271','#d5b978','#b8a0b9','#7493ad','#c17d91'];
    const nearby=copies.map((m,i)=>({m,i,p:apply(m,center)})).filter(({p})=>Math.abs(p[0]-seed[0])<radius+scale&&Math.abs(p[1]-seed[1])<radius+scale);
    for(const {m,i} of nearby){
      const color=window.DOMAIN_COLORS?.[pattern]?.[i]??i;
      const tile=element('path',{d:data.source,transform:svgMatrix(m),fill:colors[color%colors.length],'fill-opacity':'.7',stroke:'#655749','stroke-width':'1','fill-rule':'evenodd'});
      motion.append(tile);
      background.append(element('path',{d:data.source,transform:svgMatrix(m),fill:'#d4c7ae','fill-opacity':'.22',stroke:'#a99c87','stroke-width':'1','fill-rule':'evenodd'}));
    }
    motion.append(element('circle',{cx:seed[0],cy:seed[1],r:'5',fill:'#b73341',stroke:'white','stroke-width':'1.5'}));
    canvas.append(background,motion,layer);
    function clearAssembly(){cancelAnimationFrame(assemblyFrame);assembly?.remove();assembly=null;build.setAttribute('aria-pressed','false');build.textContent='Build the tiling'}
    function reset(){cancelAnimationFrame(running);background.setAttribute('opacity','0');motion.setAttribute('opacity','0');layer.replaceChildren();panel.hidden=true;selected=null;canvas.setAttribute('viewBox',oldView)}
    build.onclick=()=>{
      const on=build.getAttribute('aria-pressed')!=='true';clearAssembly();reset();toggle.setAttribute('aria-pressed','false');toggle.textContent='Show orbit points';
      if(!on){message.textContent='';return}
      build.setAttribute('aria-pressed','true');build.textContent='Clear tiling';
      const scale=Math.max(Math.hypot(...data.lattice.a),Math.hypot(...data.lattice.b)),radius=scale*1.65;
      canvas.setAttribute('viewBox',`${seed[0]-radius} ${seed[1]-radius} ${2*radius} ${2*radius}`);
      const center=data.domainCenter||seed,visible=copies.map((m,i)=>({m,color:window.DOMAIN_COLORS?.[pattern]?.[i]??0,p:apply(m,center)})).filter(({p})=>Math.abs(p[0]-seed[0])<radius+scale&&Math.abs(p[1]-seed[1])<radius+scale).sort((a,b)=>Math.hypot(a.p[0]-seed[0],a.p[1]-seed[1])-Math.hypot(b.p[0]-seed[0],b.p[1]-seed[1]));
      const colors=['#6eaaa0','#d99271','#d5b978','#b8a0b9','#7493ad','#c17d91'];assembly=element('g',{'pointer-events':'none','aria-label':'Copies of the fundamental domain'});
      const paths=visible.map(({m,color})=>{const p=element('path',{d:data.source,transform:svgMatrix(m),fill:colors[color%colors.length],'fill-opacity':'.65',stroke:'#655749','stroke-width':'1','fill-rule':'evenodd',opacity:'0'});assembly.append(p);return p});
      canvas.insertBefore(assembly,background);const start=performance.now();
      let completed=0;
      function tick(now){
        if(!assembly||!assembly.isConnected)return;
        const elapsed=now-start,spacing=paths.length>1?3000/(paths.length-1):0,duration=600;
        const last=Math.min(paths.length-1,spacing?Math.floor(elapsed/spacing):0);
        for(let i=completed;i<=last;i++){
          const t=Math.min(1,Math.max(0,(elapsed-i*spacing)/duration));
          paths[i].setAttribute('opacity','1');
          paths[i].setAttribute('transform',t===1?svgMatrix(visible[i].m):animateMatrix(visible[i].m,t));
        }
        while(completed<paths.length&&elapsed-completed*spacing>=duration)completed++;
        const done=completed===paths.length;
        message.textContent=done?'The visible copies have been placed.':'Applying group operations to place copies…';
        if(!done)assemblyFrame=requestAnimationFrame(tick);
      }
      assemblyFrame=requestAnimationFrame(tick);
    };
    function playMatrix(m){cancelAnimationFrame(running);motion.setAttribute('opacity','1');const start=performance.now();function tick(now){const t=Math.min(1,(now-start)/1800);motion.setAttribute('transform',animateMatrix(m,t));message.textContent=t===1?`The whole lattice copy has moved by ${label(m).toLowerCase()}; the red point now sits at the chosen orbit point.`:`Moving the whole lattice copy by ${label(m).toLowerCase()}…`;if(t<1)running=requestAnimationFrame(tick)}running=requestAnimationFrame(tick)}
    function pick(group){selected=group;choice.replaceChildren();group.matrices.forEach((m,i)=>{const o=document.createElement('option');o.value=i;o.textContent=label(m)+(group.matrices.filter(v=>label(v)===label(m)).length>1?` ${i+1}`:'');choice.append(o)});panel.hidden=false;message.textContent=group.matrices.length>1?`${group.matrices.length} symmetries send the starting point here. Choose one and press play.`:`One symmetry sends the starting point here.`;if(group.matrices.length===1)playMatrix(group.matrices[0])}
    play.onclick=()=>{if(selected)playMatrix(selected.matrices[Number(choice.value)])};
    toggle.onclick=()=>{
      const on=toggle.getAttribute('aria-pressed')!=='true';clearAssembly();toggle.setAttribute('aria-pressed',String(on));toggle.textContent=on?'Hide orbit points':'Show orbit points';reset();if(!on)return;
      canvas.setAttribute('viewBox',`${seed[0]-radius} ${seed[1]-radius} ${2*radius} ${2*radius}`);
      background.setAttribute('opacity','1');
      groups=[];for(const m of copies){const p=apply(m,seed);if(Math.abs(p[0]-seed[0])>radius||Math.abs(p[1]-seed[1])>radius)continue;let group=groups.find(g=>Math.hypot(g.point[0]-p[0],g.point[1]-p[1])<.005);if(!group){group={point:p,matrices:[]};groups.push(group)}group.matrices.push(m)}
      for(const group of groups){const start=Math.hypot(group.point[0]-seed[0],group.point[1]-seed[1])<.005;const c=element('circle',{cx:group.point[0],cy:group.point[1],r:Math.max(6,scale*.045),fill:start?'#b73341':'#305f72',stroke:'white','stroke-width':'2',tabindex:'0',role:'button','aria-label':`${start?'Starting':'Orbit'} point: ${group.matrices.length} symmetries`});c.style.cursor='pointer';c.addEventListener('click',()=>pick(group));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(group)}});layer.append(c)}
      message.textContent='Red marks the starting point. Select a blue orbit point to play a symmetry.';
    };
    if(showImmediately)toggle.click();
  };
})();
