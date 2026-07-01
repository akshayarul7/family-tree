import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { DEFAULT_PEOPLE, DEFAULT_EDGES } from '../lib/defaultFamilyData'

const AUTH_ENABLED = false
let seeded = false

export function useFamilyData(userId) {
  const [people,        setPeople]        = useState([])
  const [relationships, setRelationships] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  // ── Fetch all data for this user ──────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    const peopleQuery = AUTH_ENABLED
      ? supabase.from('people').select('*').eq('owner_id', userId).order('created_at')
      : supabase.from('people').select('*').order('created_at')
    const relQuery = AUTH_ENABLED
      ? supabase.from('relationships').select('*').eq('owner_id', userId)
      : supabase.from('relationships').select('*')
    const [pRes, rRes] = await Promise.all([peopleQuery, relQuery])

    if (pRes.error) { setError(pRes.error.message); setLoading(false); return }
    if (rRes.error) { setError(rRes.error.message); setLoading(false); return }

    setPeople(pRes.data)
    setRelationships(rRes.data)
    console.log('fetched people:', pRes.data)  // ADD THIS
    console.log('fetched relationships:', rRes.data)  // ADD THIS
    setLoading(false)
  }, [userId])

  // ── Seed placeholder data on first login ──────────────────────
  const seedIfEmpty = useCallback(async () => {
    const countQuery = AUTH_ENABLED
      ? supabase.from('people').select('*', { count: 'exact', head: true }).eq('owner_id', userId)
      : supabase.from('people').select('*', { count: 'exact', head: true })

    const { count, error: cErr } = await countQuery
    if (cErr) { setError(cErr.message); return }
    if (count > 0 || seeded) return // already seeded
    seeded = true

    // Insert people rows
    const rows = DEFAULT_PEOPLE.map(p => ({
      owner_id:  userId,
      name:      p.name,
      relation:  p.relation,
      gen:       p.gen,
      col:       p.col,
      color_tag: p.color_tag,
      is_root:   !!p.is_root,
    }))

    const { data: inserted, error: iErr } = await supabase
      .from('people').insert(rows).select()

    if (iErr) { setError(iErr.message); return }

    // Map placeholder key → real uuid (insert order is preserved)
    const keyToId = {}
    DEFAULT_PEOPLE.forEach((p, i) => { keyToId[p.key] = inserted[i].id })

    const edges = DEFAULT_EDGES.map(([a, b, type]) => ({
      owner_id: userId,
      person_a: keyToId[a],
      person_b: keyToId[b],
      rel_type: type,
    }))

    const { error: eErr } = await supabase.from('relationships').insert(edges)
    if (eErr) setError(eErr.message)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const init = async () => {
      await seedIfEmpty()
      await fetchAll()
    }
    init()
  }, [userId]) // eslint-disable-line

  // ── Mutations ─────────────────────────────────────────────────
  const updatePerson = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('people').update(updates).eq('id', id).select().single()
    if (error) { setError(error.message); return null }
    setPeople(prev => prev.map(p => p.id === id ? data : p))
    return data
  }, [])

  const addPerson = useCallback(async (personData) => {
    console.log('addPerson called with:', personData)  // ADD THIS
    const row = AUTH_ENABLED ? { owner_id: userId, ...personData } : personData
    console.log('inserting row:', row)  // ADD THIS
    const { data, error } = await supabase
      .from('people').insert(row).select().single()
    console.log('result:', data, error)  // ADD THIS
    if (error) { setError(error.message); return null }
    setPeople(prev => [...prev, data])
    return data
  }, [userId])

  const deletePerson = useCallback(async (id) => {
    const { error } = await supabase.from('people').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    setPeople(prev => prev.filter(p => p.id !== id))
    setRelationships(prev => prev.filter(r => r.person_a !== id && r.person_b !== id))
    return true
  }, [])

  const addRelationship = useCallback(async (personA, personB, relType) => {
    const { data, error } = await supabase
      .from('relationships')
      .insert({ owner_id: userId, person_a: personA, person_b: personB, rel_type: relType })
      .select().single()
    if (error) { setError(error.message); return null }
    setRelationships(prev => [...prev, data])
    return data
  }, [userId])

  const deleteRelationship = useCallback(async (id) => {
    const { error } = await supabase.from('relationships').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    setRelationships(prev => prev.filter(r => r.id !== id))
    return true
  }, [])

  return {
    people, relationships, loading, error,
    refetch: fetchAll,
    updatePerson, addPerson, deletePerson,
    addRelationship, deleteRelationship,
  }
}
