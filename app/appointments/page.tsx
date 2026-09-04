'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'
import { getCurrentUser } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { Button, Card, Empty, Result, Space, Spin, Tag, Typography, message } from 'antd'
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, PlusOutlined, StopOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

type Doctor = {
  id: number
  fullName: string
  academicTitle: string | null
  specialty: string
  workplaceName: string | null
}

type Appointment = {
  id: string
  doctor_id: number
  appointment_date: string
  appointment_time: string
  status: string
  reason: string | null
  doctor?: Doctor
}

function getDoctorId(appointment: Appointment) {
  if (appointment.doctor_id) return appointment.doctor_id
  const match = appointment.reason?.match(/^\[doctor:(\d+)\]/)
  return match ? Number(match[1]) : undefined
}

const labels: Record<string, string> = {
  pending: 'Chờ duyệt',
  confirmed: 'Đã duyệt',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

const colors: Record<string, string> = {
  pending: 'gold',
  confirmed: 'green',
  completed: 'blue',
  cancelled: 'red',
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-')
  return year ? `${day}/${month}/${year}` : value
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        setLoggedIn(false)
        return
      }

      setLoggedIn(true)
      const demoUser = user.id === '00000000-0000-4000-8000-000000000001'
      const admin = user.role === 'admin'
      setIsAdmin(admin)
      let appointmentsQuery = supabase
          .from('appointments')
          .select('id, doctor_id, appointment_date, appointment_time, status, reason')
          .order('appointment_date', { ascending: true })
      if (!admin) appointmentsQuery = appointmentsQuery.eq('patient_id', user.id)

      const [{ data, error }, doctorResponse] = await Promise.all([
        appointmentsQuery,
        fetch('/api/doctors'),
      ])

      if (error) throw error
      if (!doctorResponse.ok) throw new Error('Không tải được danh sách bác sĩ')

      const doctors = (await doctorResponse.json()) as Doctor[]
      const doctorMap = new Map(doctors.map((doctor) => [doctor.id, doctor]))
      if (demoUser) {
        const localAppointments = JSON.parse(localStorage.getItem('healthconnect_demo_appointments') || '[]') as Appointment[]
        setAppointments(localAppointments.map((appointment) => ({
          ...appointment,
          doctor: doctorMap.get(getDoctorId(appointment) || 0),
          reason: appointment.reason?.replace(/^\[doctor:\d+\]\s*/, '') || null,
        })))
        return
      }
      setAppointments(
        ((data || []) as Appointment[]).map((appointment) => ({
          ...appointment,
          doctor: doctorMap.get(getDoctorId(appointment) || 0),
          reason: appointment.reason?.replace(/^\[doctor:\d+\]\s*/, '') || null,
        }))
      )
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không tải được lịch hẹn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    if (error) {
      message.error('Không thể hủy lịch hẹn')
      return
    }
    message.success('Đã hủy lịch hẹn')
    await loadAppointments()
  }

  const approveAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id)
    if (error) {
      message.error('Không thể duyệt lịch hẹn')
      return
    }
    message.success('Đã duyệt lịch hẹn')
    await loadAppointments()
  }

  return (
    <PageLayout>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card bordered={false} style={{ borderRadius: 22, background: 'linear-gradient(135deg, #e0f2fe, #ecfeff)' }}>
          <Space direction="vertical" size={8}>
            <Tag color="blue"><CalendarOutlined /> Lịch hẹn của tôi</Tag>
            <Title level={2} style={{ margin: 0 }}>{isAdmin ? 'Quản lý và duyệt lịch hẹn' : 'Theo dõi lịch khám của bạn'}</Title>
            <Text type="secondary">{isAdmin ? 'Duyệt hoặc hủy các lịch hẹn đang chờ xử lý.' : 'Lịch hẹn được lưu và cập nhật trực tiếp từ Supabase.'}</Text>
          </Space>
          <Link href="/booking">
            <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 18 }}>Đặt lịch mới</Button>
          </Link>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
        ) : loggedIn === false ? (
          <Result title="Đăng nhập để xem lịch hẹn" extra={<Link href="/login"><Button type="primary">Đăng nhập</Button></Link>} />
        ) : appointments.length === 0 ? (
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <Empty description="Bạn chưa có lịch hẹn nào" />
            <Link href="/booking"><Button type="primary" icon={<PlusOutlined />}>Đặt lịch ngay</Button></Link>
          </Card>
        ) : (
          appointments.map((appointment) => {
            const doctor = appointment.doctor
            const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed'
            const canApprove = isAdmin && appointment.status === 'pending'
            return (
              <Card key={appointment.id} bordered={false} style={{ borderRadius: 18, border: '1px solid #e2e8f0' }}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Space wrap>
                    <UserOutlined style={{ color: '#2563eb' }} />
                    <Text strong>{doctor?.academicTitle ? `${doctor.academicTitle} ` : ''}{doctor?.fullName || 'Bác sĩ'}</Text>
                    <Tag color={colors[appointment.status] || 'default'}>{labels[appointment.status] || appointment.status}</Tag>
                  </Space>
                  <Text type="secondary">{doctor?.specialty || 'Chuyên khoa chưa cập nhật'}</Text>
                  <Space wrap>
                    <Text><CalendarOutlined /> {formatDate(appointment.appointment_date)}</Text>
                    <Text><ClockCircleOutlined /> {appointment.appointment_time}</Text>
                    {doctor?.workplaceName && <Text><EnvironmentOutlined /> {doctor.workplaceName}</Text>}
                  </Space>
                  <Text type="secondary">Lý do: {appointment.reason || 'Khám tổng quát'}</Text>
                  <Space wrap>
                    {canApprove && <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => approveAppointment(appointment.id)}>Duyệt lịch</Button>}
                    {canCancel && <Button danger icon={<StopOutlined />} onClick={() => cancelAppointment(appointment.id)}>Hủy lịch</Button>}
                  </Space>
                </Space>
              </Card>
            )
          })
        )}
      </Space>
    </PageLayout>
  )
}
