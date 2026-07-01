export default function EdgeLines({ relationships, posMap, width, height, nodeW, nodeH }) {
  return (
    <svg
      width={width} height={height}
      style={{ position:'absolute', top:0, left:0, pointerEvents:'none', overflow:'visible' }}
    >
      {relationships.map(rel => {
        const pa = posMap[rel.person_a]
        const pb = posMap[rel.person_b]
        if (!pa || !pb) return null

        const ax = pa.x + nodeW / 2, ay = pa.y + nodeH / 2
        const bx = pb.x + nodeW / 2, by = pb.y + nodeH / 2

        if (rel.rel_type === 'couple') {
          return (
            <line key={rel.id}
              x1={ax} y1={ay} x2={bx} y2={by}
              stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.75"
            />
          )
        }

        const my = (ay + by) / 2
        return (
          <path key={rel.id}
            d={`M${ax},${ay} C${ax},${my} ${bx},${my} ${bx},${by}`}
            fill="none" stroke="#ccc" strokeWidth="1.4"
          />
        )
      })}
    </svg>
  )
}
