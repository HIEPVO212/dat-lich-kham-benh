import { supabase } from './supabase'

export type Doctor = {
  doctor_id: string
  full_name: string
  academic_title?: string | null
  specialty_name: string
  hospital?: string
  experience_years: number
  avatar_url?: string | null
  is_accepting_bookings?: boolean
}

export type SpecialtyDoctorCount = {
  specialty_name: string
  count: number
}

export async function getDoctors(): Promise<Doctor[]> {
  try {
    // 1. Lấy dữ liệu từ bảng doctor (57 bác sĩ của bạn)
    const { data: doctorList, error } = await supabase
      .from('doctor')
      .select('*')

    if (error) {
      console.error('Lỗi khi tải bảng doctor:', error)
      return []
    }

    // 2. Lấy tên chuyên khoa từ bảng specialty
    const { data: specialties } = await supabase.from('specialty').select('*')
    const specMap = new Map<string, string>()
    if (specialties) {
      specialties.forEach((s: any) => {
        const id = String(s.specialty_id || s.id)
        specMap.set(id, s.specialty_name || s.name)
      })
    }

    // 3. Lấy tên bệnh viện/cơ sở y tế từ doctor_primary_facility hoặc medical_facility
    const { data: facilities } = await supabase.from('doctor_primary_facility').select('*')
    const facilityMap = new Map<string, string>()
    if (facilities) {
      facilities.forEach((f: any) => {
        facilityMap.set(String(f.doctor_id), f.facility_name || f.name || f.hospital_name)
      })
    }

    return (doctorList || []).map((doc: any) => {
      const specId = String(doc.specialty_id || '')
      const docId = String(doc.doctor_id || doc.id)

      const academic = doc.academic_title ? `${doc.academic_title} ` : ''
      const fullName = `${academic}${doc.full_name || 'Bác sĩ'}`

      return {
        doctor_id: docId,
        full_name: fullName,
        academic_title: doc.academic_title || null,
        specialty_name: specMap.get(specId) || doc.specialty_name || 'Đa khoa',
        hospital: facilityMap.get(docId) || doc.hospital || 'Bệnh viện Chợ Rẫy',
        experience_years: doc.experience_years || 8,
        avatar_url: doc.avatar_url || 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=300',
        is_accepting_bookings: true,
      }
    })
  } catch (err) {
    console.error('Lỗi getDoctors:', err)
    return []
  }
}

export async function getDoctorCountBySpecialty(): Promise<SpecialtyDoctorCount[]> {
  try {
    // 1. Lấy danh sách chuyên khoa
    const { data: specialties } = await supabase.from('specialty').select('*')
    const specMap = new Map<string, string>()
    const countMap = new Map<string, number>()

    if (specialties) {
      specialties.forEach((s: any) => {
        const id = String(s.specialty_id || s.id)
        const name = s.specialty_name || s.name
        specMap.set(id, name)
        countMap.set(name, 0)
      })
    }

    // 2. Lấy danh sách toàn bộ 57 bác sĩ từ bảng doctor
    const { data: doctors, error } = await supabase.from('doctor').select('specialty_id')
    if (error || !doctors) return []

    // 3. Đếm số lượng bác sĩ cho từng chuyên khoa thực tế
    doctors.forEach((doc: any) => {
      const specId = String(doc.specialty_id || '')
      const specName = specMap.get(specId) || 'Đa khoa'
      countMap.set(specName, (countMap.get(specName) || 0) + 1)
    })

    // 4. Trả về mảng số liệu có đếm (chỉ lấy các chuyên khoa có bác sĩ hoặc sắp xếp giảm dần)
    const result: SpecialtyDoctorCount[] = []
    countMap.forEach((count, specialty_name) => {
      if (count > 0) {
        result.push({ specialty_name, count })
      }
    })

    return result.sort((a, b) => b.count - a.count)
  } catch (err) {
    console.error('Lỗi thống kê bác sĩ theo chuyên khoa:', err)
    return []
  }
}
export function normalizeDoctorBookingStatus(status: any): boolean {
  if (typeof status === 'boolean') return status
  if (typeof status === 'string') {
    return status.toLowerCase() === 'true' || status === 'active' || status === 'available'
  }
  return true
}