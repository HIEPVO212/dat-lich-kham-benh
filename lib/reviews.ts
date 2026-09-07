import { supabase } from './supabase'

export type Review = {
  id: number
  full_name: string
  rating: number
  content: string
  created_at: string
}

export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, full_name, rating, content, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Không thể tải đánh giá: ${error.message}`)
  return (data ?? []) as Review[]
}

export async function createReview(rating: number, content: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) throw new Error('Vui lòng đăng nhập để đánh giá.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', authData.user.id)
    .maybeSingle()

  const { error } = await supabase.from('reviews').insert({
    user_id: authData.user.id,
    full_name: profile?.full_name ?? authData.user.user_metadata?.full_name ?? authData.user.email ?? 'Bệnh nhân',
    rating,
    content,
  })

  if (error) throw new Error(`Không thể gửi đánh giá: ${error.message}`)
}
