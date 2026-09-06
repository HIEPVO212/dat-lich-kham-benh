'use client'
import { useState } from 'react'
import PageLayout from '../../components/PageLayout'
import { createContactRequest } from '../../lib/contact-requests'

const contactMethods = [
  {
    title: 'Hotline',
    value: '1900 1234',
    detail: 'Hỗ trợ 24/7',
    icon: '📞',
  },
  {
    title: 'Email',
    value: 'support@healthconnect.vn',
    detail: 'Phản hồi trong 30 phút',
    icon: '✉️',
  },
  {
    title: 'Địa chỉ',
    value: 'Số 12, Đường Lê Lợi, Q.1, TP.HCM',
    detail: 'Từ 8:00 - 18:00',
    icon: '📍',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(false)
    setError('')
    setLoading(true)

    try {
      await createContactRequest(form)
      setSubmitted(true)
      setForm({ full_name: '', email: '', phone: '', message: '' })
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi yêu cầu hỗ trợ.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              Liên hệ với chúng tôi
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Nếu bạn cần tư vấn, đặt lịch hoặc hỗ trợ kỹ thuật, hãy để lại thông tin. HEALTHCONNECT sẽ phản hồi nhanh chóng nhất.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {contactMethods.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">
                  {item.icon}
                </div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">{item.title}</div>
                <div className="mt-3 text-lg font-bold text-slate-900">{item.value}</div>
                <div className="mt-2 text-sm text-slate-600">{item.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Gửi yêu cầu
              </div>
              <h2 className="text-3xl font-black text-slate-900">Đặt câu hỏi hoặc yêu cầu hỗ trợ</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Chúng tôi sẽ liên hệ lại với bạn trong thời gian ngắn nhất. Vui lòng điền đầy đủ thông tin để được hỗ trợ tốt hơn.
              </p>

              <div className="mt-6 space-y-4 text-sm text-slate-700">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="text-xl">🕒</span>
                  <span>Thời gian làm việc: 8:00 - 18:00 (Thứ 2 - Chủ nhật)</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="text-xl">💬</span>
                  <span>Hỗ trợ qua chat, hotline, email và lịch hẹn trực tuyến</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Họ tên</label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                    required
                    placeholder="Nhập họ tên của bạn"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                    placeholder="example@gmail.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  required
                  placeholder="Nhập số điện thoại"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nội dung</label>
                <textarea
                  rows={5}
                  name="message"
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  required
                  placeholder="Bạn cần hỗ trợ về vấn đề gì?"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700"
                >
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>

                {submitted && (
                  <span className="text-sm font-medium text-emerald-600">Yêu cầu đã được ghi nhận.</span>
                )}
                {error && <span className="text-sm font-medium text-red-600">{error}</span>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}