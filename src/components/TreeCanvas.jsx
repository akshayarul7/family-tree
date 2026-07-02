import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import PersonNode from './PersonNode'
import EdgeLines  from './EdgeLines'

export const NODE_W = 110
export const NODE_H = 120
const ROW_GAP = 158
const PAD     = 70

function buildLayout(people, relationships) {
  if (!people.length) return { posMap:{}, width:900, height:600 }

  const MIN_GAP = NODE_W + 60;
  const COUPLE_GAP = NODE_W + 15;

  const raw = {};
  const gens = {};

  // 1. Initial Setup
  people.forEach(p => {
    raw[p.id] = { ...p, x: 0, y: 450 - Number(p.gen) * ROW_GAP - NODE_H / 2, gen: Number(p.gen) };
    if (!gens[p.gen]) gens[p.gen] = [];
    gens[p.gen].push(raw[p.id]);
  });

  const sortedGens = Object.keys(gens).map(Number).sort((a,b) => a - b);

  // 2. Map Connections
  const coupleMap = {};
  const parentsOf = {};
  const childrenOf = {};

  people.forEach(p => {
    parentsOf[p.id] = [];
    childrenOf[p.id] = [];
  });

  relationships.forEach(r => {
    if (r.rel_type === 'couple') {
      coupleMap[r.person_a] = r.person_b;
      coupleMap[r.person_b] = r.person_a;
    } else if (r.rel_type === 'parent_child') {
      const pA = raw[r.person_a], pB = raw[r.person_b];
      if(!pA || !pB) return;
      const isAParent = pA.gen > pB.gen;
      const pId = isAParent ? r.person_a : r.person_b;
      const cId = isAParent ? r.person_b : r.person_a;
      parentsOf[cId].push(pId);
      childrenOf[pId].push(cId);
    }
  });

  // Helper to group spouses so they are always sorted as a single block
  const getUnits = (genList) => {
    let units = [];
    let processed = new Set();
    genList.forEach(p => {
        if (processed.has(p.id)) return;
        const partnerId = coupleMap[p.id];
        if (partnerId && raw[partnerId] && raw[partnerId].gen === p.gen) {
            units.push([p, raw[partnerId]]);
            processed.add(p.id); processed.add(partnerId);
        } else {
            units.push([p]);
            processed.add(p.id);
        }
    });
    return units;
  };

  // 3. TOP-DOWN PEDIGREE SORT
  // This physically prevents branches from crossing by locking the left-to-right order
  for (let sweep = 0; sweep < 5; sweep++) {
    
    // Sweep Down: Children align to parents
    sortedGens.forEach(g => {
      const units = getUnits(gens[g]);
      units.forEach(unit => {
        let pX = [];
        unit.forEach(p => {
           parentsOf[p.id].forEach(id => { if(raw[id]) pX.push(raw[id].x) });
        });
        unit.idealX = pX.length > 0 ? pX.reduce((a,b)=>a+b,0)/pX.length : unit[0].x;
      });
      units.sort((a, b) => {
         if (Math.abs(a.idealX - b.idealX) > 0.1) return a.idealX - b.idealX;
         return (Number(a[0].col) || 0) - (Number(b[0].col) || 0); // Tie breaker
      });
      gens[g] = units.flat();
      gens[g].forEach((p, i) => p.x = i * MIN_GAP);
    });

    // Sweep Up: Parents slightly align to children (without breaking the top-down order)
    [...sortedGens].reverse().forEach(g => {
      const units = getUnits(gens[g]);
      units.forEach(unit => {
        let cX = [];
        unit.forEach(p => {
           childrenOf[p.id].forEach(id => { if(raw[id]) cX.push(raw[id].x) });
        });
        const currentX = unit[0].x;
        unit.idealX = cX.length > 0 ? (currentX + cX.reduce((a,b)=>a+b,0)/cX.length) / 2 : currentX;
      });
      units.sort((a, b) => {
         if (Math.abs(a.idealX - b.idealX) > 0.1) return a.idealX - b.idealX;
         return (Number(a[0].col) || 0) - (Number(b[0].col) || 0);
      });
      gens[g] = units.flat();
      gens[g].forEach((p, i) => p.x = i * MIN_GAP);
    });
  }

  // 4. Map Family Units for Centering
  const familyUnits = [];
  Object.keys(childrenOf).forEach(pId => {
     if (childrenOf[pId].length > 0) {
        let unit = familyUnits.find(u => u.parents.includes(pId) || (coupleMap[pId] && u.parents.includes(coupleMap[pId])));
        if (!unit) {
            unit = { parents: coupleMap[pId] ? [pId, coupleMap[pId]].sort() : [pId], children: [] };
            familyUnits.push(unit);
        }
        childrenOf[pId].forEach(cId => {
            if (!unit.children.includes(cId)) unit.children.push(cId);
        });
     }
  });

  // 5. EXACT PIXEL CENTERING
  for (let iter = 0; iter < 100; iter++) {
     
     // Center families perfectly over each other
     familyUnits.forEach(unit => {
        const parents = unit.parents.map(id => raw[id]).filter(Boolean);
        const children = unit.children.map(id => raw[id]).filter(Boolean);
        if (parents.length && children.length) {
           const pCenter = parents.reduce((sum, p) => sum + p.x, 0) / parents.length;
           const cCenter = children.reduce((sum, c) => sum + c.x, 0) / children.length;
           const shift = (cCenter - pCenter) * 0.1;
           parents.forEach(p => p.x += shift);
           children.forEach(c => c.x -= shift);
           
           if (children.length === 1) children[0].x = pCenter; // Strike rule for single kids
        }
     });

     // Lock Couples Together tightly
     Object.entries(coupleMap).forEach(([p1, p2]) => {
        if (p1 < p2 && raw[p1] && raw[p2]) {
           const left = raw[p1].x < raw[p2].x ? raw[p1] : raw[p2];
           const right = raw[p1].x < raw[p2].x ? raw[p2] : raw[p1];
           const center = (left.x + right.x) / 2;
           left.x = center - COUPLE_GAP/2;
           right.x = center + COUPLE_GAP/2;
        }
     });

     // Anti-Collision Sweep: Symmetrically push overlapping nodes apart
     Object.values(gens).forEach(list => {
        for (let j = 0; j < list.length - 1; j++) {
           const n1 = list[j], n2 = list[j+1];
           const reqGap = (coupleMap[n1.id] === n2.id) ? COUPLE_GAP : MIN_GAP;
           if (n2.x < n1.x + reqGap) {
              const push = (n1.x + reqGap - n2.x) / 2;
              n1.x -= push;
              n2.x += push;
           }
        }
     });
  }

  // 6. Map to Absolute Pixels
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  people.forEach(p => {
    const finalX = raw[p.id].x - NODE_W / 2
    minX = Math.min(minX, finalX)
    minY = Math.min(minY, raw[p.id].y)
    maxX = Math.max(maxX, finalX + NODE_W)
    maxY = Math.max(maxY, raw[p.id].y + NODE_H)
  })

  const ox = -minX + PAD, oy = -minY + PAD
  const posMap = {}
  people.forEach(p => {
     posMap[p.id] = { x: (raw[p.id].x - NODE_W / 2) + ox, y: raw[p.id].y + oy }
  })

  return { posMap, width: maxX - minX + PAD * 2, height: maxY - minY + PAD * 2 }
}

