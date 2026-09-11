'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Space,
  Typography,
  DatePicker,
  Tag,
  Divider,
  Modal,
  Result,
  Avatar,
  message,
  Spin,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  StarFilled,
  FileTextOutlined,
  ArrowRightOutlined,
  RedoOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons'
import PageLayout from '../../components/PageLayout'
import { getCurrentUser } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { CONTACT_INFO } from '../../lib/contact'

dayjs.locale('vi')

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// Cấu trúc dữ liệu Bác sĩ
type Doctor = {
  id: number
  fullName: string
  avatarUrl: string | null
  academicTitle: string | null
  email?: string | null
  specialty: string
  experienceYears?: number
  workplaceName?: string | null
  workplaceAddress?: string | null
  rating?: number
  totalReviews?: number
  isAcceptingBookings?: number
}

// Cấu trúc dữ liệu Cuộc hẹn theo đúng yêu cầu dự án nhóm
export type AppointmentRecord = {
  id: string
  patientName: string
  phone: string
  email?: string
  specialty: string
  doctor: string
  date: string
  time: string
  reason: string
  status: string
  createdAt: string
  // Các thuộc tính mở rộng để trang Lịch hẹn của nhóm render trực tiếp mượt mà
  room?: string
  type?: string
  color?: string
}

// Khung giờ khám theo ca sáng và ca chiều
const TIME_SLOTS = [
  { shift: 'Sáng', slots: ['08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00'] },
  { shift: 'Chiều', slots: ['13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00', '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30'] },
]

function BookingFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form] = Form.useForm()

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Trạng thái Form để live preview
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>(undefined)
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs().add(1, 'day'))
  const [selectedTime, setSelectedTime] = useState<string>('08:30 - 09:00')

  // Modal thông báo thành công
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false)
  const [latestBooking, setLatestBooking] = useState<AppointmentRecord | null>(null)

  // 1. Tải danh sách bác sĩ từ API /api/doctors
  useEffect(() => {
    let isMounted = true
    const fetchDoctors = async () => {
      setLoadingDoctors(true)
      try {
        const res = await fetch('/api/doctors')
        if (!res.ok) throw new Error('Cannot load doctors')
        const data: Doctor[] = await res.json()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDoctors(data)
        }
      } catch {
        if (isMounted) {
          setDoctors([])
          message.error('Không tải được danh sách bác sĩ từ Supabase')
        }
      } finally {
        if (isMounted) setLoadingDoctors(false)
      }
    }
    fetchDoctors()
    return () => {
      isMounted = false
    }
  }, [])

  // 2. Tự động điền thông tin nếu bệnh nhân đã đăng nhập tài khoản
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          form.setFieldsValue({
            patientName: user.full_name || '',
            phone: user.phone || '',
            email: user.email || '',
          })
        }
      })
      .catch(() => {})
  }, [form])

  // 3. Xử lý query param doctorId (từ trang Danh sách Bác sĩ điều hướng sang)
  useEffect(() => {
    const docIdParam = searchParams.get('doctorId')
    if (docIdParam && doctors.length > 0) {
      const docId = parseInt(docIdParam, 10)
      const foundDoctor = doctors.find((d) => d.id === docId)
      if (foundDoctor) {
        setSelectedSpecialty(foundDoctor.specialty)
        setSelectedDoctorId(foundDoctor.id)
        form.setFieldsValue({
          specialty: foundDoctor.specialty,
          doctorId: foundDoctor.id,
        })
      }
    }
  }, [searchParams, doctors, form])

  // Danh sách các chuyên khoa duy nhất
  const specialtyOptions = useMemo(() => {
    const specs = Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean)))
    return specs.map((s) => ({ label: s, value: s }))
  }, [doctors])

  // Danh sách bác sĩ lọc theo chuyên khoa đã chọn
  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty) return doctors
    return doctors.filter((d) => d.specialty === selectedSpecialty)
  }, [doctors, selectedSpecialty])

  // Bác sĩ đang được chọn
  const currentDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId)
  }, [doctors, selectedDoctorId])

  // Khi người dùng đổi Chuyên khoa
  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value)
    // Nếu bác sĩ hiện tại không thuộc chuyên khoa mới thì reset field bác sĩ
    if (currentDoctor && currentDoctor.specialty !== value) {
      setSelectedDoctorId(undefined)
      form.setFieldValue('doctorId', undefined)
    }
  }

  // Khi người dùng đổi Bác sĩ
  const handleDoctorChange = (value: number) => {
    setSelectedDoctorId(value)
    const target = doctors.find((d) => d.id === value)
    if (target && target.specialty !== selectedSpecialty) {
      setSelectedSpecialty(target.specialty)
      form.setFieldValue('specialty', target.specialty)
    }
  }

  // Xử lý gửi Form đặt lịch
  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('Vui lòng đăng nhập trước khi đặt lịch khám')

      const appointmentDate = values.date ? dayjs(values.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      const reason = values.reason ? values.reason.trim() : 'Khám tổng quát & tư vấn sức khỏe'
      const chosenDoctor = doctors.find((d) => d.id === values.doctorId)
      if (!chosenDoctor) throw new Error('Không tìm thấy bác sĩ đã chọn')

      let savedAppointment: { id: string; created_at: string } | null = null
      let error: Error | null = null
      const demoUser = user.id === '00000000-0000-4000-8000-000000000001'

      if (demoUser) {
        savedAppointment = { id: `DEMO-${Date.now()}`, created_at: new Date().toISOString() }
        const existing = JSON.parse(localStorage.getItem('healthconnect_demo_appointments') || '[]')
        existing.unshift({
          id: savedAppointment.id,
          doctor_id: chosenDoctor.id,
          appointment_date: appointmentDate,
          appointment_time: values.time,
          reason: `[doctor:${chosenDoctor.id}] ${reason}`,
          status: 'pending',
        })
        localStorage.setItem('healthconnect_demo_appointments', JSON.stringify(existing))
      } else {
        const firstInsert = await supabase
          .from('appointments')
          .insert({
            patient_id: user.id,
            doctor_id: chosenDoctor.id,
            appointment_date: appointmentDate,
            appointment_time: values.time,
            reason,
            status: 'pending',
          })
          .select('id, created_at')
          .single()
        savedAppointment = firstInsert.data
        error = firstInsert.error
      }

      if (error) throw error
      if (!savedAppointment) throw new Error('Supabase không trả về lịch hẹn vừa tạo')

      const formattedDate = values.date ? dayjs(values.date).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY')
      const doctorDisplayName = chosenDoctor
        ? `${chosenDoctor.academicTitle ? chosenDoctor.academicTitle + ' ' : ''}${chosenDoctor.fullName}`
        : 'Bác sĩ chuyên khoa'

      // Đối tượng Booking chuẩn theo yêu cầu dự án
      const newBooking: AppointmentRecord = {
        id: savedAppointment.id,
        patientName: values.patientName.trim(),
        phone: values.phone.trim(),
        email: values.email ? values.email.trim() : '',
        specialty: values.specialty,
        doctor: doctorDisplayName,
        date: formattedDate,
        time: values.time,
        reason,
        status: 'Chờ xác nhận',
        createdAt: savedAppointment.created_at,
        // Các trường đồng bộ trang Lịch hẹn của thành viên nhóm
        room: chosenDoctor?.workplaceName || 'Phòng khám đa khoa Medicare',
        type: 'Khám chuyên khoa',
        color: 'gold',
      }

      setLatestBooking(newBooking)
      setSuccessModalOpen(true)
      message.success('Đặt lịch khám bệnh thành công!')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!')
    } finally {
      setSubmitting(false)
    }
  }

  // Khởi tạo lại form sau khi đặt xong nếu muốn đặt lịch khác
  const handleBookAnother = () => {
    setSuccessModalOpen(false)
    form.resetFields(['reason'])
    setSelectedTime('08:30 - 09:00')
    setSelectedDate(dayjs().add(1, 'day'))
    form.setFieldsValue({
      date: dayjs().add(1, 'day'),
      time: '08:30 - 09:00',
    })
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Banner Tiêu đề phong cách Y tế đồng bộ */}
      <div
        className="booking-hero"
        style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 35%, #eff6ff 100%)',
          border: '1px solid rgba(37, 99, 235, 0.12)',
          borderRadius: 24,
          padding: '28px 32px 24px',
          boxShadow: '0 12px 28px rgba(37, 99, 235, 0.08)',
        }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space orientation="vertical" size={8}>
              <Tag
                color="blue"
                style={{
                  borderRadius: 999,
                  fontWeight: 600,
                  padding: '4px 14px',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                }}
              >
                ✦ Đặt lịch khám trực tuyến
              </Tag>
              <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
                Đăng ký khám bệnh cùng chuyên gia
              </Title>
              <Text type="secondary" style={{ fontSize: 15, color: '#475569' }}>
                Chủ động chọn bác sĩ, chuyên khoa và khung giờ phù hợp. Tiết kiệm thời gian chờ đợi tại phòng khám.
              </Text>
            </Space>
          </Col>
          <Col className="booking-hero-action" xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Link href="/appointments">
              <Button
                icon={<FileTextOutlined />}
                size="large"
                style={{
                  borderRadius: 12,
                  height: 44,
                  borderColor: '#93c5fd',
                  color: '#1d4ed8',
                  background: '#ffffff',
                  fontWeight: 600,
                }}
              >
                Xem lịch hẹn đã đặt
              </Button>
            </Link>
          </Col>
        </Row>
      </div>

      {/* Nội dung chính: 2 Cột Form & Live Preview */}
      <Row gutter={[24, 24]}>
        {/* CỘT TRÁI: FORM ĐẶT LỊCH */}
        <Col xs={24} lg={15}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 22,
              boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              requiredMark="optional"
              initialValues={{
                date: selectedDate,
                time: selectedTime,
              }}
              onFinish={handleSubmit}
            >
              {/* PHẦN 1: THÔNG TIN BỆNH NHÂN */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    1
                  </div>
                  <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                    Thông tin người khám
                  </Title>
                </div>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="patientName"
                      label={<span style={{ fontWeight: 600, color: '#334155' }}>Họ và tên bệnh nhân</span>}
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên' },
                        { min: 3, message: 'Họ tên tối thiểu 3 ký tự' },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        size="large"
                        style={{ borderRadius: 12 }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label={<span style={{ fontWeight: 600, color: '#334155' }}>Số điện thoại</span>}
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        {
                          pattern: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                          message: 'Số điện thoại Việt Nam không hợp lệ (10 số)',
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Ví dụ: 0912 345 678"
                        size="large"
                        style={{ borderRadius: 12 }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      name="email"
                      label={<span style={{ fontWeight: 600, color: '#334155' }}>Email nhận phiếu khám (Không bắt buộc)</span>}
                      rules={[{ type: 'email', message: 'Địa chỉ email không đúng định dạng' }]}
                    >
                      <Input
                        prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="email@vidu.com"
                        size="large"
                        style={{ borderRadius: 12 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider style={{ margin: '16px 0 24px' }} />

              {/* PHẦN 2: CHUYÊN KHOA & BÁC SĨ */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    2
                  </div>
                  <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                    Chọn Chuyên khoa & Bác sĩ phụ trách
                  </Title>
                </div>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="specialty"
                      label={<span style={{ fontWeight: 600, color: '#334155' }}>Chuyên khoa</span>}
                      rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa' }]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn chuyên khoa khám"
                        options={specialtyOptions}
                        onChange={handleSpecialtyChange}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="doctorId"
                      label={<span style={{ fontWeight: 600, color: '#334155' }}>Bác sĩ khám</span>}
                      rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
                    >
                      <Select
                        size="large"
                        placeholder={
                          loadingDoctors
                            ? 'Đang tải danh sách bác sĩ...'
                            : selectedSpecialty
                            ? 'Chọn bác sĩ thuộc chuyên khoa'
                            : 'Chọn bác sĩ'
                        }
                        loading={loadingDoctors}
                        onChange={handleDoctorChange}
                        options={filteredDoctors.map((doc) => ({
                          label: `${doc.academicTitle ? doc.academicTitle + ' ' : ''}${doc.fullName} (${doc.specialty})`,
                          value: doc.id,
                        }))}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider style={{ margin: '16px 0 24px' }} />

              {/* PHẦN 3: NGÀY KHÁM, GIỜ KHÁM & LÝ DO */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    3
                  </div>
                  <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                    Thời gian & Lý do khám
                  </Title>
                </div>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="date"
                      label={<span style={{ fontWeight: 600, color: '#334155' }}>Ngày hẹn khám</span>}
                      rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
                    >
                      <DatePicker
                        size="large"
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày khám"
                        style={{ width: '100%', borderRadius: 12 }}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        onChange={(d) => setSelectedDate(d)}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="time"
                      label={<span style={{ fontWeight: 600, color: '#334155' }}>Khung giờ khám</span>}
                      rules={[{ required: true, message: 'Vui lòng chọn khung giờ khám' }]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn giờ khám"
                        value={selectedTime}
                        onChange={(t) => setSelectedTime(t)}
                        options={TIME_SLOTS.flatMap((group) =>
                          group.slots.map((s) => ({
                            label: `${s} (${group.shift})`,
                            value: s,
                          }))
                        )}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>

                  {/* Nút chọn giờ nhanh trực quan */}
                  <Col xs={24}>
                    <div style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 8 }}>
                        Hoặc bấm chọn nhanh khung giờ phù hợp:
                      </Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {TIME_SLOTS.flatMap((g) => g.slots).map((slot) => {
                          const isSelected = selectedTime === slot
                          return (
                            <button
                              type="button"
                              key={slot}
                              onClick={() => {
                                setSelectedTime(slot)
                                form.setFieldValue('time', slot)
                              }}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 10,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                                background: isSelected ? '#eff6ff' : '#ffffff',
                                color: isSelected ? '#1d4ed8' : '#334155',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <ClockCircleOutlined style={{ marginRight: 6, fontSize: 12 }} />
                              {slot}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      name="reason"
                      label={<span style={{ fontWeight: 600, color: '#334155' }}>Lý do khám / Triệu chứng ban đầu</span>}
                      rules={[{ required: true, message: 'Vui lòng mô tả ngắn triệu chứng hoặc lý do khám' }]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Mô tả tóm tắt tình trạng sức khỏe, triệu chứng hiện tại hoặc yêu cầu khám bệnh..."
                        style={{ borderRadius: 12, padding: '10px 14px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* NÚT SUBMIT */}
              <div style={{ paddingTop: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                  block
                  style={{
                    height: 50,
                    borderRadius: 14,
                    background: 'linear-gradient(90deg, #0ea5e9, #2563eb)',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  Xác nhận đặt lịch khám ngay
                </Button>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <SafetyCertificateOutlined style={{ color: '#10b981', marginRight: 6 }} />
                    Thông tin của bạn được cam kết bảo mật 100% theo tiêu chuẩn y tế
                  </Text>
                </div>
              </div>
            </Form>
          </Card>
        </Col>

        {/* CỘT PHẢI: LIVE PREVIEW & THÔNG TIN TIỆN ÍCH */}
        <Col xs={24} lg={9}>
          <div style={{ position: 'sticky', top: 24, display: 'grid', gap: 20 }}>
            {/* THẺ TÓM TẮT PHIẾU KHÁM TRỰC TIẾP */}
            <Card
              variant="borderless"
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#2563eb' }} />
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Phiếu hẹn trực tiếp</span>
                </Space>
              }
              extra={<Tag color="processing">Xem trước</Tag>}
              style={{
                borderRadius: 22,
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
                border: '1px solid #e2e8f0',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
              }}
            >
              {currentDoctor ? (
                <div
                  style={{
                    background: '#eff6ff',
                    borderRadius: 16,
                    padding: 16,
                    border: '1px solid #dbeafe',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <Avatar
                    size={56}
                    icon={<UserOutlined />}
                    src={currentDoctor.avatarUrl || undefined}
                    style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, textTransform: 'uppercase' }}>
                      {currentDoctor.specialty}
                    </div>
                    <Text strong style={{ fontSize: 16, color: '#1e293b', display: 'block' }}>
                      {currentDoctor.academicTitle ? `${currentDoctor.academicTitle} ` : ''}
                      {currentDoctor.fullName}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 12, color: '#64748b' }}>
                      <StarFilled style={{ color: '#f59e0b' }} /> {currentDoctor.rating || 5.0} • {currentDoctor.experienceYears || 10} năm kinh nghiệm
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 16,
                    padding: '18px 16px',
                    border: '1px dashed #cbd5e1',
                    marginBottom: 16,
                    textAlign: 'center',
                  }}
                >
                  <MedicineBoxOutlined style={{ fontSize: 28, color: '#94a3b8', marginBottom: 8 }} />
                  <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>Chưa chọn Bác sĩ phụ trách</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Vui lòng chọn chuyên khoa & bác sĩ ở biểu mẫu bên cạnh</div>
                </div>
              )}

              {/* Chi tiết ngày giờ đã chọn */}
              <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: 8, color: '#2563eb' }} /> Ngày khám:
                  </Text>
                  <Text strong>{selectedDate ? selectedDate.format('DD/MM/YYYY') : 'Chưa chọn'}</Text>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <Text type="secondary">
                    <ClockCircleOutlined style={{ marginRight: 8, color: '#2563eb' }} /> Giờ khám:
                  </Text>
                  <Text strong style={{ color: '#2563eb' }}>
                    {selectedTime || 'Chưa chọn'}
                  </Text>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <Text type="secondary">
                    <EnvironmentOutlined style={{ marginRight: 8, color: '#2563eb' }} /> Địa điểm:
                  </Text>
                  <Text strong style={{ textAlign: 'right', maxWidth: 180 }}>
                    {currentDoctor?.workplaceName || 'Medicare Clinic'}
                  </Text>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text type="secondary">
                    <CheckCircleOutlined style={{ marginRight: 8, color: '#10b981' }} /> Phí đặt chỗ trước:
                  </Text>
                  <Tag color="success" style={{ margin: 0, fontWeight: 700 }}>
                    Miễn phí
                  </Tag>
                </div>
              </div>
            </Card>

            {/* THẺ HƯỚNG DẪN BỆNH NHÂN */}
            <Card
              variant="borderless"
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#0ea5e9' }} />
                  <span style={{ fontWeight: 600 }}>Lưu ý trước khi đến khám</span>
                </Space>
              }
              style={{
                borderRadius: 22,
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'grid', gap: 10, fontSize: 13, color: '#475569' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ color: '#2563eb', fontWeight: 700 }}>•</div>
                  <div>Có mặt trước giờ hẹn ít nhất 15 phút để hoàn tất thủ tục lễ tân.</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ color: '#2563eb', fontWeight: 700 }}>•</div>
                  <div>Mang theo thẻ Căn cước công dân (CCCD) và bảo hiểm y tế nếu có.</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ color: '#2563eb', fontWeight: 700 }}>•</div>
                  <div>Nhịn ăn sáng nếu bạn có nhu cầu xét nghiệm máu hoặc nội soi tiêu hóa.</div>
                </div>
              </div>
            </Card>

            {/* THẺ TỔNG ĐÀI HỖ TRỢ */}
            <Card
              variant="borderless"
              style={{
                borderRadius: 22,
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    fontSize: 20,
                  }}
                >
                  <CustomerServiceOutlined />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Tổng đài hỗ trợ đặt lịch 24/7</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>{CONTACT_INFO.hotline}</div>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* MODAL THÀNH CÔNG SAU KHI ĐẶT LỊCH */}
      <Modal
        open={successModalOpen}
        onCancel={() => setSuccessModalOpen(false)}
        footer={null}
        centered
        width={560}
        style={{ borderRadius: 24, overflow: 'hidden' }}
      >
        <Result
          status="success"
          title={<span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Đặt Lịch Khám Thành Công!</span>}
          subTitle={
            <div style={{ textAlign: 'left', marginTop: 12 }}>
              <Paragraph style={{ color: '#475569', fontSize: 14, textAlign: 'center' }}>
                Hệ thống Medicare đã tiếp nhận hồ sơ đăng ký của bạn. Lịch hẹn đã được lưu an toàn vào mục quản lý lịch khám.
              </Paragraph>

              {latestBooking && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 16,
                    padding: '16px 20px',
                    border: '1px solid #e2e8f0',
                    marginTop: 16,
                    display: 'grid',
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Mã lịch hẹn:</Text>
                    <Text strong style={{ color: '#2563eb' }}>
                      {latestBooking.id}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Bệnh nhân:</Text>
                    <Text strong>{latestBooking.patientName}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Bác sĩ phụ trách:</Text>
                    <Text strong>{latestBooking.doctor}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Chuyên khoa:</Text>
                    <Text strong>{latestBooking.specialty}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Thời gian khám:</Text>
                    <Text strong style={{ color: '#16a34a' }}>
                      {latestBooking.time} - {latestBooking.date}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Trạng thái:</Text>
                    <Tag color="gold">{latestBooking.status}</Tag>
                  </div>
                </div>
              )}
            </div>
          }
          extra={[
            <Link href="/appointments" key="appointments">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                style={{
                  borderRadius: 12,
                  height: 44,
                  background: 'linear-gradient(90deg, #0ea5e9, #2563eb)',
                  fontWeight: 600,
                }}
              >
                Đến trang Lịch hẹn của tôi
              </Button>
            </Link>,
            <Button
              key="book-another"
              size="large"
              icon={<RedoOutlined />}
              onClick={handleBookAnother}
              style={{ borderRadius: 12, height: 44, fontWeight: 600 }}
            >
              Đặt thêm lịch khác
            </Button>,
          ]}
        />
      </Modal>
    </div>
  )
}

export default function BookingPage() {
  return (
    <PageLayout>
      <Suspense
        fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <Spin size="large" tip="Đang tải dữ liệu trang đặt lịch..." />
          </div>
        }
      >
        <BookingFormContent />
      </Suspense>
    </PageLayout>
  )
}