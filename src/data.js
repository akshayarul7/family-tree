/**
 * data.js — Family tree data
 *
 * HOW TO EDIT:
 *   - Each person object has: id, name, rel, gen (generation), col (column position),
 *     avatar (initials), color ('you' | 'parent' | 'grand' | 'other'), year, notes
 *   - gen: 0 = your generation, 1 = parents, 2 = grandparents, -1 = children
 *   - col: horizontal position (0 = center, negative = left, positive = right)
 *   - Each edge is [sourceId, targetId] or [sourceId, targetId, 'couple']
 *
 * ADD A PERSON: copy an existing object, give it a unique id, set gen/col, add an edge.
 */

const people = [
  /* ── You ── */
  { id:'you',    name:'You',               rel:'',                     gen:0,  col:0,  avatar:'Y',  color:'you',    year:'', notes:'' },

  /* ── Your generation ── */
  { id:'partner',name:'Partner / Spouse',  rel:'Partner',              gen:0,  col:1,  avatar:'P',  color:'other',  year:'', notes:'' },
  { id:'sis',    name:'Sister',            rel:'Sister',               gen:0,  col:-2, avatar:'S',  color:'other',  year:'', notes:'' },
  { id:'sis_h',  name:"Sister's husband",  rel:'Brother-in-law',       gen:0,  col:-3, avatar:'SH', color:'other',  year:'', notes:'' },
  { id:'bro',    name:'Brother',           rel:'Brother',              gen:0,  col:2,  avatar:'B',  color:'other',  year:'', notes:'' },
  { id:'bro_w',  name:"Brother's wife",    rel:'Sister-in-law',        gen:0,  col:3,  avatar:'BW', color:'other',  year:'', notes:'' },

  /* ── Cousins ── */
  { id:'cous1',  name:'Cousin 1',          rel:'Cousin (mom side)',     gen:0,  col:-5, avatar:'C',  color:'other',  year:'', notes:'' },
  { id:'cous2',  name:'Cousin 2',          rel:'Cousin (mom side)',     gen:0,  col:-4, avatar:'C',  color:'other',  year:'', notes:'' },
  { id:'cous3',  name:'Cousin 3',          rel:'Cousin (dad side)',     gen:0,  col:4,  avatar:'C',  color:'other',  year:'', notes:'' },
  { id:'cous4',  name:'Cousin 4',          rel:'Cousin (dad side)',     gen:0,  col:5,  avatar:'C',  color:'other',  year:'', notes:'' },

  /* ── Next generation ── */
  { id:'neph',   name:'Nephew',            rel:"Brother's son",         gen:-1, col:2,  avatar:'N',  color:'other',  year:'', notes:'' },
  { id:'niece',  name:'Niece',             rel:"Brother's daughter",    gen:-1, col:3,  avatar:'N',  color:'other',  year:'', notes:'' },

  /* ── Parents ── */
  { id:'mom',    name:'Mom',               rel:'Mother',               gen:1,  col:-1, avatar:'M',  color:'parent', year:'', notes:'' },
  { id:'dad',    name:'Dad',               rel:'Father',               gen:1,  col:1,  avatar:'D',  color:'parent', year:'', notes:'' },

  /* ── Aunts & uncles ── */
  { id:'maunt',  name:'Aunt (mom side)',   rel:'Maternal aunt',        gen:1,  col:-3, avatar:'A',  color:'parent', year:'', notes:'' },
  { id:'muncle', name:'Uncle (mom side)',  rel:'Maternal uncle',       gen:1,  col:-4, avatar:'U',  color:'parent', year:'', notes:'' },
  { id:'paunt',  name:'Aunt (dad side)',   rel:'Paternal aunt',        gen:1,  col:3,  avatar:'A',  color:'parent', year:'', notes:'' },
  { id:'puncle', name:'Uncle (dad side)',  rel:'Paternal uncle',       gen:1,  col:4,  avatar:'U',  color:'parent', year:'', notes:'' },

  /* ── Grandparents ── */
  { id:'mgm',    name:'Maternal grandma', rel:"Mom's mother",          gen:2,  col:-2, avatar:'GM', color:'grand',  year:'', notes:'' },
  { id:'mgf',    name:'Maternal grandpa', rel:"Mom's father",          gen:2,  col:-1, avatar:'GF', color:'grand',  year:'', notes:'' },
  { id:'pgm',    name:'Paternal grandma', rel:"Dad's mother",          gen:2,  col:1,  avatar:'GM', color:'grand',  year:'', notes:'' },
  { id:'pgf',    name:'Paternal grandpa', rel:"Dad's father",          gen:2,  col:2,  avatar:'GF', color:'grand',  year:'', notes:'' },
];

const edges = [
  /* parents → you */
  ['mom', 'you'], ['dad', 'you'],
  /* parents → siblings */
  ['mom', 'sis'], ['dad', 'sis'],
  ['mom', 'bro'], ['dad', 'bro'],
  /* couples */
  ['you',  'partner',  'couple'],
  ['sis',  'sis_h',    'couple'],
  ['bro',  'bro_w',    'couple'],
  /* grandparents → parents */
  ['mgm', 'mom'], ['mgf', 'mom'],
  ['pgm', 'dad'], ['pgf', 'dad'],
  /* grandparents → aunts/uncles */
  ['mgm', 'maunt'],  ['mgf', 'maunt'],
  ['mgm', 'muncle'], ['mgf', 'muncle'],
  ['pgm', 'paunt'],  ['pgf', 'paunt'],
  ['pgm', 'puncle'], ['pgf', 'puncle'],
  /* aunts/uncles → cousins */
  ['maunt',  'cous1'], ['muncle', 'cous1'],
  ['maunt',  'cous2'], ['muncle', 'cous2'],
  ['paunt',  'cous3'], ['puncle', 'cous3'],
  ['paunt',  'cous4'], ['puncle', 'cous4'],
  /* brother → kids */
  ['bro', 'neph'],  ['bro_w', 'neph'],
  ['bro', 'niece'], ['bro_w', 'niece'],
];
