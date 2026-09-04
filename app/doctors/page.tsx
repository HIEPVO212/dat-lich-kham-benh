'use client'

import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Input, Select, Button, Empty, Rate, Pagination, message } from 'antd'
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, HeartOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const PAGE_SIZE = 10

type Doctor = {
  id: number
  fullName: string
  avatarUrl: string | null
  academicTitle: string | null
  specialty: string
  experienceYears: number
  bio: string | null
  workplaceName: string | null
  workplaceAddress: string | null
  rating: number
  totalReviews: number
  totalPatients: number
  isAcceptingBookings: number
}

const SPECIALTY_THEMES = [
  { grad: 'from-blue-500 to-indigo-600', hex: ['#3B82F6', '#4F46E5'], tagBg: 'bg-blue-50', tagText: 'text-blue-700', tagBorder: 'border-blue-200', tint: 'from-blue-50', shadow: 'rgba(59,130,246,0.30)' },
  { grad: 'from-teal-500 to-cyan-600', hex: ['#14B8A6', '#0891B2'], tagBg: 'bg-teal-50', tagText: 'text-teal-700', tagBorder: 'border-teal-200', tint: 'from-teal-50', shadow: 'rgba(20,184,166,0.30)' },
  { grad: 'from-rose-500 to-pink-600', hex: ['#F43F5E', '#DB2777'], tagBg: 'bg-rose-50', tagText: 'text-rose-700', tagBorder: 'border-rose-200', tint: 'from-rose-50', shadow: 'rgba(244,63,94,0.30)' },
  { grad: 'from-amber-500 to-orange-600', hex: ['#F59E0B', '#EA580C'], tagBg: 'bg-amber-50', tagText: 'text-amber-700', tagBorder: 'border-amber-200', tint: 'from-amber-50', shadow: 'rgba(245,158,11,0.30)' },
  { grad: 'from-violet-500 to-purple-600', hex: ['#8B5CF6', '#9333EA'], tagBg: 'bg-violet-50', tagText: 'text-violet-700', tagBorder: 'border-violet-200', tint: 'from-violet-50', shadow: 'rgba(139,92,246,0.30)' },
  { grad: 'from-emerald-500 to-green-600', hex: ['#10B981', '#16A34A'], tagBg: 'bg-emerald-50', tagText: 'text-emerald-700', tagBorder: 'border-emerald-200', tint: 'from-emerald-50', shadow: 'rgba(16,185,129,0.30)' },
]

function getTheme(specialty: string) {
  let hash = 0
  for (let i = 0; i < specialty.length; i++) hash = (hash * 31 + specialty.charCodeAt(i)) >>> 0
  return SPECIALTY_THEMES[hash % SPECIALTY_THEMES.length]
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-extrabold text-slate-900">{value}</span>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  )
}

// 1 lượt nội dung của dải chữ chạy — được render nhiều lần liên tiếp để tạo
// vòng lặp liền mạch (hết bản này thì bản kế tiếp vừa vặn thế chỗ, không giật).
function MarqueeContent() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 pr-10 text-sm text-slate-600">
      <HeartOutlined className="text-rose-500" />
      <span>
        <b className="font-semibold text-blue-700">Tôn trọng người bệnh:</b> Hãy coi người bệnh như người thân ruột thịt của mình.
      </span>
      <span className="text-teal-400">✦</span>
      <span>
        <b className="font-semibold text-teal-700">Đặt sức khỏe lên trên hết:</b> Lương y như từ mẫu.
      </span>
      <span className="text-rose-300">✦</span>
      <span>
        <b className="font-semibold text-rose-700">Trung thực và tận tụy:</b> Người bác sĩ giỏi không chỉ chữa trị căn bệnh, mà là chữa trị người bệnh.
      </span>
      <span className="text-blue-300">✦</span>
    </span>
  )
}

// Icon chữ thập y tế vẽ bằng div thuần, không phụ thuộc bộ icon nào
function CrossIcon() {
  return (
    <div className="relative h-4 w-4">
      <div className="absolute left-1/2 top-0 h-4 w-1.5 -translate-x-1/2 rounded-full bg-white" />
      <div className="absolute left-0 top-1/2 h-1.5 w-4 -translate-y-1/2 rounded-full bg-white" />
    </div>
  )
}

