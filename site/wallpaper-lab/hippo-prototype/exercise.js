const data=window.FLEUR_EXERCISE || window.HIPPO_EXERCISE,canvas=document.querySelector('#canvas');
const range=document.querySelector('#progress'),percent=document.querySelector('#percent'),overlay=document.querySelector('#overlay');
const shades=['#6eaaa0','#d99271','#ba9eb5','#dfbe79'];let frame=0,showOverlay=false;
canvas.setAttribute('viewBox',data.bounds.join(' '));
const shapes=data.pieces.map((p,i)=>`<path class="piece" d="${p.path}" fill="${shades[i%shades.length]}" stroke="#484039" stroke-width="1.2" fill-rule="evenodd"/>`).join('');
const svgMatrix=m=>`matrix(${m[0]} ${m[2]} ${m[1]} ${m[3]} ${m[4]} ${m[5]})`;
let copies=data.groupCopies;
if(!copies){copies=[];for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)copies.push([1,0,0,1,i*data.lattice.a[0]+j*data.lattice.b[0],i*data.lattice.a[1]+j*data.lattice.b[1]])}
if(data.domainCenter){const [cx,cy]=data.domainCenter;copies=[...copies].sort((m,n)=>{const distance=x=>Math.hypot(x[0]*cx+x[1]*cy+x[4]-cx,x[2]*cx+x[3]*cy+x[5]-cy);return distance(m)-distance(n)})}
const tiles=copies.map(m=>`<path d="${data.target}" transform="${svgMatrix(m)}" fill="none" stroke="#9a6a76" stroke-width=".8" stroke-dasharray="3 3" fill-rule="evenodd"/>`).join('');
const domainTiles=copies.map((m,i)=>`<path class="domain-copy" d="${data.source}" transform="${svgMatrix(m)}" fill="${['#6eaaa0','#d99271','#bba1b8','#d6bf7d','#8ba7ba','#c58e8f'][i%6]}" fill-opacity=".55" stroke="#514c45" stroke-width=".7" fill-rule="evenodd" style="visibility:hidden"/>`).join('');
const art=data.sourcePattern && window.SOURCE_CONTOURS ? `<path d="${window.SOURCE_CONTOURS[data.sourcePattern].ink}" fill="#4d453a" opacity=".20" fill-rule="evenodd"/>` : '';
canvas.innerHTML=`<rect x="${data.bounds[0]}" y="${data.bounds[1]}" width="${data.bounds[2]}" height="${data.bounds[3]}" fill="#f3ecdc"/>${art}<g id="domain-tiling" opacity="0">${domainTiles}</g><g id="tiling" opacity="0">${tiles}</g><path d="${data.source}" fill="#e2dbc8" fill-opacity=".65" stroke="#a39a87" stroke-width="1" fill-rule="evenodd"/><path d="${data.target}" fill="none" stroke="#774a58" stroke-width="1.7" stroke-dasharray="4 3" fill-rule="evenodd"/>${shapes}`;
function animatedMatrix(piece,t){
 if(!piece.matrix)return `translate(${piece.to[0]*t} ${piece.to[1]*t})`;
 const [a,b,d,e,x,y]=piece.matrix,det=a*e-b*d;
 if(det>0){const theta=Math.atan2(d,a)*t,c=Math.cos(theta),s=Math.sin(theta);return svgMatrix([c,-s,s,c,x*t,y*t])}
 // A reflection must pass through a collapsed state in a 2D animation.
 return svgMatrix([1+(a-1)*t,b*t,d*t,1+(e-1)*t,x*t,y*t]);
}
function update(){const t=Number(range.value)/100;percent.value=`${Math.round(t*100)}%`;canvas.querySelectorAll('.piece').forEach((p,i)=>p.setAttribute('transform',animatedMatrix(data.pieces[i],t)));document.querySelector('#caption').textContent=t===0?'The pieces fill the first domain. The dashed outline shows the destination.':t===1?'The pieces fill the second domain. Each moved by a symmetry of the pattern.':'Each intersection moves by its corresponding symmetry.'}
range.addEventListener('input',()=>{cancelAnimationFrame(frame);update()});
document.querySelector('#play').onclick=()=>{cancelAnimationFrame(frame);range.value=0;const start=performance.now();function tick(now){range.value=Math.min(100,(now-start)/30);update();if(Number(range.value)<100)frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick)};
document.querySelector('#reset').onclick=()=>{cancelAnimationFrame(frame);range.value=0;update()};
overlay.onclick=()=>{showOverlay=!showOverlay;overlay.setAttribute('aria-pressed',String(showOverlay));overlay.textContent=showOverlay?'Hide second tiling':'Show second tiling';canvas.querySelector('#tiling').setAttribute('opacity',showOverlay?'.65':'0')};
const domainButton=document.querySelector('#domain-tiles');let growthFrame=0;
if(domainButton)domainButton.onclick=()=>{
 const on=domainButton.getAttribute('aria-pressed')!=='true';cancelAnimationFrame(growthFrame);domainButton.setAttribute('aria-pressed',String(on));domainButton.textContent=on?'Hide domain colors':'Grow colored pattern';canvas.querySelector('#domain-tiling').setAttribute('opacity',on?'1':'0');
 const nodes=[...canvas.querySelectorAll('.domain-copy')];nodes.forEach(p=>p.style.visibility='hidden');
 if(on){const start=performance.now();function grow(now){const count=Math.min(nodes.length,Math.ceil(nodes.length*(now-start)/2200));nodes.slice(0,count).forEach(p=>p.style.visibility='visible');if(count<nodes.length)growthFrame=requestAnimationFrame(grow)}growthFrame=requestAnimationFrame(grow)}
};
document.querySelector('#export-domains').onclick=()=>{
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${data.bounds.join(' ')}"><title>Two fundamental domains</title><path d="${data.source}" fill="#6eaaa0" fill-opacity=".55" stroke="#484039" stroke-width="1" fill-rule="evenodd"/><path d="${data.target}" fill="#d99271" fill-opacity=".55" stroke="#774a58" stroke-width="1" fill-rule="evenodd"/></svg>`;
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),link=document.createElement('a');link.href=url;link.download=data.sourcePattern===16?'fleur-two-domains.svg':'hippo-two-domains.svg';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
document.querySelector('#area-values').innerHTML=`<span class="values">${data.areas.domain.toFixed(2)} = ${data.areas.cell.toFixed(2)} ÷ ${data.pointGroupOrder}</span><br><span>First domain: ${data.areas.domain.toFixed(2)} · Second domain: ${data.areas.other.toFixed(2)} square pixels</span>`;
if(data.visibleTile){const tile=data.visibleTile;const model=data.extraction ? ` Model tile: ${tile.domainAreaMultiple} × ${data.areas.domain.toFixed(1)} = ${data.extraction.modelTileArea.toFixed(1)} square pixels.` : '';document.querySelector('#tile-area').innerHTML=`<strong>Visible tile (part a):</strong> scan estimate ${tile.estimatedArea.toFixed(1)} square pixels.${model} ${tile.explanation}`}
if(data.extraction && window.SOURCE_CONTOURS){
 const e=data.extraction,svg=document.querySelector('#extraction');
 svg.innerHTML=`<rect width="793" height="482" fill="#fff"/><path d="${window.SOURCE_CONTOURS[16].ink}" fill="#312f30" fill-rule="evenodd"/><path d="${e.tilePath}" fill="#e8b96c" fill-opacity=".30" stroke="#ab6e25" stroke-width="2"/><path d="${data.source}" fill="#52a896" fill-opacity=".35" stroke="#317769" stroke-width="2"/><path d="M${e.mirrorX} 115 V365" stroke="#754663" stroke-dasharray="5 4" stroke-width="2"/>`;
 document.querySelector('#correction').textContent=`Symmetry correction changed ${(100*e.correctionArea/data.areas.domain).toFixed(2)}% of a domain area relative to the detected half-tile. The dashed line is the mirror axis.`;
}
window.installOrbit({canvas,data,copies});
update();
