// Placeholder people inserted automatically on first login.
// gen: 0=you, 1=parents, 2=grandparents, -1=children
// col: horizontal position (0=center, neg=left, pos=right)

export const DEFAULT_PEOPLE = [
  { key:'you',     name:'You',                relation:'',                    gen:0,  col:0,  color_tag:'you',    is_root:true  },
  { key:'partner', name:'Partner / Spouse',   relation:'Partner',             gen:0,  col:1,  color_tag:'other',  is_root:false },
  { key:'sis',     name:'Sister',             relation:'Sister',              gen:0,  col:-2, color_tag:'other',  is_root:false },
  { key:'sis_h',   name:"Sister's husband",   relation:'Brother-in-law',      gen:0,  col:-3, color_tag:'other',  is_root:false },
  { key:'bro',     name:'Brother',            relation:'Brother',             gen:0,  col:2,  color_tag:'other',  is_root:false },
  { key:'bro_w',   name:"Brother's wife",     relation:'Sister-in-law',       gen:0,  col:3,  color_tag:'other',  is_root:false },
  { key:'cous1',   name:'Cousin 1',           relation:'Cousin (mom side)',   gen:0,  col:-5, color_tag:'other',  is_root:false },
  { key:'cous2',   name:'Cousin 2',           relation:'Cousin (mom side)',   gen:0,  col:-4, color_tag:'other',  is_root:false },
  { key:'cous3',   name:'Cousin 3',           relation:'Cousin (dad side)',   gen:0,  col:4,  color_tag:'other',  is_root:false },
  { key:'cous4',   name:'Cousin 4',           relation:'Cousin (dad side)',   gen:0,  col:5,  color_tag:'other',  is_root:false },
  { key:'neph',    name:'Nephew',             relation:"Brother's son",       gen:-1, col:2,  color_tag:'other',  is_root:false },
  { key:'niece',   name:'Niece',              relation:"Brother's daughter",  gen:-1, col:3,  color_tag:'other',  is_root:false },
  { key:'mom',     name:'Mom',                relation:'Mother',              gen:1,  col:-1, color_tag:'parent', is_root:false },
  { key:'dad',     name:'Dad',                relation:'Father',              gen:1,  col:1,  color_tag:'parent', is_root:false },
  { key:'maunt',   name:'Aunt (mom side)',    relation:'Maternal aunt',       gen:1,  col:-3, color_tag:'parent', is_root:false },
  { key:'muncle',  name:'Uncle (mom side)',   relation:'Maternal uncle',      gen:1,  col:-4, color_tag:'parent', is_root:false },
  { key:'paunt',   name:'Aunt (dad side)',    relation:'Paternal aunt',       gen:1,  col:3,  color_tag:'parent', is_root:false },
  { key:'puncle',  name:'Uncle (dad side)',   relation:'Paternal uncle',      gen:1,  col:4,  color_tag:'parent', is_root:false },
  { key:'mgm',     name:'Maternal grandma',   relation:"Mom's mother",        gen:2,  col:-2, color_tag:'grand',  is_root:false },
  { key:'mgf',     name:'Maternal grandpa',   relation:"Mom's father",        gen:2,  col:-1, color_tag:'grand',  is_root:false },
  { key:'pgm',     name:'Paternal grandma',   relation:"Dad's mother",        gen:2,  col:1,  color_tag:'grand',  is_root:false },
  { key:'pgf',     name:'Paternal grandpa',   relation:"Dad's father",        gen:2,  col:2,  color_tag:'grand',  is_root:false },
]

export const DEFAULT_EDGES = [
  ['mom','you','parent_child'],   ['dad','you','parent_child'],
  ['mom','sis','parent_child'],   ['dad','sis','parent_child'],
  ['mom','bro','parent_child'],   ['dad','bro','parent_child'],
  ['you','partner','couple'],
  ['sis','sis_h','couple'],
  ['bro','bro_w','couple'],
  ['mgm','mom','parent_child'],   ['mgf','mom','parent_child'],
  ['pgm','dad','parent_child'],   ['pgf','dad','parent_child'],
  ['mgm','maunt','parent_child'], ['mgf','maunt','parent_child'],
  ['mgm','muncle','parent_child'],['mgf','muncle','parent_child'],
  ['pgm','paunt','parent_child'], ['pgf','paunt','parent_child'],
  ['pgm','puncle','parent_child'],['pgf','puncle','parent_child'],
  ['maunt','cous1','parent_child'],['muncle','cous1','parent_child'],
  ['maunt','cous2','parent_child'],['muncle','cous2','parent_child'],
  ['paunt','cous3','parent_child'],['puncle','cous3','parent_child'],
  ['paunt','cous4','parent_child'],['puncle','cous4','parent_child'],
  ['bro','neph','parent_child'],  ['bro_w','neph','parent_child'],
  ['bro','niece','parent_child'], ['bro_w','niece','parent_child'],
]
