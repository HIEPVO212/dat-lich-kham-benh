import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    const [doctorResult, specialtyResult, facilityResult, statsResult] = await Promise.all([
      supabase
        .from('doctor')
        .select('doctor_id, full_name, avatar_url, academic_title, specialty_id, experience_years, bio, email, is_accepting_bookings')
        .order('full_name'),
      supabase.from('specialty').select('specialty_id, specialty_name'),
      supabase.from('doctor_primary_facility').select('doctor_id, facility_name, address'),
      supabase.from('doctor_stats').select('doctor_id, rating, total_reviews, total_patients'),
    ])

    const firstError = doctorResult.error || specialtyResult.error || facilityResult.error || statsResult.error
    if (firstError) throw firstError

    const specialties = new Map((specialtyResult.data || []).map((item) => [item.specialty_id, item.specialty_name]))
    const facilities = new Map((facilityResult.data || []).map((item) => [item.doctor_id, item]))
    const stats = new Map((statsResult.data || []).map((item) => [item.doctor_id, item]))

    const doctors = (doctorResult.data || []).map((doctor) => {
      const facility = facilities.get(doctor.doctor_id)
      const doctorStats = stats.get(doctor.doctor_id)

      return {
        id: doctor.doctor_id,
        fullName: doctor.full_name,
        avatarUrl: doctor.avatar_url,
        academicTitle: doctor.academic_title,
        email: doctor.email,
        specialty: specialties.get(doctor.specialty_id) || 'Chưa cập nhật chuyên khoa',
        experienceYears: doctor.experience_years || 0,
        bio: doctor.bio,
        workplaceName: facility?.facility_name || null,
        workplaceAddress: facility?.address || null,
        rating: doctorStats?.rating || 0,
        totalReviews: doctorStats?.total_reviews || 0,
        totalPatients: doctorStats?.total_patients || 0,
        isAcceptingBookings: doctor.is_accepting_bookings ? 1 : 0,
      }
    })

    return NextResponse.json(doctors)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Không đọc được dữ liệu bác sĩ từ Supabase'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}