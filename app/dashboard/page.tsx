'use client'

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Spin, message, Progress, Avatar } from 'antd'
import {
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  PieChartOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    confirmedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    totalDoctors: 0,
    totalUsers: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])
  const [specialtyStats, setSpecialtyStats] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    async function initDashboard() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          message.error('Vui lòng đăng nhập tài khoản Quản trị viên')
          router.push('/login')
          return
        }

        const email = session.user.email?.toLowerCase()
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        const role = profile?.role || session.user.user_metadata?.role
        const isAdmin = email === 'hiepvo212600@gmail.com' || role === 'admin'

        if (!isAdmin) {
          message.error('Chỉ Quản trị viên mới có quyền xem trang Tổng quan!')
          router.push('/')
          return
        }

        // Tải danh sách bác sĩ
        const { data: doctors } = await supabase.from('doctor').select('*')
        const docMap = new Map<string, any>()
        const specCountMap = new Map<string, number>()

        ;(doctors || []).forEach((d: any) => {
          const docId = String(d.doctor_id || d.id)
          docMap.set(docId, d)
          const spec = d.specialty || 'Đa khoa'
          specCountMap.set(spec, (specCountMap.get(spec) || 0) + 1)
        })

        const specList: { name: string; count: number }[] = []
        specCountMap.forEach((count, name) => {
          specList.push({ name, count })
        })
        setSpecialtyStats(specList.sort((a, b) => b.count - a.count).slice(0, 5))

        // Tải danh sách người dùng
        const { data: users } = await supabase.from('users').select('*')
        const userMap = new Map<string, any>()
        ;(users || []).forEach((u: any) => {
          userMap.set(String(u.id), u)
        })

        // Tải lịch hẹn
        const { data: appointments } = await supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false })

        const appList = appointments || []
        const confirmed = appList.filter(
          (a) => a.status === 'confirmed' || a.status === 'Đã duyệt'
        ).length
        const cancelled = appList.filter(
          (a) => a.status === 'cancelled' || a.status === 'Đã hủy'
        ).length
        const pending = appList.length - confirmed - cancelled

        setStats({
          totalAppointments: appList.length,
          confirmedAppointments: confirmed,
          pendingAppointments: pending > 0 ? pending : 0,
          cancelledAppointments: cancelled,
          totalDoctors: doctors?.length || 0,
          totalUsers: users?.length || 0,
        })

        // Ghép nối thông tin bệnh nhân và bác sĩ cho danh sách gần đây
        const mappedRecent = appList.slice(0, 6).map((app: any) => {
          const doc = docMap.get(String(app.doctor_id || ''))
          const user = userMap.get(String(app.user_id || app.patient_id || ''))

          const pName =
            app.patient_name ||
            app.full_name ||
            user?.full_name ||
            (user?.email ? user.email.split('@')[0] : 'Bệnh nhân')

          const pPhone = app.phone || app.patient_phone || user?.phone || ''

          const dName =
            app.doctor_name ||
            (doc ? `${doc.academic_title ? doc.academic_title + ' ' : ''}${doc.full_name || doc.name}` : '') ||
            'Chưa chỉ định'

          return {
            id: String(app.id || app.appointment_id),
            patient_name: pName,
            patient_phone: pPhone,
            doctor_name: dName,
            doctor_specialty: doc?.specialty || app.specialty || '',
            appointment_date: app.appointment_date,
            appointment_time: app.appointment_time || app.time,
            status: app.status || 'pending',
          }
        })

        setRecentAppointments(mappedRecent)
      } catch (err) {
        console.error('Lỗi tải Dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    initDashboard()
  }, [router])

  const columns = [
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_: any, r: any) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.patient_name}</div>
          {r.patient_phone && (
            <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <PhoneOutlined style={{ color: '#0284c7' }} /> {r.patient_phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Bác sĩ phụ trách',
      key: 'doctor',
      render: (_: any, r: any) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.doctor_name}</div>
          {r.doctor_specialty && (
            <span style={{ fontSize: 12, color: '#0284c7' }}>{r.doctor_specialty}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Ngày & Giờ khám',
      key: 'datetime',
      render: (_: any, r: any) => (
        <span>
          {r.appointment_date} {r.appointment_time && `(${r.appointment_time})`}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (st === 'confirmed' || st === 'Đã duyệt') {
          return <Tag color="green" style={{ borderRadius: 10 }}>Đã duyệt</Tag>
        }
        if (st === 'cancelled' || st === 'Đã hủy') {
          return <Tag color="red" style={{ borderRadius: 10 }}>Đã hủy</Tag>
        }
        return <Tag color="orange" style={{ borderRadius: 10 }}>Chờ duyệt</Tag>
      },
    },
  ]

  if (loading) {
    return (
      <PageLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Đang tải dữ liệu tổng quan..." />
        </div>
      </PageLayout>
    )
  }

  const confirmedRate =
    stats.totalAppointments > 0
      ? Math.round((stats.confirmedAppointments / stats.totalAppointments) * 100)
      : 0
  const pendingRate =
    stats.totalAppointments > 0
      ? Math.round((stats.pendingAppointments / stats.totalAppointments) * 100)
      : 0
  const cancelledRate =
    stats.totalAppointments > 0
      ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100)
      : 0

  return (
    <PageLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 8px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Tổng Quan Hệ Thống (Dashboard)
          </h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
            Báo cáo thống kê thời gian thực về lịch hẹn khám bệnh và nhân sự bác sĩ
          </p>
        </div>

        {/* 4 THẺ THỐNG KÊ */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <Statistic
                title={<span style={{ fontWeight: 600 }}>Tổng Số Lịch Hẹn</span>}
                value={stats.totalAppointments}
                prefix={<CalendarOutlined style={{ color: '#0284c7' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <Statistic
                title={<span style={{ fontWeight: 600 }}>Lịch Đã Phê Duyệt</span>}
                value={stats.confirmedAppointments}
                valueStyle={{ color: '#10b981' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <Statistic
                title={<span style={{ fontWeight: 600 }}>Đang Chờ Xác Nhận</span>}
                value={stats.pendingAppointments}
                valueStyle={{ color: '#f59e0b' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <Statistic
                title={<span style={{ fontWeight: 600 }}>Đội Ngũ Bác Sĩ</span>}
                value={stats.totalDoctors}
                valueStyle={{ color: '#6366f1' }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 2 KHỐI BIỂU ĐỒ BÁO CÁO TRỰC QUAN */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {/* Biểu đồ 1: Tỷ lệ & Trạng thái duyệt lịch */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  <PieChartOutlined style={{ color: '#0284c7', marginRight: 8 }} />
                  Tỷ Lệ Phân Bổ Trạng Thái Lịch Hẹn
                </span>
              }
              style={{ borderRadius: 16, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '8px 4px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontWeight: 600, fontSize: 13.5 }}>
                    <span style={{ color: '#10b981' }}>Đã phê duyệt thành công ({stats.confirmedAppointments})</span>
                    <span>{confirmedRate}%</span>
                  </div>
                  <Progress percent={confirmedRate} strokeColor="#10b981" showInfo={false} strokeWidth={12} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontWeight: 600, fontSize: 13.5 }}>
                    <span style={{ color: '#f59e0b' }}>Đang chờ xử lý ({stats.pendingAppointments})</span>
                    <span>{pendingRate}%</span>
                  </div>
                  <Progress percent={pendingRate} strokeColor="#f59e0b" showInfo={false} strokeWidth={12} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontWeight: 600, fontSize: 13.5 }}>
                    <span style={{ color: '#ef4444' }}>Đã hủy bỏ ({stats.cancelledAppointments})</span>
                    <span>{cancelledRate}%</span>
                  </div>
                  <Progress percent={cancelledRate} strokeColor="#ef4444" showInfo={false} strokeWidth={12} />
                </div>
              </div>
            </Card>
          </Col>

          {/* Biểu đồ 2: Top chuyên khoa có nhiều bác sĩ nhất */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  <BarChartOutlined style={{ color: '#6366f1', marginRight: 8 }} />
                  Phân Bổ Bác Sĩ Theo Chuyên Khoa
                </span>
              }
              style={{ borderRadius: 16, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 4px' }}>
                {specialtyStats.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
                    Chưa có dữ liệu chuyên khoa
                  </div>
                ) : (
                  specialtyStats.map((item, idx) => {
                    const percent =
                      stats.totalDoctors > 0
                        ? Math.round((item.count / stats.totalDoctors) * 100)
                        : 0
                    const colors = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']
                    const currentColor = colors[idx % colors.length]

                    return (
                      <div key={item.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13.5, fontWeight: 600 }}>
                          <span>{item.name}</span>
                          <span style={{ color: currentColor }}>{item.count} bác sĩ ({percent}%)</span>
                        </div>
                        <Progress percent={percent} strokeColor={currentColor} showInfo={false} strokeWidth={10} />
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* BẢNG LỊCH HẸN MỚI NHẤT ĐẦY ĐỦ THÔNG TIN */}
        <Card
          title={<span style={{ fontWeight: 700, fontSize: 16 }}>Danh Sách Lịch Hẹn Gần Đây</span>}
          style={{ marginTop: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <Table
            columns={columns}
            dataSource={recentAppointments}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </div>
    </PageLayout>
  )
}