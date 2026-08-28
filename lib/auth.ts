import { supabase } from './supabase'

export async function registerUser(data: {
  full_name: string
  email: string
  phone: string
  password: string
}) {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.full_name, phone: data.phone },
    },
  })
  if (error) throw error
  return authData.user
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function logoutUser() {
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { id: user.id, email: user.email, ...profile }
}

export async function updateProfile(userId: string, data: { full_name: string; phone: string }) {
  const { data: updated, error } = await supabase
    .from('profiles')
    .update({ full_name: data.full_name, phone: data.phone })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}