// Badge icon "nổi 3D": nền gradient + lớp sáng hắt ở góc trên (giả lập ánh sáng
// phản chiếu) + đổ bóng sâu + animation bồng bềnh chậm — tạo cảm giác vật thể
// đang lơ lửng trong không gian 3D, không cần thư viện 3D nào.
function FloatingBadge({
  children,
  className = '',
  delay = '0s',
  size = 52,
}: {
  children: ReactNode
  className?: string
  delay?: string
  size?: number
}) {
  return (
    <div
      className={`pointer-events-none absolute items-center justify-center rounded-2xl ${className}`}
      style={{
        width: size,
        height: size,
        animation: `mc-float 5s ease-in-out ${delay} infinite`,
        boxShadow: '0 16px 30px -10px rgba(15,23,42,0.35)',
      }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/45 to-transparent" />
      <div className="relative text-white" style={{ fontSize: size * 0.4 }}>
        {children}
      </div>
    </div>
  )
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const [imgError, setImgError] = useState(false)
  const theme = getTheme(doctor.specialty)
  const accepting = doctor.isAcceptingBookings === 1

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({ rx: (0.5 - py) * 12, ry: (px - 0.5) * 12 })
    setGlare({ x: px * 100, y: py * 100 })
  }
  const resetTilt = () => {
    setTilt({ rx: 0, ry: 0 })
    setGlare({ x: 50, y: 50 })
  }

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
        }}
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br ${theme.tint} to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]`}
      >
        {/* glow màu theo chuyên khoa, hiện khi hover thay cho bóng xám mặc định */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `0 25px 45px -15px ${theme.shadow}` }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(500px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.55), transparent 60%)` }}
        />

        <div className="absolute right-5 top-5 flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            {accepting && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${accepting ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          </span>
        </div>

        <div className="relative flex gap-4">
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${theme.grad} text-xl font-bold text-white shadow-lg`}
          >
            {doctor.avatarUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doctor.avatarUrl}
                onError={() => setImgError(true)}
                alt={doctor.fullName}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              getInitials(doctor.fullName)
            )}
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <h3 className="truncate text-base font-bold text-slate-900">
              {doctor.academicTitle ? `${doctor.academicTitle} ` : ''}
              {doctor.fullName}
            </h3>
            <span
              className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.tagBg} ${theme.tagText} ${theme.tagBorder}`}
            >
              {doctor.specialty}
            </span>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center gap-1.5">
          {doctor.totalReviews > 0 ? (
            <>
              <Rate disabled allowHalf value={doctor.rating} style={{ fontSize: 13, color: '#F59E0B' }} />
              <span className="text-xs font-medium text-slate-500">
                {doctor.rating.toFixed(1)} · {doctor.totalReviews} đánh giá
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-400">Chưa có đánh giá</span>
          )}
        </div>

        <p className="relative mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {doctor.bio || 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}
        </p>

        <div className="relative mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-center">
          <div>
            <div className="text-lg font-extrabold text-slate-900">{doctor.experienceYears}</div>
            <div className="text-[11px] text-slate-500">năm kinh nghiệm</div>
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">{doctor.totalPatients}</div>
            <div className="text-[11px] text-slate-500">bệnh nhân đã khám</div>
          </div>
        </div>

        {doctor.workplaceName && (
          <div className="relative mt-4 flex items-start gap-1.5 text-xs text-slate-500">
            <EnvironmentOutlined className="mt-0.5" />
            <div>
              <div className="font-medium text-slate-700">{doctor.workplaceName}</div>
              {doctor.workplaceAddress && <div>{doctor.workplaceAddress}</div>}
            </div>
          </div>
        )}

        <div className="relative mt-auto pt-5">
          {accepting ? (
            <Link href={`/booking?doctorId=${doctor.id}`}>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                block
                style={{ height: 40, borderRadius: 12, border: 'none', background: theme.hex[0], fontWeight: 600 }}
              >
                Đặt lịch khám
              </Button>
            </Link>
          ) : (
            <Button block disabled style={{ height: 40, borderRadius: 12 }}>
              Không nhận lịch
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadDoctors()
  }, [])

  // Đổi từ khoá tìm/lọc thì quay về trang 1, tránh đứng ở trang trống
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, specialty])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      // Query thẳng Supabase (được vì đây là bảng công khai, có policy cho phép
      // đọc). Tách 4 truy vấn riêng rồi ghép ở client cho chắc chắn, thay vì
      // dùng cú pháp embed phức tạp giữa bảng và 2 view.
      const [doctorsRes, specialtyRes, facilityRes, statsRes] = await Promise.all([
        supabase
          .from('doctor')
          .select('doctor_id, full_name, avatar_url, academic_title, specialty_id, experience_years, bio, is_accepting_bookings')
          .order('full_name', { ascending: true }),
        supabase.from('specialty').select('specialty_id, specialty_name'),
        supabase.from('doctor_primary_facility').select('doctor_id, facility_name, address'),
        supabase.from('doctor_stats').select('doctor_id, rating, total_reviews, total_patients'),
      ])

      if (doctorsRes.error) throw doctorsRes.error

      const specialtyMap = new Map((specialtyRes.data || []).map((s: any) => [Number(s.specialty_id), s.specialty_name]))
      const facilityMap = new Map((facilityRes.data || []).map((f: any) => [Number(f.doctor_id), f]))
      const statsMap = new Map((statsRes.data || []).map((s: any) => [Number(s.doctor_id), s]))

      const merged: Doctor[] = (doctorsRes.data || []).map((d: any) => {
        const id = Number(d.doctor_id)
        const facility = facilityMap.get(id)
        const stats = statsMap.get(id)
        return {
          id,
          fullName: d.full_name,
          avatarUrl: d.avatar_url,
          academicTitle: d.academic_title,
          specialty: specialtyMap.get(Number(d.specialty_id)) || 'Chưa cập nhật',
          experienceYears: d.experience_years,
          bio: d.bio,
          workplaceName: facility?.facility_name ?? null,
          workplaceAddress: facility?.address ?? null,
          rating: Number(stats?.rating ?? 0),
          totalReviews: Number(stats?.total_reviews ?? 0),
          totalPatients: Number(stats?.total_patients ?? 0),
          isAcceptingBookings: d.is_accepting_bookings ? 1 : 0,
        }
      })

      setDoctors(merged)
    } catch (err) {
      message.error('Không tải được danh sách bác sĩ, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  const specialtyOptions = useMemo(() => {
    const unique = Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean)))
    return [{ label: 'Tất cả chuyên khoa', value: 'all' }, ...unique.map((s) => ({ label: s, value: s }))]
  }, [doctors])

  const filteredDoctors = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    return doctors.filter((d) => {
      const matchName = d.fullName.toLowerCase().includes(keyword)
      const matchSpecialty = specialty === 'all' || d.specialty === specialty
      return matchName && matchSpecialty
    })
  }, [doctors, searchText, specialty])

  const pagedDoctors = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredDoctors.slice(start, start + PAGE_SIZE)
  }, [filteredDoctors, currentPage])

  const acceptingCount = useMemo(() => doctors.filter((d) => d.isAcceptingBookings === 1).length, [doctors])
  const specialtyCount = useMemo(() => new Set(doctors.map((d) => d.specialty)).size, [doctors])

  return (
    <PageLayout hideBackButton>
      <div className={beVietnamPro.className}>
        <style>{`
          @keyframes mc-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(4deg); }
          }
          @keyframes mc-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .mc-marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* Hero — phong cách y tế: lớp gradient nhiều tầng tạo chiều sâu,
            đường EKG mờ phía sau, các icon y tế "nổi 3D" lơ lửng góc phải */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-teal-50 px-8 py-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 top-0 h-40 w-40 rounded-full bg-rose-300/20 blur-2xl" />

          <svg
            className="pointer-events-none absolute inset-x-0 bottom-4 h-16 w-full opacity-20"
            viewBox="0 0 800 60"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,32 130,32 152,10 175,52 198,32 640,32 660,6 682,56 704,32 800,32"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          <FloatingBadge className="right-8 top-6 flex bg-gradient-to-br from-rose-400 to-rose-600">
            <CrossIcon />
          </FloatingBadge>
          <FloatingBadge
            className="right-28 top-20 hidden sm:flex bg-gradient-to-br from-blue-400 to-indigo-600"
            delay="1.3s"
            size={44}
          >
            <MedicineBoxOutlined />
          </FloatingBadge>
          <FloatingBadge
            className="right-2 top-36 hidden md:flex bg-gradient-to-br from-teal-400 to-cyan-600"
            delay="0.7s"
            size={36}
          >
            <HeartOutlined />
          </FloatingBadge>

          <div className="relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Danh sách bác sĩ
            </h1>
            <p className="mt-2 max-w-xl text-slate-500">
              Tìm và chọn bác sĩ phù hợp, đặt lịch khám chỉ trong vài bước
            </p>
            {!loading && doctors.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-8">
                <StatPill value={doctors.length} label="bác sĩ" />
                <StatPill value={specialtyCount} label="chuyên khoa" />
                <StatPill value={acceptingCount} label="đang nhận lịch" />
              </div>
            )}
          </div>
        </div>

        {/* Khu vực lọc + danh sách — thêm các khối màu mờ phía sau để không gian
            giữa các thẻ không bị trắng trơn, vẫn giữ tông y tế nhẹ nhàng */}
        <div className="relative">
          <div className="pointer-events-none absolute -left-16 top-24 h-96 w-96 rounded-full bg-blue-300/50 blur-2xl" />
          <div className="pointer-events-none absolute right-0 top-[28rem] h-96 w-96 rounded-full bg-teal-300/45 blur-2xl" />
          <div className="pointer-events-none absolute left-1/4 bottom-0 h-80 w-80 rounded-full bg-rose-300/40 blur-2xl" />

          {/* Bộ lọc */}
          <div className="relative mb-8 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm">
          <Input
            placeholder="Tìm theo tên bác sĩ..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 280 }}
            allowClear
          />
          <Select value={specialty} onChange={setSpecialty} options={specialtyOptions} style={{ minWidth: 220 }} />

          {/* Dải chữ chạy — lấp khoảng trống còn lại, dừng khi rê chuột vào để đọc */}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent" />
            <div className="mc-marquee-track flex w-max" style={{ animation: 'mc-marquee 34s linear infinite' }}>
              <MarqueeContent />
              <MarqueeContent />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-slate-200/70 bg-white p-6">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="mt-4 h-3 w-full rounded bg-slate-200" />
                <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
                <div className="mt-4 h-16 rounded-2xl bg-slate-100" />
                <div className="mt-4 h-10 rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Empty
            description={doctors.length === 0 ? 'Chưa có bác sĩ nào trong hệ thống' : 'Không tìm thấy bác sĩ phù hợp'}
            className="mt-12"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pagedDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>

            {filteredDoctors.length > PAGE_SIZE && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={filteredDoctors.length}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </PageLayout>
  )
}
