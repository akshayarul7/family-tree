const AVATAR_CLASS = { you:'avatar-you', parent:'avatar-parent', grand:'avatar-grand', other:'avatar-other' }
const GEN_CLASS    = { parent:'gen-1', grand:'gen-2' }

export default function PersonNode({ person, x, y, isSelected, onClick }) {
  const avatarCls = AVATAR_CLASS[person.color_tag] || 'avatar-other'
  const genCls    = GEN_CLASS[person.color_tag]    || ''

  const initials = (person.name || '?')
    .split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()

  const cls = [
    'ft-node',
    person.is_root  ? 'you'      : '',
    isSelected      ? 'selected' : '',
    genCls,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cls}
      style={{ left: x, top: y }}
      onClick={e => { e.stopPropagation(); onClick(person.id) }}
    >
      <div className={`ft-avatar ${avatarCls}`}>
        {person.photo_url
          ? <img src={person.photo_url} alt={person.name} />
          : <span>{initials}</span>}
      </div>
      <div className="ft-name">{person.name}</div>
      {person.relation && <div className="ft-rel">{person.relation}</div>}
      {person.birth_year && <div className="ft-rel" style={{opacity:0.6}}>{person.birth_year}</div>}
      {person.is_root && <div className="ft-you-badge">YOU</div>}
    </div>
  )
}
