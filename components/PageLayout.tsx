'use client'
import { Layout, Button } from 'antd'
import { ArrowLeftOutlined, HeartFilled, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from './Header'
import Sidebar from './Sidebar'
import { CONTACT_INFO } from '../lib/contact'

const { Content, Footer } = Layout

const quickLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/doctors', label: 'Bác sĩ' },
  { href: '/chuyen-khoa', label: 'Chuyên khoa' },
  { href: '/booking', label: 'Đặt lịch khám' },
  { href: '/contact', label: 'Liên hệ' },
]

const aboutLinks = [
  { href: '/about', label: 'Về chúng tôi' },
  { href: '/privacy', label: 'Chính sách bảo mật' },
  { href: '/terms', label: 'Điều khoản sử dụng' },
]

export default function PageLayout({ children, bare = false }: { children: React.ReactNode; bare?: boolean }) {
  const router = useRouter()

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f9ff 0%, #eef6ff 100%)' }}>
      <Header />
      <Layout style={{ background: 'transparent' }}>
        <Sidebar />
        <Content
          className="app-content"
          style={{
            minWidth: 0,
            ...(bare
              ? {}
              : {
                  margin: 20,
                  padding: 26,
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: 22,
                  border: '1px solid rgba(37, 99, 235, 0.08)',
                  boxShadow: '0 12px 30px rgba(37, 99, 235, 0.06)',
                  backdropFilter: 'blur(10px)',
                }),
          }}
        >
          {!bare && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              style={{
                marginBottom: 18,
                borderRadius: 10,
                background: '#eff6ff',
                borderColor: '#bfdbfe',
                color: '#1d4ed8',
                fontWeight: 600,
              }}
            >
              Quay lại
            </Button>
          )}
          {children}
        </Content>
      </Layout>

      <Footer style={{ background: '#0f172a', color: '#e2e8f0', padding: '56px 24px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            className="app-footer-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1.2fr 1.4fr',
              gap: 32,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                  }}
                >
                  <HeartFilled style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, color: '#fff' }}>HEALTHCONNECT</div>
              </div>

              <p style={{ color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
                Nền tảng kết nối bệnh nhân và bác sĩ, giúp việc đặt lịch khám trở nên đơn giản và thuận tiện.
              </p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Về HEALTHCONNECT</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                {aboutLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Liên kết nhanh</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Thông tin liên hệ</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                  <PhoneOutlined />
                  <span>Hotline: {CONTACT_INFO.hotline}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                  <MailOutlined />
                  <span>Email: {CONTACT_INFO.email}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                  <EnvironmentOutlined />
                  <span>Địa chỉ: {CONTACT_INFO.address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(148, 163, 184, 0.2)',
              marginTop: 28,
              paddingTop: 20,
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            © 2026 HEALTHCONNECT. Mọi quyền được bảo lưu.
          </div>
        </div>
      </Footer>
    </Layout>
  )
}