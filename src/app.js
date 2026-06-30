/**
 * app.js — Family tree rendering & interaction logic
 */

/* ── State ── */
let selectedId = null;
let scale = 1, panX = 0, panY = 0;
let isPanning = false, startX = 0, startY = 0, startPanX = 0, startPanY = 0;

// In-memory photo store: { personId: dataURL }
const photos = {};

/* ── Layout constants (mirrors CSS vars) ── */
const NODE_W  = 110;
const NODE_H  = 115;
const COL_GAP = 130;
const ROW_GAP = 155;

/* ── Helpers ── */
function getPos(p) {
  const cx = 650, cy = 420;
  return {
    x: cx + p.col * COL_GAP - NODE_W / 2,
    y: cy - p.gen * ROW_GAP - NODE_H / 2,
  };
}

function avatarClasses(color) {
  const map = { you: 'avatar-you', parent: 'avatar-parent', grand: 'avatar-grand', other: 'avatar-other' };
  return map[color] || 'avatar-other';
}

function initials(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

/* ── Render ── */
function render() {
  const canvas = document.getElementById('ft-canvas');
  const svg    = document.getElementById('ft-lines');

  const posMap = {};
  people.forEach(p => { posMap[p.id] = getPos(p); });

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  people.forEach(p => {
    const pos = posMap[p.id];
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + NODE_W);
    maxY = Math.max(maxY, pos.y + NODE_H);
  });

  const W  = maxX - minX + 120;
  const H  = maxY - minY + 120;
  const ox = -minX + 60;
  const oy = -minY + 60;

  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  svg.setAttribute('width',  W);
  svg.setAttribute('height', H);
  svg.style.width  = W + 'px';
  svg.style.height = H + 'px';

  // Draw edges
  let svgHTML = '';
  edges.forEach(([aId, bId, type]) => {
    const pa = posMap[aId], pb = posMap[bId];
    if (!pa || !pb) return;
    const ax = pa.x + ox + NODE_W / 2, ay = pa.y + oy + NODE_H / 2;
    const bx = pb.x + ox + NODE_W / 2, by = pb.y + oy + NODE_H / 2;

    if (type === 'couple') {
      svgHTML += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"
        stroke="#C9A84C" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7"/>`;
    } else {
      const my = (ay + by) / 2;
      svgHTML += `<path d="M${ax},${ay} C${ax},${my} ${bx},${my} ${bx},${by}"
        fill="none" stroke="#bbb" stroke-width="1.2"/>`;
    }
  });
  svg.innerHTML = svgHTML;

  // Draw nodes
  canvas.innerHTML = '';
  people.forEach(p => {
    const pos  = posMap[p.id];
    const x    = pos.x + ox;
    const y    = pos.y + oy;
    const avCls = avatarClasses(p.color);
    const photoSrc = photos[p.id];
    const isYou     = p.id === 'you';
    const isSelected = selectedId === p.id;
    const genClass  = p.color === 'parent' ? 'gen-1' : p.color === 'grand' ? 'gen-2' : '';

    let nodeClass = 'ft-node';
    if (isYou)     nodeClass += ' you';
    if (isSelected) nodeClass += ' selected';
    if (genClass)  nodeClass += ' ' + genClass;

    const avatarInner = photoSrc
      ? `<img src="${photoSrc}" alt="${p.name}">`
      : `<span>${p.avatar}</span>`;

    const el = document.createElement('div');
    el.className   = nodeClass;
    el.style.left  = x + 'px';
    el.style.top   = y + 'px';
    el.dataset.id  = p.id;
    el.innerHTML   = `
      <div class="ft-avatar ${avCls}">${avatarInner}</div>
      <div class="ft-name">${p.name}</div>
      ${p.rel ? `<div class="ft-rel">${p.rel}</div>` : ''}
      ${isYou ? '<div class="ft-you-badge">YOU</div>' : ''}
    `;

    el.addEventListener('click', e => { e.stopPropagation(); selectPerson(p.id); });
    canvas.appendChild(el);
  });
}

