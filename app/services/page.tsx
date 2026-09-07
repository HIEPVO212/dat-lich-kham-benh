import Link from 'next/link'
import PageLayout from '../../components/PageLayout'

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
    <PageLayout>
      <div className="min-h-[70vh] rounded-[30px] bg-slate-50 p-2 sm:p-4">
        <section className="overflow-hidden rounded-[26px] bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
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

              <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                <div className="relative overflow-hidden rounded-[26px]">
                  {/* Hình minh họa dịch vụ thay cho dữ liệu lịch khám mẫu. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.pexels.com/photos/7659567/pexels-photo-7659567.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Nhân viên y tế tư vấn dịch vụ chăm sóc sức khỏe"
                    className="h-[360px] w-full object-cover"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-sm">
                    <div className="text-sm font-semibold text-cyan-700">Chăm sóc sức khỏe toàn diện</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">Đồng hành cùng bạn trong mọi nhu cầu y tế</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

          <div className="mt-8 flex justify-center">
            <Link
              href="/chuyen-khoa"
              className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-700"
            >
              Xem tất cả chuyên khoa →
            </Link>
          </div>
        </section>

        <section className="-mx-6 overflow-hidden bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-700 py-14 text-white sm:-mx-8">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm">
              Hỗ trợ bệnh nhân
            </div>

            <h2 className="mx-auto mt-7 max-w-[1100px] text-[2.2rem] font-black leading-[1.02] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[4rem]">
              Sẵn sàng hỗ trợ bạn đặt lịch và chăm sóc sức khỏe tốt hơn
            </h2>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/booking"
                className="!text-white inline-flex min-w-[180px] items-center justify-center rounded-full border border-white/80 bg-transparent px-7 py-3 text-base font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] transition hover:bg-white/5"
              >
                Đặt lịch ngay
              </Link>
              <Link
                href="/contact"
                className="!text-white inline-flex min-w-[190px] items-center justify-center rounded-full border border-white/80 bg-transparent px-7 py-3 text-base font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] transition hover:bg-white/5"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
