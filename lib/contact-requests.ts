import { supabase } from './supabase'

export type ContactRequest = {
  full_name: string
  email: string
  phone: string
  message: string
}

export async function createContactRequest(request: ContactRequest) {
  const { error } = await supabase.from('contact_requests').insert({
    full_name: request.full_name,
    email: request.email,
    phone: request.phone,
    message: request.message,
  })

  if (error) {
    throw new Error(`Không thể gửi yêu cầu hỗ trợ: ${error.message}`)
  }
}
