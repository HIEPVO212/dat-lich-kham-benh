import Link from 'next/link'
import Header from '../../components/Header'

const serviceHighlights = [
  {
    title: 'Khám tổng quát',
    description: 'Tư vấn sức khỏe định kỳ, đánh giá tổng quát và lập kế hoạch chăm sóc cá nhân.',
    icon: '❤️',
  },
  {
    title: 'Khám chuyên khoa',
    description: 'Hỗ trợ đa chuyên khoa như tim mạch, nội tổng quát, nhi khoa và tiêu hóa.',
    icon: '🩺',
  },
  {
    title: 'Đặt lịch nhanh',
    description: 'Đặt lịch online dễ dàng với lịch khám rõ ràng, tối ưu thời gian cho bệnh nhân.',
    icon: '📅',
  },
  {
    title: 'Bảo mật thông tin',
    description: 'Thông tin bệnh nhân được bảo mật theo chuẩn an toàn và quy trình rõ ràng.',
    icon: '🔒',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main>
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                  Dịch vụ y tế hiện đại
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  Dịch vụ chăm sóc sức khỏe toàn diện, dành cho mọi nhu cầu.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  HEALTHCONNECT mang đến giải pháp đặt lịch khám bệnh trực tuyến nhanh chóng, an toàn và hiệu quả, với đội ngũ bác sĩ chuyên khoa và quy trình tối ưu.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/booking"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-700"
                  >
                    Đặt lịch ngay →
                  </Link>
                  <Link
                    href="/doctors"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                  >
                    Tìm bác sĩ
                  </Link>
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                <div className="rounded-[26px] bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-cyan-50">Lịch khám ưu tiên</div>
                      <div className="mt-2 text-3xl font-black">08:30</div>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3 text-2xl">📅</div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-base font-bold">
                        BA
                      </div>
                      <div>
                        <div className="font-semibold">BS. Minh Anh</div>
                        <div className="text-sm text-cyan-50/90">Tim mạch • Chuyên khoa</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              Dịch vụ tiêu biểu
            </div>
            <h2 className="mt-5 text-3xl font-black text-slate-900 sm:text-4xl">
              Hệ thống chăm sóc sức khỏe hiệu quả và thuận tiện
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {serviceHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                  {item.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-20 text-white">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50">
              Hỗ trợ bệnh nhân
            </div>
            <h2 className="mt-5 text-3xl font-black sm:text-4xl">
              Sẵn sàng hỗ trợ bạn đặt lịch và chăm sóc sức khỏe tốt hơn
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-cyan-700 transition hover:bg-slate-100"
              >
                Đặt lịch ngay
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-transparent px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-10 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-lg text-white">
              ❤
            </div>
            <div className="text-lg font-black tracking-[0.22em] text-white">HEALTHCONNECT</div>
          </div>
          <div className="text-sm text-slate-400">© 2026 HEALTHCONNECT. Mọi quyền được bảo lưu.</div>
          <div className="text-sm text-slate-400">Hỗ trợ 24/7 • hotline 1900 1234</div>
        </div>
      </footer>
    </div>
  )
}
