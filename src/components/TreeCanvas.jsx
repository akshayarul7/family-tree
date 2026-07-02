import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import PersonNode from './PersonNode'
import EdgeLines  from './EdgeLines'

export const NODE_W = 110
export const NODE_H = 120
const COL_GAP = 132
const ROW_GAP = 158
const PAD     = 70

function buildLayout(people) {
  if (!people.length) return { posMap:{}, width:900, height:600 }

  const cx = 700, cy = 450
  const raw = {}
  people.forEach(p => {
    raw[p.id] = {
      x: cx + Number(p.col) * COL_GAP - NODE_W / 2,
      y: cy - Number(p.gen) * ROW_GAP - NODE_H / 2,
    }
  })

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  people.forEach(p => {
    minX = Math.min(minX, raw[p.id].x)
    minY = Math.min(minY, raw[p.id].y)
    maxX = Math.max(maxX, raw[p.id].x + NODE_W)
    maxY = Math.max(maxY, raw[p.id].y + NODE_H)
  })

  const ox = -minX + PAD, oy = -minY + PAD
  const posMap = {}
  people.forEach(p => { posMap[p.id] = { x: raw[p.id].x + ox, y: raw[p.id].y + oy } })

  return { posMap, width: maxX - minX + PAD * 2, height: maxY - minY + PAD * 2 }
}

export default function TreeCanvas({ people, relationships, selectedId, onSelect, onDeselect }) {
  const wrapRef   = useRef(null)
  const panRef    = useRef({ active: false, startX:0, startY:0, startPanX:0, startPanY:0 })
  const [scale,   setScale] = useState(1)
  const [pan,     setPan]   = useState({ x:0, y:0 })

  const { posMap, width, height } = useMemo(() => buildLayout(people), [people])

  const applyZoom = useCallback(factor => {
    setScale(s => Math.min(Math.max(s * factor, 0.2), 2.8))
  }, [])

  // UPDATED: Dynamically calculates the center of the viewport relative to the tree bounds
  const resetView = useCallback(() => { 
    if (!wrapRef.current) return;
    
    const viewportW = wrapRef.current.clientWidth;
    const viewportH = wrapRef.current.clientHeight;
    
    setScale(1);
    setPan({ 
      x: (viewportW - width) / 2, 
      y: (viewportH - height) / 2 
    });
  }, [width, height]);

  // NEW: Automatically centers the canvas perfectly on initial component mount
  useEffect(() => {
    resetView();
  }, [resetView]);

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
    
    // 1. Get the mouse position relative to the canvas wrapper
    const rect = wrapRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 2. Determine zoom factor (clamped for sensitivity)
    const zoomFactor = 1 - (e.deltaY * 0.001);
    const nextScale = Math.min(Math.max(scale * zoomFactor, 0.2), 2.8);
    const actualScaleChange = nextScale / scale;

    // 3. Calculate how the pan must shift to keep the mouse point stationary
    // Formula: newPan = (mousePos - currentPan) * (1 - scaleChange) / currentScale
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

      <div id="ft-legend">
        <div className="ft-legend-item"><div className="ft-legend-dot you-dot"></div>You</div>
        <div className="ft-legend-item"><div className="ft-legend-dot parent-dot"></div>Parents' generation</div>
        <div className="ft-legend-item"><div className="ft-legend-dot grand-dot"></div>Grandparents</div>
        <div className="ft-legend-item"><div className="ft-legend-dot" style={{width:18,height:0,borderRadius:0,borderTop:'1.5px solid #bbb'}}></div>Parent–child</div>
        <div className="ft-legend-item"><div className="ft-legend-dot" style={{width:18,height:0,borderRadius:0,borderTop:'1.5px dashed #C9A84C'}}></div>Couple</div>
      </div>

      <button id="tree-reset-btn" style={{display:'none'}} onClick={resetView}></button>
    </div>
  )
}