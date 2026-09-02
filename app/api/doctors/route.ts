import { NextResponse } from 'next/server'
import { getDb } from '../../../lib/sqlite'

// GET /api/doctors — trả JSON danh sách bác sĩ cho trang app/doctors/page.tsx
// Chạy ở server (Node.js runtime mặc định của Route Handler) vì SQLite là
// file trên đĩa, KHÔNG thể query trực tiếp từ trình duyệt như Supabase.
export async function GET() {
  try {
    const db = getDb()

    const doctors = db
      .prepare(
        `
        SELECT
          d.DoctorId            AS id,
          d.FullName            AS fullName,
          d.AvatarUrl           AS avatarUrl,
          d.AcademicTitle       AS academicTitle,
          s.SpecialtyName       AS specialty,
          d.ExperienceYears     AS experienceYears,
          d.Bio                 AS bio,
          pf.FacilityName       AS workplaceName,
          pf.Address            AS workplaceAddress,
          st.Rating             AS rating,
          st.TotalReviews       AS totalReviews,
          st.TotalPatients      AS totalPatients,
          d.IsAcceptingBookings AS isAcceptingBookings
        FROM Doctor d
        JOIN Specialty s ON s.SpecialtyId = d.SpecialtyId
        LEFT JOIN DoctorPrimaryFacility pf ON pf.DoctorId = d.DoctorId
        LEFT JOIN DoctorStats st ON st.DoctorId = d.DoctorId
        ORDER BY d.FullName
        `
      )
      .all()

    db.close()
    return NextResponse.json(doctors)
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Không đọc được database bác sĩ' },
      { status: 500 }
    )
  }
}