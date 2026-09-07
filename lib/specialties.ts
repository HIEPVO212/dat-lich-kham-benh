import { supabase } from './supabase'

export type Specialty = {
  specialty_id: number
  specialty_name: string
  description: string
}

export async function getSpecialties(): Promise<Specialty[]> {
  const { data, error } = await supabase
    .from('specialty')
    .select('specialty_id, specialty_name, description')
    .order('specialty_id', { ascending: true })

  if (error) {
    throw new Error(`Không thể tải danh sách chuyên khoa: ${error.message}`)
  }

  return (data ?? []).map((specialty) => ({
    specialty_id: Number(specialty.specialty_id),
    specialty_name: String(specialty.specialty_name),
    description: String(specialty.description ?? ''),
  }))
}
