'use client'

import PageLayout from '../../components/PageLayout'
import { Card, Row, Col, Statistic } from 'antd'
import { CalendarOutlined, CheckCircleFilled, ClockCircleFilled, TeamOutlined } from '@ant-design/icons'

export default function DashboardPage() {
  return (
    <PageLayout>
      <h1 style={{ marginBottom: 24 }}>Tổng Quan Hệ Thống</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng lịch hẹn" value={0} prefix={<CalendarOutlined style={{ color: '#2563eb' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đã duyệt" value={0} prefix={<CheckCircleFilled style={{ color: '#22c55e' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Chờ xác nhận" value={0} prefix={<ClockCircleFilled style={{ color: '#f59e0b' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Bác sĩ" value={0} prefix={<TeamOutlined style={{ color: '#ef4444' }} />} />
          </Card>
        </Col>
      </Row>
      {/* TODO: người phụ trách Dashboard nối số liệu thật từ Supabase + biểu đồ */}
    </PageLayout>
  )
}