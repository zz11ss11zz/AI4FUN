import {THEMES,themeFor} from './themes.mjs';

const $ = selector => document.querySelector(selector);
let canvas = $('#world');
const storageKey = 'ai4fun.relic-run.v1';
const configKey = 'ai4fun.relic-run.settings.v1';
let selected = themeFor(new URL(location.href).searchParams.get('scene'));
let THREE, logic, createWorld, renderer, scene, camera, world, sunlight, hemisphere, sky, particles, obstacleGroup, fallback;
let fallbackMode=false;
let run, lastTime=0, previewDistance=8, frameHandle, noticeTimer, hitTimer, runNumber=0;
let countdownRemaining=0, pausedCountdown=false;
let isReady=false, endingShown=false, cameraX=0, cameraY=1.7, cameraRoll=0, loadedScene='', currentCoach='';
let objects=new Map(), skyMaterials=[], obstacleResources=[], bests={}, fpsSeconds=0, fpsFrames=0, slowWindows=0, menuBusy=false;
let settings={quality:matchMedia('(max-width: 800px)').matches?'balanced':'high',bob:!matchMedia('(prefers-reduced-motion: reduce)').matches,sound:false};
try{const s=JSON.parse(localStorage.getItem(configKey)||'{}');if(['high','balanced','low'].includes(s.quality))settings.quality=s.quality;if(typeof s.bob==='boolean')settings.bob=s.bob;if(typeof s.sound==='boolean')settings.sound=s.sound;const b=JSON.parse(localStorage.getItem(storageKey)||'{}');if(b&&typeof b==='object')bests=b;}catch{}

const audio = {
  ctx:null,master:null,wind:null,lastStep:0,
  async activate(){
    if(!settings.sound)return;
    try{
      if(!this.ctx){
        this.ctx=new (window.AudioContext||window.webkitAudioContext)();
        this.master=this.ctx.createGain();this.master.gain.value=.24;this.master.connect(this.ctx.destination);
        const size=this.ctx.sampleRate*3, buffer=this.ctx.createBuffer(1,size,this.ctx.sampleRate),data=buffer.getChannelData(0);let brown=0;
        for(let i=0;i<size;i++){brown=(brown+(Math.random()*2-1)*.014)/1.018;data[i]=brown*2;}
        const source=this.ctx.createBufferSource();source.buffer=buffer;source.loop=true;
        const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=480;
        this.wind=this.ctx.createGain();this.wind.gain.value=.28;source.connect(filter);filter.connect(this.wind);this.wind.connect(this.master);source.start();
      }
      await this.ctx.resume();this.master.gain.setTargetAtTime(.24,this.ctx.currentTime,.1);
    }catch{settings.sound=false;syncSettings();notice('当前浏览器未能开启音频，游戏仍可继续。');}
  },
  mute(){if(this.master)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.04);},
  tone(freq=660,duration=.15,type='sine',gain=.12){
    if(!settings.sound||!this.ctx||this.ctx.state!=='running')return;
    const now=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);o.frequency.exponentialRampToValueAtTime(freq*.65,now+duration);g.gain.setValueAtTime(gain,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.01);
  },
  step(time,speed){if(time-this.lastStep>3.7/speed){this.lastStep=time;this.tone(75+Math.random()*32,.075,'triangle',.22);}},
  event(type){if(type==='collect'){this.tone(1050,.16,'sine',.15);setTimeout(()=>this.tone(1570,.12,'sine',.08),65);}if(type==='hit')this.tone(58,.34,'sawtooth',.19);if(type==='jump')this.tone(170,.13,'sine',.08);if(type==='complete'){[523,659,784,1046].forEach((n,i)=>setTimeout(()=>this.tone(n,.45,'sine',.13),i*130));}}
};

