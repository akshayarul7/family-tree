import React from 'react';

export default function EdgeLines({ relationships, posMap, width, height, nodeW, nodeH }) {
  // 1. Map Couples
  const coupleMap = {};
  relationships.forEach(r => {
    if (r.rel_type === 'couple') {
      coupleMap[r.person_a] = r.person_b;
      coupleMap[r.person_b] = r.person_a;
    }
  });

  // 2. Map Families (Ensures spouses share the exact same drop-down stem)
  const familyUnits = {};
  relationships.forEach(r => {
     if (r.rel_type === 'parent_child') {
       const isAParent = posMap[r.person_a]?.y < posMap[r.person_b]?.y;
       const pId = isAParent ? r.person_a : r.person_b;
       const cId = isAParent ? r.person_b : r.person_a;

       const partnerId = coupleMap[pId];
       const familyKey = partnerId ? [pId, partnerId].sort().join('-') : pId;

       if (!familyUnits[familyKey]) {
         familyUnits[familyKey] = {
           parents: partnerId ? [pId, partnerId].sort() : [pId],
           children: new Set()
         };
       }
       familyUnits[familyKey].children.add(cId);
     }
  });

  const families = Object.entries(familyUnits).sort((a,b) => a[0].localeCompare(b[0]));

  return (
    <svg width={width} height={height} style={{ position:'absolute', top:0, left:0, pointerEvents:'none', overflow:'visible' }}>
      
      {/* 1. Explicit Couple Lines */}
      {relationships.filter(r => r.rel_type === 'couple').map(rel => {
        const pa = posMap[rel.person_a], pb = posMap[rel.person_b];
        if (!pa || !pb) return null;
        return <line key={rel.id} x1={pa.x + nodeW/2} y1={pa.y + nodeH/2} x2={pb.x + nodeW/2} y2={pb.y + nodeH/2} stroke="#4A4A4A" strokeWidth="2" />;
      })}

      {/* 2. Vertical Stems, Horizontal Branches, and Child Drops */}
      {families.map(([key, unit]) => {
         const pPositions = unit.parents.map(id => posMap[id]).filter(Boolean);
         if (pPositions.length === 0) return null;

         // Stem X is perfectly centered between parents. Stem Y starts in the middle of the parent card.
         let stemX = pPositions.reduce((sum, p) => sum + (p.x + nodeW/2), 0) / pPositions.length;
         const stemY = pPositions[0].y + nodeH / 2;
         
         // MAGIC FIX: Branch Y is explicitly calculated to be exactly 19 pixels below the bottom of the parent card.
         const branchY = pPositions[0].y + nodeH + 19;

         const childCoords = Array.from(unit.children).map(cId => posMap[cId]).filter(Boolean);
         if (childCoords.length === 0) return null;

         const childXCoords = childCoords.map(c => c.x + nodeW / 2);
         let minX = Math.min(...childXCoords, stemX);
         let maxX = Math.max(...childXCoords, stemX);

         // If there is only ONE child, bypass the crossbar logic and drop straight down
         if (childCoords.length === 1) { 
             stemX = childCoords[0].x + nodeW / 2; 
             minX = stemX; 
             maxX = stemX; 
         }

         return (
           <g key={`family-${key}`}>
             {/* Main Stem Drop */}
             <line x1={stemX} y1={stemY} x2={stemX} y2={branchY} stroke="#4A4A4A" strokeWidth="2" />

             {/* Horizontal Branch (Only renders if there are multiple children) */}
             {minX !== maxX && (
                <line x1={minX} y1={branchY} x2={maxX} y2={branchY} stroke="#4A4A4A" strokeWidth="2" />
             )}

             {/* Drops to individual children */}
             {childCoords.map((c, i) => (
                <line key={`drop-${i}`} x1={c.x + nodeW/2} y1={branchY} x2={c.x + nodeW/2} y2={c.y} stroke="#4A4A4A" strokeWidth="2" />
             ))}
           </g>
         );
      })}
    </svg>
  );
}