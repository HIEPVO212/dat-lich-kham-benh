'use client'

import Link from 'next/link'
import { CONTACT_INFO } from '../../lib/contact'
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartFilled,
  HeartOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'

const statHighlights = [
  { value: '15k+', label: 'Bệnh nhân tin tưởng' },
  { value: '120+', label: 'Bác sĩ chuyên khoa' },
  { value: '4.9/5', label: 'Đánh giá trung bình' },
]

const services = [
  {
    title: 'Khám tổng quát',
    description: 'Tổng kết sức khỏe, tư vấn hướng điều trị và theo dõi định kỳ.',
    icon: <HeartOutlined className="text-3xl text-cyan-600" />,
  },
  {
    title: 'Khám chuyên khoa',
    description: 'Đội ngũ bác sĩ chuyên khoa từ tim mạch, nội tổng quát đến nhi khoa.',
    icon: <HeartFilled className="text-3xl text-rose-500" />,
  },
  {
    title: 'Đặt lịch nhanh',
    description: 'Chọn bác sĩ, khung giờ và nhận thông báo xác nhận ngay trong vài phút.',
    icon: <CalendarOutlined className="text-3xl text-emerald-600" />,
  },
  {
    title: 'Bảo mật thông tin',
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

const doctors = [
  {
    name: 'BS. Minh Anh',
    specialty: 'Tim mạch',
    experience: '12 năm kinh nghiệm',
    rating: '4.9',
    accent: 'from-cyan-500 to-sky-600',
  },
  {
    name: 'BS. Hoàng Nam',
    specialty: 'Nội tổng quát',
    experience: '10 năm kinh nghiệm',
    rating: '4.8',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'BS. Thảo Vy',
    specialty: 'Nhi khoa',
    experience: '9 năm kinh nghiệm',
    rating: '5.0',
    accent: 'from-violet-500 to-purple-600',
  },
]

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


const specialties = [
  { name: 'Tiêu hóa', area: 'Phần khu 2', accent: 'from-cyan-500 to-sky-600' },
  { name: 'Cơ xương khớp', area: 'Phần khu 2', accent: 'from-emerald-500 to-teal-600' },
  { name: 'Hô hấp - Phần', area: 'khu 2', accent: 'from-violet-500 to-purple-600' },
  { name: 'Nội tiết - Phần', area: 'khu 2', accent: 'from-amber-500 to-orange-600' },
  { name: 'Tiết niệu - Phần', area: 'khu 2', accent: 'from-pink-500 to-rose-600' },
  { name: 'Ung bướu - Phần', area: 'khu 2', accent: 'from-indigo-500 to-blue-700' },
  { name: 'Truyền nhiễm - Phần', area: 'khu 2', accent: 'from-teal-500 to-cyan-600' },
  { name: 'Tâm thần - Phần', area: 'khu 2', accent: 'from-fuchsia-500 to-violet-600' },
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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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

              <div className="mt-10 grid max-w-lg gap-6 sm:grid-cols-3">
                {statHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
                    <div className="text-2xl font-black text-slate-900">{item.value}</div>
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
                      <div className="mt-2 text-3xl font-black">08:30</div>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3">
                      <CalendarOutlined className="text-2xl" />
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
                        BA
                      </div>
                      <div>
                        <div className="font-semibold">BS. Minh Anh</div>
                        <div className="text-sm text-cyan-50/90">Tim mạch - Chuyên khoa</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Tìm kiếm nhanh</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      Có sẵn
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Chuyên khoa</div>
                      <div className="mt-2 font-semibold text-slate-800">Khám tim mạch</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Ngày khám</div>
                      <div className="mt-2 font-semibold text-slate-800">Thứ Sáu, 12/09</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                  <div>
                    <div className="text-sm text-cyan-700">Tỷ lệ phản hồi</div>
                    <div className="mt-1 text-xl font-black text-slate-900">96%</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-emerald-600">
                    <CheckCircleOutlined />
                    Xác nhận nhanh
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-4 pt-2 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-slate-900">Chuyên khoa phổ biến</h2>
            <Link href="/doctors" className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-800">
              Xem tất cả →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            {specialties.map((specialty) => (
              <div
                key={specialty.name}
                className="group rounded-[22px] border border-slate-200 bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
              >
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${specialty.accent} shadow-lg`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[10px] font-black text-slate-700">
                    {specialty.name
                      .split(' ')
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900">{specialty.name}</div>
                <div className="mt-1 text-[11px] text-slate-500">{specialty.area}</div>
              </div>
            ))}
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

          <div className="grid gap-6 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <div key={doctor.name} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className={`h-40 bg-gradient-to-br ${doctor.accent}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-700">
                      {doctor.name
                        .split(' ')
                        .slice(-2)
                        .map((word) => word[0])
                        .join('')}
                    </div>
                    <div className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {doctor.rating} ★
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">{doctor.name}</h3>
                  <div className="mt-2 text-base font-medium text-cyan-700">{doctor.specialty}</div>
                  <p className="mt-3 text-sm text-slate-600">{doctor.experience}</p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserOutlined />
                      Đặt khám ngay
                    </div>
                    <Link href="/booking" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                      Đặt lịch
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-lg font-black text-cyan-700">
                      {testimonial.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={`${testimonial.name}-${index}`}>★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-base leading-7 text-slate-600">“{testimonial.quote}”</p>

                  <div className="mt-6 border-t border-slate-200 pt-4">
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer id="contact" className="bg-slate-950 py-10 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700">
              <HeartFilled className="text-lg text-white" />
            </div>
            <div className="text-lg font-black tracking-[0.22em] text-white">HEALTHCONNECT</div>
          </div>
          <div className="text-sm text-slate-400">© 2026 HEALTHCONNECT. Mọi quyền được bảo lưu.</div>
          <div className="text-sm text-slate-400">Hỗ trợ 24/7 • hotline {CONTACT_INFO.hotline}</div>
        </div>
      </footer>
    </div>
  )
}