function persistSettings(){try{localStorage.setItem(configKey,JSON.stringify(settings));}catch{}}
function notice(message){clearTimeout(noticeTimer);$('#notice').textContent=message;$('#notice').hidden=false;noticeTimer=setTimeout(()=>$('#notice').hidden=true,4000);}
function syncSettings(){
  $('#quality').value=settings.quality;$('#head-bob').checked=settings.bob;$('#sound-setting').checked=settings.sound;
  $('#sound-toggle').setAttribute('aria-label',settings.sound?'关闭声音':'开启声音');$('#sound-toggle').setAttribute('aria-pressed',String(settings.sound));$('#sound-toggle span').textContent=settings.sound?'声音开':'声音关';
  $('#quality-status').textContent=fallbackMode?'兼容画面':{high:'高画质',balanced:'均衡',low:'流畅'}[settings.quality];
}
function renderSelection(){
  document.documentElement.style.setProperty('--gold',selected.color);
  const hadFocus=$('#scene-list').contains(document.activeElement);
  $('#scene-list').innerHTML=THEMES.map(t=>`<button class="scene-card" data-scene="${t.id}" aria-label="选择${t.name}场景：${t.title}" aria-pressed="${t.id===selected.id}"><img src="${t.image}" alt="${t.name}场景概念封面，AI 生成" loading="eager"><span class="scene-selected">◇</span><span class="scene-name">${t.name}</span><span class="scene-time">${t.region}</span></button>`).join('');
  const current=$('#scene-list').querySelector('[aria-pressed="true"]');
  if(current){if(hadFocus)current.focus({preventScroll:true});$('#scene-list').scrollLeft=current.offsetLeft-($('#scene-list').clientWidth-current.offsetWidth)/2;}
  $('#scene-region').textContent=selected.region;$('#scene-title').textContent=selected.title;$('#scene-description').textContent=selected.description;$('#scene-en').textContent=selected.en;
  $('#hud-scene').textContent=`${selected.name} · ${selected.title}`;
  const url=new URL(location.href);url.searchParams.set('scene',selected.id);history.replaceState({},'',url);
}
function mode(value){document.body.dataset.mode=value;}
function error(message){countdownRemaining=0;$('#countdown').hidden=true;cancelAnimationFrame(frameHandle);audio.mute();$('#error-message').textContent=message;$('#error-panel').hidden=false;$('#start').disabled=true;mode('error');}

