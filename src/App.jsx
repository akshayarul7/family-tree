import { useState } from 'react'
import { useAuth }       from './hooks/useAuth'
import { useFamilyData } from './hooks/useFamilyData'
import Login             from './components/Login'
import TreeCanvas        from './components/TreeCanvas'
import EditPanel         from './components/EditPanel'
import AddPersonModal    from './components/AddPersonModal'

const AUTH_ENABLED = false
const DEV_USER = { id: '00000000-0000-0000-0000-000000000000' }

export default function App() {
 
  const auth = useAuth()
  const user        = AUTH_ENABLED ? auth.user    : DEV_USER
  const authLoading = AUTH_ENABLED ? auth.loading : false
  const signOut     = AUTH_ENABLED ? auth.signOut : () => {}

  const {
    people, relationships, loading: dataLoading, error,
    updatePerson, addPerson, deletePerson, addRelationship,
  } = useFamilyData(user?.id)

  const [selectedId,   setSelectedId]   = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // ── Loading / auth gates ─────────────────────────────────────
  if (authLoading) return <div className="full-center"><div className="spinner"></div></div>
  if (AUTH_ENABLED && !auth.user) return <Login />

  const selectedPerson = people.find(p => p.id === selectedId) ?? null

  // ── Handlers ────────────────────────────────────────────────
  async function handleDelete(id) {
    setSelectedId(null)
    await deletePerson(id)
  }

  function handleDeselect() {
    setSelectedId(null)
  }

  return (
    <div id="ft-app">
      {/* ── Toolbar ── */}
      <div id="ft-toolbar">
        <h1><i className="ti ti-trees"></i> Family Tree</h1>
        <div className="ft-toolbar-actions">
          <button className="ft-btn" onClick={() => document.getElementById('tree-reset-btn')?.click()}>
            <i className="ti ti-focus-2"></i> Reset view
          </button>
          <button className="ft-btn accent" onClick={() => setShowAddModal(true)}>
            <i className="ti ti-plus"></i> Add member
          </button>
          {AUTH_ENABLED && (
          <button className="ft-btn" onClick={signOut} title="Sign out">
            <i className="ti ti-logout"></i>
          </button>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="error-banner">
          <i className="ti ti-alert-circle"></i> {error}
        </div>
      )}

      {/* ── Tree canvas ── */}
      {dataLoading
        ? <div className="full-center"><div className="spinner"></div><p>Loading your family tree…</p></div>
        : (
          <div style={{ flex:1, position:'relative', display: 'flex' }}>
            <TreeCanvas
              people={people}
              relationships={relationships}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDeselect={handleDeselect}
            />
            <EditPanel
              person={selectedPerson}
              userId={user.id}
              allPeople={people}                   
              onClose={() => setSelectedId(null)}
              onSave={updatePerson}
              onDelete={handleDelete}
              onAddRelationship={addRelationship}
              onAddPerson={addPerson}
            />
          </div>
        )
      }

      {/* ── Add person modal ── */}
      {showAddModal && (
        <AddPersonModal
          people={people}
          onAdd={addPerson}
          onClose={() => setShowAddModal(false)}
          onLinkParentChild={(parentId, childId) => addRelationship(parentId, childId, 'parent_child')}
          onLinkCouple={(a, b)                   => addRelationship(a, b, 'couple')}
        />
      )}
    </div>
  )
}