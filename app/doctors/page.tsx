'use client'

import { useEffect, useMemo, useState, Suspense, type MouseEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Input, Select, Button, Empty, Rate, Pagination, message, Spin } from 'antd'
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, HeartOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const PAGE_SIZE = 9

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

function MarqueeContent() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 pr-10 text-sm text-slate-600">
      <HeartOutlined className="text-rose-500" />
      <span><b className="font-semibold text-blue-700">Tôn trọng người bệnh:</b> Hãy coi người bệnh như người thân ruột thịt.</span>
      <span className="text-teal-400">✦</span>
      <span><b className="font-semibold text-teal-700">Đặt sức khỏe lên trên hết:</b> Lương y như từ mẫu.</span>
      <span className="text-rose-300">✦</span>
    </span>
  )
}

function CrossIcon() {
  return (
    <div className="relative h-4 w-4">
      <div className="absolute left-1/2 top-0 h-4 w-1.5 -translate-x-1/2 rounded-full bg-white" />
      <div className="absolute left-0 top-1/2 h-1.5 w-4 -translate-y-1/2 rounded-full bg-white" />
    </div>
  )
}

function FloatingBadge({ children, className = '', delay = '0s', size = 52 }: { children: ReactNode, className?: string, delay?: string, size?: number }) {
  return (
    <div className={`pointer-events-none absolute items-center justify-center rounded-2xl ${className}`} style={{ width: size, height: size, animation: `mc-float 5s ease-in-out ${delay} infinite`, boxShadow: '0 16px 30px -10px rgba(15,23,42,0.35)' }}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/45 to-transparent" />
      <div className="relative text-white" style={{ fontSize: size * 0.4 }}>{children}</div>
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
  const resetTilt = () => { setTilt({ rx: 0, ry: 0 }); setGlare({ x: 50, y: 50 }); }

  return (
    <div style={{ perspective: '1000px' }}>
      <div onMouseMove={handleMouseMove} onMouseLeave={resetTilt} style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: 'transform 200ms ease-out' }} className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br ${theme.tint} to-white p-6`}>
        <div className="relative flex gap-4">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${theme.grad} text-xl font-bold text-white`}>
            {doctor.avatarUrl && !imgError ? <img src={doctor.avatarUrl} onError={() => setImgError(true)} alt={doctor.fullName} className="h-full w-full object-cover object-top" /> : getInitials(doctor.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-900">{doctor.academicTitle} {doctor.fullName}</h3>
            <span className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.tagBg} ${theme.tagText}`}>{doctor.specialty}</span>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-1.5">
          <Rate disabled allowHalf value={doctor.rating} style={{ fontSize: 13, color: '#F59E0B' }} />
          <span className="text-xs text-slate-500">{doctor.rating} · {doctor.totalReviews} đánh giá</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-slate-500">{doctor.bio || 'Bác sĩ chưa cập nhật giới thiệu.'}</p>
        <div className="mt-auto pt-5">
          {accepting ? (
            <Link href={`/booking?doctorId=${doctor.id}`}><Button type="primary" icon={<CalendarOutlined />} block style={{ height: 40, borderRadius: 12, background: theme.hex[0] }}>Đặt lịch khám</Button></Link>
          ) : (
            <Button block disabled style={{ height: 40, borderRadius: 12 }}>Hết lịch</Button>
          )}
        </div>
      </div>
    </div>
  )
}

// TÁCH NỘI DUNG CHÍNH RA ĐỂ DÙNG SUSPENSE
function DoctorsContent() {
  const searchParams = useSearchParams()
  const requestedSpecialty = searchParams.get('specialty')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [specialty, setSpecialty] = useState(requestedSpecialty || 'all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('doctors').select('*').order('id')
        if (error) throw error
        setDoctors(data || [])
      } catch (err) { message.error('Lỗi tải dữ liệu bác sĩ') }
      finally { setLoading(false) }
    }
    loadDoctors()
  }, [])

  useEffect(() => { setSpecialty(requestedSpecialty || 'all') }, [requestedSpecialty])
  useEffect(() => { setCurrentPage(1) }, [searchText, specialty])

  const filteredDoctors = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    return doctors.filter((d) => (d.fullName.toLowerCase().includes(keyword)) && (specialty === 'all' || d.specialty === specialty))
  }, [doctors, searchText, specialty])

  const pagedDoctors = useMemo(() => filteredDoctors.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredDoctors, currentPage])

  return (
    <PageLayout>
      <div className={beVietnamPro.className}>
        <style>{`@keyframes mc-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } } @keyframes mc-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        <div className="relative mb-8 rounded-3xl bg-gradient-to-br from-blue-50 to-teal-50 p-10 overflow-hidden">
           <h1 className="text-3xl font-extrabold text-slate-900">Danh sách bác sĩ</h1>
           <p className="text-slate-500">Tìm bác sĩ và đặt lịch khám nhanh chóng.</p>
        </div>
        <div className="mb-8 flex gap-3 p-3 bg-white border rounded-2xl shadow-sm">
          <Input placeholder="Tìm tên bác sĩ..." prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ maxWidth: 280 }} />
          <Select value={specialty} onChange={setSpecialty} style={{ minWidth: 200 }} options={[{label: 'Tất cả', value: 'all'}, ...Array.from(new Set(doctors.map(d => d.specialty))).map(s => ({label: s, value: s}))]} />
        </div>
        {loading ? <div className="text-center p-20"><Spin size="large" /></div> : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagedDoctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

// FILE CHÍNH BẮT BUỘC PHẢI CÓ SUSPENSE
export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center"><Spin size="large" /></div>}>
      <DoctorsContent />
    </Suspense>
  )
}