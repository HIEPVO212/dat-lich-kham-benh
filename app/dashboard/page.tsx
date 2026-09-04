'use client'

import { useEffect, useState } from 'react'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'
import { Card, Row, Col, Statistic, Spin, Alert, message } from 'antd'
import { CalendarOutlined, CheckCircleFilled, ClockCircleFilled, CloseCircleFilled, TeamOutlined } from '@ant-design/icons'

export default function DashboardPage() {
  const [counts, setCounts] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0, doctors: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data, error: statsError } = await supabase.from('dashboard_stats').select('*').single()
        if (statsError) throw statsError

        setCounts({
          total: data.total_appointments,
          confirmed: data.confirmed_appointments,
          pending: data.pending_appointments,
          cancelled: data.cancelled_appointments,
          doctors: data.total_doctors,
        })
      } catch (loadError) {
        const errorMessage = loadError instanceof Error ? loadError.message : 'Không tải được dữ liệu tổng quan'
        setError(errorMessage)
        message.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  return (
    <PageLayout>
      <h1 style={{ marginBottom: 24 }}>Tổng Quan Hệ Thống</h1>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin size="large" /></div>
      ) : error ? (
        <Alert type="error" message={error} showIcon />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={12} lg={4}>
            <Card><Statistic title="Tổng lịch hẹn" value={counts.total} prefix={<CalendarOutlined style={{ color: '#2563eb' }} />} /></Card>
          </Col>
          <Col xs={12} lg={4}>
            <Card><Statistic title="Đã duyệt" value={counts.confirmed} prefix={<CheckCircleFilled style={{ color: '#22c55e' }} />} /></Card>
          </Col>
          <Col xs={12} lg={4}>
            <Card><Statistic title="Chờ xác nhận" value={counts.pending} prefix={<ClockCircleFilled style={{ color: '#f59e0b' }} />} /></Card>
          </Col>
          <Col xs={12} lg={4}>
            <Card><Statistic title="Đã hủy" value={counts.cancelled} prefix={<CloseCircleFilled style={{ color: '#ef4444' }} />} /></Card>
          </Col>
          <Col xs={12} lg={4}>
            <Card><Statistic title="Bác sĩ" value={counts.doctors} prefix={<TeamOutlined style={{ color: '#ef4444' }} />} /></Card>
          </Col>
        </Row>
      )}
    </PageLayout>
  )
}