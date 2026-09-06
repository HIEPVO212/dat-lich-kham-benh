'use client'

import Link from 'next/link'
import PageLayout from '../../components/PageLayout'

const values = [
  {
    title: 'Tiện lợi',
    description: 'Đặt lịch nhanh chóng, theo dõi lịch hẹn và quản lý hồ sơ sức khỏe mọi lúc mọi nơi.',
  },
  {
    title: 'Đáng tin cậy',
    description: 'Mạng lưới bác sĩ chuyên khoa được kiểm duyệt, quy trình khám rõ ràng và minh bạch.',
  },
  {
    title: 'Dịch vụ cá nhân hóa',
    description: 'Gợi ý chuyên khoa, bác sĩ và thời gian phù hợp với nhu cầu thực tế của từng bệnh nhân.',
  },
]

const steps = [
  'Chọn chuyên khoa hoặc bác sĩ phù hợp',
  'Chọn ngày giờ khám thuận tiện',
  'Xác nhận thông tin cá nhân và đặt lịch',
  'Nhận thông báo và đến khám đúng hẹn',
]

export default function AboutPage() {
  return (
    <PageLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', lineHeight: 1.8 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #ecfeff 0%, #eff6ff 100%)',
            borderRadius: 28,
            padding: '32px 28px',
            border: '1px solid #dbeafe',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: '#dbeafe',
              color: '#0f172a',
              padding: '8px 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              marginBottom: 16,
            }}
          >
            Về HEALTHCONNECT
          </div>
          <h1 style={{ margin: '0 0 12px', fontSize: 38, color: '#0f172a' }}>Nền tảng đặt lịch khám bệnh hiện đại, hướng tới sức khỏe cộng đồng.</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 18 }}>
            HEALTHCONNECT là hệ thống đặt lịch khám bệnh trực tuyến, kết nối bệnh nhân với đội ngũ bác sĩ chuyên khoa nhanh chóng, an toàn và thuận tiện.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          {values.map((item) => (
            <div
              key={item.title}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 24,
                padding: 24,
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#0f172a' }}>{item.title}</h3>
              <p style={{ margin: 0, color: '#475569' }}>{item.description}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24 }}>
            <h2 style={{ marginTop: 0, fontSize: 28, color: '#0f172a' }}>Sứ mệnh của chúng tôi</h2>
            <p style={{ color: '#475569' }}>
              Chúng tôi mang đến giải pháp đặt lịch khám bệnh trực tuyến giúp bệnh nhân tiết kiệm thời gian, giảm rủi ro chờ đợi và dễ dàng tiếp cận các chuyên khoa uy tín.
            </p>
            <p style={{ color: '#475569' }}>
              Đồng thời, HEALTHCONNECT hỗ trợ bác sĩ tối ưu hóa quy trình tiếp nhận bệnh nhân, quản lý lịch khám và nâng cao chất lượng phục vụ.
            </p>
          </div>

          <div style={{ background: '#0f172a', borderRadius: 24, padding: 24, color: '#fff' }}>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>Quy trình đơn giản</h2>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 12 }}>
              {steps.map((step) => (
                <li key={step} style={{ color: '#e2e8f0' }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24 }}>
          <h2 style={{ marginTop: 0, fontSize: 28, color: '#0f172a' }}>Vì sao bệnh nhân tin chọn HEALTHCONNECT?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#0ea5e9' }}>15k+</div>
              <div style={{ color: '#475569' }}>Bệnh nhân đã sử dụng</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#0ea5e9' }}>120+</div>
              <div style={{ color: '#475569' }}>Bác sĩ chuyên khoa</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#0ea5e9' }}>4.9/5</div>
              <div style={{ color: '#475569' }}>Đánh giá trải nghiệm</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#0ea5e9' }}>24/7</div>
              <div style={{ color: '#475569' }}>Hỗ trợ đặt lịch</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link
            href="/booking"
            style={{
              display: 'inline-block',
              background: '#0ea5e9',
              color: '#fff',
              padding: '14px 24px',
              borderRadius: 999,
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Đặt lịch ngay
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}