export default function TreeCanvas({ people, relationships, selectedId, onSelect, onDeselect }) {
  const wrapRef   = useRef(null)
  const panRef    = useRef({ active: false, startX:0, startY:0, startPanX:0, startPanY:0 })
  const [scale,   setScale] = useState(1)
  const [pan,     setPan]   = useState({ x:0, y:0 })

  const { posMap, width, height } = useMemo(() => buildLayout(people, relationships), [people, relationships])

  const applyZoom = useCallback(factor => {
    setScale(s => Math.min(Math.max(s * factor, 0.2), 2.8))
  }, [])

  const resetView = useCallback(() => { 
    if (!wrapRef.current) return;
    const viewportW = wrapRef.current.clientWidth;
    const viewportH = wrapRef.current.clientHeight;
    setScale(1);
    setPan({ x: (viewportW - width) / 2, y: (viewportH - height) / 2 });
  }, [width, height]);

  useEffect(() => { resetView() }, [resetView]);

  function onMouseDown(e) {
    if (e.target.closest('.ft-node') || e.target.closest('.ft-panel')) return
    panRef.current = { active:true, startX:e.clientX, startY:e.clientY, startPanX:pan.x, startPanY:pan.y }
    wrapRef.current?.classList.add('grabbing')
  }
  
  function onMouseMove(e) {
    if (!panRef.current.active) return
    const { startX, startY, startPanX, startPanY } = panRef.current
    setPan({ x: startPanX + (e.clientX - startX)/scale, y: startPanY + (e.clientY - startY)/scale })
  }
  
  function onMouseUp() {
    panRef.current.active = false
    wrapRef.current?.classList.remove('grabbing')
  }

  function onWheel(e) {
    e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1 - (e.deltaY * 0.001);
    const nextScale = Math.min(Math.max(scale * zoomFactor, 0.2), 2.8);
    const actualScaleChange = nextScale / scale;

    setPan(prev => ({
      x: prev.x - (mouseX / scale) * (actualScaleChange - 1),
      y: prev.y - (mouseY / scale) * (actualScaleChange - 1)
    }));
    setScale(nextScale);
  }

  function onBgClick(e) {
    if (!e.target.closest('.ft-node')) onDeselect()
  }

  const t = `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`

  return (
    <div
      id="ft-canvas-wrap" ref={wrapRef}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onWheel={onWheel} onClick={onBgClick}
    >
      <div style={{ position:'absolute', top:0, left:0, transform:t, transformOrigin:'0 0' }}>
        <EdgeLines relationships={relationships} posMap={posMap} width={width} height={height} nodeW={NODE_W} nodeH={NODE_H} />
        <div style={{ position:'relative', width, height }}>
          {people.map(p => {
            const pos = posMap[p.id]
            if (!pos) return null
            return (
              <PersonNode key={p.id} person={p} x={pos.x} y={pos.y}
                isSelected={selectedId === p.id} onClick={onSelect} />
            )
          })}
        </div>
      </div>

      <div id="ft-zoom">
        <button className="ft-zoom-btn" onClick={() => applyZoom(1.15)} title="Zoom in"><i className="ti ti-plus"></i></button>
        <button className="ft-zoom-btn" onClick={() => applyZoom(0.87)} title="Zoom out"><i className="ti ti-minus"></i></button>
      </div>

      <button id="tree-reset-btn" style={{display:'none'}} onClick={resetView}></button>
    </div>
  )
}