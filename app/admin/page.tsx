'use client'

import React, { useEffect, useState } from 'react'
import {
  Table,
  Tag,
  Select,
  Button,
  Input,
  message,
  Card,
  Popconfirm,
  Badge,
  Avatar,
  Tabs,
  Space,
  Spin,
} from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'

const { Search } = Input

type AppointmentItem = {
  id: string
  patient_name: string
  patient_phone?: string
  patient_email?: string
  doctor_name: string
  doctor_specialty?: string
  doctor_avatar?: string
  appointment_date?: string
  appointment_time?: string
  status?: string
  notes?: string
}

type UserItem = {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: 'admin' | 'member' | 'user'
  status?: string
  created_at?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  // State Quản lý Lịch hẹn
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [appointmentSearch, setAppointmentSearch] = useState('')

  // State Quản lý Người dùng
  const [users, setUsers] = useState<UserItem[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          message.error('Vui lòng đăng nhập tài khoản')
          router.push('/login')
          return
        }

        const userEmail = session.user.email?.toLowerCase()
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        const userRole = profile?.role || session.user.user_metadata?.role
        const isAdmin = userEmail === 'hiepvo212600@gmail.com' || userRole === 'admin'

        if (!isAdmin) {
          message.error('Bạn không có quyền truy cập trang quản trị')
          router.push('/')
          return
        }

        setChecking(false)
        loadAppointments()
        loadUsers()
      } catch (err) {
        console.error('Lỗi check admin:', err)
        setChecking(false)
      }
    }

    checkAdmin()
  }, [router])

  // Tải lịch hẹn
  async function loadAppointments() {
    setLoadingAppointments(true)
    try {
      const { data: appData, error: appError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })

      if (appError) throw appError

      const { data: docData } = await supabase.from('doctor').select('*')
      const docMap = new Map<string, any>()
      ;(docData || []).forEach((d: any) => {
        const dId = String(d.doctor_id || d.id)
        docMap.set(dId, d)
      })

      const { data: userData } = await supabase.from('users').select('*')
      const userMap = new Map<string, any>()
      ;(userData || []).forEach((u: any) => {
        userMap.set(String(u.id), u)
      })

      const mappedList: AppointmentItem[] = (appData || []).map((app: any) => {
        const appId = String(app.id)
        const docId = String(app.doctor_id || '')
        const doc = docMap.get(docId)

        const userId = String(app.user_id || app.patient_id || '')
        const patient = userMap.get(userId)

        const pName =
          app.patient_name ||
          app.full_name ||
          patient?.full_name ||
          app.name ||
          (patient?.email ? patient.email.split('@')[0] : 'Bệnh nhân')

        const pPhone = app.phone || app.patient_phone || patient?.phone || ''
        const pEmail = app.email || app.patient_email || patient?.email || ''

        const dName =
          app.doctor_name ||
          (doc ? `${doc.academic_title ? doc.academic_title + ' ' : ''}${doc.full_name || doc.name}` : '') ||
          'Chưa chỉ định'

        const dSpecialty = app.specialty || doc?.specialty || ''

        return {
          id: appId,
          patient_name: pName,
          patient_phone: pPhone,
          patient_email: pEmail,
          doctor_name: dName,
          doctor_specialty: dSpecialty,
          doctor_avatar: doc?.avatar_url,
          appointment_date: app.appointment_date,
          appointment_time: app.appointment_time || app.time,
          status: app.status || 'pending',
          notes: app.notes || app.reason || app.symptoms || '',
        }
      })

      setAppointments(mappedList)
    } catch (err: any) {
      console.error('Lỗi tải lịch hẹn:', err)
      message.error('Không thể tải lịch hẹn')
    } finally {
      setLoadingAppointments(false)
    }
  }

  // Cập nhật trạng thái Lịch hẹn
  async function updateAppointmentStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      message.success(
        newStatus === 'confirmed' ? 'Đã duyệt lịch hẹn thành công!' : 'Đã hủy lịch hẹn!'
      )

      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      )
    } catch (err: any) {
      console.error('Lỗi cập nhật lịch hẹn:', err)
      message.error('Cập nhật thất bại: ' + (err.message || 'Lỗi'))
    }
  }

  // Tải danh sách Tài khoản
  async function loadUsers() {
    setLoadingUsers(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      console.error('Lỗi tải users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Phân quyền tài khoản
  async function handleChangeRole(userId: string, newRole: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      message.success(`Đã cập nhật vai trò thành: ${newRole.toUpperCase()}`)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      )
    } catch (err: any) {
      message.error('Không thể cập nhật: ' + err.message)
    }
  }

  // Khóa / Mở tài khoản
  async function handleToggleStatus(userId: string, currentStatus?: string) {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked'
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error

      message.success(newStatus === 'active' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản')
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      )
    } catch (err: any) {
      message.error('Không thể cập nhật trạng thái')
    }
  }

  async function handleApproveUser(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId)

      if (error) throw error

      message.success('Đã duyệt tài khoản thành công')
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
      )
    } catch (err: any) {
      message.error('Không thể duyệt tài khoản: ' + err.message)
    }
  }

  if (checking) {
    return (
      <PageLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Đang kiểm tra quyền quản trị..." />
        </div>
      </PageLayout>
    )
  }

  const filteredAppointments = appointments.filter((a) => {
    const kw = appointmentSearch.toLowerCase()
    return (
      a.patient_name.toLowerCase().includes(kw) ||
      a.doctor_name.toLowerCase().includes(kw) ||
      (a.patient_phone && a.patient_phone.includes(kw)) ||
      (a.patient_email && a.patient_email.toLowerCase().includes(kw))
    )
  })

  const appointmentColumns = [
    {
      title: 'Thông tin Bệnh nhân',
      key: 'patient',
      render: (_: any, r: AppointmentItem) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14.5 }}>
            {r.patient_name}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, fontSize: 12.5, color: '#64748b' }}>
            {r.patient_phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <PhoneOutlined style={{ color: '#0284c7' }} /> {r.patient_phone}
              </span>
            )}
            {r.patient_email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MailOutlined style={{ color: '#0284c7' }} /> {r.patient_email}
              </span>
            )}
          </div>
          {r.notes && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#e11d48', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>
              Lý do: {r.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Bác sĩ phụ trách',
      key: 'doctor',
      render: (_: any, r: AppointmentItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            src={r.doctor_avatar}
            icon={<UserOutlined />}
            size={40}
            style={{ backgroundColor: '#e0f2fe', color: '#0284c7', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
              {r.doctor_name}
            </div>
            {r.doctor_specialty && (
              <Tag color="blue" style={{ marginTop: 2, fontSize: 11.5, borderRadius: 10 }}>
                {r.doctor_specialty}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày & Giờ hẹn',
      key: 'datetime',
      render: (_: any, r: AppointmentItem) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>
            {r.appointment_date || 'Chưa định ngày'}
          </div>
          <div style={{ color: '#0284c7', fontWeight: 600, fontSize: 12.5, marginTop: 2 }}>
            {r.appointment_time || '--:--'}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        const isConfirmed = st === 'confirmed' || st === 'Đã duyệt'
        const isCancelled = st === 'cancelled' || st === 'Đã hủy'
        return (
          <Tag
            color={isConfirmed ? 'green' : isCancelled ? 'red' : 'orange'}
            style={{ padding: '3px 10px', borderRadius: 12, fontWeight: 600 }}
          >
            {isConfirmed ? 'Đã duyệt' : isCancelled ? 'Đã hủy' : 'Chờ xác nhận'}
          </Tag>
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: AppointmentItem) => {
        const isConfirmed = r.status === 'confirmed' || r.status === 'Đã duyệt'
        const isCancelled = r.status === 'cancelled' || r.status === 'Đã hủy'
        return (
          <Space>
            {!isConfirmed && (
              <Button
                size="small"
                type="primary"
                style={{ backgroundColor: '#10b981', borderRadius: 6 }}
                onClick={() => updateAppointmentStatus(r.id, 'confirmed')}
              >
                Duyệt
              </Button>
            )}
            {!isCancelled && (
              <Button
                size="small"
                danger
                style={{ borderRadius: 6 }}
                onClick={() => updateAppointmentStatus(r.id, 'cancelled')}
              >
                Hủy
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  const filteredUsers = users.filter((u) => {
    const kw = userSearch.toLowerCase()
    const nameMatch = (u.full_name || '').toLowerCase().includes(kw)
    const emailMatch = (u.email || '').toLowerCase().includes(kw)
    const phoneMatch = (u.phone || '').includes(kw)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return (nameMatch || emailMatch || phoneMatch) && matchRole
  })

  const userColumns = [
    {
      title: 'Tài khoản',
      key: 'user',
      render: (_: any, record: UserItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{
              backgroundColor:
                record.role === 'admin'
                  ? '#f59e0b'
                  : record.role === 'member'
                  ? '#10b981'
                  : '#0284c7',
            }}
          />
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
              {record.full_name || 'Chưa đặt tên'}
            </div>
            <div style={{ fontSize: 12.5, color: '#64748b' }}>{record.email}</div>
            {record.phone && (
              <div style={{ fontSize: 12, color: '#0284c7', marginTop: 2 }}>
                📞 {record.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò hiện tại',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        if (role === 'admin') {
          return (
            <Tag icon={<CrownOutlined />} color="gold" style={{ padding: '3px 10px', borderRadius: 12 }}>
              Quản trị viên (Admin)
            </Tag>
          )
        }
        if (role === 'member') {
          return (
            <Tag icon={<SafetyCertificateOutlined />} color="green" style={{ padding: '3px 10px', borderRadius: 12 }}>
              Thành viên (Member)
            </Tag>
          )
        }
        return (
          <Tag icon={<TeamOutlined />} color="blue" style={{ padding: '3px 10px', borderRadius: 12 }}>
            Người dùng thường (User)
          </Tag>
        )
      },
    },
    {
      title: 'Phê duyệt vai trò',
      key: 'approve_role',
      render: (_: any, record: UserItem) => (
        <Select
          value={record.role || 'user'}
          style={{ width: 190 }}
          onChange={(newRole) => handleChangeRole(record.id, newRole)}
          options={[
            {
              value: 'user',
              label: <span style={{ color: '#0284c7', fontWeight: 600 }}>👤 Người dùng (User)</span>,
            },
            {
              value: 'member',
              label: <span style={{ color: '#059669', fontWeight: 600 }}>⭐ Thành viên (Member)</span>,
            },
            {
              value: 'admin',
              label: <span style={{ color: '#d97706', fontWeight: 600 }}>👑 Quản trị viên (Admin)</span>,
            },
          ]}
        />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: UserItem) => (
        <Badge
          status={record.status === 'pending' ? 'warning' : record.status === 'blocked' ? 'error' : 'success'}
          text={record.status === 'pending' ? 'Chờ duyệt' : record.status === 'blocked' ? 'Đã khóa' : 'Hoạt động'}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: UserItem) => (
        record.status === 'pending' ? (
          <Popconfirm
            title="Duyệt tài khoản này?"
            description="Tài khoản sẽ được kích hoạt và có thể sử dụng hệ thống."
            onConfirm={() => handleApproveUser(record.id)}
            okText="Duyệt tài khoản"
            cancelText="Hủy"
          >
            <Button type="primary" size="small" style={{ borderRadius: 6 }}>
              Duyệt tài khoản
            </Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Thay đổi trạng thái tài khoản"
            description={`Bạn muốn ${record.status === 'blocked' ? 'kích hoạt lại' : 'khóa'} tài khoản này?`}
            onConfirm={() => handleToggleStatus(record.id, record.status)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button size="small" danger={record.status !== 'blocked'} style={{ borderRadius: 6 }}>
              {record.status === 'blocked' ? 'Kích hoạt lại' : 'Khóa'}
            </Button>
          </Popconfirm>
        )
      ),
    },
  ]

  const tabItems = [
    {
      key: 'appointments',
      label: (
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          <CalendarOutlined /> Quản lý Lịch hẹn ({appointments.length})
        </span>
      ),
      children: (
        <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <Search
              placeholder="Tìm theo tên bệnh nhân, số điện thoại hoặc bác sĩ..."
              allowClear
              style={{ width: 360 }}
              prefix={<SearchOutlined />}
              onChange={(e) => setAppointmentSearch(e.target.value)}
            />
            <Button icon={<ReloadOutlined />} onClick={loadAppointments}>
              Làm mới lịch hẹn
            </Button>
          </div>
          <Table
            columns={appointmentColumns}
            dataSource={filteredAppointments}
            rowKey="id"
            loading={loadingAppointments}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      ),
    },
    {
      key: 'users',
      label: (
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          <TeamOutlined /> Quản lý Người dùng & Phê duyệt ({users.length})
        </span>
      ),
      children: (
        <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
            <Search
              placeholder="Tìm theo tên, email hoặc SĐT..."
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              onChange={(e) => setUserSearch(e.target.value)}
            />

            <Select
              defaultValue="all"
              style={{ width: 220 }}
              onChange={(val) => setRoleFilter(val)}
              options={[
                { value: 'all', label: 'Tất cả vai trò' },
                { value: 'member', label: '⭐ Thành viên (Member)' },
                { value: 'user', label: '👤 Người dùng thường (User)' },
                { value: 'admin', label: '👑 Quản trị viên (Admin)' },
              ]}
            />

            <Button icon={<ReloadOutlined />} onClick={loadUsers}>
              Làm mới người dùng
            </Button>
          </div>

          <Table
            columns={userColumns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loadingUsers}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      ),
    },
  ]

  return (
    <PageLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 12px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Hệ Thống Quản Trị Trung Tâm
          </h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
            Quản lý phê duyệt chi tiết lịch hẹn bệnh nhân và phân quyền tài khoản thành viên
          </p>
        </div>

        <Tabs defaultActiveKey="appointments" items={tabItems} size="large" />
      </div>
    </PageLayout>
  )
}