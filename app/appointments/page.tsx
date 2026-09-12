'use client'

import React, { useEffect, useState } from 'react'
import { Table, Tag, Button, Modal, message, Spin, Empty, Input, Card, Popconfirm } from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'

export default function AppointmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [searchText, setSearchText] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  // Tải danh sách lịch hẹn và sắp xếp mới nhất lên đầu
  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      let query1 = supabase.from('appointments').select('*')
      let admin = false
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        admin = user.email?.toLowerCase() === 'hiepvo212600@gmail.com' || profile?.role === 'admin'
        setIsAdmin(admin)
      }
      if (user && !admin) {
        // Lấy lịch của user hiện tại
        query1 = query1.eq('patient_id', user.id)
      }

      // SẮP XẾP MỚI NHẤT LÊN ĐẦU: id giảm dần, created_at giảm dần
      const { data: list1, error: err1 } = await query1.order('id', { ascending: false })

      let rawList = list1 || []

      // Nếu bảng appointments trống, thử bảng appointment
      if (rawList.length === 0) {
        const { data: list2 } = await supabase
          .from('appointment')
          .select('*')
          .order('appointment_id', { ascending: false })
        if (list2 && list2.length > 0) {
          rawList = list2
        }
      }

      // Lấy bác sĩ, chuyên khoa và cơ sở để giữ đúng thông tin lịch hẹn
      let docList: any[] = []
      const { data: d1 } = await supabase.from('doctor').select('*')
      if (d1) docList = d1
      else {
        const { data: d2 } = await supabase.from('doctors').select('*')
        if (d2) docList = d2
      }
      const { data: specialtyList } = await supabase.from('specialty').select('*')
      const specialtyMap = new Map(
        (specialtyList || []).map((item: any) => [
          String(item.specialty_id || item.id),
          item.specialty_name || item.name,
        ])
      )
      const { data: facilityList } = await supabase.from('doctor_primary_facility').select('*')
      const facilityMap = new Map(
        (facilityList || []).map((item: any) => [
          String(item.doctor_id),
          item.facility_name || item.name || item.hospital_name,
        ])
      )

      // Ghép thông tin bác sĩ & SẮP XẾP LẠI 1 LẦN NỮA ĐẢM BẢO MỚI NHẤT LUÔN Ở ĐẦU
      const mapped = rawList.map((item: any) => {
        const doc = docList.find(
          (d: any) => String(d.doctor_id || d.id) === String(item.doctor_id)
        )
        return {
          ...item,
          doctor_name: doc ? `${doc.academic_title ? doc.academic_title + ' ' : ''}${doc.full_name || doc.name}` : 'Bác sĩ chuyên khoa',
          doctor_specialty:
            item.specialty ||
            (doc ? doc.specialty || doc.specialty_name || specialtyMap.get(String(doc.specialty_id)) : null) ||
            'Chưa cập nhật chuyên khoa',
          doctor_facility: doc
            ? facilityMap.get(String(doc.doctor_id || doc.id)) || doc.hospital || 'Chưa cập nhật cơ sở'
            : 'Chưa cập nhật cơ sở',
          patient_name: item.patient_name || item.full_name || item.name || item.email || '',
          reason: item.reason || item.notes || item.symptoms || '',
        }
      })

      // Sắp xếp JavaScript: Ưu tiên created_at hoặc id giảm dần
      mapped.sort((a: any, b: any) => {
        const idA = a.id || a.appointment_id || 0
        const idB = b.id || b.appointment_id || 0
        return idB - idA
      })

      setAppointments(mapped)
    } catch (err) {
      console.error('Lỗi tải lịch hẹn:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  // Hủy lịch hẹn
  const handleCancel = async (record: any) => {
    const id = record.id || record.appointment_id
    try {
      const { error: e1 } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (e1) {
        await supabase
          .from('appointment')
          .update({ status: 'cancelled' })
          .eq('appointment_id', id)
      }

      message.success('Đã hủy lịch hẹn thành công')
      fetchAppointments()
    } catch (err: any) {
      message.error(err.message || 'Không thể hủy lịch')
    }
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã xác nhận</Tag>
      case 'cancelled':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Đã hủy</Tag>
      case 'completed':
        return <Tag color="blue">Đã khám</Tag>
      default:
        return <Tag color="orange" icon={<SyncOutlined spin />}>Chờ xác nhận</Tag>
    }
  }

  const filteredAppointments = appointments.filter((item) => {
    const doc = (item.doctor_name || '').toLowerCase()
    const query = searchText.toLowerCase()
    return !query || doc.includes(query) || (item.appointment_date || '').includes(query)
  })

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tiêu đề & nút tạo mới */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 m-0">
              Lịch hẹn khám của tôi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin
                ? 'Xem toàn bộ lịch hẹn. Duyệt lịch tại Quản trị hệ thống'
                : 'Theo dõi và quản lý các lượt khám bệnh đã đăng ký (lịch mới nhất hiển thị ở đầu)'}
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push('/booking')}
            className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 h-11"
          >
            Đặt lịch mới
          </Button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="mb-4">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo tên bác sĩ, ngày hẹn..."
            size="large"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="sm:w-80 rounded-xl"
          />
        </div>

        {/* Bảng danh sách */}
        {loading ? (
          <div className="py-20 text-center">
            <Spin size="large" tip="Đang tải lịch hẹn mới nhất..." />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
            <Empty description="Bạn chưa có lịch hẹn nào. Hãy bấm 'Đặt lịch mới' để đăng ký khám!" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Mã lịch</th>
                    <th className="p-4">Bác sĩ phụ trách</th>
                    <th className="p-4">Chuyên khoa</th>
                    <th className="p-4">Lý do khám</th>
                    <th className="p-4">Ngày khám</th>
                    <th className="p-4">Khung giờ</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAppointments.map((record) => {
                    const id = record.id || record.appointment_id
                    const isNewest = record === filteredAppointments[0]

                    return (
                      <tr key={id} className={`hover:bg-slate-50 transition-colors ${isNewest ? 'bg-blue-50/40' : ''}`}>
                        <td className="p-4 font-mono font-bold text-blue-600">
                          #{id} {isNewest && <span className="ml-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-sans">MỚI</span>}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {record.doctor_name}
                        </td>
                        <td className="p-4 text-slate-600">
                          <Tag color="blue">{record.doctor_specialty}</Tag>
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs">
                          {record.reason || <span className="text-slate-400">Chưa ghi nhận</span>}
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          <CalendarOutlined className="mr-1.5 text-blue-500" />
                          {record.appointment_date ? dayjs(record.appointment_date).format('DD/MM/YYYY') : '---'}
                        </td>
                        <td className="p-4 text-blue-600 font-semibold">
                          <ClockCircleOutlined className="mr-1.5" />
                          {record.appointment_time || '08:30'}
                        </td>
                        <td className="p-4">
                          {getStatusTag(record.status)}
                        </td>
                        <td className="p-4 text-center">
                          {isAdmin ? (
                            <span className="text-xs text-slate-400">Duyệt tại Quản trị hệ thống</span>
                          ) : record.status !== 'cancelled' && record.status !== 'completed' ? (
                            <Popconfirm
                              title="Xác nhận hủy lịch hẹn?"
                              description="Bạn có chắc chắn muốn hủy lượt đặt lịch này không?"
                              onConfirm={() => handleCancel(record)}
                              okText="Hủy lịch"
                              cancelText="Giữ lại"
                              okButtonProps={{ danger: true }}
                            >
                              <Button danger size="small" className="rounded-lg">
                                Hủy lịch
                              </Button>
                            </Popconfirm>
                          ) : (
                            <span className="text-xs text-slate-400">Không khả dụng</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}