/* ── Selection & panel ── */
function selectPerson(id) {
  selectedId = id;
  const p = people.find(x => x.id === id);
  if (!p) return;

  const panel   = document.getElementById('ft-panel');
  const avEl    = document.getElementById('pp-avatar');
  const avCls   = avatarClasses(p.color);

  panel.classList.add('open');

  avEl.className = 'ft-panel-avatar ' + avCls;
  avEl.innerHTML = photos[p.id]
    ? `<img src="${photos[p.id]}" alt="${p.name}">`
    : `<span>${p.avatar}</span>`;

  document.getElementById('pp-name').textContent       = p.name;
  document.getElementById('pp-rel').textContent        = p.rel || 'You';
  document.getElementById('pp-name-input').value       = p.name;
  document.getElementById('pp-year-input').value       = p.year  || '';
  document.getElementById('pp-notes-input').value      = p.notes || '';

  render();
}

function closePanel() {
  selectedId = null;
  document.getElementById('ft-panel').classList.remove('open');
  render();
}

function savePerson() {
  if (!selectedId) return;
  const p = people.find(x => x.id === selectedId);
  if (!p) return;

  const newName = document.getElementById('pp-name-input').value.trim();
  if (newName) {
    p.name   = newName;
    p.avatar = initials(newName);
  }
  p.year  = document.getElementById('pp-year-input').value.trim();
  p.notes = document.getElementById('pp-notes-input').value.trim();

  // Update panel header
  document.getElementById('pp-name').textContent = p.name;

  // Update avatar initials if no photo
  if (!photos[p.id]) {
    document.getElementById('pp-avatar').innerHTML = `<span>${p.avatar}</span>`;
  }

  render();
}

/* ── Photo upload ── */
document.getElementById('pp-photo-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file || !selectedId) return;
  const reader = new FileReader();
  reader.onload = ev => {
    photos[selectedId] = ev.target.result;
    const p = people.find(x => x.id === selectedId);
    document.getElementById('pp-avatar').innerHTML = `<img src="${ev.target.result}" alt="${p.name}">`;
    render();
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

/* ── Pan & zoom ── */
function applyTransform() {
  const t = `scale(${scale}) translate(${panX}px, ${panY}px)`;
  document.getElementById('ft-canvas').style.transform = t;
  document.getElementById('ft-lines').style.transform  = t;
}

function zoom(factor) {
  scale = Math.min(Math.max(scale * factor, 0.25), 2.5);
  applyTransform();
}

function resetView() {
  scale = 1; panX = 0; panY = 0;
  applyTransform();
}

const wrap = document.getElementById('ft-canvas-wrap');

wrap.addEventListener('mousedown', e => {
  if (e.target.closest('.ft-node') || e.target.closest('#ft-panel')) return;
  isPanning = true;
  startX = e.clientX; startY = e.clientY;
  startPanX = panX;   startPanY = panY;
  wrap.classList.add('grabbing');
});

window.addEventListener('mousemove', e => {
  if (!isPanning) return;
  panX = startPanX + (e.clientX - startX) / scale;
  panY = startPanY + (e.clientY - startY) / scale;
  applyTransform();
});

window.addEventListener('mouseup', () => {
  isPanning = false;
  wrap.classList.remove('grabbing');
});

wrap.addEventListener('wheel', e => {
  e.preventDefault();
  zoom(e.deltaY < 0 ? 1.08 : 0.93);
}, { passive: false });

// Close panel when clicking canvas background
document.getElementById('ft-app').addEventListener('click', e => {
  if (!e.target.closest('.ft-node') && !e.target.closest('#ft-panel')) closePanel();
});

// Keyboard shortcut: Escape closes panel
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePanel();
});

/* ── Init ── */
render();
