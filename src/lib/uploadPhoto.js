import { supabase } from './supabaseClient'

const BUCKET       = 'avatars'
const MAX_SIZE     = 5 * 1024 * 1024 // 5 MB

export async function uploadPhoto(file, userId, personId) {
  if (!file) return { url: null, error: 'No file provided.' }
  if (file.size > MAX_SIZE) return { url: null, error: 'Image must be under 5 MB.' }
  if (!file.type.startsWith('image/')) return { url: null, error: 'Please select an image file.' }

  const ext  = file.name.split('.').pop()
  const path = `${userId}/${personId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
