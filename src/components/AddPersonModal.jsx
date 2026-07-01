import { useState } from 'react'

const GEN_OPTIONS = [
  { value: 2,  label: 'Grandparents generation' },
  { value: 1,  label: 'Parents / Aunts / Uncles' },
  { value: 0,  label: 'Your generation' },
  { value: -1, label: "Children's generation" },
]

const COLOR_OPTIONS = [
  { value: 'grand',  label: 'Grandparent (purple tint)' },
  { value: 'parent', label: 'Parent / Aunt / Uncle (green tint)' },
  { value: 'other',  label: 'Other (white)' },
]

export default function AddPersonModal({ people, onAdd, onClose, onLinkParentChild, onLinkCouple }) {
  const [name,     setName]     = useState('')
  const [relation, setRelation] = useState('')
  const [gen,      setGen]      = useState(0)
  const [colorTag, setColorTag] = useState('other')
  const [linkType, setLinkType] = useState('none')
  const [linkedId, setLinkedId] = useState('')
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (linkType !== 'none' && !linkedId) { setError('Please select a person to connect to.'); return }
    setBusy(true); setError(null)

    const sameGen = people.filter(p => p.gen === Number(gen))
    const maxCol  = sameGen.length ? Math.max(...sameGen.map(p => Number(p.col))) : -1

    const newPerson = await onAdd({
      name:      name.trim(),
      relation:  relation.trim(),
      gen:       Number(gen),
      col:       maxCol + 1,
      color_tag: colorTag,
      is_root:   false,
    })

    if (newPerson) {
      if      (linkType === 'child_of')   await onLinkParentChild(linkedId, newPerson.id)
      else if (linkType === 'partner_of') await onLinkCouple(linkedId, newPerson.id)
    }

    setBusy(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="ft-panel-close" onClick={onClose}><i className="ti ti-x"></i></button>
        <h2 style={{ marginBottom: 4 }}>Add a family member</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          You can upload their photo after adding them.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="ft-field">
            <label>Full name *</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} required autoFocus placeholder="e.g. Aunt Priya" />
          </div>
          <div className="ft-field">
            <label>Relation label</label>
            <input type="text" value={relation} onChange={e=>setRelation(e.target.value)} placeholder="e.g. Maternal aunt" />
          </div>
          <div className="ft-field">
            <label>Generation</label>
            <select value={gen} onChange={e=>setGen(e.target.value)}>
              {GEN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="ft-field">
            <label>Category (colour)</label>
            <select value={colorTag} onChange={e=>setColorTag(e.target.value)}>
              {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="ft-field">
            <label>Connect to</label>
            <select value={linkType} onChange={e=>setLinkType(e.target.value)}>
              <option value="none">No connection yet</option>
              <option value="child_of">Child of…</option>
              <option value="partner_of">Partner of…</option>
            </select>
          </div>
          {linkType !== 'none' && (
            <div className="ft-field">
              <label>Select person</label>
              <select value={linkedId} onChange={e=>setLinkedId(e.target.value)}>
                <option value="">Choose…</option>
                {[...people].sort((a,b)=>a.name.localeCompare(b.name)).map(p =>
                  <option key={p.id} value={p.id}>{p.name}</option>
                )}
              </select>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="ft-save-btn" disabled={busy}>
            {busy ? 'Adding…' : 'Add to tree'}
          </button>
        </form>
      </div>
    </div>
  )
}