function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,248,212,1)');g.addColorStop(.15,'rgba(255,215,135,.65)');g.addColorStop(.4,'rgba(255,195,104,.12)');g.addColorStop(1,'rgba(255,180,90,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);
}
function initRenderer(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.08,240);camera.position.set(0,1.7,0);camera.rotation.order='YXZ';
  hemisphere=new THREE.HemisphereLight(0xd9e3dc,0x524531,2.2);scene.add(hemisphere);
  sunlight=new THREE.DirectionalLight(0xffe1ae,3.4);sunlight.castShadow=true;sunlight.shadow.camera.left=-34;sunlight.shadow.camera.right=34;sunlight.shadow.camera.top=44;sunlight.shadow.camera.bottom=-44;sunlight.shadow.camera.near=1;sunlight.shadow.camera.far=180;sunlight.shadow.bias=-.0005;sunlight.shadow.normalBias=.05;sunlight.shadow.radius=3;sunlight.target.position.set(0,0,-42);scene.add(sunlight,sunlight.target);
  const fill=new THREE.DirectionalLight(0xafd3e8,.3);fill.position.set(-20,12,15);scene.add(fill);
  const skyGeo=new THREE.SphereGeometry(205,32,18);
  const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color(0x6c929c)},bottom:{value:new THREE.Color(0xd9bb8b)},sun:{value:new THREE.Vector3(.4,.45,-.7).normalize()},glow:{value:new THREE.Color(0xffdf9d)}},vertexShader:'varying vec3 vPosition;void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vPosition;uniform vec3 top;uniform vec3 bottom;uniform vec3 sun;uniform vec3 glow;void main(){vec3 d=normalize(vPosition);float h=pow(max(d.y,0.0),0.65);vec3 c=mix(bottom,top,h);float s=max(dot(d,sun),0.0);c+=glow*pow(s,32.0)*0.22+glow*pow(s,700.0)*0.6;gl_FragColor=vec4(c,1.0);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'.replace(';#include',';\n#include')});
  sky=new THREE.Mesh(skyGeo,skyMat);sky.renderOrder=-5;scene.add(sky);skyMaterials.push(skyMat);
  const count=650,positions=new Float32Array(count*3),pColors=new Float32Array(count*3);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*75;positions[i*3+1]=Math.random()*19+.4;positions[i*3+2]=Math.random()*170-155;pColors[i*3]=1;pColors[i*3+1]=.87;pColors[i*3+2]=.57;}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(positions,3));pg.setAttribute('color',new THREE.BufferAttribute(pColors,3));
  const pm=new THREE.PointsMaterial({size:.065,transparent:true,opacity:.5,depthWrite:false,vertexColors:true,blending:THREE.AdditiveBlending});particles=new THREE.Points(pg,pm);scene.add(particles);
  obstacleGroup=new THREE.Group();scene.add(obstacleGroup);applyQuality();
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();error('图形上下文已中断。可以关闭其他占用显卡的标签页后重新加载。');});
}
function applyQuality(){
  if(!renderer||fallbackMode){syncSettings();return;}
  const ratios={high:1.55,balanced:1.05,low:.72};renderer.setPixelRatio(Math.min(devicePixelRatio||1,ratios[settings.quality]));
  renderer.shadowMap.enabled=settings.quality!=='low';const size=settings.quality==='high'?2048:1024;sunlight.shadow.mapSize.set(size,size);if(sunlight.shadow.map){sunlight.shadow.map.dispose();sunlight.shadow.map=null;}
  particles.visible=settings.quality!=='low';resize();syncSettings();
}
function resize(){if(fallback){fallback.resize();return;}if(!renderer)return;const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.8?82:74;camera.updateProjectionMatrix();}
function loadScene(){
  if(fallbackMode){fallback.loadScene(selected);loadedScene=selected.id;previewDistance=8;cameraX=0;cameraY=1.7;cameraRoll=0;return;}
  if(world){scene.remove(world.group);world.dispose();}
  world=createWorld(selected.id,{quality:settings.quality});scene.add(world.group);loadedScene=selected.id;
  const s=world.settings;scene.background=new THREE.Color(s.sky);const f=s.fog;scene.fog=new THREE.Fog(f.color,f.near,f.far);renderer.toneMappingExposure=s.exposure||1;
  hemisphere.color.set(s.ambientColor);hemisphere.groundColor.set(s.groundColor);hemisphere.intensity=selected.id==='castle'?1.55:2.05;
  sunlight.color.set(s.sunColor);sunlight.intensity=s.sunIntensity;sunlight.position.set(...s.sunPosition);
  sky.material.uniforms.top.value.set(s.sky);sky.material.uniforms.bottom.value.set(f.color);sky.material.uniforms.glow.value.set(s.sunColor);sky.material.uniforms.sun.value.copy(sunlight.position).normalize();
  particles.material.opacity=selected.id==='castle'?.2:.5;
  previewDistance=8;world.update(previewDistance,0);cameraX=0;cameraY=1.7;cameraRoll=0;camera.position.set(0,1.7,0);camera.rotation.set(0,0,0);clearObjects();
}
function clearObjects(){if(fallbackMode)return;for(const m of objects.values())obstacleGroup.remove(m);objects.clear();for(const r of obstacleResources)r.dispose();obstacleResources=[];}
function makeObjects(){
  if(fallbackMode)return;
  clearObjects();
  const stoneColor={egypt:0x9d7e4f,khmer:0x647260,maya:0x8c9576,wall:0x6c7171,castle:0x5d6066}[selected.id];
  const stone=new THREE.MeshStandardMaterial({color:stoneColor,roughness:.92});const dark=new THREE.MeshStandardMaterial({color:0x33251b,roughness:.9});
  const brass=new THREE.MeshStandardMaterial({color:0xc08c3a,roughness:.35,metalness:.7,emissive:0x38230b,emissiveIntensity:.2});const gem=new THREE.MeshStandardMaterial({color:0xffda7b,emissive:0xffad32,emissiveIntensity:1.15,metalness:.55,roughness:.2});
  const black=new THREE.MeshBasicMaterial({color:0x070b0a});const gtex=glowTexture();const glowMat=new THREE.SpriteMaterial({map:gtex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.36});
  const box=new THREE.BoxGeometry(1,1,1),rock=new THREE.DodecahedronGeometry(.5,0),crystal=new THREE.OctahedronGeometry(.2,0),ring=new THREE.TorusGeometry(.24,.018,6,24);
  obstacleResources.push(stone,dark,brass,gem,black,gtex,glowMat,box,rock,crystal,ring);
  const mesh=(geometry,material,parent,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  for(const o of run.objects){
    const group=new THREE.Group();group.position.set(o.lane*logic.LANE_WIDTH,0,-o.distance);
    if(o.kind==='relic'){
      const c=mesh(crystal,gem,group,0,1.13,0,1,1.4,1);c.rotation.z=.12;
      const r=mesh(ring,brass,group,0,1.13,0);r.rotation.x=.25;
      const halo=new THREE.Sprite(glowMat);halo.position.y=1.13;halo.scale.set(1.25,1.25,1);group.add(halo);
    }else if(o.kind==='barrier'){
      mesh(box,stone,group,0,.37,0,1.5,.74,.9);
      for(let i=0;i<5;i++){const r=mesh(rock,stone,group,(i-2)*.31,.76+Math.sin(i*2)*.06,(i%2-.5)*.16,.5,.3,.8);r.rotation.set(i*.4,.4*i,i*.15);}
      mesh(box,brass,group,0,.78,.47,1.2,.045,.025);
    }else if(o.kind==='beam'){
      mesh(box,dark,group,0,1.43,0,1.7,.55,.6);
      for(const x of [-.8,.8]){mesh(box,dark,group,x,1.05,0,.12,2.1,.25);mesh(box,brass,group,x,1.43,.31,.08,.56,.025);}
      mesh(box,brass,group,0,1.16,.31,1.6,.035,.035);
    }else if(o.kind==='gap'){
      mesh(box,black,group,0,.018,0,1.65,.03,2.4);
      for(const z of [-1.25,1.25]){const lip=mesh(box,stone,group,0,.06,z,1.78,.13,.16);lip.rotation.z=.01;}
      for(const x of [-.88,.88])mesh(box,stone,group,x,.04,0,.13,.09,2.5);
      for(let i=0;i<3;i++){const r=mesh(rock,stone,group,(i-1)*.6,.08,1.35,.25,.16,.25);r.rotation.y=i;}
    }
    group.visible=false;group.userData.kind=o.kind;objects.set(o.id,group);obstacleGroup.add(group);
  }
}
function updateObjects(time){
  if(fallbackMode)return;
  for(const o of run.objects){const group=objects.get(o.id);if(!group)continue;const z=run.distance-o.distance;group.visible=!o.collected&&z<5&&z>-152;if(!group.visible)continue;group.position.z=z;if(o.kind==='relic'){group.rotation.y=time*1.8+o.distance*.12;group.position.y=Math.sin(time*2.2+o.distance)*.08;}}
}
function setCoach(text){if(currentCoach!==text){$('#coach').textContent=text;currentCoach=text;}}
function updateHUD(){
  $('#distance').textContent=Math.floor(run.distance);$('#progress').style.width=`${Math.min(100,run.distance/logic.RUN_LENGTH*100)}%`;$('#relics').textContent=run.relics;$('#speed').textContent=Math.round(run.speed*3.6);
  $('#health').textContent=Array.from({length:3},(_,i)=>i<run.health?'◆':'◇').join(' ');$('#health').setAttribute('aria-label',`剩余 ${run.health} 次容错`);
  if(run.invincible>0){setCoach('擦碰了一下，稳住节奏');return;}
  const hazard=run.objects.find(o=>o.kind!=='relic'&&!o.passed&&Math.abs(o.lane*logic.LANE_WIDTH-run.x)<.9&&o.distance-run.distance>0&&o.distance-run.distance<20);
  if(hazard)setCoach(({barrier:'前方低石障 · 跳跃或变道',beam:'前方横梁 · 滑铲或变道',gap:'前方裂隙 · 跳跃或变道'})[hazard.kind]);
  else if(run.distance<35)setCoach('自动向前奔跑 · A / D 变道 · 空格跳跃 · S 滑铲');
  else if(run.distance>logic.RUN_LENGTH-80)setCoach('出口就在前面，最后一段！');
  else setCoach('');
}
function start(){
  if(!isReady||menuBusy)return;
  $('#pause-panel').hidden=true;$('#result-panel').hidden=true;$('#settings-dialog').close();
  clearTimeout(hitTimer);$('#hit-flash').classList.remove('active');pausedCountdown=false;
  fpsSeconds=0;fpsFrames=0;slowWindows=0;
  runNumber++;run=logic.createRun({scene:selected.id,seed:selected.seed+runNumber-1});endingShown=false;cameraX=0;cameraY=1.7;cameraRoll=0;
  if(loadedScene!==selected.id)loadScene();if(world)world.update(0,0);makeObjects();updateObjects(0);updateHUD();audio.activate();
  mode('countdown');countdownRemaining=1.95;lastTime=performance.now();$('#countdown').hidden=false;$('#countdown').textContent='3';audio.tone(440,.12,'sine',.12);
}
function advanceCountdown(dt){
  if(document.body.dataset.mode!=='countdown'||run?.status!=='ready')return;
  countdownRemaining=Math.max(0,countdownRemaining-dt);
  if(countdownRemaining===0){$('#countdown').hidden=true;logic.startRun(run);mode('playing');audio.tone(880,.2,'sine',.15);return;}
  const count=String(Math.ceil(countdownRemaining/.65));
  if($('#countdown').textContent!==count){$('#countdown').textContent=count;audio.tone(440,.12,'sine',.12);}
}
function pause(){
  if(run?.status==='ready'&&document.body.dataset.mode==='countdown'){pausedCountdown=true;$('#countdown').hidden=true;}
  else if(run?.status==='running')logic.act(run,'pause');
  else return;
  mode('paused');$('#pause-panel').hidden=false;$('#resume').focus();audio.mute();
}
function resume(){
  if($('#settings-dialog').open)return;
  if(pausedCountdown&&run?.status==='ready'){pausedCountdown=false;mode('countdown');$('#countdown').hidden=false;}
  else if(run?.status==='paused'){logic.act(run,'resume');mode('playing');}
  else return;
  $('#pause-panel').hidden=true;lastTime=performance.now();audio.activate();canvas.focus({preventScroll:true});
}
function backToMenu(){countdownRemaining=0;pausedCountdown=false;$('#countdown').hidden=true;$('#pause-panel').hidden=true;$('#result-panel').hidden=true;clearTimeout(hitTimer);$('#hit-flash').classList.remove('active');mode('menu');clearObjects();run=null;previewDistance=8;endingShown=false;cameraX=0;cameraY=1.7;cameraRoll=0;$('#start').focus();audio.mute();}
async function chooseScene(id){
  if(menuBusy)return;const next=themeFor(id);if(next.id===selected.id&&loadedScene)return;
  // Scene cards are usable while modules load; construction waits for init().
  if(!isReady){selected=next;renderSelection();return;}
  menuBusy=true;$('#start').disabled=true;$('#start-label').textContent='正在穿过时空…';selected=next;renderSelection();
  try{await new Promise(resolve=>requestAnimationFrame(resolve));loadScene();$('#start-label').textContent='踏入遗迹';$('#start').disabled=false;}catch(e){console.error(e);error('这个场景未能加载，请重新打开游戏。');}finally{menuBusy=false;}
}
function finish(){
  if(endingShown)return;endingShown=true;mode('result');const won=run.status==='won';$('#result-title').textContent=won?'你带回了失落的光。':'再试一次，更远一点。';$('#result-eyebrow').textContent=won?'EXPEDITION COMPLETE':'THE JOURNEY CONTINUES';
  $('#result-message').textContent=won?`${selected.title} · ${Math.round(run.elapsed)} 秒的遗迹之旅。下一段冒险，由你选择。`:'沿着金色遗物观察路线。提前变道，遇到横梁时试试滑铲。';
  $('#result-distance').textContent=Math.floor(run.distance);$('#result-relics').textContent=run.relics;$('#result-score').textContent=run.score;
  const old=Number(bests[selected.id]?.score)||0,newBest=run.score>old;
  if(newBest){bests[selected.id]={score:run.score,distance:Math.floor(run.distance),relics:run.relics,completed:won,date:new Date().toISOString()};try{localStorage.setItem(storageKey,JSON.stringify(bests));}catch{}}
  $('#best-line').textContent=`${newBest?'新的个人纪录 · ':''}${selected.name}最佳得分 ${Math.max(old,run.score)} · 保存在本机浏览器`;
  $('#result-panel').hidden=false;$('#retry').focus();
}
function action(name){if(run?.status==='running'){logic.act(run,name);audio.activate();}else if(name==='resume')resume();}
function animate(now){
  frameHandle=requestAnimationFrame(animate);if((!renderer||!world)&&!fallbackMode)return;const realDt=Math.min((now-(lastTime||now))/1000,.15),dt=Math.min(realDt,.05);lastTime=now;const t=now/1000;
  advanceCountdown(realDt);
  if(fallbackMode){animateFallback(realDt,t);return;}
  if(document.body.dataset.mode==='menu'){
    previewDistance+=dt*.4;world.update(previewDistance,t);camera.position.set(Math.sin(t*.11)*.18,1.85+Math.sin(t*.17)*.025,0);camera.rotation.set(-.015,Math.sin(t*.09)*.018,0);camera.fov=canvas.clientWidth/canvas.clientHeight<.8?82:74;
  }else if(run){
    if(run.status==='running'){
      logic.stepRun(run,realDt);world.update(run.distance,t);updateObjects(t);updateHUD();
      for(const e of run.events){audio.event(e.type);if(e.type==='hit'){clearTimeout(hitTimer);$('#hit-flash').classList.add('active');hitTimer=setTimeout(()=>$('#hit-flash').classList.remove('active'),260);}}
      if(run.jumpY<.1&&run.slide<=0)audio.step(t,run.speed);
    }else if(run.status==='ready'){world.update(0,t);updateObjects(t);}
    const s=1-Math.exp(-dt*13);const laneVelocity=(run.x-cameraX)/Math.max(realDt,.001);cameraX=run.x;const sliding=run.slide>0;
    const bob=settings.bob&&run.status==='running'&&run.jumpY<.05&&!sliding?Math.sin(run.distance*1.45)*.034:0;
    const targetY=1.7+run.jumpY-(sliding?.85:0)+bob;cameraY+=(targetY-cameraY)*(1-Math.exp(-dt*20));
    cameraRoll+=((settings.bob?-laneVelocity*.003:0)-cameraRoll)*s;
    camera.position.set(cameraX,cameraY,0);camera.rotation.set(sliding?.055:-.008,-laneVelocity*.001,cameraRoll);
    const baseFov=canvas.clientWidth/canvas.clientHeight<.8?82:74;camera.fov+=(baseFov+(run.speed-11)*.45-camera.fov)*dt*4;
    if((run.status==='over'||run.status==='won')&&!endingShown)finish();
  }
  camera.updateProjectionMatrix();particles.rotation.y=Math.sin(t*.03)*.03;particles.position.z=Math.sin(t*.3)*1.6;
  renderer.render(scene,camera);
  if(document.body.dataset.mode==='playing'){
    fpsSeconds+=realDt;fpsFrames++;if(fpsSeconds>3){const fps=fpsFrames/fpsSeconds;if(fps<24)slowWindows++;else slowWindows=0;if(slowWindows>=2&&settings.quality!=='low'){settings.quality=settings.quality==='high'?'balanced':'low';applyQuality();notice('已降低画面负载，让奔跑更流畅；可以在设置中调整。');slowWindows=0;}fpsSeconds=0;fpsFrames=0;}
  }
}

function animateFallback(dt,time){
  const menu=document.body.dataset.mode==='menu';
  if(menu)previewDistance+=dt*.4;
  else if(run?.status==='running'){
    logic.stepRun(run,dt);updateHUD();
    for(const e of run.events){audio.event(e.type);if(e.type==='hit'){clearTimeout(hitTimer);$('#hit-flash').classList.add('active');hitTimer=setTimeout(()=>$('#hit-flash').classList.remove('active'),260);}}
    if(run.jumpY<.1&&run.slide<=0)audio.step(time,run.speed);
  }
  fallback.render({distance:menu?previewDistance:(run?.distance||0),time,x:menu?0:(run?.x||0),jumpY:menu?0:(run?.jumpY||0),slide:menu?0:(run?.slide||0),objects:menu?[]:(run?.objects||[]),status:run?.status||'ready',menu,bob:settings.bob});
  if(run&&(run.status==='over'||run.status==='won')&&!endingShown)finish();
}

function bindControls(){
  $('#scene-list').addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(b)chooseScene(b.dataset.scene);});
  $('#start').addEventListener('click',start);$('#retry').addEventListener('click',start);$('#pause-restart').addEventListener('click',start);$('#pause').addEventListener('click',pause);$('#resume').addEventListener('click',resume);$('#pause-menu').addEventListener('click',backToMenu);$('#result-menu').addEventListener('click',backToMenu);
  $('#next-scene').addEventListener('click',async()=>{backToMenu();await chooseScene(THEMES[(THEMES.findIndex(t=>t.id===selected.id)+1)%THEMES.length].id);});
  $('#settings-open').addEventListener('click',()=>{pause();$('#settings-dialog').showModal();});$('#settings-close').addEventListener('click',()=>$('#settings-dialog').close());
  $('#settings-dialog').addEventListener('close',()=>{if(document.body.dataset.mode==='paused')$('#resume').focus();});
  $('#quality').addEventListener('change',e=>{settings.quality=e.target.value;applyQuality();persistSettings();});$('#head-bob').addEventListener('change',e=>{settings.bob=e.target.checked;persistSettings();});
  const setSound=value=>{settings.sound=value;if(value)audio.activate();else audio.mute();syncSettings();persistSettings();};$('#sound-toggle').addEventListener('click',()=>setSound(!settings.sound));$('#sound-setting').addEventListener('change',e=>setSound(e.target.checked));
  $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#game-shell').requestFullscreen();}catch{notice('当前浏览器不支持页面全屏，可以使用系统全屏功能。');}});$('#reload').addEventListener('click',()=>location.reload());
  $('#compatibility-reload').addEventListener('click',()=>{const url=new URL(location.href);url.searchParams.set('renderer','canvas');location.assign(url);});
  document.addEventListener('keydown',e=>{
    if($('#settings-dialog').open||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(e.key==='Tab'&&['paused','result'].includes(document.body.dataset.mode)){
      const panel=document.body.dataset.mode==='paused'?$('#pause-panel'):$('#result-panel');
      const buttons=[...panel.querySelectorAll('button:not([disabled]),a[href]')];
      const first=buttons[0],last=buttons[buttons.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      return;
    }
    const key=e.key.toLowerCase();
    if(['arrowleft','arrowright','arrowup','arrowdown',' ','a','d','w','s'].includes(key)&&run?.status==='running'){e.preventDefault();if(!e.repeat)action(({'arrowleft':'left','a':'left','arrowright':'right','d':'right','arrowup':'jump','w':'jump',' ':'jump','s':'slide','arrowdown':'slide'})[key]);}
    if((key==='escape'||key==='p')&&!e.repeat){if(run?.status==='running'||(run?.status==='ready'&&document.body.dataset.mode==='countdown'))pause();else if(document.body.dataset.mode==='paused')resume();}
    if(key==='r'&&!e.repeat&&run&&document.body.dataset.mode!=='countdown'){e.preventDefault();start();}
  });
  document.querySelectorAll('[data-action]').forEach(button=>{button.addEventListener('pointerdown',e=>{e.preventDefault();action(button.dataset.action);});button.addEventListener('click',e=>{if(e.detail===0)action(button.dataset.action);});});
  window.addEventListener('resize',resize);window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();lastTime=performance.now();});
}
function bindCanvasControls(){
  let pointer=null;
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;if(Math.abs(dx)>Math.abs(dy))action(dx>0?'right':'left');else action(dy>0?'slide':'jump');});
  canvas.addEventListener('pointercancel',()=>pointer=null);
}

