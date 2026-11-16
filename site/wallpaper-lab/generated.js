/* Build SVG geometry by applying group operations to OpenCV-extracted domains. */
(function(){
  const d=window.SOURCE_DOMAINS, ink='#353341';
  const translation=(x,y=0)=>({label:'Translate',text:'Translate by a repeat vector.', transform:t=>`translate(${x*t} ${y*t})`,guide:`<path d="M0 0 L${x} ${y}"/>`});
  const reflect=(x)=>({label:'Reflect',text:'Reflect across the marked vertical axis.',transform:t=>`translate(${x} 0) scale(${1-2*t} 1) translate(${-x} 0)`,guide:`<path d="M${x} -300 V300"/>`});
  const rotate=(angle,x,y)=>({label:`Rotate ${angle}°`,text:`Rotate about the marked center.`,transform:t=>`rotate(${angle*t} ${x} ${y})`,guide:`<circle cx="${x}" cy="${y}" r="3"/>`});
  const glide=(x,y)=>({label:'Glide reflection',text:'Reflect across the horizontal line and slide along it.',transform:t=>`translate(${x*t} ${y}) scale(1 ${1-2*t}) translate(0 ${-y})`,guide:`<path d="M-300 ${y} H300"/>`});
  const verticalGlide=(distance,x)=>({label:'Glide reflection',text:'Reflect across the vertical line and slide along it.',transform:t=>`translate(${x} ${distance*t}) scale(${1-2*t} 1) translate(${-x} 0)`,guide:`<path d="M${x} -300 V300"/>`});
  const strip=d[6], w=strip.halfWidth, h=strip.periodY;
  const curve=strip.curve.map(([x,y])=>`${x} ${y}`).join(' L');
  const reversed=strip.curve.slice(0,-1).reverse().map(([x,y])=>`${2*w-x} ${y}`).join(' L');
  const arch=`M0 0 L${curve} L${reversed}`;
  const diamond=d[9], bx=d[12].width, by=d[12].height;
  const diamondCell=()=>{
    let shapes='';
    for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++) {
      const cx=x*diamond.width,cy=y*diamond.height,dx=diamond.width/2,dy=diamond.height/2;
      // Fit the extracted straight edges to shared vertices to remove scan gaps.
      shapes+=`<path d="M${cx} ${cy-dy} L${cx+dx} ${cy} ${cx} ${cy+dy} ${cx-dx} ${cy} Z" fill="var(--tile-color)" stroke="${ink}" stroke-width="1.5"/>`;
    }
    return `<rect width="${diamond.width}" height="${diamond.height}" fill="#e4ad89"/>${shapes}`;
  };
  const brickCell=()=>{
    let items=`<rect width="${bx}" height="${by*2}" fill="${ink}"/>`;
    // A quarter of a brick is reflected across both axes to make each brick.
    for(let row=-1;row<=2;row++)for(let col=-2;col<=2;col++){
      const cx=col*bx+(Math.abs(row%2)?0:bx/2),cy=row*by+by/2;
      items+=`<g transform="translate(${cx} ${cy})" fill="var(--tile-color)">`;
      for(let sx of [-1,1])for(let sy of [-1,1])
        items+=`<rect transform="scale(${sx} ${sy})" x="0" y="0" width="${bx/2-1}" height="${by/2-1}"/>`;
      items+=`<rect x="${-bx*.30}" y="${-by*.27}" width="${bx*.60}" height="${by*.54}" rx="2" fill="#ffffff" opacity=".17"/></g>`;
    }
    return items;
  };
  window.GENERATED={
    6:{width:2*w,height:h,body:`<rect width="${2*w}" height="${h}" fill="var(--tile-color)"/><path d="${arch} L${2*w} 0 Z" fill="#eab894"/><path d="${arch} M0 0 V${h} M${2*w} 0 V${h}" fill="none" stroke="${ink}" stroke-width="1.6"/>`,actions:[translation(2*w),reflect(w),verticalGlide(h,w)],note:'The scalloped edge was extracted from half of one arch and reflected.'},
    9:{width:diamond.width,height:diamond.height,body:diamondCell(),actions:[translation(diamond.width),reflect(0),rotate(180,0,0),glide(diamond.width,0)],note:'A source diamond was extracted; fitted edges and reflections create the colored repeat.'},
    12:{width:bx,height:by*2,body:brickCell(),actions:[translation(bx),reflect(bx/2),rotate(180,bx/2,by/2),glide(bx/2,by)],note:'OpenCV measured the brick interior; reflected quarter-bricks form a staggered repeat.'}
  };
})();
