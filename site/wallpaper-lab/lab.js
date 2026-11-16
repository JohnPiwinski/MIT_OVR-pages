const catalog=document.querySelector('#catalog'),preview=document.querySelector('#preview');
const color=document.querySelector('#tile-color'),showFill=document.querySelector('#show-fill');
const showRepeat=document.querySelector('#show-repeat'),repeatOption=document.querySelector('#repeat-option');
const controls=document.querySelector('#controls'),progress=document.querySelector('#progress');
let selected=9,action=0,frame=0;
function sourceSVG(id,thumbnail=false){
 const p=window.SOURCE_CONTOURS[id],fill=thumbnail?'#c6d7cb':color.value;
 const regions=showFill.checked?`<path d="${p.regions.join(' ')}" fill="${fill}" fill-rule="evenodd"/>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.width} ${p.height}" role="img" aria-label="Vector trace of Artin pattern ${id}"><rect width="${p.width}" height="${p.height}" fill="white"/>${regions}<path d="${p.ink}" fill="#29282c" fill-rule="evenodd"/></svg>`;
}
function generatedSVG(id,thumbnail=false){
 const p=window.GENERATED[id],fill=showFill.checked?color.value:'#faf6ee';
 const vp=thumbnail?`0 0 ${p.width} ${p.height}`:'-138 -108 276 216';
 // IDs are unique because the same SVG is used in the gallery and large view.
 const suffix=thumbnail?'thumb'+id:'main'+id,pattern='repeat'+suffix,clip='clip'+suffix;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vp}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Generated vector pattern ${id}" style="--tile-color:${fill}"><defs><pattern id="${pattern}" width="${p.width}" height="${p.height}" patternUnits="userSpaceOnUse">${p.body}</pattern><clipPath id="${clip}"><rect x="-138" y="-108" width="276" height="216"/></clipPath></defs><g clip-path="url(#${clip})"><rect x="-1200" y="-1200" width="2400" height="2400" fill="url(#${pattern})"/><g class="moving" opacity="0"><rect x="-1200" y="-1200" width="2400" height="2400" fill="url(#${pattern})"/><rect x="-1200" y="-1200" width="2400" height="2400" fill="#50346c" opacity=".18"/></g><g class="guide" fill="#52305e" stroke="#52305e" stroke-width="2" stroke-dasharray="4 3"/></g></svg>`;
}
function update(){
 const item=window.GENERATED[selected]?.actions[action],moving=preview.querySelector('.moving');
 if(!item||!moving)return;
 const t=Number(progress.value)/100;moving.setAttribute('transform',item.transform(t));moving.setAttribute('opacity',t===0?'0':'.65');
 preview.querySelector('.guide').innerHTML=item.guide;document.querySelector('#description').textContent=item.text;
 document.querySelectorAll('#buttons button').forEach((b,i)=>{b.classList.toggle('active',i===action);b.setAttribute('aria-pressed',String(i===action))});
}
function select(id,reset=true){
 cancelAnimationFrame(frame);selected=id;if(reset){action=0;progress.value=0}
 const p=window.PATTERNS[id-1],g=window.GENERATED[id],repeat=Boolean(g&&showRepeat.checked);
 repeatOption.hidden=!g;
 document.querySelector('#open-exercise').href=`hippo-prototype/assignment.html?pattern=${id}`;
 document.querySelector('#number').textContent=`ARTIN FIGURE 6.6.2 · PATTERN ${id}`;
 document.querySelector('#title').textContent=p.name;document.querySelector('#group').textContent=`Source point group ${p.pointGroup}`;
 document.querySelectorAll('.item').forEach(b=>{let active=Number(b.dataset.id)===id;b.classList.toggle('active',active);b.setAttribute('aria-current',String(active))});
 preview.innerHTML=repeat?generatedSVG(id):sourceSVG(id);controls.hidden=!repeat;
 document.querySelector('#status').textContent=repeat?`Generated vector repeat · ${g.note}`:'OpenCV vector trace of the source figure';
 document.querySelector('#color-hint').textContent=repeat?'Colors repeat with the geometry. The tint on the moving copy is only an animation aid.':'The trace colors enclosed regions; partial regions along the edges may remain white.';
 if(repeat){const buttons=document.querySelector('#buttons');buttons.replaceChildren();g.actions.forEach((item,i)=>{const b=document.createElement('button');b.textContent=item.label;b.onclick=()=>{cancelAnimationFrame(frame);action=i;progress.value=0;update()};buttons.append(b)});update()}
}
window.PATTERNS.forEach(p=>{const b=document.createElement('button');b.className='item';b.dataset.id=p.id;const svg=sourceSVG(p.id,true);b.innerHTML=`<span class="thumb">${svg}</span><span>${String(p.id).padStart(2,'0')} &nbsp; ${p.name}</span><span>${p.pointGroup}</span>`;b.onclick=()=>{showRepeat.checked=false;select(p.id)};catalog.append(b)});
color.addEventListener('input',()=>select(selected,false));showFill.addEventListener('change',()=>select(selected,false));
showRepeat.addEventListener('change',()=>select(selected));
progress.addEventListener('input',()=>{cancelAnimationFrame(frame);update()});
document.querySelector('#play').onclick=()=>{cancelAnimationFrame(frame);const initial=selected,start=performance.now();progress.value=0;function tick(now){progress.value=Math.min(100,(now-start)/18);update();if(Number(progress.value)<100&&selected===initial)frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick)};
document.querySelector('#download').onclick=()=>{const svg=preview.querySelector('svg').cloneNode(true);svg.querySelector('.moving')?.remove();svg.querySelector('.guide')?.remove();const blob=new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`artin-pattern-${String(selected).padStart(2,'0')}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const initialPattern=Number(new URLSearchParams(location.search).get('pattern'));
select(Number.isInteger(initialPattern)&&initialPattern>=1&&initialPattern<=17?initialPattern:9);