async function initFallback(){
  const {createFallbackRenderer}=await import('./fallback.mjs');
  // A canvas can have one context type. Replace it after a partial WebGL init.
  const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;
  if(renderer){renderer.dispose();renderer=null;}
  fallbackMode=true;fallback=createFallbackRenderer(canvas);
  $('.scene-caption small').textContent='COMPATIBILITY VIEW · FIRST PERSON';
  $('#quality').disabled=true;$('#quality').title='当前浏览器使用兼容画面';
  $('#quality-help').textContent='已使用兼容画面；完整三维光照需要浏览器支持 WebGL 2。';
  canvas.setAttribute('aria-label','可玩的第一人称兼容场景');syncSettings();
}

async function init(){
  renderSelection();syncSettings();bindControls();
  try{
    logic=await import('./logic.mjs');
    if(new URL(location.href).searchParams.get('renderer')==='canvas')await initFallback();
    else{
      [THREE,{createWorld}]=await Promise.all([import('./vendor/three.module.js'),import('./world.mjs')]);
      try{initRenderer();}
      catch(graphicsError){console.info('WebGL unavailable; using Canvas compatibility renderer.',graphicsError.message);await initFallback();notice('当前浏览器未启用 WebGL，已进入可玩的兼容画面。');}
    }
    bindCanvasControls();loadScene();isReady=true;$('#start').disabled=false;$('#start-label').textContent='踏入遗迹';frameHandle=requestAnimationFrame(animate);
  }
  catch(e){console.error('RELIC RUN could not start',e);error('场景暂未加载完成，请重新加载，或尝试兼容画面。完整三维模式需要启用 WebGL 2。');}
}
init();
