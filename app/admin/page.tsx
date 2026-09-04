'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Tag, Button, Space, message } from 'antd'
import PageLayout from '../../components/PageLayout'
import { getCurrentUser } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

type AdminAppointment = {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  reason: string | null
  patient: { full_name: string | null; phone: string | null }[] | null
}

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [loading, setLoading] = useState(false)

  const loadAppointments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, status, reason, patient:profiles!appointments_patient_id_fkey(full_name, phone)')
      .order('appointment_date', { ascending: false })
    if (error) {
      message.error('Không tải được danh sách lịch hẹn')
    } else {
      setAppointments((data || []) as AdminAppointment[])
    }
    setLoading(false)
  }

  useEffect(() => {
    const check = async () => {
      const user = await getCurrentUser()
      if (!user || user.role !== 'admin') {
        message.error('Bạn không có quyền truy cập trang này')
        router.push('/dashboard')
        return
      }
      setChecking(false)
      await loadAppointments()
    }
    check()
  }, [router])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) {
      message.error('Cập nhật thất bại')
    } else {
      message.success('Đã cập nhật')
      await loadAppointments()
    }
  }

  if (checking) return null

  const statusColor: Record<string, string> = {
    pending: 'gold',
    confirmed: 'green',
    completed: 'blue',
    cancelled: 'red',
  }
  const statusLabel: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã duyệt',
    completed: 'Hoàn tất',
    cancelled: 'Đã huỷ',
  }

  const columns = [
    { title: 'Ngày khám', dataIndex: 'appointment_date', key: 'date' },
    { title: 'Giờ', dataIndex: 'appointment_time', key: 'time' },
    { title: 'Bệnh nhân', key: 'patient', render: (_: unknown, r: AdminAppointment) => r.patient?.[0]?.full_name || '—' },
    { title: 'SĐT', key: 'phone', render: (_: unknown, r: AdminAppointment) => r.patient?.[0]?.phone || '—' },
    { title: 'Lý do khám', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColor[status]}>{statusLabel[status] || status}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, r: AdminAppointment) => (
        <Space>
          <Button size="small" type="primary" disabled={r.status !== 'pending'} onClick={() => updateStatus(r.id, 'confirmed')}>
            Duyệt
          </Button>
          <Button size="small" danger disabled={r.status !== 'pending'} onClick={() => updateStatus(r.id, 'cancelled')}>
            Huỷ
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <PageLayout>
      <h1>Quản lý lịch hẹn</h1>
      <Table rowKey="id" columns={columns} dataSource={appointments} loading={loading} />
    </PageLayout>
  )
}