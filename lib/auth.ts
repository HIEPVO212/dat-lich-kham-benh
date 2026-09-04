import { supabase } from './supabase'

const DEMO_USER_KEY = 'healthconnect_demo_user'

type DemoUser = {
  id: string
  full_name: string
  phone?: string
  email?: string
  cccd?: string
  role: 'patient'
}

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

function normalizeVietnamPhone(phone: string) {
  const value = phone.replace(/\s+/g, '')
  if (value.startsWith('0')) return `+84${value.slice(1)}`
  return value.startsWith('+') ? value : `+84${value}`
}

export async function sendOtp(data: {
  method: 'email' | 'phone' | 'cccd'
  value: string
  full_name?: string
  phone?: string
}) {
  if (data.method !== 'email') return { demoCode: '123456' }

  const channel = { email: data.value }
  const { error } = await supabase.auth.signInWithOtp({
    ...channel,
    options: {
      shouldCreateUser: true,
      data: {
        full_name: data.full_name,
        phone: data.phone,
        cccd: undefined,
        auth_method: data.method,
      },
    },
  })
  if (error) {
    if (error.code === 'phone_provider_disabled' || error.message === 'Unsupported phone provider') {
      throw new Error('Đăng ký bằng số điện thoại chưa được bật SMS trên hệ thống. Vui lòng chọn Gmail hoặc bật Phone Auth trong Supabase.')
    }
    throw error
  }
  return { demoCode: undefined }
}

export async function verifyOtp(data: { method: 'email' | 'phone' | 'cccd'; value: string; phone?: string; token: string }) {
  if (data.method !== 'email') {
    if (data.token !== '123456') throw new Error('Mã demo không đúng. Hãy nhập 123456')
    return null
  }

  const channel = data.method === 'email' ? { email: data.value } : { phone: normalizeVietnamPhone(data.phone || data.value) }
  const { data: authData, error } = await supabase.auth.verifyOtp({
    ...channel,
    token: data.token,
    type: data.method === 'email' ? 'email' : 'sms',
  })
  if (error) throw error
  return authData.user
}

export async function createDemoAuthSession(data: { full_name: string; phone?: string; cccd?: string }) {
  const phone = (data.phone || data.cccd || 'demo').replace(/\D/g, '')
  const email = `demo.${phone}@healthconnect.local`
  const password = `Demo@${phone}Aa1`
  const metadata = { full_name: data.full_name, phone: data.phone, cccd: data.cccd, auth_method: 'demo' }
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: metadata } })

  if (signUpError && !signUpError.message.toLowerCase().includes('already registered')) throw signUpError
  if (!signUpData.session) {
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) throw loginError
  }
  if (typeof window !== 'undefined') window.localStorage.removeItem(DEMO_USER_KEY)
}

export async function logoutUser() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(DEMO_USER_KEY)
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name,
      phone: profile?.phone || user.user_metadata?.phone,
      role: profile?.role || 'patient',
      ...profile,
    }
  }

  if (typeof window !== 'undefined') {
    const demoUser = window.localStorage.getItem(DEMO_USER_KEY)
    if (demoUser) return JSON.parse(demoUser) as DemoUser
  }

  return null
}

export function setDemoUser(data: { full_name: string; phone?: string; email?: string; cccd?: string }) {
  if (typeof window === 'undefined') return
  const user: DemoUser = {
    id: '00000000-0000-4000-8000-000000000001',
    full_name: data.full_name,
    phone: data.phone,
    email: data.email,
    cccd: data.cccd,
    role: 'patient',
  }
  window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
}

export async function updateProfile(userId: string, data: { full_name: string; phone: string }) {
  if (typeof window !== 'undefined' && window.localStorage.getItem(DEMO_USER_KEY)) {
    const demoUser = JSON.parse(window.localStorage.getItem(DEMO_USER_KEY) || '{}') as DemoUser
    const updated = { ...demoUser, full_name: data.full_name, phone: data.phone }
    window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated))
    return updated
  }

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
  if (typeof window !== 'undefined' && window.localStorage.getItem(DEMO_USER_KEY)) return
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}