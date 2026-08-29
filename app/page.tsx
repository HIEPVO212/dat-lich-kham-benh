'use client'
import Link from 'next/link'
import { Button, Row, Col, Card } from 'antd'
import { CalendarOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import Header from '../components/Header'

export default function HomePage() {
  return (
    <div>
      <Header />

      <div
        style={{
          background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
          color: '#fff',
          padding: '96px 32px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>
          Medicare - Chăm sóc sức khỏe 4.0
        </h1>
        <p style={{ fontSize: 18, marginBottom: 32, opacity: 0.9 }}>
          Hệ thống đặt lịch khám bệnh trực tuyến nhanh chóng, tiện lợi
        </p>
        <Link href="/booking">
          <Button
            size="large"
            style={{ background: '#fff', color: '#2563eb', fontWeight: 600, height: 48, paddingInline: 32 }}
          >
            Bắt đầu đặt lịch ngay
          </Button>
        </Link>
      </div>

      <div style={{ padding: '64px 32px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 40 }}>Vì sao chọn Medicare?</h2>
        <Row gutter={24}>
          <Col span={8}>
            <Card style={{ textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: 36, color: '#2563eb', marginBottom: 12 }} />
              <h3>Đặt lịch nhanh chóng</h3>
              <p>Chọn bác sĩ, khung giờ phù hợp chỉ trong vài bước</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: 36, color: '#2563eb', marginBottom: 12 }} />
              <h3>Đội ngũ bác sĩ uy tín</h3>
              <p>Danh sách bác sĩ chuyên khoa được cập nhật liên tục</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 36, color: '#2563eb', marginBottom: 12 }} />
              <h3>An toàn, bảo mật</h3>
              <p>Thông tin cá nhân được bảo vệ theo tiêu chuẩn</p>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}