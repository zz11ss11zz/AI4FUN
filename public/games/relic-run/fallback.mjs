/**
 * Original Canvas 2D compatibility renderer. Architecture is projected from
 * world coordinates; the AI concept covers are deliberately not used as frames.
 * This module has no WebGL, remote asset, or third-party dependency.
 */
const PALETTES = {
  egypt: {sky:'#4e7180',horizon:'#e6ba79',fog:'#d9bb8d',sun:'#ffedbb',ground:'#a38660',road:'#aa9373',stone:'#b69a70',light:'#dec69d',shade:'#7d674c',dark:'#514a3b',foliage:'#5b6b46',mountain:'#aa9471',accent:'#ebc26c'},
  khmer: {sky:'#385c5c',horizon:'#b5c8af',fog:'#91aaa1',sun:'#fff5cf',ground:'#30483b',road:'#707d6c',stone:'#758574',light:'#a0ab8c',shade:'#46594c',dark:'#243c32',foliage:'#2a5d42',mountain:'#547768',accent:'#b8d8a0'},
  maya: {sky:'#3e6672',horizon:'#e3ac91',fog:'#b6b4a0',sun:'#ffe4b6',ground:'#3f5141',road:'#95927b',stone:'#a4a18a',light:'#d4c7a4',shade:'#606e5b',dark:'#344d3b',foliage:'#285e43',mountain:'#617c6e',accent:'#77e5b7'},
  wall: {sky:'#688caa',horizon:'#dce4da',fog:'#c0d0cc',sun:'#fff5d9',ground:'#6c8773',road:'#93978c',stone:'#838d88',light:'#bdc3b1',shade:'#566865',dark:'#364c49',foliage:'#456753',mountain:'#708f87',accent:'#e9dbb6'},
  castle: {sky:'#081325',horizon:'#40576c',fog:'#293e51',sun:'#d9eaff',ground:'#182b31',road:'#536271',stone:'#596c7c',light:'#859aab',shade:'#2d4555',dark:'#162a39',foliage:'#1b3c3c',mountain:'#1b3245',accent:'#ffc987'},
};
const TAU = Math.PI * 2;
const NEAR = 0.24;
const FAR = 168;
const LANE = 1.85;
const ROAD = 3.12;
const random = n => {const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v);};
const rgb = color => {const n=parseInt(color.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
const mixed = (a,b,t) => `rgb(${a.map((n,i)=>Math.round(n+(b[i]-n)*t)).join(',')})`;

export function createFallbackRenderer(canvas) {
  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
  if(!ctx)throw new Error('Canvas compatibility renderer requires a fresh canvas: an existing WebGL context cannot be reused for Canvas 2D.');
  let width=1,height=1,dpr=1,focal=1,horizon=1,eye=1.7,camX=0,travel=0,clock=0;
  let theme='egypt',palette=PALETTES.egypt,fogRGB=rgb(palette.fog),faces=[];
  const colorCache=new Map(),rgbCache=new Map();
  const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    width=Math.max(1,canvas.clientWidth||globalThis.innerWidth||1280);
    height=Math.max(1,canvas.clientHeight||globalThis.innerHeight||720);
    dpr=Math.min(globalThis.devicePixelRatio||1,1.35);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    focal=height*(width/height<.8?.57:.73);
    colorCache.clear();
  }
  function loadScene(selected){
    theme=selected?.id in PALETTES?selected.id:'egypt';palette=PALETTES[theme];fogRGB=rgb(palette.fog);colorCache.clear();rgbCache.clear();
  }
  function tinted(color,z=0,shade=1){
    const band=Math.max(0,Math.min(28,Math.round((z-12)/5.4)));
    const key=`${color}:${band}:${shade}`;
    let value=colorCache.get(key);if(value)return value;
    let base=rgbCache.get(color);if(!base){base=rgb(color);rgbCache.set(color,base);}
    const t=Math.min(.91,(band/28)**1.35*.91);
    value=mixed(base.map(n=>Math.min(255,n*shade)),fogRGB,t);colorCache.set(key,value);return value;
  }
  function project(p){const scale=focal/p[2];return [width*.5+(p[0]-camX)*scale,horizon+(eye-p[1])*scale,scale];}
  function clip(points){
    const result=[];
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length],insideA=a[2]>=NEAR,insideB=b[2]>=NEAR;
      if(insideA)result.push(a);
      if(insideA!==insideB){const t=(NEAR-a[2])/(b[2]-a[2]);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,NEAR]);}
    }
    return result;
  }
  function path(points){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();}
  function polygon(points,color,z,shade=1,edge=false){
    const clipped=clip(points);if(clipped.length<3)return;
    const projected=clipped.map(project);
    if(projected.every(p=>p[0]<-2)||projected.every(p=>p[0]>width+2)||projected.every(p=>p[1]<-2)||projected.every(p=>p[1]>height+2))return;
    path(projected);ctx.fillStyle=tinted(color,z,shade);ctx.fill();
    if(edge&&z<55){ctx.strokeStyle=theme==='castle'?'rgba(5,13,21,.2)':'rgba(35,32,25,.18)';ctx.lineWidth=.7;ctx.stroke();}
  }
  function face(points,color,shade=1,edge=false){
    let max=-Infinity,total=0;for(const p of points){max=Math.max(max,p[2]);total+=p[2];}
    if(max<NEAR||total/points.length>FAR+25)return;
    faces.push({z:total/points.length,points,color,shade,edge});
  }
  function box(x,y,z,w,h,d,color=palette.stone,detail=false){
    if(z+d*.5<NEAR||z-d*.5>FAR)return;
    const l=x-w*.5,r=x+w*.5,front=z-d*.5,back=z+d*.5,top=y+h;
    face([[l,y,front],[r,y,front],[r,top,front],[l,top,front]],color,.92,detail);
    if(camX<l)face([[l,y,back],[l,y,front],[l,top,front],[l,top,back]],color,.76,detail);
    if(camX>r)face([[r,y,front],[r,y,back],[r,top,back],[r,top,front]],color,1.03,detail);
    if(eye>top)face([[l,top,front],[r,top,front],[r,top,back],[l,top,back]],color,1.18,detail);
    else if(eye<y)face([[l,y,back],[r,y,back],[r,y,front],[l,y,front]],color,.58,detail);
  }
  function frustum(x,y,z,bottom,top,h,color=palette.stone,depthScale=1){
    const b=bottom*.5,t=top*.5,bd=b*depthScale,td=t*depthScale;
    face([[x-b,y,z-bd],[x+b,y,z-bd],[x+t,y+h,z-td],[x-t,y+h,z-td]],color,.96,true);
    const side=camX<x?-1:1;
    face([[x+side*b,y,z-bd],[x+side*b,y,z+bd],[x+side*t,y+h,z+td],[x+side*t,y+h,z-td]],color,side<0?.76:1.07,true);
    if(eye>y+h)face([[x-t,y+h,z-td],[x+t,y+h,z-td],[x+t,y+h,z+td],[x-t,y+h,z+td]],color,1.15,true);
  }
  function cylinder(x,y,z,r,h,color=palette.stone,topRadius=r){
    const n=8;
    for(let i=0;i<n;i++){
      const a=i/n*TAU,b=(i+1)/n*TAU,mid=(a+b)*.5;
      if(Math.cos(mid)*(x-camX)+Math.sin(mid)*z>0)continue;
      face([[x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],[x+Math.cos(b)*topRadius,y+h,z+Math.sin(b)*topRadius],[x+Math.cos(a)*topRadius,y+h,z+Math.sin(a)*topRadius]],color,.89+Math.cos(mid+.9)*.24,true);
    }
  }
  function line3(points,color,widthWorld=.025,z=0){
    const p=points.filter(a=>a[2]>NEAR);if(p.length<2)return;
    faces.push({z:z||p.reduce((n,a)=>n+a[2],0)/p.length,line:p,color,widthWorld});
  }
  function glow(x,y,z,r,color,alpha=.38){if(z>NEAR&&z<FAR)faces.push({z,glow:[x,y,z,r,color,alpha]});}
  function silhouetteTree(x,z,size,seed){
    cylinder(x,0,z,.28*size,4.7*size,palette.shade,.16*size);
    for(let layer=0;layer<3;layer++){
      const points=[],cx=x+(random(seed+layer)-.5)*size*1.7,cy=(5.4+layer*.7)*size,rx=(2.6-layer*.35)*size,ry=(1.3+random(seed+17))*size;
      for(let i=0;i<18;i++){const a=i/18*TAU,r=.88+random(seed+i*9+layer)*.24;points.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r,z+.4+layer*.35]);}
      face(points,palette.foliage,.83+layer*.12);
    }
    line3([[x,1,z-.2],[x+size*.65,0,z-1.6],[x+size*1.1,.02,z-2]],palette.shade,.18,z-1);
  }

  function drawSky(){
    const sky=ctx.createLinearGradient(0,0,0,horizon+height*.2);sky.addColorStop(0,palette.sky);sky.addColorStop(.8,palette.horizon);sky.addColorStop(1,palette.fog);ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
    const sx=width*(theme==='maya'?.66:.76),sy=height*(theme==='castle'?.2:.24),sunSize=height*(theme==='castle'?.028:.037);
    const halo=ctx.createRadialGradient(sx,sy,0,sx,sy,sunSize*8);halo.addColorStop(0,theme==='castle'?'rgba(180,214,255,.24)':'rgba(255,225,163,.35)');halo.addColorStop(1,'rgba(255,225,163,0)');ctx.fillStyle=halo;ctx.fillRect(sx-sunSize*8,sy-sunSize*8,sunSize*16,sunSize*16);
    ctx.fillStyle=palette.sun;ctx.beginPath();ctx.arc(sx,sy,sunSize,0,TAU);ctx.fill();
    if(theme==='castle'){
      ctx.fillStyle='#b7d2ea';for(let i=0;i<65;i++){const x=random(i+8)*width,y=random(i+47)*horizon*.78;ctx.globalAlpha=.2+random(i+76)*.5;ctx.fillRect(x,y,random(i+11)>.94?1.5:1,random(i+11)>.94?1.5:1);}ctx.globalAlpha=1;
      ctx.fillStyle='rgba(160,181,199,.07)';ctx.beginPath();ctx.ellipse(width*.68,height*.34,width*.34,height*.035,-.08,0,TAU);ctx.fill();
    }
    for(let layer=0;layer<4;layer++){
      const base=horizon+height*(.025+layer*.018),amplitude=height*(theme==='wall'?.18:.065)*(1-layer*.13),points=[[0,height]];
      for(let i=0;i<=64;i++){const px=width*i/64,peak=Math.sin(i*.24+layer*.8)*.42+Math.sin(i*.63+layer*2)*.2+Math.sin(i*1.27+layer)*.08;points.push([px,base-amplitude*(.6+peak)]);}
      points.push([width,height]);path(points);ctx.fillStyle=mixed(rgb(palette.mountain),fogRGB,.64-layer*.17);ctx.fill();
    }
    if(theme==='egypt'){
      for(const [x,y,s] of [[.67,.02,.15],[.89,.014,.10],[.13,.016,.08]]){
        const base=horizon+height*y,peak=base-height*s,half=height*s*.85;
        path([[width*x-half,base],[width*x,peak],[width*x+half,base]]);ctx.fillStyle=tinted(palette.stone,112,.97);ctx.fill();
        path([[width*x,peak],[width*x+half*.25,base],[width*x+half,base]]);ctx.fillStyle=tinted(palette.stone,112,.77);ctx.fill();
      }
    }
    if(theme==='khmer'||theme==='maya'){
      for(let i=0;i<34;i++){const x=width*i/32,w=width*(.025+random(i+2)*.03),y=horizon-height*(.015+random(i+4)*.06);ctx.fillStyle=tinted(palette.foliage,108+random(i)*27);ctx.beginPath();ctx.ellipse(x,y,w,w*.67,0,0,TAU);ctx.fill();}
    }
    const mist=ctx.createLinearGradient(0,horizon-height*.07,0,horizon+height*.14);mist.addColorStop(0,'rgba(210,221,209,0)');mist.addColorStop(.45,theme==='castle'?'rgba(88,117,142,.11)':'rgba(210,221,209,.23)');mist.addColorStop(1,'rgba(210,221,209,0)');ctx.fillStyle=mist;ctx.fillRect(0,horizon-height*.07,width,height*.21);
  }
  function road(){
    polygon([[-150,0,FAR],[150,0,FAR],[150,0,NEAR],[-150,0,NEAR]],palette.ground,50);
    polygon([[-ROAD,0,FAR],[ROAD,0,FAR],[ROAD,0,NEAR],[-ROAD,0,NEAR]],palette.road,0);
    const tile=2.6,first=Math.floor(travel/tile)-1,last=first+Math.ceil(FAR/tile)+2;
    for(let row=last;row>=first;row--){
      const z=row*tile-travel,z2=z+tile;if(z2<NEAR)continue;
      for(let col=0;col<3;col++){
        const left=-ROAD+col*ROAD*2/3,right=left+ROAD*2/3,shade=.88+random(row*17+col)*.2;
        polygon([[left+.012,.003,z],[right-.012,.003,z],[right-.012,.003,z2-.025],[left+.012,.003,z2-.025]],palette.road,(z+z2)*.5,shade,true);
        if(z>1&&z<24&&random(row*15+col)>.48){
          const crack=[[left+.3,.006,z+.4],[left+.66,.006,z+.66],[left+.75,.006,z+.94],[left+1,.006,z+1.17]].map(project);
          ctx.beginPath();ctx.moveTo(...crack[0].slice(0,2));for(const p of crack.slice(1))ctx.lineTo(p[0],p[1]);ctx.strokeStyle='rgba(24,34,29,.22)';ctx.lineWidth=.8;ctx.stroke();
        }
      }
      for(const side of [-1,1])polygon([[side*ROAD,.012,z],[side*(ROAD+.23),.012,z],[side*(ROAD+.23),.012,z2],[side*ROAD,.012,z2]],palette.light,(z+z2)*.5,.9);
    }
    // Subtle lane guides remain visible when the route passes into deep shade.
    for(const x of [-LANE*.5,LANE*.5]){
      const p=clip([[x-.012,.016,NEAR],[x+.012,.016,NEAR],[x+.012,.016,FAR],[x-.012,.016,FAR]]).map(project);path(p);ctx.fillStyle=theme==='castle'?'rgba(204,219,225,.15)':'rgba(230,226,197,.19)';ctx.fill();
    }
  }
  function egypt(){
    for(let n=Math.floor((travel-10)/12);n<Math.ceil((travel+FAR)/12);n++){
      const z=n*12-travel;
      for(const side of [-1,1]){
        const x=side*4.45;box(x,0,z,1.78,.35,1.78,palette.shade,true);box(x,.35,z,1.48,.25,1.48,palette.light,true);
        cylinder(x,.6,z,.57,6.35,palette.stone,.7);cylinder(x,6.95,z,.7,.8,palette.light,1.05);box(x,7.75,z,2.2,.48,2.2,palette.light,true);
        for(const y of [1.5,4.4,6.4])cylinder(x,y,z,.59,.1,palette.shade,.6);
        if(z>2&&z<65){for(let k=0;k<4;k++){const y=2+k*.76;line3([[x-.19,y,z-.6],[x+.19,y+.15,z-.6],[x+.12,y+.36,z-.6],[x-.12,y+.36,z-.6]],palette.shade,.026,z-.6);}}
        box(side*8.8,0,z,1.4,5.4,11.9,palette.stone,true);
        if(n%3===0){box(side*11,0,z+3,1.7,.6,1.7,palette.light);frustum(side*11,.6,z+3,1.3,.65,10,palette.stone);frustum(side*11,10.6,z+3,.65,.02,1.1,palette.light);}
      }
      if(n%2===0)box(0,8.23,z,10.9,.75,1.75,palette.stone,true);
    }
  }
  function khmer(){
    for(let n=Math.floor((travel-12)/11);n<Math.ceil((travel+FAR)/11);n++){
      const z=n*11-travel;
      for(const side of [-1,1]){
        const x=side*4.25;box(x,0,z,1.28,.46,1.4,palette.shade,true);box(x,.46,z,.88,3.5,1,palette.stone,true);box(x,3.96,z,1.2,.38,1.2,palette.light,true);
        box(x,.9,z-.52,.7,.11,.07,palette.foliage);box(x,2.2,z-.52,.7,.08,.07,palette.shade);
        box(side*5.2,0,z+4.9,1.05,.65,9.4,palette.stone,true);
        if(n%3===0){
          const tx=side*8.2;for(let level=0;level<5;level++)frustum(tx,level*1.4,z+1,5.8-level*.85,4.9-level*.83,1.35,palette.stone);
          frustum(tx,7,z+1,1.6,.12,2.3,palette.light);box(tx,1.3,z-1.9,1.05,2.4,.08,palette.dark);
          line3([[tx-.5,4.4,z-1.25],[tx,4.2,z-1.4],[tx+.5,4.4,z-1.25]],palette.shade,.08,z-1.4);
        }
        if(n%2===0)silhouetteTree(side*(7.8+random(n+side)*2),z+3,1.1+random(n*3)*.8,n*13+side);
      }
      if(n%4===1){box(0,4.35,z,9.5,.75,1.3,palette.stone,true);frustum(0,5.1,z,4.6,3.4,.8,palette.light,.3);frustum(0,5.9,z,3.4,.35,1.9,palette.stone,.4);}
    }
  }
  function maya(){
    for(let n=Math.floor((travel-12)/12);n<Math.ceil((travel+FAR)/12);n++){
      const z=n*12-travel;
      for(const side of [-1,1]){
        const x=side*4.4;box(x,0,z,1.5,.36,1.45,palette.shade,true);box(x,.36,z,.84,3.1,.68,palette.stone,true);box(x,3.46,z,1.1,.28,.84,palette.light,true);
        for(let j=0;j<3;j++){box(x,1+j*.72,z-.36,.57,.08,.04,palette.shade);box(x-.18,1.08+j*.72,z-.36,.08,.27,.04,palette.shade);}
        if(n%4===0){
          const px=side*12;for(let level=0;level<7;level++){const w=15-level*1.75;box(px,level*1.28,z+3,w,1.21,w*.65,palette.stone,true);box(px,level*1.28+1.2,z+3,w+.16,.09,w*.65+.16,palette.light);}
          box(px,8.96,z+3,3.5,2.6,2.5,palette.stone,true);box(px,9.4,z+1.72,1.1,1.8,.08,palette.dark);frustum(px,11.56,z+3,4.2,2.6,.8,palette.light,.65);
          for(let s=0;s<16;s++)box(px,s*.56,z-2.7+s*.22,1.65,.56,.33,palette.light);
        }else if(n%2===1)silhouetteTree(side*(10+random(n)*3),z+2,1.1+random(n+3)*.8,n*17+side);
      }
    }
  }
  function wall(){
    for(let n=Math.floor((travel-6)/4);n<Math.ceil((travel+FAR)/4);n++){
      const z=n*4-travel;
      for(const side of [-1,1]){
        const x=side*3.6;box(x,0,z,.78,1.02,4.02,palette.stone,true);box(x,1.02,z,.91,.16,4.04,palette.light,true);box(x,1.18,z,.8,.67,1.9,palette.stone,true);box(x,1.85,z,.9,.13,2,palette.light,true);
        if(n%2===0){line3([[x-side*.402,.32,z-1.8],[x-side*.402,.32,z+1.8]],palette.shade,.022,z);line3([[x-side*.402,.67,z-1.8],[x-side*.402,.67,z+1.8]],palette.shade,.022,z);}
      }
    }
    for(let n=Math.floor((travel-15)/56);n<Math.ceil((travel+FAR)/56);n++){
      const z=n*56+27-travel;
      for(const side of [-1,1]){
        box(side*4.45,0,z,2.4,5.5,5.2,palette.stone,true);box(side*4.45,5.5,z,2.65,.33,5.45,palette.light,true);
        box(side*4.45,3.2,z-2.62,.65,1.15,.03,palette.dark);box(side*4.45,1.2,z-2.62,.65,1.15,.03,palette.dark);
        for(const dz of [-2,0,2])box(side*4.45,5.83,z+dz,2.4,.7,1.1,palette.stone,true);
      }
      box(0,4.3,z,7.6,1.2,4.2,palette.stone,true);frustum(0,5.5,z,9.7,7.5,.7,palette.shade,.61);frustum(0,6.2,z,7.9,4.4,.9,palette.shade,.58);box(0,7.1,z,4.6,.18,.3,palette.light);
    }
  }
  function pointedArch(z){
    for(const side of [-1,1]){
      box(side*3.75,0,z,.72,4.2,.95,palette.stone,true);box(side*3.75,.25,z,1.03,.3,1.2,palette.light,true);box(side*3.75,4.05,z,1.05,.32,1.16,palette.light,true);
      for(let i=0;i<10;i++){
        const t=i/10,t2=(i+1)/10,x1=side*3.75*(1-t),x2=side*3.75*(1-t2),y1=4.35+3.1*(1-(1-t)**1.5),y2=4.35+3.1*(1-(1-t2)**1.5);
        face([[x1,y1,z-.5],[x2,y2,z-.5],[x2,y2+.5,z-.5],[x1,y1+.5,z-.5]],palette.light,.87+(i%2)*.07,true);
        face([[x1,y1,z-.5],[x1,y1,z+.5],[x2,y2,z+.5],[x2,y2,z-.5]],palette.stone,.62,true);
      }
    }
  }
  function castle(){
    for(let n=Math.floor((travel-10)/12);n<Math.ceil((travel+FAR)/12);n++){
      const z=n*12-travel;pointedArch(z);
      for(const side of [-1,1]){
        const x=side*6;box(x,0,z,1.1,9,12.05,palette.stone,true);box(side*4.8,0,z,1.2,1,1.8,palette.shade,true);
        const wx=side*5.43;face([[wx,2,z+2.7],[wx,5.7,z+2.7],[wx,6.5,z+3.5],[wx,5.7,z+4.3],[wx,2,z+4.3]],palette.dark);
        line3([[wx-side*.01,2.2,z+3.5],[wx-side*.01,5.9,z+3.5]],palette.light,.055,z+3.5);
        line3([[wx-side*.01,4.2,z+2.8],[wx-side*.01,4.2,z+4.2]],palette.light,.04,z+3.5);
        box(side*3.85,1.3,z-1.2,.2,.9,.2,palette.dark);box(side*3.85,2.14,z-1.2,.52,.17,.52,palette.shade);
        glow(side*3.85,2.62,z-1.2,1.1,'#f6ad5c',.42);
        const flame=.43+Math.sin(clock*11+n)*.08;face([[side*3.85-.16,2.3,z-1.2],[side*3.85,2.3+flame,z-1.2],[side*3.85+.16,2.3,z-1.2]],'#ffd391',1.2);
      }
    }
    for(let n=Math.floor((travel-10)/46);n<Math.ceil((travel+FAR)/46);n++){
      const z=n*46+20-travel;for(const side of [-1,1]){cylinder(side*9,0,z,2,11,palette.stone);frustum(side*9,11,z,4.7,.02,5,palette.dark);box(side*9,8,z-2.01,.7,1.8,.05,palette.dark);}
    }
  }
  function obstacles(objects){
    for(const item of objects){
      if(item.collected)continue;const z=item.distance-travel;if(z<NEAR-2||z>FAR)continue;const x=item.lane*LANE;
      if(item.kind==='relic'){
        if(z>NEAR)faces.push({z,relic:[x,1.1+Math.sin(clock*2.4+item.distance)*.065,z,item.distance]});
      }else if(item.kind==='barrier'){
        box(x,0,z,1.5,.76,.9,palette.stone,true);box(x,.76,z-.22,1.35,.13,.43,palette.light,true);
        for(let i=0;i<3;i++)frustum(x+(i-1)*.43,.76,z+.1,.46,.3,.18+random(item.distance+i)*.1,palette.stone,.7);
        box(x,.67,z-.458,1.34,.064,.02,'#e0b463');
      }else if(item.kind==='beam'){
        for(const side of [-1,1])box(x+side*.8,0,z,.13,2.1,.25,palette.dark,true);
        box(x,1.15,z,1.75,.55,.64,palette.dark,true);box(x,1.15,z-.33,1.75,.065,.03,'#e7c179');
        for(const dx of [-.68,.68])box(x+dx,1.2,z-.33,.1,.45,.035,'#cf9f58');
      }else if(item.kind==='gap'){
        face([[x-.83,.025,z-1.2],[x+.83,.025,z-1.2],[x+.83,.025,z+1.2],[x-.83,.025,z+1.2]],'#050e13');
        face([[x-.68,.026,z-.96],[x+.68,.026,z-.96],[x+.53,.026,z+.86],[x-.53,.026,z+.86]],'#02070b');
        for(const edge of [-1,1]){box(x,.025,z+edge*1.26,1.85,.12,.15,palette.light,true);box(x+edge*.9,0,z,.12,.08,2.55,palette.stone,true);}
        box(x,.145,z-1.27,1.72,.032,.1,'#cba464');
      }
    }
  }
  function exitGate(){
    const z=720-travel;if(z>FAR||z<NEAR)return;
    for(const side of [-1,1]){box(side*3.1,0,z,.65,5.1,.8,palette.light,true);box(side*3.1,4.8,z,.9,.45,1.1,palette.light);}
    box(0,4.9,z,7,.38,1,palette.light,true);box(0,4.7,z-.51,5.3,.1,.08,'#efcc87');
    glow(0,2.4,z+.2,3.6,palette.sun,.3);
  }
  function drawGlow(data){
    const [x,y,z,r,color,alpha]=data,p=project([x,y,z]),radius=Math.min(width*.65,r*p[2]);if(radius<.5)return;
    const base=rgb(color),g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],radius);g.addColorStop(0,`rgba(${base.join(',')},${alpha})`);g.addColorStop(.22,`rgba(${base.join(',')},${alpha*.5})`);g.addColorStop(1,`rgba(${base.join(',')},0)`);ctx.fillStyle=g;ctx.fillRect(p[0]-radius,p[1]-radius,radius*2,radius*2);
  }
  function drawRelic(data){
    const [x,y,z,id]=data,p=project([x,y,z]),s=p[2],rx=(.12+Math.abs(Math.cos(clock*1.8+id))*.11)*s,ry=.29*s;
    drawGlow([x,y,z,.6,'#ffd992',.35]);
    ctx.strokeStyle=tinted('#d9ab59',z);ctx.lineWidth=Math.max(.7,.016*s);ctx.beginPath();ctx.ellipse(p[0],p[1],.29*s,.24*s,.25,0,TAU);ctx.stroke();
    path([[p[0],p[1]-ry],[p[0]+rx,p[1]],[p[0],p[1]+ry],[p[0]-rx,p[1]]]);ctx.fillStyle=tinted('#ffd98b',z,1.12);ctx.fill();
    path([[p[0],p[1]-ry],[p[0]-rx,p[1]],[p[0],p[1]+ry]]);ctx.fillStyle=tinted('#a9772e',z);ctx.fill();
    path([[p[0],p[1]-ry],[p[0]+rx,p[1]],[p[0],p[1]+ry*.25]]);ctx.fillStyle=tinted('#fff0bb',z);ctx.fill();
  }
  function drawFaces(){
    faces.sort((a,b)=>b.z-a.z);
    for(const f of faces){
      if(f.relic){drawRelic(f.relic);continue;}if(f.glow){drawGlow(f.glow);continue;}
      if(f.line){const p=f.line.map(project);ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)ctx.lineTo(p[i][0],p[i][1]);ctx.strokeStyle=tinted(f.color,f.z);ctx.lineWidth=Math.min(10,Math.max(.6,f.widthWorld*focal/f.z));ctx.stroke();continue;}
      polygon(f.points,f.color,f.z,f.shade,f.edge);
    }
  }
  function atmosphere(){
    if(theme==='egypt'||theme==='khmer'){
      ctx.fillStyle=theme==='egypt'?'rgba(255,226,170,.036)':'rgba(223,255,218,.028)';path([[width*.72,0],[width*.75,0],[width*.26,height],[width*.03,height]]);ctx.fill();
    }
    const count=theme==='castle'?14:30;
    for(let i=0;i<count;i++){
      const x=((random(i+119)*width+clock*(4+random(i)*9))%(width+60))-30,y=((random(i+389)*height+Math.sin(clock*.45+i)*13)%(height+40))-20,r=.5+random(i+16)*1.2;
      ctx.globalAlpha=.12+random(i+63)*.2;ctx.fillStyle=theme==='castle'?'#fbc185':'#eee9c6';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
    const vignette=ctx.createRadialGradient(width*.5,height*.44,height*.12,width*.5,height*.48,Math.max(width,height)*.72);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(.7,'rgba(0,8,10,.06)');vignette.addColorStop(1,'rgba(0,8,10,.3)');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
  }
  function render({distance=0,time=0,x=0,jumpY=0,slide=0,objects=[],status='ready',menu=false,bob=true}={}){
    travel=Number.isFinite(distance)?distance:0;clock=Number.isFinite(time)?time:0;camX=Number.isFinite(x)?x:0;
    const bobAmount=bob&&!reducedMotion&&!menu&&status==='running'&&jumpY<.05&&slide<=0?Math.sin(travel*1.45)*.025:0;
    eye=(menu?1.85:1.7)+Math.max(0,jumpY)-(slide>0?.85:0)+bobAmount;horizon=height*(menu?.46:.445);
    if(menu&&!reducedMotion)camX+=Math.sin(clock*.11)*.16;
    faces.length=0;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;
    drawSky();road();({egypt,khmer,maya,wall,castle})[theme]();obstacles(objects);if(!menu)exitGate();drawFaces();atmosphere();
  }
  resize();
  return {loadScene,resize,render};
}
