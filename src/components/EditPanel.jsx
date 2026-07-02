import { useEffect, useRef, useState } from 'react'
import { uploadPhoto } from '../lib/uploadPhoto'

const AVATAR_CLASS = { you:'avatar-you', parent:'avatar-parent', grand:'avatar-grand', other:'avatar-other' }

export default function EditPanel({ person, userId, allPeople, onClose, onSave, onDelete, onAddRelationship, onAddPerson }) {
  const [name,     setName]     = useState('')
  const [year,     setYear]     = useState('')
  const [notes,    setNotes]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [uploadErr,setUploadErr]= useState(null)
  const fileRef = useRef(null)

  // Link existing person state
  const [linkTargetId, setLinkTargetId] = useState('')
  const [linkType,     setLinkType]     = useState('parent_child')

  // Quick Add new person state
  const [quickName, setQuickName] = useState('')
  const [quickRole, setQuickRole] = useState('child')
  const [isQuickAdding, setIsQuickAdding] = useState(false)

  useEffect(() => {
    if (!person) return
    setName(person.name       || '')
    setYear(person.birth_year || '')
    setNotes(person.notes     || '')
    setUploadErr(null)
    
    // Reset connection / quick add dropdowns when a new person is selected
    setLinkTargetId('')
    setLinkType('parent_child')
    setQuickName('')
    setQuickRole('child')
  }, [person?.id]) // eslint-disable-line

  if (!person) return null

  const avatarCls = AVATAR_CLASS[person.color_tag] || 'avatar-other'
  const initials  = (person.name || '?').split(' ').map(w=>w[0]).filter(Boolean).join('').slice(0,2).toUpperCase()

  async function handleSave() {
    setSaving(true)
    await onSave(person.id, {
      name:       name.trim() || person.name,
      birth_year: year.trim(),
      notes:      notes.trim(),
    })
    setSaving(false)
  }

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setUploadErr(null)

    const { url, error } = await uploadPhoto(file, userId, person.id)
    if (error) setUploadErr(error)
    else await onSave(person.id, { photo_url: url })

    setUploading(false)
    e.target.value = ''
  }

  async function handleQuickAdd(e) {
    e.preventDefault();
    if (!quickName.trim()) return;

    setIsQuickAdding(true);
    
    try {
      let newGen = person.gen || 0;
      let relType = 'parent_child';
      let personA = person.id; // Default assumption: selected is parent
      let personB = null;      // Default assumption: new node is child

      if (quickRole === 'child') {
        newGen = (person.gen || 0) - 1;
        personA = person.id;
      } else if (quickRole === 'parent') {
        newGen = (person.gen || 0) + 1;
        personB = person.id; 
      } else if (quickRole === 'partner') {
        newGen = (person.gen || 0);
        relType = 'couple';
        personA = person.id;
      }

      // Create new person
      const createdPerson = await onAddPerson({
        name: quickName.trim(),
        gen: newGen,
        col: person.col || 0 // Inherit column to render nearby initially
      });

      if (!createdPerson || !createdPerson.id) {
        throw new Error("Failed to retrieve new person ID");
      }

      // Assign the new ID to the correct directional relationship slot
      if (quickRole === 'child' || quickRole === 'partner') {
        personB = createdPerson.id;
      } else if (quickRole === 'parent') {
        personA = createdPerson.id;
      }

      // Create relationship
      await onAddRelationship(personA, personB, relType);

      // Reset Form
      setQuickName('');
      setQuickRole('child');

    } catch (error) {
      console.error("Error adding relative:", error);
      alert("Failed to quick-add relative. Check console for details.");
    } finally {
      setIsQuickAdding(false);
    }
  }

  const dropdownStyle = {
    padding: '7px 10px', 
    borderRadius: '8px', 
    border: '1px solid var(--border-mid)', 
    background: 'var(--cream)',
    fontFamily: 'inherit',
    fontSize: '13px'
  }

  return (
    <div className="ft-panel open">
      <button className="ft-panel-close" onClick={onClose}><i className="ti ti-x"></i></button>

      <div className={`ft-panel-avatar ${avatarCls}`}>
        {person.photo_url
          ? <img src={person.photo_url} alt={person.name} />
          : <span>{initials}</span>}
      </div>

      <div className="ft-panel-name">{person.name}</div>
      <div className="ft-panel-rel">{person.relation || 'You'}</div>
      <div className="ft-panel-divider" />

      <div className="ft-field">
        <label>Full name</label>
        <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter name" />
      </div>
      <div className="ft-field">
        <label>Birth year</label>
        <input type="text" value={year} onChange={e=>setYear(e.target.value)} placeholder="e.g. 1965" />
      </div>
      <div className="ft-field">
        <label>Notes</label>
        <input type="text" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any extra info" />
      </div>

      <label className="ft-upload-btn">
        <i className="ti ti-camera"></i>
        {uploading ? 'Uploading…' : 'Upload photo'}
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto} disabled={uploading} />
      </label>
      {uploadErr && <div className="auth-error" style={{marginTop:0}}>{uploadErr}</div>}

      <button className="ft-save-btn" onClick={handleSave} disabled={saving || uploading}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>

      <div className="ft-panel-divider" />

      {/* NEW: Quick Add Relative */}
      <div className="ft-field">
        <label>Quick Add New Relative</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input 
            type="text" 
            value={quickName} 
            onChange={e => setQuickName(e.target.value)}
            placeholder="New person's name"
            style={dropdownStyle}
          />
          <select 
            value={quickRole} 
            onChange={e => setQuickRole(e.target.value)}
            style={dropdownStyle}
          >
            <option value="child">As Child</option>
            <option value="parent">As Parent</option>
            <option value="partner">As Partner</option>
          </select>
          <button 
            className="ft-save-btn"
            style={{ 
              background: 'var(--gold)', 
              color: 'var(--green)', 
              opacity: quickName.trim() ? 1 : 0.5,
              cursor: quickName.trim() ? 'pointer' : 'not-allowed'
            }}
            disabled={isQuickAdding || !quickName.trim()}
            onClick={handleQuickAdd}
          >
            {isQuickAdding ? 'Adding...' : 'Add & Connect'}
          </button>
        </div>
      </div>

      <div className="ft-panel-divider" />
      
      {/* EXISTING: Link Existing Relative */}
      <div className="ft-field">
        <label>Link Existing Relative</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <select 
            value={linkTargetId} 
            onChange={e => setLinkTargetId(e.target.value)}
            style={dropdownStyle}
          >
            <option value="">Select someone...</option>
            {allPeople && allPeople
              .filter(p => p.id !== person.id)
              .map(p => (
                <option key={p.id} value={p.id}>{p.name || 'Unnamed Person'}</option>
            ))}
          </select>

          <select 
            value={linkType} 
            onChange={e => setLinkType(e.target.value)}
            style={dropdownStyle}
          >
            <option value="parent_child">Parent / Child</option>
            <option value="couple">Couple</option>
          </select>

          <button 
            className="ft-save-btn"
            style={{ 
              background: 'var(--gold)', 
              color: 'var(--green)', 
              opacity: linkTargetId ? 1 : 0.5,
              cursor: linkTargetId ? 'pointer' : 'not-allowed'
            }}
            disabled={!linkTargetId}
            onClick={() => {
              if (linkTargetId) {
                onAddRelationship(person.id, linkTargetId, linkType)
                setLinkTargetId('') 
              }
            }}
          >
            Connect
          </button>
        </div>
      </div>

      <div className="ft-panel-divider" />

      {!person.is_root && (
        <button
          className="ft-delete-btn"
          onClick={() => { if (window.confirm(`Remove ${person.name} from the tree?`)) onDelete(person.id) }}
        >
          <i className="ti ti-trash"></i> Remove person
        </button>
      )}
    </div>
  )
}