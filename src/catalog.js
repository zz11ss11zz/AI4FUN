export const CATEGORY={interactive:'互动',game:'游戏',film:'影像',music:'音乐'};
export const ROLE={code:'AI 辅助编程',visual:'AI 生成画面',audio:'AI 参与声音',runtime:'运行时使用 AI',editing:'AI 辅助后期'};
export const COST={free:'免费',freemium:'部分免费',paid:'付费',unknown:'费用待核对'};
export const LOGIN={none:'无需登录',required:'需要账号',unknown:'账号要求待核对'};
export const DEVICE={desktop:'电脑体验',mobile:'手机体验',both:'电脑 / 手机',unknown:'设备要求见原作'};
export const MODES={play:'立即体验',watch:'观看原作',setup:'查看部署',demo:'查看演示'};
export const FILTERS={free:'免费体验','no-login':'无需登录',code:'有源码',made:'AI 编程/生成素材',mobile:'手机可体验'};
export function isMade(p){return p.aiRole.some(x=>['code','visual','audio','editing'].includes(x));}
export function normalizeSearch(s){return String(s||'').normalize('NFKC').toLocaleLowerCase().trim();}
export function selectProjects(projects,state,saved=[]){
  const favoriteSet=new Set(saved);
  const terms=normalizeSearch(state.q).split(/\s+/).filter(Boolean);
  const selected=new Set(state.filters||[]);
  let result=projects.filter(p=>{
    if(state.view==='saved'&&!favoriteSet.has(p.id))return false;
    if(state.category&&state.category!=='all'&&p.category!==state.category)return false;
    if(state.collection&&!p.collectionIds.includes(state.collection))return false;
    if(selected.has('free')&&p.access.cost!=='free')return false;
    if(selected.has('no-login')&&p.access.login!=='none')return false;
    if(selected.has('code')&&!p.links.code)return false;
    if(selected.has('made')&&!isMade(p))return false;
    if(selected.has('mobile')&&!['mobile','both'].includes(p.access.device))return false;
    const hay=normalizeSearch([p.title,p.subtitle,p.description,p.creator.name,CATEGORY[p.category],...p.tags,...p.tools,...p.aiRole.map(x=>ROLE[x])].join(' '));
    return terms.every(t=>hay.includes(t));
  });
  if(state.sort==='name')result.sort((a,b)=>a.title.localeCompare(b.title,'zh-CN'));
  else if(state.sort==='newest')result.sort((a,b)=>(b.publishedAt||`${b.year||0}-01-01`).localeCompare(a.publishedAt||`${a.year||0}-01-01`));
  else if(state.sort==='recent')result.sort((a,b)=>b.addedAt.localeCompare(a.addedAt));
  else result.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured));
  return result;
}
export function readFavorites(raw,validIds){
  let parsed;try{parsed=JSON.parse(raw||'[]');}catch{return [];}
  const ids=Array.isArray(parsed)?parsed:parsed?.projectIds;
  if(!Array.isArray(ids))return [];
  const valid=validIds instanceof Set?validIds:new Set(validIds);
  return [...new Set(ids.filter(x=>typeof x==='string'&&valid.has(x)))];
}
export function safeExternal(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'#';}catch{return '#';}}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
