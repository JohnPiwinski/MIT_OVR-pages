const qs=s=>document.querySelector(s), canvas=qs('#canvas'),targetCanvas=qs('#target-canvas');
let data=window.HIPPO_EXERCISE,pattern='hippo',stage=2,frame=0,copies=[];
let boardMode=false,selectedGroup='',dragGroup='';const boardAnswers={};
const provisionalNames={3:['Three-way interlock','C₃'],4:['Four-way stars','C₄'],5:['Six-way pinwheels','C₆'],7:['Angular strips','D₁'],10:['Herringbone','D₂'],14:['Square stars','D₄'],15:['Hexagonal tiles','D₃'],17:['Circular rosettes','D₆']};
for(const [id,[name]] of Object.entries(provisionalNames)){const b=document.createElement('button');b.id=`pick-p${id}`;b.textContent=`${String(id).padStart(2,'0')} · ${name} (draft)`;b.setAttribute('aria-pressed','false');qs('.pattern-pick').append(b)}
for(const button of [...qs('.pattern-pick').children].sort((a,b)=>parseInt(a.textContent)-parseInt(b.textContent)))qs('.pattern-pick').append(button);
const palette=['#6eaaa0','#d99271','#b8a0b9','#d5b978'];
const groupPalette=['#4c8b83','#cc7756','#9877a8','#c5a44a','#5b789e','#b86f87','#8c9b57','#bc8c59','#658c9c','#a77965','#9c87b8','#7aa477'];
const config=[
 ['a','Area of a tile','Use the detected tile and its symmetry model to estimate its area.'],
 ['b','Two noncongruent domains','Compare two domains for the same pattern and explore the orbit of a point.'],
 ['c','Cut and reassemble','Compare both colored domain tilings, then move the intersection pieces.'],
 ['d','Area and the point group','Connect the area of the translation cell to the number of point-group elements.']
];
function isGroupMatch(){return pattern!=='hippo'&&pattern!=='fleur'}
const matchRecords={
 2:['zigzag',()=>window.ZIGZAG_EXERCISE],3:['p3',()=>window.PROVISIONAL_EXERCISES[3]],4:['p4',()=>window.PROVISIONAL_EXERCISES[4]],5:['p5',()=>window.PROVISIONAL_EXERCISES[5]],
 6:['strips',()=>window.STRIPS_EXERCISE],7:['p7',()=>window.PROVISIONAL_EXERCISES[7]],8:['scales',()=>window.SCALES_EXERCISE],9:['diamond',()=>window.DIAMOND_EXERCISE],
 10:['p10',()=>window.PROVISIONAL_EXERCISES[10]],11:['bands',()=>window.BANDS_EXERCISE],12:['brick',()=>window.BRICK_EXERCISE],13:['circles',()=>window.CIRCLES_EXERCISE],
 14:['p14',()=>window.PROVISIONAL_EXERCISES[14]],15:['p15',()=>window.PROVISIONAL_EXERCISES[15]],17:['p17',()=>window.PROVISIONAL_EXERCISES[17]]
};
const pointGroups=['C₂','C₃','C₄','C₆','D₁','D₂','D₃','D₄','D₆'];
function thumbnailArt(id,record){
 const previousData=data,previousPattern=pattern,previousCopies=copies;data=record;pattern=matchRecords[id][0];copies=copyMatrices();
 const source=window.SOURCE_CONTOURS[record.sourcePattern],view=source?[0,0,source.width,source.height]:record.bounds;
 const art=patternArt(`board-${id}`);data=previousData;pattern=previousPattern;copies=previousCopies;
 return `<svg viewBox="${view.join(' ')}" role="img" aria-label="Vector drawing of ${window.PATTERNS[id-1].name} with its fundamental domain outlined"><rect x="${view[0]}" y="${view[1]}" width="${view[2]}" height="${view[3]}" fill="#fffaf1"/>${art}<path d="${record.source}" fill="#e0bd6640" stroke="#a86838" stroke-width="2.4" stroke-dasharray="5 3" stroke-linejoin="round" fill-rule="evenodd" vector-effect="non-scaling-stroke"/></svg>`;
}
function showMatchingBoard(){
 boardMode=true;qs('#matching-board').hidden=false;qs('.assignment-shell').hidden=true;
 const tray=qs('.group-tray'),grid=qs('#pattern-board-grid');tray.replaceChildren();grid.replaceChildren();selectedGroup='';dragGroup='';qs('#board-feedback').textContent='';
 for(const group of pointGroups){const chip=document.createElement('button');chip.className='group-chip';chip.type='button';chip.draggable=true;chip.textContent=group;chip.dataset.group=group;chip.setAttribute('aria-pressed','false');chip.setAttribute('aria-label',`Drag or select point group ${group}`);chip.addEventListener('dragstart',()=>{dragGroup=group});chip.addEventListener('click',()=>{selectedGroup=selectedGroup===group?'':group;tray.querySelectorAll('.group-chip').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===selectedGroup)));qs('#board-feedback').textContent=selectedGroup?`${selectedGroup} selected. Click a pattern’s answer slot to place it.`:''});tray.append(chip)}
 for(const id of Object.keys(matchRecords).map(Number).sort((a,b)=>a-b)){
  const [name,getRecord]=matchRecords[id],record=getRecord(),meta=window.PATTERNS[id-1],card=document.createElement('article');card.className='pattern-card';card.dataset.patternId=id;
  card.innerHTML=`<div class="pattern-id">ARTIN FIG. 6.6.2 · ${String(id).padStart(2,'0')}</div><h3>${meta.name}</h3>${thumbnailArt(id,record)}<button class="drop-slot" type="button" aria-label="Drop a point group for ${meta.name}">${boardAnswers[id]||'Drop group here'}</button><div class="card-controls"><span class="card-result" aria-live="polite"></span><button class="explore-pattern" type="button">Explore ↗</button></div>`;
  if(boardAnswers[id])card.dataset.answer=boardAnswers[id];
  const slot=card.querySelector('.drop-slot');slot.addEventListener('dragover',e=>{e.preventDefault();slot.classList.add('drag-over')});slot.addEventListener('dragleave',()=>slot.classList.remove('drag-over'));slot.addEventListener('drop',e=>{e.preventDefault();slot.classList.remove('drag-over');assignGroup(card,dragGroup)});slot.addEventListener('click',()=>{if(selectedGroup)assignGroup(card,selectedGroup)});
  card.querySelector('.explore-pattern').addEventListener('click',()=>{boardMode=false;selectPattern(name,record)});grid.append(card);
 }
}
function assignGroup(card,group){if(!group)return;const id=Number(card.dataset.patternId);boardAnswers[id]=group;card.dataset.answer=group;card.classList.remove('correct','incorrect');card.querySelector('.drop-slot').textContent=group;card.querySelector('.card-result').textContent='';qs('#board-feedback').textContent=`Placed ${group} on ${window.PATTERNS[id-1].name}.`}
function expectedPointGroup(){const id=data.sourcePattern||({hippo:1,fleur:16})[pattern];return window.PATTERNS?.[id-1]?.pointGroup}
function matrix(m){return `matrix(${m[0]} ${m[2]} ${m[1]} ${m[3]} ${m[4]} ${m[5]})`}
function copyMatrices(){if(data.groupCopies)return data.groupCopies;const r=[];for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)r.push([1,0,0,1,i*data.lattice.a[0]+j*data.lattice.b[0],i*data.lattice.a[1]+j*data.lattice.b[1]]);return r}
function svgPath(path,fill,stroke='#534a3e'){return `<path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" fill-rule="evenodd"/>`}
function cellPolygon(){const p=data.orbitSeed,a=data.lattice.a,b=data.lattice.b;return [p,[p[0]+a[0],p[1]+a[1]],[p[0]+a[0]+b[0],p[1]+a[1]+b[1]],[p[0]+b[0],p[1]+b[1]]]}
function manualTileArt(key){
 const path=data.modelTilePath,seed=`manual-tile-${key}`;
 const pairs=[...path.matchAll(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 if(pairs.length<3)return '';
 const [ux,uy]=data.lattice.a,[vx,vy]=data.lattice.b,det=ux*vy-uy*vx;
 const center=pairs.reduce((p,q)=>[p[0]+q[0]/pairs.length,p[1]+q[1]/pairs.length],[0,0]);
 const colors=['#6eaaa0','#d99271','#b8a0b9','#d5b978'];
 const seen=new Set(),tiles=[];
 for(const m of copies){
  const [a,b,d,e,x,y]=m,transformed=pairs.map(([px,py])=>[a*px+b*py+x,d*px+e*py+y]);
  const shapeKey=transformed.map(p=>p.map(n=>n.toFixed(2)).join(',')).sort().join(';');
  if(seen.has(shapeKey))continue;seen.add(shapeKey);
  const cx=a*center[0]+b*center[1]+x,cy=d*center[0]+e*center[1]+y,dx=cx-data.orbitSeed[0],dy=cy-data.orbitSeed[1];
  const i=Math.round((dx*vy-dy*vx)/det),j=Math.round((ux*dy-uy*dx)/det);
  const hue=data.symmetry==='p3'||data.symmetry==='p6'||data.symmetry==='p3m1'||data.symmetry==='p6m'?((i-j)%3+3)%3:((i+j)%2+2)%2;
  tiles.push(`<use href="#${seed}" transform="${matrix(m)}" fill="${colors[hue]}" stroke="#514b43" stroke-width="1.1" stroke-linejoin="round"/>`);
 }
 return `<defs><path id="${seed}" d="${path}" fill-rule="evenodd"/></defs>${tiles.join('')}`;
}
function patternArt(key){if(data.tileExtracted&&data.modelTilePath)return manualTileArt(key);if(data.patternFragmentPath){const seed=`fragment-${key}`;return `<defs><path id="${seed}" d="${data.patternFragmentPath}" fill="#514b43" fill-rule="evenodd"/></defs>${copies.map(m=>`<use href="#${seed}" transform="${matrix(m)}"/>`).join('')}`}const inkId=data.seedInkId||data.sourcePattern,contour=window.SOURCE_CONTOURS[inkId];if(!contour)return data.artwork||'';const clip=`clip-${key}`,seed=`seed-${key}`,ink=contour.ink;return `<defs><clipPath id="${clip}"><path d="${data.source}"/></clipPath><g id="${seed}" clip-path="url(#${clip})"><path d="${ink}" fill="#514b43" fill-rule="evenodd"/></g></defs>${copies.map(m=>`<use href="#${seed}" transform="${matrix(m)}"/>`).join('')}`}
function setSvg(svg,view,content){svg.setAttribute('viewBox',view.join(' '));svg.innerHTML=content}
function animation(piece,t){
 if(!piece.matrix)return `translate(${piece.to[0]*t} ${piece.to[1]*t})`;
 const [a,b,d,e,x,y]=piece.matrix,det=a*e-b*d;
 if(det>0){const angle=Math.atan2(d,a),den=(1-a)*(1-e)-b*d;if(Math.abs(angle)>.00001&&Math.abs(den)>1e-9){const cx=((1-e)*x+b*y)/den,cy=(d*x+(1-a)*y)/den;return `translate(${cx} ${cy}) rotate(${angle*t*180/Math.PI}) translate(${-cx} ${-cy})`}return `translate(${x*t} ${y*t})`}
 return matrix([1+(a-1)*t,b*t,d*t,1+(e-1)*t,x*t,y*t]);
}
function updateProgress(){const t=Number(qs('#progress').value)/100;qs('#percent').value=`${Math.round(100*t)}%`;canvas.querySelectorAll('.piece').forEach((p,i)=>p.setAttribute('transform',animation(data.pieces[i],t)));qs('#caption').textContent=pattern==='hippo'?(t===0?'The rounded lobe is cut from the right side of D.':t===1?'The lobe has moved by a lattice translation to the left side, forming D′.':'The rounded lobe moves to the other side by a lattice translation.'):(t===0?'The pieces fill D. The dashed boundary is D′.':t===1?'The pieces now fill D′.':'Each piece moves by its associated symmetry.')}
function render(){
 cancelAnimationFrame(frame);copies=copyMatrices();
 const groupMatch=isGroupMatch();if(groupMatch)stage=1;else if(stage<2)stage=2;
 qs('#matching-board').hidden=!boardMode;qs('.assignment-shell').hidden=boardMode;
 qs('#back-to-board').hidden=boardMode||!groupMatch;
 const collectionId=data.sourcePattern||({hippo:1,zigzag:2,strips:6,scales:8,diamond:9,bands:11,brick:12,circles:13,fleur:16})[pattern];
 qs('header a').href=`../index.html?pattern=${collectionId}`;
 for(const id of ['#tile-feedback','#congruence-feedback','#order-feedback'])qs(id).textContent='';
 qs('#tile-answer').value='';qs('#order-answer').value='';qs('#formula').hidden=true;
 qs('#area-input-label').textContent=data.provisional&&!data.tileExtracted?'Candidate domain area in square pixels':'Estimated tile area in square pixels';
 for(const b of document.querySelectorAll('.pattern-pick button'))b.setAttribute('aria-pressed',String(b.id===`pick-${pattern}`));
 qs('#pattern-tag').textContent=groupMatch?'Identify the point group':data.provisional?`${provisionalNames[data.sourcePattern][0]} · ${provisionalNames[data.sourcePattern][1]} (draft)`:{hippo:'Hippo · C₁',zigzag:'Zigzag interlock · C₂',strips:'Pointed strips · D₁',scales:'Scalloped scales · D₁',diamond:'Diamonds · D₂',bands:'Wavy bands · D₂',brick:'Brick wall · D₂',circles:'Overlapping circles · D₄',fleur:'Fleur-de-lis · D₃'}[pattern];
 const fitNote=data.scanFit?` Raster edge match: ${Math.round(data.scanFit.f1*100)}% within 2.5 px.`:data.rosetteFit?` Circle lattice fit: ${data.rosetteFit.rms.toFixed(1)} px RMS.`:'';
 qs('#pattern-note').textContent=data.provisional?`${data.domainConstruction||'The group origin and artwork are estimated.'}${fitNote} The group fit and tile area still need confirmation against the scan.`:{hippo:'A smoothed, scan-derived domain with a measured translation lattice.',zigzag:'A scan-derived zigzag pattern generated by half-turns and translations.',strips:'An extracted curved strip edge, completed using mirror and translation symmetry.',scales:'A staggered scallop pattern regenerated from scan-extracted edges.',diamond:'A scan-measured diamond pattern. The second domain has two separated pieces.',bands:'Scan-derived bands with mirror, half-turn, and glide symmetries.',brick:'An idealized running-bond wall measured from the source; the domain is a quarter brick.',circles:'A square-lattice domain generated from scan-extracted circular edges. The second domain is disconnected.',fleur:'A scan-extracted half-fleur, corrected to an estimated D₃ symmetry model.'}[pattern];
 if(data.tileExtracted)qs('#pattern-note').textContent=`The tile outline was manually cleaned from the scan. Domain choice: ${data.domainConstruction||'provisional model'}.${fitNote} Group placement still needs scan confirmation.`;
 if(groupMatch)qs('#pattern-note').textContent='Match the pattern to its point group, then click an orbit point to explore a rotation, reflection, or glide.';
 qs('#stage-label').textContent=groupMatch?'SYMMETRY LIBRARY · IDENTIFY':`ARTIN M.5 · PART (${config[stage][0]})`;qs('#stage-title').textContent=groupMatch?'Match the point group':config[stage][1];qs('#stage-intro').textContent=groupMatch?'Choose the point group, then inspect the orbit of a point to see the symmetry operations in action.':config[stage][2];
 if(stage===0&&data.provisional&&!data.tileExtracted){qs('#stage-title').textContent='Candidate domain area';qs('#stage-intro').textContent='This draft does not yet have a verified visible-tile boundary. Explore its candidate domain instead.'}
 qs('#stage-count').textContent=groupMatch?'Pattern matching':`Stage ${stage-1} of 2`;qs('#previous').disabled=groupMatch||stage===2;qs('#next').disabled=groupMatch||stage===3;
 qs('#stages').hidden=groupMatch;document.querySelector('.stage-nav').hidden=groupMatch;
 document.querySelectorAll('#stages button').forEach((b,i)=>b.setAttribute('aria-current',i===stage?'step':'false'));
 document.querySelectorAll('#stages button[data-stage="0"],#stages button[data-stage="1"]').forEach(b=>b.hidden=!groupMatch);
 for(const [i,id] of ['#stage-a','#stage-b','#stage-c','#stage-d'].entries())qs(id).hidden=stage!==i;
 qs('#domain-compare').hidden=groupMatch;qs('#match-mode').hidden=!groupMatch;qs('#build-panel').hidden=groupMatch;qs('#group-choice').value='';qs('#match-feedback').textContent='';qs('#orbit-instructions').textContent=groupMatch?'Click a point to move a copy of the whole lattice there.':'Click an orbit point to play a symmetry on a whole lattice copy.';
 qs('#target-box').hidden=groupMatch||stage!==1;qs('#orbit-toggle').setAttribute('aria-pressed','false');qs('#orbit-toggle').textContent='Show orbit points';qs('#build-tiling').setAttribute('aria-pressed','false');qs('#build-tiling').textContent='Build the tiling';qs('#orbit-options').hidden=true;qs('#orbit-message').textContent='';
 qs('#progress').value=0;qs('#overlay').setAttribute('aria-pressed','true');qs('#overlay').textContent='Hide both tilings';
 if(stage===0){const tile=data.modelTilePath || (data.extraction?data.extraction.modelTilePath:data.source);setSvg(canvas,data.tileBounds||data.bounds,`<g opacity=".22">${patternArt('tile')}</g>${svgPath(tile,'#77aea4')}`);qs('#tile-info').textContent=data.visibleTile.explanation;}
 if(groupMatch){const source=window.SOURCE_CONTOURS[data.sourcePattern],view=source?[0,0,source.width,source.height]:data.bounds;setSvg(canvas,view,`<rect x="${view[0]}" y="${view[1]}" width="${view[2]}" height="${view[3]}" fill="#fffaf1"/>${patternArt('match')}`);window.installOrbit({canvas,data,copies,pattern,showImmediately:true});qs('#orbit-instructions').textContent='Click a blue point to move a whole lattice copy by a rotation, reflection, or glide.'}
 else if(stage===1){setSvg(canvas,data.bounds,`${patternArt('a')}${svgPath(data.source,'#77aea4')}`);setSvg(targetCanvas,data.bounds,`${patternArt('b')}${svgPath(data.target,'#d99271')}`);window.installOrbit({canvas,data,copies,pattern})}
 if(stage===2){const original=copies.map(m=>`<path d="${data.source}" transform="${matrix(m)}" fill="#478e96" fill-opacity=".12" stroke="#34717b" stroke-width="1.3" fill-rule="evenodd"/>`).join('');const target=copies.map(m=>`<path d="${data.target}" transform="${matrix(m)}" fill="#c36d55" fill-opacity=".10" stroke="#a84c3d" stroke-width="1.3" stroke-dasharray="4 2" fill-rule="evenodd"/>`).join('');const pieces=data.pieces.map((p,i)=>`<path class="piece" d="${p.path}" fill="${palette[i%palette.length]}" stroke="#4b433a" stroke-width="1.2" fill-rule="evenodd"/>`).join('');const [x,y,w,h]=data.bounds;const view=[x-w*.45,y-h*.45,w*1.9,h*1.9];setSvg(canvas,view,`<g opacity=".16">${patternArt('c')}</g><g id="tiling">${original}${target}</g>${svgPath(data.target,'none','#774a58').replace('<path ','<path stroke-dasharray="4 3" ')}${pieces}`);updateProgress()}
 if(stage===3){const pts=cellPolygon(),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x=Math.min(...xs)-20,y=Math.min(...ys)-20,points=pts.map(p=>p.join(',')).join(' ');const view=[x,y,Math.max(...xs)-x+20,Math.max(...ys)-y+20],classes=new Map();const domains=copies.map(m=>{const key=m.slice(0,4).map(v=>Math.round(v*1e6)).join(',');if(!classes.has(key))classes.set(key,classes.size);return `<path d="${data.source}" transform="${matrix(m)}" fill="${groupPalette[classes.get(key)%groupPalette.length]}" fill-opacity=".75" stroke="#655749" stroke-width=".9" fill-rule="evenodd"/>`}).join('');setSvg(canvas,view,`<defs><clipPath id="translation-cell"><polygon points="${points}"/></clipPath></defs><polygon points="${points}" fill="#e6c99e"/><g clip-path="url(#translation-cell)">${domains}</g><polygon points="${points}" fill="none" stroke="#6f5f4c" stroke-width="2"/>`)}
}
function selectPattern(name,record){boardMode=false;pattern=name;data=record;stage=(name==='hippo'||name==='fleur')?2:1;render()}
qs('#pick-hippo').onclick=()=>selectPattern('hippo',window.HIPPO_EXERCISE);qs('#pick-zigzag').onclick=()=>selectPattern('zigzag',window.ZIGZAG_EXERCISE);qs('#pick-strips').onclick=()=>selectPattern('strips',window.STRIPS_EXERCISE);qs('#pick-scales').onclick=()=>selectPattern('scales',window.SCALES_EXERCISE);qs('#pick-diamond').onclick=()=>selectPattern('diamond',window.DIAMOND_EXERCISE);qs('#pick-bands').onclick=()=>selectPattern('bands',window.BANDS_EXERCISE);qs('#pick-brick').onclick=()=>selectPattern('brick',window.BRICK_EXERCISE);qs('#pick-circles').onclick=()=>selectPattern('circles',window.CIRCLES_EXERCISE);qs('#pick-fleur').onclick=()=>selectPattern('fleur',window.FLEUR_EXERCISE);
for(const id of Object.keys(provisionalNames))qs(`#pick-p${id}`).onclick=()=>selectPattern(`p${id}`,window.PROVISIONAL_EXERCISES[id]);
document.querySelectorAll('#stages button').forEach(b=>b.onclick=()=>{stage=Number(b.dataset.stage);render()});qs('#next').onclick=()=>{stage=3;render()};qs('#previous').onclick=()=>{stage=2;render()};
function tileArea(){return data.modelTileArea ?? (data.extraction?data.extraction.modelTileArea:data.areas.domain)}
qs('#check-tile').onclick=()=>{const field=qs('#tile-answer'),n=field.valueAsNumber,target=tileArea();qs('#tile-feedback').textContent=Number.isFinite(n)&&Math.abs(n-target)<=target*.05?'That is within 5% of the model area.':data.provisional&&!data.tileExtracted?'Try dividing the candidate translation-cell area by the point-group order.':'Try comparing the tile with the translation cell and its symmetry copies.'};
qs('#reveal-tile').onclick=()=>{const k=data.visibleTile.domainAreaMultiple;qs('#tile-feedback').textContent=k==null?`${data.provisional&&!data.tileExtracted?'Candidate domain':'Fitted boundary'} area: ${tileArea().toFixed(2)} square pixels. ${data.visibleTile.explanation}`:`${k} × ${data.areas.domain.toFixed(2)} = ${tileArea().toFixed(2)} square pixels. ${data.visibleTile.explanation}`};
qs('#congruent-yes').onclick=()=>qs('#congruence-feedback').textContent='Try comparing the perimeters: rigid motions preserve perimeter.';
qs('#congruent-no').onclick=()=>qs('#congruence-feedback').textContent=`Correct. Their perimeters are ${data.perimeters.domain.toFixed(2)} and ${data.perimeters.other.toFixed(2)} pixels; a rigid motion preserves perimeter.`;
qs('#check-group').onclick=()=>{const answer=qs('#group-choice').value,correct=answer===expectedPointGroup();qs('#match-feedback').textContent=!answer?'Choose a point group first.':correct?`Correct — this pattern has point group ${expectedPointGroup()}. Click an orbit point to watch one of its symmetries.`:'Not quite. Try reading the rotations and reflection directions in the repeating pattern.';qs('#match-feedback').classList.toggle('correct',correct);qs('#match-feedback').classList.toggle('incorrect',Boolean(answer)&&!correct)};
qs('#reveal-group').onclick=()=>{const group=expectedPointGroup();qs('#match-feedback').textContent=`This pattern has point group ${group}. Click an orbit point to explore its rotations, reflections, or glide reflections.`;qs('#match-feedback').classList.add('correct');qs('#match-feedback').classList.remove('incorrect')};
qs('#check-board').onclick=()=>{const cards=[...qs('#pattern-board-grid').children],filled=cards.filter(c=>c.dataset.answer),correct=cards.filter(c=>c.dataset.answer===window.PATTERNS[Number(c.dataset.patternId)-1].pointGroup);for(const card of cards){const isCorrect=card.dataset.answer===window.PATTERNS[Number(card.dataset.patternId)-1].pointGroup;card.classList.toggle('correct',Boolean(card.dataset.answer)&&isCorrect);card.classList.toggle('incorrect',Boolean(card.dataset.answer)&&!isCorrect);card.querySelector('.card-result').textContent=card.dataset.answer?(isCorrect?'✓':'Try again'):''}qs('#board-feedback').textContent=filled.length<cards.length?`${correct.length} correct so far. Place groups on all ${cards.length} patterns to complete the board.`:`${correct.length} of ${cards.length} correct. ${correct.length===cards.length?'Excellent — every point group matches.':'Review the highlighted cards and try again.'}`};
qs('#reset-board').onclick=()=>{qs('#pattern-board-grid').querySelectorAll('.pattern-card').forEach(card=>{delete boardAnswers[card.dataset.patternId];delete card.dataset.answer;card.classList.remove('correct','incorrect');card.querySelector('.drop-slot').textContent='Drop group here';card.querySelector('.card-result').textContent=''});qs('#board-feedback').textContent='All matches cleared.'};
qs('#board-hippo').onclick=()=>selectPattern('hippo',window.HIPPO_EXERCISE);qs('#board-fleur').onclick=()=>selectPattern('fleur',window.FLEUR_EXERCISE);qs('#back-to-board').onclick=showMatchingBoard;
function downloadDomain(path,name,fill){
 const view=data.bounds.join(' ');
 const contents=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}"><title>${name}</title><path d="${path}" fill="${fill}" stroke="#534a3e" stroke-width="1.2" fill-rule="evenodd"/></svg>`;
 const url=URL.createObjectURL(new Blob([contents],{type:'image/svg+xml'})),link=document.createElement('a');
 link.href=url;link.download=`artin-${pattern}-${name==='Fundamental domain D'?'domain-d':'domain-d-prime'}.svg`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
qs('#download-domain').onclick=()=>downloadDomain(data.source,'Fundamental domain D','#77aea4');
qs('#download-other').onclick=()=>downloadDomain(data.target,'Fundamental domain D prime','#d99271');
qs('#download-tiling').onclick=()=>{
 const [ux,uy]=data.lattice.a,[vx,vy]=data.lattice.b,[px,py]=data.orbitSeed,det=ux*vy-uy*vx;
 const q=[vy/det,-vx/det,-uy/det,ux/det],center=data.domainCenter||data.orbitSeed;
 const colors=['#6eaaa0','#d99271','#d5b978','#b8a0b9','#7493ad','#c17d91'],seen=new Set(),uses=[];
 copies.forEach((m,i)=>{
  const [a,b,d,e,x,y]=m,A=q[0]*a+q[1]*d,B=q[0]*b+q[1]*e,C=q[2]*a+q[3]*d,E=q[2]*b+q[3]*e;
  let X=q[0]*(x-px)+q[1]*(y-py),Y=q[2]*(x-px)+q[3]*(y-py);
  const shiftX=4*Math.floor((A*center[0]+B*center[1]+X)/4),shiftY=4*Math.floor((C*center[0]+E*center[1]+Y)/4);
  X-=shiftX;Y-=shiftY;
  const key=[A,B,C,E,X,Y].map(n=>Math.round(n*1e5)).join(',');if(seen.has(key))return;seen.add(key);
  const fill=colors[(window.DOMAIN_COLORS?.[pattern]?.[i]??0)%colors.length];
  for(const dx of [-4,0,4])for(const dy of [-4,0,4])uses.push(`<use href="#domain" transform="${matrix([A,B,C,E,X+dx,Y+dy])}" fill="${fill}"/>`);
 });
 const ink=data.patternFragmentPath||window.SOURCE_CONTOURS[data.sourcePattern||1]?.ink||'';
 const artwork=data.tileExtracted
  ? `<path d="${data.modelTilePath}" fill="none" stroke="#514b43" stroke-width="1.1" stroke-linejoin="round" clip-path="url(#domain-clip)"/>`
  : `<path d="${ink}" fill="#514b43" fill-rule="evenodd" clip-path="url(#domain-clip)"/>`;
 const contents=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${data.bounds.join(' ')}"><title>Repeating fundamental-domain tiling</title><defs><clipPath id="domain-clip"><path d="${data.source}" fill-rule="evenodd"/></clipPath><g id="domain"><path d="${data.source}" fill-rule="evenodd" stroke="#655749" stroke-width="1"/>${artwork}</g><pattern id="tiling" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="matrix(${ux} ${uy} ${vx} ${vy} ${px} ${py})">${uses.join('')}</pattern></defs><rect x="${data.bounds[0]}" y="${data.bounds[1]}" width="${data.bounds[2]}" height="${data.bounds[3]}" fill="url(#tiling)"/></svg>`;
 const url=URL.createObjectURL(new Blob([contents],{type:'image/svg+xml'})),link=document.createElement('a');link.href=url;link.download=`artin-${pattern}-repeating-tiling.svg`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
qs('#progress').oninput=()=>{cancelAnimationFrame(frame);updateProgress()};qs('#play').onclick=()=>{cancelAnimationFrame(frame);qs('#progress').value=0;const start=performance.now();function tick(now){qs('#progress').value=Math.min(100,(now-start)/30);updateProgress();if(Number(qs('#progress').value)<100&&stage===2)frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick)};
qs('#reset').onclick=()=>{cancelAnimationFrame(frame);qs('#progress').value=0;updateProgress()};qs('#overlay').onclick=()=>{const b=qs('#overlay'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.textContent=on?'Hide both tilings':'Show both tilings';canvas.querySelector('#tiling').setAttribute('opacity',on?'1':'0')};
function revealFormula(){qs('#formula').hidden=false;qs('#formula').textContent=`Area(D) = area(translation cell) ÷ |point group| = ${data.areas.cell.toFixed(2)} ÷ ${data.pointGroupOrder} = ${data.areas.domain.toFixed(2)} square pixels.`}
qs('#check-order').onclick=()=>{const n=qs('#order-answer').valueAsNumber,correct=n===data.pointGroupOrder;qs('#order-feedback').textContent=correct?'Correct. Divide the translation-cell area by that order.':'Not quite. Count the point-group transformations, including the identity.';if(correct)revealFormula()};qs('#reveal-order').onclick=revealFormula;
const requestedPattern=Number(new URLSearchParams(location.search).get('pattern'));
const patternIds={1:'hippo',2:'zigzag',6:'strips',8:'scales',9:'diamond',11:'bands',12:'brick',13:'circles',16:'fleur'};
if(Number.isInteger(requestedPattern)&&requestedPattern>=1&&requestedPattern<=17){
 const id=patternIds[requestedPattern]||`p${requestedPattern}`;
 qs(`#pick-${id}`).click();
}else if(new URLSearchParams(location.search).get('mode')==='match'||!new URLSearchParams(location.search).has('pattern'))showMatchingBoard();
else render();
