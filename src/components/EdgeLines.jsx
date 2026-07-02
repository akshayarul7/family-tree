export default function EdgeLines({ relationships, posMap, width, height, nodeW, nodeH }) {
  return (
    <svg
      width={width} height={height}
      style={{ position:'absolute', top:0, left:0, pointerEvents:'none', overflow:'visible' }}
    >
      {relationships.map(rel => {
        const pa = posMap[rel.person_a];
        const pb = posMap[rel.person_b];
        if (!pa || !pb) return null;

        const ax = pa.x + nodeW / 2;
        const ay = pa.y + nodeH / 2;
        const bx = pb.x + nodeW / 2;
        const by = pb.y + nodeH / 2;

        // 1. Couple Routing (Horizontal Line)
        if (rel.rel_type === 'couple') {
          return (
            <line key={rel.id}
              x1={ax} y1={ay} x2={bx} y2={by}
              stroke="#4A4A4A" strokeWidth="2"
            />
          );
        }

        // 2. Parent-Child Routing
        // Dynamically assign parent/child based on who is higher up (smaller Y) on the canvas
        const isAParent = ay < by;
        const parentId = isAParent ? rel.person_a : rel.person_b;
        const childId = isAParent ? rel.person_b : rel.person_a;
        
        const parentX = isAParent ? ax : bx;
        const parentY = isAParent ? ay : by;
        const childX = isAParent ? bx : ax;
        const childY = isAParent ? by : ay;

        // Default start position is the individual parent's center
        let startX = parentX;

        // Find if this specific child has another parent record in the relationships array
        const otherParentRel = relationships.find(r => 
          r.rel_type !== 'couple' && 
          r.id !== rel.id && // Don't match the current relationship record
          (r.person_a === childId || r.person_b === childId) // Must relate to the same child
        );

        // If the child has a second parent, calculate the exact midpoint between the two parents
        if (otherParentRel) {
          const otherParentId = otherParentRel.person_a === childId ? otherParentRel.person_b : otherParentRel.person_a;
          const otherParentPos = posMap[otherParentId];
          
          if (otherParentPos) {
            const otherParentX = otherParentPos.x + nodeW / 2;
            startX = (parentX + otherParentX) / 2;
          }
        }

        // Calculate the halfway point between generations for the horizontal branching
        const my = (parentY + childY) / 2;
        
        return (
          <path key={rel.id}
            // M: Start at parent's Y, but at the horizontal midpoint (startX)
            // L: Drop down to halfway between generations (my)
            // L: Go across to the child's X coordinate (childX)
            // L: Drop down directly into the child node (childY)
            d={`M ${startX} ${parentY} L ${startX} ${my} L ${childX} ${my} L ${childX} ${childY}`}
            fill="none" 
            stroke="#4A4A4A"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}