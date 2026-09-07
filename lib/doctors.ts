import { supabase } from './supabase'

export type Doctor = {
  doctor_id: number
  full_name: string
  avatar_url: string | null
  academic_title: string | null
  specialty_id: number
  specialty_name: string
  experience_years: number
  is_accepting_bookings: boolean
}

type DoctorRow = Omit<Doctor, 'specialty_name'> & {
  specialty: { specialty_name: string }[] | null
}

export async function getDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctor')
    .select(
      'doctor_id, full_name, avatar_url, academic_title, specialty_id, experience_years, is_accepting_bookings, specialty(specialty_name)',
    )
    .order('doctor_id', { ascending: true })

  if (error) {
    throw new Error(`Không thể tải danh sách bác sĩ: ${error.message}`)
  }

  return ((data ?? []) as DoctorRow[]).map((doctor) => ({
    doctor_id: Number(doctor.doctor_id),
    full_name: String(doctor.full_name),
    avatar_url: doctor.avatar_url,
    academic_title: doctor.academic_title,
    specialty_id: Number(doctor.specialty_id),
    specialty_name: doctor.specialty?.[0]?.specialty_name ?? 'Chưa cập nhật',
    experience_years: Number(doctor.experience_years ?? 0),
    is_accepting_bookings: Boolean(doctor.is_accepting_bookings),
  }))
}
