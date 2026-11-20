export const THEMES = [
  {id:'egypt',name:'埃及',title:'太阳神的回廊',en:'SANDS OF ETERNITY',region:'尼罗河谷 · 黄昏',description:'风沙掠过巨柱，最后一束金光正穿过失落的神庙。',color:'#edc087',image:'assets/egypt.webp',motif:'沙岩巨柱 / 金字塔 / 金色尘埃',seed:1701},
  {id:'khmer',name:'高棉',title:'雨林的低语',en:'ROOTS OF THE FORGOTTEN',region:'吴哥密林 · 雨后',description:'沿着湿润的石道奔跑，让盘绕的树根与古老石塔从身侧掠过。',color:'#afd5b4',image:'assets/khmer.webp',motif:'青苔石殿 / 盘根古树 / 雨林薄雾',seed:2702},
  {id:'maya',name:'玛雅',title:'翡翠日蚀',en:'THE JADE HORIZON',region:'尤卡坦丛林 · 暮色',description:'越过雨林中的祭祀长道，向阶梯金字塔背后的落日疾行。',color:'#9edace',image:'assets/maya.webp',motif:'阶梯金字塔 / 石碑 / 翡翠祭坛',seed:3703},
  {id:'wall',name:'长城',title:'云海之上',en:'ABOVE THE CLOUDS',region:'群山之巅 · 清晨',description:'穿行敌楼与绵延城垛，在山峦和云海之间找到自己的节奏。',color:'#cedce5',image:'assets/wall.webp',motif:'青砖城垛 / 敌楼 / 层叠远山',seed:4704},
  {id:'castle',name:'欧洲古堡',title:'余烬与月光',en:'EMBERS IN THE DARK',region:'山间古堡 · 午夜',description:'火盆照亮雨后的石廊。穿过尖拱，带着遗物离开沉睡的古堡。',color:'#b9c7ed',image:'assets/castle.webp',motif:'哥特石廊 / 高耸塔楼 / 冷月与火光',seed:5705}
];
export const themeFor = id => THEMES.find(t=>t.id===id) || THEMES[0];
