'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  HeartFilled,
  HeartOutlined,
  InstagramOutlined,
  MailOutlined,
  MenuOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  StarFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { getSpecialties, type Specialty } from '../../lib/specialties'
import { CONTACT_INFO } from '../../lib/contact'
import { getDoctors, type Doctor } from '../../lib/doctors'
import { getAppointmentsLast24Hours, getCompletedPatientCount, getLatestAppointment, type LatestAppointment } from '../../lib/appointments'
import { createReview, getReviews, type Review } from '../../lib/reviews'
import { supabase } from '../../lib/supabase'

const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Bác sĩ', href: '/doctors' },
  { label: 'Đặt lịch khám', href: '/booking' },
  { label: 'Dịch vụ', href: '/services' },
  { label: 'Liên hệ', href: '/contact' },
]

const statHighlights = [
  { value: '15k+', label: 'Bệnh nhân tin tưởng', icon: <UserOutlined className="text-cyan-600" /> },
  { value: '57', label: 'Bác sĩ chuyên khoa', icon: <TeamOutlined className="text-emerald-600" /> },
  { value: '4.9/5', label: 'Đánh giá trung bình', icon: <StarFilled className="text-amber-400" /> },
]

const services = [
  {
    title: 'Khám tổng quát',
    href: '/booking',
    description: 'Tổng kết sức khỏe, tư vấn hướng điều trị và theo dõi định kỳ.',
    icon: <HeartOutlined className="text-3xl text-cyan-600" />,
  },
  {
    title: 'Khám chuyên khoa',
    href: '/chuyen-khoa',
    description: 'Đội ngũ bác sĩ chuyên khoa từ tim mạch, nội tổng quát đến nhi khoa.',
    icon: <HeartFilled className="text-3xl text-rose-500" />,
  },
  {
    title: 'Đặt lịch nhanh',
    href: '/booking',
    description: 'Chọn bác sĩ, khung giờ và nhận thông báo xác nhận ngay trong vài phút.',
    icon: <CalendarOutlined className="text-3xl text-emerald-600" />,
  },
  {
    title: 'Bảo mật thông tin',
    href: '/privacy',
    description: 'Quy trình dữ liệu minh bạch, lưu trữ an toàn và kiểm soát quyền truy cập.',
    icon: <SafetyCertificateOutlined className="text-3xl text-violet-600" />,
  },
]

const steps = [
  {
    number: '01',
    title: 'Chọn chuyên khoa',
    description: 'Lựa chọn loại khám phù hợp với nhu cầu của bạn.',
  },
  {
    number: '02',
    title: 'Chọn bác sĩ',
    description: 'Xem lịch làm việc và ưu tiên bác sĩ phù hợp.',
  },
  {
    number: '03',
    title: 'Chọn thời gian',
    description: 'Điền thông tin và xác nhận khung giờ muốn đặt.',
  },
  {
    number: '04',
    title: 'Nhận xác nhận',
    description: 'Nhận email/SMS xác nhận và nhắc lịch khám tức thì.',
  },
]

const doctorAccents = ['from-cyan-500 to-sky-600', 'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600']

const testimonials = [
  {
    name: 'Anh Hương',
    role: 'Khách hàng',
    quote:
      'Mình đặt lịch chỉ trong 2 phút, bác sĩ phù hợp và lịch khám rõ ràng. Trải nghiệm rất chuyên nghiệp và tiết kiệm thời gian.',
  },
  {
    name: 'Chị Lan',
    role: 'Phụ huynh',
    quote:
      'Tôi rất thích cách hệ thống giúp chọn khung giờ tiện lợi cho con. Nhắc lịch và xác nhận rất rõ, không phải lo lắng về việc quên khám.',
  },
  {
    name: 'Anh Nam',
    role: 'Nhân viên công ty',
    quote:
      'Không cần gọi điện nhiều lần nữa. HEALTHCONNECT giúp mình chủ động lên lịch khám và theo dõi bệnh tình hiệu quả hơn.',
  },
]


const specialtyAccents = [
  'from-cyan-500 to-sky-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-700',
  'from-teal-500 to-cyan-600',
  'from-fuchsia-500 to-violet-600',
]

const faqs = [
  {
    question: 'Tôi có thể đặt lịch khám trực tuyến ngay khi nào?',
    answer: 'Bạn có thể đặt lịch bất cứ lúc nào qua website, và hệ thống sẽ hiển thị các khung giờ còn trống phù hợp với chuyên khoa và bác sĩ bạn chọn.',
  },
  {
    question: 'Hệ thống có hỗ trợ đặt cho người nhà không?',
    answer: 'Có. HEALTHCONNECT giúp bạn quản lý nhiều lịch khám, đồng thời tối ưu trải nghiệm lựa chọn thời gian cho cá nhân hoặc gia đình.',
  },
  {
    question: 'Nếu tôi cần đổi lịch khám thì sao?',
    answer: 'Bạn có thể cập nhật lịch hẹn theo hướng dẫn trong mục đặt lịch hoặc liên hệ hỗ trợ để được hỗ trợ nhanh hơn.',
  },
]

