/* Repeat cells are hand-built in SVG coordinates, not traced pixels.
 * Each action is a symmetry of the COLORED pattern, including its fill.
 * The origin and all coordinates are in the same space as the repeat cell.
 */
(function () {
  const stroke = '#403a43';
  const rotation = (angle, x = 0, y = 0) => ({label:`Rotate ${angle}°`, text:`Rotate ${angle}° about the marked point.`, transform:t=>`rotate(${angle*t} ${x} ${y})`, guide:`<circle cx="${x}" cy="${y}" r="5"/>`});
  const vertical = (x = 0) => ({label:'Reflect', text:'Reflect across the dashed vertical line.', transform:t=>`translate(${x} 0) scale(${1-2*t} 1) translate(${-x} 0)`, guide:`<path d="M${x} -250 V250"/>`});
  const horizontalGlide = (distance, y = 0) => ({label:'Glide reflection', text:'Reflect across the dashed horizontal line and slide along it.', transform:t=>`translate(${distance*t} ${y}) scale(1 ${1-2*t}) translate(0 ${-y})`, guide:`<path d="M-300 ${y} H300"/>`});
  const verticalGlide = (distance, x = 0) => ({label:'Glide reflection', text:'Reflect across the dashed vertical line and slide along it.', transform:t=>`translate(${x} ${distance*t}) scale(${1-2*t} 1) translate(${-x} 0)`, guide:`<path d="M${x} -250 V250"/>`});
  const translate = (x, y = 0) => ({label:'Translate', text:'Slide the pattern by a repeat vector.', transform:t=>`translate(${x*t} ${y*t})`, guide:`<path d="M0 0 L${x} ${y}"/>`});
  const circleCell = (hexagonal) => {
    const step = hexagonal ? 103.923048454 : 120;
    const height = 2 * step;
    let circles = '';
    for (let row=-2; row<=3; row++) for(let col=-3; col<=3; col++) {
      const x=col*120 + (hexagonal && Math.abs(row%2) ? 60 : 0);
      circles += `<circle cx="${x}" cy="${row*step}" r="120"/>`;
    }
    return {width:120,height,body:`<rect width="120" height="${height}" fill="#f7ead2"/><g fill="#76a99e" fill-opacity=".20" stroke="${stroke}" stroke-width="2">${circles}</g>`};
  };
  const diamonds = [];
  for(let row=-2;row<=3;row++)for(let col=-2;col<=2;col++) {
    const x=col*80+(Math.abs(row%2)?40:0), y=row*50;
    diamonds.push(`<path d="M${x} ${y-50} L${x+40} ${y} ${x} ${y+50} ${x-40} ${y} Z" fill="${Math.abs(row%2)?'#7cb2a8':'#e7b786'}"/>`);
  }
  const palette = ['#e4b18e', '#80ada6', '#b6a3c0', '#eed4a0'];
  const ink = `stroke="${stroke}" stroke-width="2" stroke-linejoin="round"`;
  const base = (w,h,color='#f7ead2') => `<rect width="${w}" height="${h}" fill="${color}"/>`;
  const polygon = (points, fill) => `<polygon points="${points}" fill="${fill}" ${ink}/>`;
  const star = (x,y,outer,inner,points,angle=0) => {
    let coords=[];
    for(let k=0;k<points*2;k++) {
      let r=k%2?inner:outer, a=angle+Math.PI*k/points;
      coords.push(`${(x+r*Math.cos(a)).toFixed(3)},${(y+r*Math.sin(a)).toFixed(3)}`);
    }
    return coords.join(' ');
  };
  function starCell(points, triangular=false, angle=0) {
    const width=120, dy=triangular?103.923048454:120, height=dy*2;
    let body=base(width,height);
    for(let row=-2;row<=3;row++) for(let col=-2;col<=2;col++) {
      const x=col*120+(triangular&&Math.abs(row%2)?60:0),y=row*dy;
      body+=polygon(star(x,y,55,29,points,angle),palette[1]);
    }
    return {width,height,body,actions:[translate(width)],draft:true};
  }
  function offsetGrid(width,height,dx,dy,draw) {
    let body=base(width,height);
    for(let row=-3;row<=4;row++) for(let col=-3;col<=4;col++)
      body+=draw(col*dx+(Math.abs(row%2)?dx/2:0),row*dy,row,col);
    return {width,height,body,actions:[translate(width)],draft:true};
  }
  const curveInterlock = offsetGrid(120,120,60,60,(x,y)=>
    `<path d="M${x} ${y} h38 a16 16 0 0 1 0 32 h-8 v14 h-30 Z" fill="${palette[0]}" ${ink}/>`);
  const zigzag = offsetGrid(160,80,80,40,(x,y)=>
    `<path d="M${x} ${y} l20 -12 18 10 18 -10 24 12 -20 12 -18 -10 -18 10 Z" fill="${palette[1]}" ${ink}/>`);
  const threeWay = offsetGrid(120,104,60,52,(x,y)=>
    polygon(`${x-30},${y-12} ${x-18},${y-32} ${x+5},${y-32} ${x+12},${y-43} ${x+30},${y-32} ${x+21},${y-12} ${x+30},${y+8} ${x+12},${y+20} ${x+5},${y+9} ${x-18},${y+9}`,palette[2]));
  const angular = offsetGrid(100,104,50,52,(x,y)=>
    polygon(`${x-25},${y-26} ${x+6},${y-26} ${x+25},${y+8} ${x+13},${y+26} ${x-6},${y+26} ${x-25},${y-8}`,palette[0]));
  const scales = offsetGrid(100,120,50,60,(x,y)=>
    `<path d="M${x-25} ${y-30} H${x+25} V${y+5} Q${x+25} ${y+30} ${x} ${y+30} Q${x-25} ${y+30} ${x-25} ${y+5} Z" fill="${palette[1]}" ${ink}/>`);
  const weave = (()=>{
    const width=120,height=120;let body=base(width,height);
    // Integer-coordinate diagonal pieces: neighboring cells match at every edge.
    for(let row=-2;row<=2;row++)for(let col=-2;col<=2;col++) {
      const x=col*120,y=row*120;
      body+=polygon(`${x},${y} ${x+60},${y+60} ${x+40},${y+80} ${x-20},${y+20}`,palette[0]);
      body+=polygon(`${x+60},${y} ${x+120},${y+60} ${x+100},${y+80} ${x+40},${y+20}`,palette[1]);
      body+=polygon(`${x},${y+60} ${x+60},${y+120} ${x+40},${y+140} ${x-20},${y+80}`,palette[1]);
      body+=polygon(`${x+60},${y+60} ${x+120},${y+120} ${x+100},${y+140} ${x+40},${y+80}`,palette[0]);
    }
    return {width,height,body,actions:[translate(width)],draft:true};
  })();
  const bands = (()=>{
    const width=80,height=80;let body=base(width,height);
    for(let y=-160;y<=160;y+=40) body+=`<path d="M-80 ${y} h10 v-10 l10 -7 10 7 v10 h20 v-10 l10 -7 10 7 v10 h20 v-10 l10 -7 10 7 v10 h20 v-10 l10 -7 10 7 v10 h20 v-10 l10 -7 10 7 v10 h20 v-10 l10 -7 10 7 v10 h20 v40 h-200 Z" fill="${palette[1]}" ${ink}/>`;
    return {width,height,body,actions:[translate(width)],draft:true};
  })();
  const hexagons = offsetGrid(120,103.923048454,120,51.961524227,(x,y)=>
    polygon(Array.from({length:6},(_,i)=>{let a=Math.PI/3*i+Math.PI/6;return `${(x+36*Math.cos(a)).toFixed(3)},${(y+36*Math.sin(a)).toFixed(3)}`}).join(' '),palette[0]));
  const fleur = offsetGrid(160,138.564064606,160,69.282032303,(x,y)=>
    `<path d="M${x} ${y-49} Q${x+10} ${y-27} ${x+24} ${y-30} Q${x+44} ${y-35} ${x+39} ${y-15} Q${x+35} ${y-2} ${x+52} ${y+1} Q${x+30} ${y+8} ${x+26} ${y+23} Q${x+21} ${y+42} ${x+6} ${y+30} L${x} ${y+49} L${x-6} ${y+30} Q${x-21} ${y+42} ${x-26} ${y+23} Q${x-30} ${y+8} ${x-52} ${y+1} Q${x-35} ${y-2} ${x-39} ${y-15} Q${x-44} ${y-35} ${x-24} ${y-30} Q${x-10} ${y-27} ${x} ${y-49} Z" fill="${palette[2]}" ${ink}/>`);
  window.GEOMETRY = {
    1:curveInterlock, 2:zigzag, 3:threeWay, 4:starCell(4), 5:starCell(6,true),
    6: {width:42,height:90,body:`<rect width="42" height="90" fill="#dba98d"/><path d="M0 0 Q21 26 42 0 M0 0 V90 M42 0 V90 M0 90 Q21 116 42 90" fill="none" stroke="${stroke}" stroke-width="2"/>`,actions:[translate(42),vertical(21),verticalGlide(90,21)]},
    7:angular, 8:scales,
    9: {width:80,height:100,body:`<g stroke="${stroke}" stroke-width="2">${diamonds.join('')}</g>`,actions:[translate(80),rotation(180),vertical(),horizontalGlide(80)]},
    10:weave, 11:bands,
    12: {width:120,height:80,body:`<g fill="#c67966" stroke="${stroke}" stroke-width="2"><rect x="0" y="0" width="120" height="40"/><rect x="-60" y="40" width="120" height="40"/><rect x="60" y="40" width="120" height="40"/></g>`,actions:[translate(120),rotation(180,60,20),vertical(60),horizontalGlide(60,40)]},
    13: {...circleCell(false),actions:[translate(120),rotation(90),vertical(),horizontalGlide(120)]},
    14:starCell(4,false,Math.PI/4), 15:hexagons, 16:fleur,
    17: {...circleCell(true),actions:[translate(120),rotation(60),vertical(),horizontalGlide(120)]}
  };
})();
