import { supabase } from './supabase'

export type LatestAppointment = {
  id: string
  appointment_date: string
  appointment_time: string
  doctor_name: string
  doctor_title: string
  specialty_name: string
}

export async function getLatestAppointment(): Promise<LatestAppointment | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select('id, appointment_date, appointment_time, doctor_id')
    .eq('patient_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (appointmentError) throw new Error(`Không thể tải lịch hẹn mới nhất: ${appointmentError.message}`)
  if (!appointment) return null

  const { data: doctor, error: doctorError } = await supabase
    .from('doctor')
    .select('full_name, academic_title, specialty(specialty_name)')
    .eq('doctor_id', appointment.doctor_id)
    .single()

  if (doctorError) throw new Error(`Không thể tải thông tin bác sĩ: ${doctorError.message}`)

  const specialty = Array.isArray(doctor.specialty) ? doctor.specialty[0] : doctor.specialty
  return {
    id: String(appointment.id),
    appointment_date: String(appointment.appointment_date),
    appointment_time: String(appointment.appointment_time).slice(0, 5),
    doctor_name: String(doctor.full_name),
    doctor_title: doctor.academic_title ? String(doctor.academic_title) : '',
    specialty_name: specialty?.specialty_name ? String(specialty.specialty_name) : 'Chưa cập nhật',
  }
}

export async function createAppointment(data: {
  doctor_id: number
  appointment_date: string
  appointment_time: string
  reason: string
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Vui lòng đăng nhập trước khi đặt lịch.')

  const { error } = await supabase.from('appointments').insert({
    patient_id: userData.user.id,
    doctor_id: data.doctor_id,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    reason: data.reason,
    status: 'pending',
  })

  if (error) throw new Error(`Đặt lịch thất bại: ${error.message}`)
}

export async function getAppointmentsLast24Hours(): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)

  if (error) throw new Error(`Không thể tải số lượt đặt lịch: ${error.message}`)
  return count ?? 0
}

export async function getCompletedPatientCount(): Promise<number> {
  const { data, error } = await supabase
    .from('appointments')
    .select('patient_id')
    .eq('status', 'completed')

  if (error) throw new Error(`Không thể tải số bệnh nhân đã khám: ${error.message}`)

  return new Set((data ?? []).map((appointment) => appointment.patient_id)).size
}
export type AppointmentTrendPoint = { date: string; count: number }

export async function getAppointmentsTrend(days = 7): Promise<AppointmentTrendPoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('appointments')
    .select('created_at')
    .gte('created_at', since.toISOString())

  if (error) throw new Error(`Không thể tải xu hướng đặt lịch: ${error.message}`)

  const buckets = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const day = new Date(since)
    day.setDate(since.getDate() + i)
    buckets.set(day.toISOString().slice(0, 10), 0)
  }

  for (const row of data ?? []) {
    const key = String(row.created_at).slice(0, 10)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }))
}