export default function HealthConnectLanding() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true)
  const [specialtiesError, setSpecialtiesError] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [doctorsError, setDoctorsError] = useState<string | null>(null)
  const [doctorOffset, setDoctorOffset] = useState(0)
  const [latestAppointment, setLatestAppointment] = useState<LatestAppointment | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewUser, setReviewUser] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [appointmentsLast24Hours, setAppointmentsLast24Hours] = useState(0)
  const [completedPatientCount, setCompletedPatientCount] = useState(0)

  useEffect(() => {
    let isMounted = true

    getSpecialties()
      .then((data) => {
        if (isMounted) {
          setSpecialties(data)
          setSpecialtiesError(null)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setSpecialtiesError(error instanceof Error ? error.message : 'Không thể tải danh sách chuyên khoa.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setSpecialtiesLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    getAppointmentsLast24Hours()
      .then(setAppointmentsLast24Hours)
      .catch(() => setAppointmentsLast24Hours(0))

    getCompletedPatientCount()
      .then(setCompletedPatientCount)
      .catch(() => setCompletedPatientCount(0))
  }, [])

  useEffect(() => {
    Promise.all([
      getReviews(),
      supabase.auth.getUser(),
    ])
      .then(([loadedReviews, userResult]) => {
        setReviews(loadedReviews)
        setReviewUser(Boolean(userResult.data.user))
      })
      .catch(() => setReviews([]))
  }, [])

  const submitReview = async () => {
    if (!reviewText.trim()) return
    setReviewLoading(true)
    try {
      await createReview(reviewRating, reviewText.trim())
      setReviews(await getReviews())
      setReviewText('')
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Không thể gửi đánh giá.')
    } finally {
      setReviewLoading(false)
    }
  }

  useEffect(() => {
    getLatestAppointment()
      .then(setLatestAppointment)
      .catch(() => setLatestAppointment(null))
  }, [])

  useEffect(() => {
    let isMounted = true

    getDoctors()
      .then((data) => {
        if (isMounted) {
          setDoctors(data)
          setDoctorsError(null)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setDoctorsError(error instanceof Error ? error.message : 'Không thể tải danh sách bác sĩ.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setDoctorsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (doctors.length <= 3) {
      return
    }

    const interval = window.setInterval(() => {
      setDoctorOffset((current) => (current + 3) % doctors.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [doctors.length])

  const visibleDoctors = doctors.length
    ? Array.from({ length: Math.min(3, doctors.length) }, (_, index) => doctors[(doctorOffset + index) % doctors.length])
    : []
  const appointmentDateLabel = latestAppointment
    ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(
        new Date(`${latestAppointment.appointment_date}T00:00:00`),
      )
    : null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20">
                <HeartFilled className="text-lg text-white" />
              </div>
              <div>
                <div className="text-lg font-black tracking-[0.22em] text-slate-900">HEALTHCONNECT</div>
              </div>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-slate-600 transition hover:text-cyan-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
              >
                Đăng nhập
              </Link>
              <Link
                href="/booking"
                className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-700"
              >
                Đặt lịch
              </Link>
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 md:hidden"
            >
              {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </nav>

          {mobileOpen && (
            <div className="space-y-3 border-t border-slate-200 pb-4 pt-4 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-cyan-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/booking"
                  className="flex-1 rounded-full bg-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Đặt lịch
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
          <div className="absolute left-[-120px] top-16 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
          <div className="absolute right-[-120px] top-10 h-80 w-80 rounded-full bg-emerald-200/60 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
                <SearchOutlined />
                Chăm sóc sức khỏe thông minh
              </div>

              <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Đặt lịch khám bệnh thật dễ dàng, mỗi ngày khỏe mạnh hơn.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                HEALTHCONNECT giúp bạn tìm bác sĩ phù hợp, đặt lịch theo thời gian mong muốn và theo dõi quá trình chăm sóc sức khỏe một cách thuận tiện.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-700"
                >
                  Bắt đầu đặt lịch
                  <ArrowRightOutlined />
                </Link>
                <Link
                  href="/doctors"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                >
                  Tìm bác sĩ
                </Link>
              </div>

              <div className="mt-7 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <CalendarOutlined className="text-cyan-600" />
                  <span>
                    <strong className="text-slate-900">{appointmentsLast24Hours.toLocaleString('vi-VN')}</strong>{' '}
                    lượt đặt lịch trong 24 giờ qua
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {reviews.slice(0, 4).map((review) => (
                      <span
                        key={review.id}
                        title={review.full_name}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-cyan-100 text-xs font-bold text-cyan-700"
                      >
                        <UserOutlined />
                      </span>
                    ))}
                  </div>
                  <span>
                    <strong className="text-slate-900">
                      {reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                    </strong>
                    <span className="ml-1 text-amber-400">★★★★★</span>
                    <span className="ml-1">từ {reviews.length.toLocaleString('vi-VN')} bệnh nhân</span>
                  </span>
                </div>
              </div>

              <div className="mt-10 grid max-w-lg gap-6 sm:grid-cols-3">
                {statHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                      {item.icon}
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {item.label === 'Bệnh nhân tin tưởng'
                        ? completedPatientCount.toLocaleString('vi-VN')
                        : item.value}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-10 h-24 w-24 rounded-full border border-cyan-200 bg-cyan-100/80" />
              <div className="absolute -right-8 bottom-10 h-28 w-28 rounded-full border border-emerald-200 bg-emerald-100/80" />

              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:p-7">
                <div className="rounded-[28px] bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-cyan-50">Đặt lịch hôm nay</div>
                      <div className="mt-2 text-3xl font-black">{latestAppointment?.appointment_time ?? '--:--'}</div>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3">
                      <CalendarOutlined className="text-2xl" />
                    </div>
                  </div>

                  <Link href={latestAppointment ? '/appointments' : '/booking'} className="mt-8 block rounded-2xl bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
                        {latestAppointment
                          ? latestAppointment.doctor_name
                              .split(' ')
                              .slice(-2)
                              .map((word) => word[0])
                              .join('')
                          : '--'}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {latestAppointment
                            ? `${latestAppointment.doctor_title ? `${latestAppointment.doctor_title} ` : ''}${latestAppointment.doctor_name}`
                            : 'Chưa có lịch hẹn'}
                        </div>
                        <div className="text-sm text-cyan-50/90">
                          {latestAppointment?.specialty_name ?? 'Đặt lịch để xem thông tin tại đây'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Tìm kiếm nhanh</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      Có sẵn
                    </span>
                  </div>

                  <div className="space-y-3">
                    <Link href="/chuyen-khoa" className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-cyan-300 hover:shadow-sm">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Chuyên khoa</div>
                      <div className="mt-2 font-semibold text-slate-800">
                        {latestAppointment?.specialty_name ?? 'Chưa có lịch hẹn'}
                      </div>
                    </Link>
                    <Link href={latestAppointment ? '/appointments' : '/booking'} className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-cyan-300 hover:shadow-sm">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Ngày khám</div>
                      <div className="mt-2 font-semibold capitalize text-slate-800">
                        {appointmentDateLabel ?? 'Chưa có lịch hẹn'}
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                  <div>
                    <div className="text-sm text-cyan-700">Hỗ trợ bệnh nhân</div>
                    <div className="mt-1 text-xl font-black text-slate-900">24/7</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-emerald-600">
                    <CheckCircleOutlined />
                    Luôn sẵn sàng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-4 pt-2 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-slate-900">Chuyên khoa phổ biến</h2>
            <Link href="/chuyen-khoa" className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-800">
              Xem tất cả →
            </Link>
          </div>

          {specialtiesLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              Đang tải danh sách chuyên khoa...
            </div>
          )}

          {specialtiesError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {specialtiesError}
            </div>
          )}

          {!specialtiesLoading && !specialtiesError && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {specialties.slice(0, 6).map((specialty, index) => (
                <Link
                  key={specialty.specialty_id}
                  href={`/doctors?specialty=${encodeURIComponent(specialty.specialty_name)}`}
                  className="group rounded-[22px] border border-slate-200 bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
                >
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${specialtyAccents[index % specialtyAccents.length]} shadow-lg`}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[10px] font-black text-slate-700">
                      {specialty.specialty_name
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{specialty.specialty_name}</div>
                  <div className="mt-1 line-clamp-2 text-[11px] text-slate-500">{specialty.description}</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                Dịch vụ tiêu biểu
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-900 sm:text-4xl">
                Chăm sóc sức khỏe thuận tiện hơn mỗi ngày
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => (
                <Link
                  key={service.title}
                  href={service.href}
                  className="group rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-white hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition group-hover:scale-105">
                    {service.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{service.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
                    Xem thêm <ArrowRightOutlined />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Đội ngũ bác sĩ
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-900 sm:text-4xl">
                Bác sĩ giàu kinh nghiệm, tận tâm chăm sóc
              </h2>
            </div>
            <Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-800">
              Xem thêm bác sĩ
              <ArrowRightOutlined />
            </Link>
          </div>

          {doctorsLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              Đang tải danh sách bác sĩ...
            </div>
          )}

          {doctorsError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {doctorsError}
            </div>
          )}

          {!doctorsLoading && !doctorsError && (
          <div className="grid gap-6 lg:grid-cols-3">
            {visibleDoctors.map((doctor, index) => (
              <div key={doctor.doctor_id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className={`h-40 bg-gradient-to-br ${doctorAccents[index % doctorAccents.length]}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-black text-slate-700">
                      {doctor.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={doctor.avatar_url} alt={doctor.full_name} className="h-full w-full object-cover" />
                      ) : (
                        doctor.full_name
                        .split(' ')
                        .slice(-2)
                        .map((word) => word[0])
                        .join('')
                      )}
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${doctor.is_accepting_bookings ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {doctor.is_accepting_bookings ? 'Đang nhận lịch' : 'Tạm kín lịch'}
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {doctor.academic_title ? `${doctor.academic_title} ` : ''}{doctor.full_name}
                  </h3>
                  <div className="mt-2 text-base font-medium text-cyan-700">{doctor.specialty_name}</div>
                  <p className="mt-3 text-sm text-slate-600">{doctor.experience_years} năm kinh nghiệm</p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserOutlined />
                      Đặt khám ngay
                    </div>
                    <Link href={`/booking?doctorId=${doctor.doctor_id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                      Đặt lịch
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </section>

        <section className="bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                  Quy trình đặt lịch
                </div>
                <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                  Chỉ 4 bước để được khám nhanh chóng
                </h2>
                <p className="mt-4 max-w-lg text-lg text-slate-300">
                  Thiết kế giúp người bệnh chủ động trong lựa chọn bác sĩ, ngày giờ và chuyên khoa mà không phải lo lắng.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/10"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-2xl font-black text-cyan-300">{step.number}</span>
                      <ClockCircleOutlined className="text-lg text-cyan-200" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mt-16 max-w-2xl text-center">
              <div className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                Khách hàng tin tưởng
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-900 sm:text-4xl">
                Trải nghiệm đặt lịch được đánh giá cao
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {reviews.slice(0, 3).map((testimonial) => (
                <div key={testimonial.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-lg font-black text-cyan-700">
                      {testimonial.full_name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: testimonial.rating }).map((_, index) => (
                        <span key={`${testimonial.id}-${index}`}>★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-base leading-7 text-slate-600">“{testimonial.content}”</p>

                  <div className="mt-6 border-t border-slate-200 pt-4">
                    <div className="font-bold text-slate-900">{testimonial.full_name}</div>
                    <div className="text-sm text-slate-500">Bệnh nhân</div>
                  </div>
                  {reviews.length === 0 && (
                    <p className="mt-8 text-center text-slate-500">Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm.</p>
                  )}
                  {reviewUser && (
                    <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
                      <h3 className="font-bold text-slate-900">Chia sẻ trải nghiệm của bạn</h3>
                      <div className="mt-3 flex gap-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <button key={index} type="button" onClick={() => setReviewRating(index + 1)} className={index < reviewRating ? 'text-amber-400' : 'text-slate-300'}>★</button>
                        ))}
                      </div>
                      <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3" rows={3} placeholder="Nhập đánh giá của bạn..." />
                      <button type="button" onClick={submitReview} disabled={reviewLoading || !reviewText.trim()} className="mt-3 rounded-full bg-cyan-600 px-5 py-2 font-semibold text-white disabled:opacity-50">
                        {reviewLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer id="contact" className="bg-slate-950 py-12 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr_1.2fr_1.5fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/30">
                <HeartFilled className="text-lg text-white" />
              </div>
              <div className="text-lg font-black tracking-[0.22em] text-white">HEALTHCONNECT</div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Nền tảng kết nối bệnh nhân và bác sĩ, giúp việc đặt lịch khám trở nên đơn giản và thuận tiện.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300">
                <FacebookOutlined />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300">
                <InstagramOutlined />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Về HEALTHCONNECT</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/about" className="transition hover:text-cyan-300">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-cyan-300">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-cyan-300">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Liên kết nhanh</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/" className="transition hover:text-cyan-300">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="transition hover:text-cyan-300">
                  Bác sĩ
                </Link>
              </li>
              <li>
                <Link href="/chuyen-khoa" className="transition hover:text-cyan-300">
                  Chuyên khoa
                </Link>
              </li>
              <li>
                <Link href="/booking" className="transition hover:text-cyan-300">
                  Đặt lịch khám
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-cyan-300">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Thông tin liên hệ</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <PhoneOutlined className="text-cyan-300" />
                <span>Hotline: {CONTACT_INFO.hotline}</span>
              </li>
              <li className="flex items-center gap-2">
                <MailOutlined className="text-cyan-300" />
                <span>Email: {CONTACT_INFO.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <EnvironmentOutlined className="text-cyan-300" />
                <span>Địa chỉ: {CONTACT_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 px-4 pt-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          © 2026 HEALTHCONNECT. Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  )
}
