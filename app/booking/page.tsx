'use client'

import React, { Suspense, useEffect, useState, useMemo } from 'react'
import {
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  message,
  Modal,
  Spin,
  Avatar,
  Tag,
  Row,
  Col,
} from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleFilled,
  PhoneOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { useRouter, useSearchParams } from 'next/navigation'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'
import { isAppointmentActive, toDatabaseTime } from '../../lib/booking-utils'

dayjs.locale('vi')

const TIME_SLOTS = [
  '08:00 - 08:30',
  '08:30 - 09:00',
  '09:00 - 09:30',
  '09:30 - 10:00',
  '10:00 - 10:30',
  '10:30 - 11:00',
  '13:30 - 14:00',
  '14:00 - 14:30',
  '14:30 - 15:00',
  '15:00 - 15:30',
  '15:30 - 16:00',
  '16:00 - 16:30',
]

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedDoctorId = searchParams.get('doctor_id')

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [doctors, setDoctors] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])

  const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs().add(1, 'day'))
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [bookedSlots, setBookedSlots] = useState<string[]>([]) // Danh sách giờ đã có người đặt
  const [checkingSlots, setCheckingSlots] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  // 1. TẢI DỮ LIỆU BAN ĐẦU
  useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const u = session.user
          const meta = u.user_metadata || {}
          form.setFieldsValue({
            patient_name: meta.full_name || meta.name || u.email?.split('@')[0] || '',
            patient_phone: meta.phone || '0799754794',
            patient_email: u.email || '',
          })
        }

        let specList: any[] = []
        const { data: s1 } = await supabase.from('specialty').select('*')
        if (s1 && s1.length > 0) specList = s1
        else {
          const { data: s2 } = await supabase.from('specialties').select('*')
          if (s2 && s2.length > 0) specList = s2
        }

        let docList: any[] = []
        const { data: d1 } = await supabase.from('doctor').select('*')
        if (d1 && d1.length > 0) docList = d1
        else {
          const { data: d2 } = await supabase.from('doctors').select('*')
          if (d2 && d2.length > 0) docList = d2
        }

        const mergedDocs = docList.map((d: any) => {
          const matched = specList.find(
            (s: any) => String(s.id || s.specialty_id) === String(d.specialty_id)
          )
          return {
            ...d,
            specialty_display:
              d.specialty || d.specialty_name || (matched ? matched.name || matched.specialty_name : 'Đa khoa'),
          }
        })

        const allSpecs: any[] = []
        specList.forEach((s: any) => {
          const name = s.name || s.specialty_name
          if (name && !allSpecs.some((x) => (x.name || x) === name)) allSpecs.push(s)
        })
        mergedDocs.forEach((d: any) => {
          if (d.specialty_display && !allSpecs.some((x) => (x.name || x) === d.specialty_display)) {
            allSpecs.push({ id: d.specialty_id || d.specialty_display, name: d.specialty_display })
          }
        })

        setSpecialties(allSpecs)
        setDoctors(mergedDocs)

        if (preselectedDoctorId) {
          const found = mergedDocs.find(
            (d: any) => String(d.doctor_id || d.id) === String(preselectedDoctorId)
          )
          if (found) {
            const dId = found.doctor_id || found.id
            setSelectedDoctorId(dId)
            setSelectedSpecialty(found.specialty_display)
            form.setFieldsValue({
              specialty: found.specialty_display,
              doctor_id: dId,
              date: dayjs().add(1, 'day'),
            })
          }
        } else {
          form.setFieldsValue({ date: dayjs().add(1, 'day') })
        }
      } catch (e) {
        console.error('Lỗi tải dữ liệu ban đầu:', e)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [form, preselectedDoctorId])

  // 2. TỰ ĐỘNG QUÉT VÀ KHÓA GIỜ ĐÃ CÓ NGƯỜI ĐẶT CỦA BÁC SĨ (CHUẨN XÁC 100%)
  useEffect(() => {
    async function checkBookedSlots() {
      if (!selectedDoctorId || !selectedDate) {
        setBookedSlots([])
        return
      }

      setCheckingSlots(true)
      const dateStr = selectedDate.format('YYYY-MM-DD')
      const targetDocId = String(selectedDoctorId)

      try {
        // Lấy tất cả lịch hẹn trong appointments
        const { data: allAppts, error } = await supabase
          .from('appointments')
          .select('doctor_id, appointment_date, appointment_time, status')
          .eq('appointment_date', dateStr)

        if (!error && allAppts) {
          const occupied: string[] = []

          allAppts.forEach((item: any) => {
            // So khớp đúng bác sĩ và trạng thái chưa hoàn thành
            const isMatchDoc = String(item.doctor_id) === targetDocId
            const isActiveStatus = isAppointmentActive(item.status)

            if (isMatchDoc && isActiveStatus) {
              const rawTime = String(item.appointment_time || '').trim()
              // Cắt lấy định dạng HH:mm (ví dụ 08:30:00 -> 08:30)
              const timePrefix = rawTime.substring(0, 5)

              // Tìm slot khớp trong danh sách TIME_SLOTS
              const matchedSlot = TIME_SLOTS.find((s) => s.startsWith(timePrefix))
              if (matchedSlot && !occupied.includes(matchedSlot)) {
                occupied.push(matchedSlot)
              }
            }
          })

          setBookedSlots(occupied)

          // Nếu giờ đang chọn vô tình rơi vào giờ vừa bị khóa thì reset
          if (selectedTime && occupied.includes(selectedTime)) {
            setSelectedTime('')
            form.setFieldsValue({ timeSlot: undefined })
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra giờ đã đặt:', err)
      } finally {
        setCheckingSlots(false)
      }
    }

    checkBookedSlots()
  }, [selectedDoctorId, selectedDate, selectedTime, form])

  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty) return doctors
    const target = String(selectedSpecialty).toLowerCase().trim()
    const matched = doctors.filter((doc: any) => {
      const sName = String(doc.specialty_display || doc.specialty || '').toLowerCase()
      return sName.includes(target) || target.includes(sName)
    })
    return matched.length > 0 ? matched : doctors
  }, [doctors, selectedSpecialty])

  const currentDoctor = useMemo(() => {
    if (!selectedDoctorId) return null
    return doctors.find(
      (d: any) => String(d.doctor_id || d.id) === String(selectedDoctorId)
    )
  }, [doctors, selectedDoctorId])

  async function ensureUserProfile(user: any, values: any) {
    const pName = values.patient_name || user.user_metadata?.full_name || 'Bệnh nhân'
    const pPhone = values.patient_phone || user.user_metadata?.phone || '0799754794'
    const pEmail = values.patient_email || user.email || ''

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.warn('Không đọc được profile users:', profileError.message)
      return
    }

    if (!profile) {
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: pEmail,
        full_name: pName,
        phone: pPhone,
        role: 'user',
        status: 'active',
      })

      if (insertError) console.warn('Không tạo được profile users:', insertError.message)
    }
  }

  async function handleSubmit(values: any) {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    if (!user) {
      message.warning('Bạn chưa đăng nhập! Vui lòng đăng nhập để đặt lịch.')
      router.push('/login?redirect=/booking')
      return
    }

    const docId = selectedDoctorId || values.doctor_id
    if (!docId) {
      message.error('Vui lòng chọn bác sĩ khám!')
      return
    }

    const timeSlotVal = values.timeSlot || selectedTime
    if (!timeSlotVal) {
      message.error('Vui lòng chọn khung giờ khám!')
      return
    }

    if (bookedSlots.includes(timeSlotVal)) {
      message.error('Khung giờ này đã có người đặt trước! Vui lòng chọn giờ khác.')
      return
    }

    setSubmitting(true)
    try {
      await ensureUserProfile(user, values)
      const dateVal = values.date || selectedDate
      const dateStr = dateVal ? (dateVal.format ? dateVal.format('YYYY-MM-DD') : String(dateVal)) : dayjs().add(1, 'day').format('YYYY-MM-DD')
      const timeStr = toDatabaseTime(timeSlotVal)

      const appointmentData = {
        patient_id: user.id,
        doctor_id: docId,
        appointment_date: dateStr,
        appointment_time: timeStr,
        reason: values.reason || null,
        specialty: values.specialty || currentDoctor?.specialty_display || null,
        status: 'pending',
      }

      let { error: apptError } = await supabase.from('appointments').insert([appointmentData])

      if (apptError) {
        // Một số database cũ chưa có các cột mở rộng; vẫn cho phép đặt lịch bằng cột lõi.
        const { error: retryError } = await supabase.from('appointments').insert([{
          doctor_id: docId,
          appointment_date: dateStr,
          appointment_time: timeStr,
          patient_id: user.id,
          status: 'pending',
        }])
        apptError = retryError || apptError
      }

      if (apptError) {
        throw new Error(`Không thể lưu lịch hẹn: ${apptError.message}`)
      }

      setSuccessModalOpen(true)
      message.success('Đặt lịch khám thành công!')
    } catch (err: any) {
      console.error('Lỗi submit:', err)
      message.error(`Không thể đặt lịch: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Spin size="large" />
          <span className="text-slate-500 font-medium text-sm">Đang tải dữ liệu...</span>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <ArrowLeftOutlined /> Quay lại
        </button>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full mb-2">
              ✦ Đặt lịch khám trực tuyến
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2">
              Đăng ký khám bệnh cùng chuyên gia
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Đặt lịch khám bệnh nhanh chóng và tiện lợi chỉ trong vài bước đơn giản
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/appointments')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-700 bg-white border border-blue-300 rounded-xl shadow-sm hover:bg-blue-50 transition-all shrink-0 cursor-pointer"
          >
            <FileTextOutlined className="text-blue-600" />
            Xem lịch hẹn đã đặt
          </button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={15}>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-sm">
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* 1. THÔNG TIN BỆNH NHÂN */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-sm">
                    1
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                    Thông tin người khám
                  </h2>
                </div>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="font-semibold text-slate-700">Họ và tên bệnh nhân</span>}
                      name="patient_name"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                      <Input prefix={<UserOutlined className="text-slate-400" />} size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="font-semibold text-slate-700">Số điện thoại</span>}
                      name="patient_phone"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                      <Input prefix={<PhoneOutlined className="text-slate-400" />} size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item label={<span className="font-semibold text-slate-700">Email nhận phiếu khám</span>} name="patient_email">
                      <Input prefix={<MailOutlined className="text-slate-400" />} size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* 2. CHỌN CHUYÊN KHOA & BÁC SĨ */}
                <div className="flex items-center gap-2.5 mt-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-sm">
                    2
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                    Chọn Chuyên khoa & Bác sĩ phụ trách
                  </h2>
                </div>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={<span className="font-semibold text-slate-700">Chuyên khoa</span>} name="specialty">
                      <Select
                        size="large"
                        placeholder="Chọn chuyên khoa..."
                        allowClear
                        value={selectedSpecialty}
                        className="w-full"
                        onChange={(val) => {
                          setSelectedSpecialty(val || null)
                          setSelectedDoctorId(null)
                          form.setFieldsValue({ doctor_id: undefined })
                        }}
                      >
                        {specialties.map((s: any, idx: number) => {
                          const name = s.name || s.specialty_name || s
                          return <Select.Option key={idx} value={name}>{name}</Select.Option>
                        })}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="font-semibold text-slate-700">Bác sĩ khám</span>}
                      name="doctor_id"
                      rules={[{ required: true, message: 'Vui lòng chọn bác sĩ khám' }]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn bác sĩ..."
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        value={selectedDoctorId || undefined}
                        className="w-full"
                        onChange={(val) => {
                          setSelectedDoctorId(val)
                          const doc = doctors.find((d: any) => String(d.doctor_id || d.id) === String(val))
                          if (doc && doc.specialty_display && !selectedSpecialty) {
                            setSelectedSpecialty(doc.specialty_display)
                            form.setFieldsValue({ specialty: doc.specialty_display })
                          }
                        }}
                      >
                        {filteredDoctors.map((doc: any) => {
                          const id = doc.doctor_id || doc.id
                          const title = doc.academic_title ? `${doc.academic_title} ` : ''
                          const name = doc.full_name || doc.name || 'Bác sĩ'
                          const sp = doc.specialty_display || doc.specialty
                          return (
                            <Select.Option key={id} value={id}>
                              {title}{name} {sp ? `(${sp})` : ''}
                            </Select.Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* 3. THỜI GIAN & KHÓA GIỜ ĐÃ CÓ LỊCH */}
                <div className="flex items-center gap-2.5 mt-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-sm">
                    3
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                    Thời gian khám (Tự động cập nhật giờ trống)
                  </h2>
                </div>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="font-semibold text-slate-700">Ngày hẹn khám</span>}
                      name="date"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
                    >
                      <DatePicker
                        size="large"
                        className="w-full rounded-lg"
                        format="DD/MM/YYYY"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        onChange={(d) => setSelectedDate(d)}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="font-semibold text-slate-700">Khung giờ khám</span>}
                      name="timeSlot"
                      rules={[{ required: true, message: 'Vui lòng chọn giờ khám' }]}
                    >
                      <Select
                        size="large"
                        value={selectedTime || undefined}
                        placeholder={checkingSlots ? 'Đang kiểm tra giờ trống...' : 'Chọn khung giờ...'}
                        className="w-full"
                        onChange={(val) => setSelectedTime(val)}
                        options={TIME_SLOTS.map((slot) => {
                          const isOccupied = bookedSlots.includes(slot)
                          return {
                            value: slot,
                            disabled: isOccupied,
                            label: isOccupied ? `${slot} (ĐÃ CÓ LỊCH)` : `${slot} (Trống)`,
                          }
                        })}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Chọn nhanh khung giờ khám */}
                <div className="mb-5">
                  <div className="text-xs sm:text-sm text-slate-500 font-medium mb-2 flex items-center justify-between">
                    <span>Chọn nhanh khung giờ khám:</span>
                    <span className="text-xs font-semibold">
                      <span className="text-emerald-600">🟢 Trống</span> &nbsp;|&nbsp; <span className="text-red-600">🔴 Đã có lịch</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isOccupied = bookedSlots.includes(slot)
                      const isSelected = selectedTime === slot

                      if (isOccupied) {
                        return (
                          <div
                            key={slot}
                            className="px-2.5 py-2 text-xs rounded-lg border border-red-200 bg-red-50 text-red-600 font-bold flex items-center justify-between cursor-not-allowed opacity-80"
                            title="Khung giờ này đã có người đặt lịch"
                          >
                            <span>{slot}</span>
                            <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded">ĐÃ ĐẶT</span>
                          </div>
                        )
                      }

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setSelectedTime(slot)
                            form.setFieldsValue({ timeSlot: slot })
                          }}
                          className={`px-2.5 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm'
                              : 'border border-slate-300 bg-white text-slate-700 font-medium hover:border-blue-400'
                          }`}
                        >
                          <span>{slot}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-semibold">Trống</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Form.Item label={<span className="font-semibold text-slate-700">Lý do khám / Triệu chứng ban đầu</span>} name="reason">
                  <Input.TextArea rows={3} placeholder="Mô tả triệu chứng..." maxLength={500} className="rounded-lg" />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  className="h-12 sm:h-13 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 mt-2"
                >
                  Xác nhận đặt lịch khám ngay
                </Button>
              </Form>
            </div>
          </Col>

          {/* CỘT PHẢI: PHIẾU HẸN XEM TRƯỚC */}
          <Col xs={24} lg={9}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-blue-600 text-base" />
                  <span className="font-extrabold text-base text-slate-900">Phiếu hẹn trực tiếp</span>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Xem trước</span>
              </div>

              {currentDoctor ? (
                <div className="border border-blue-200 rounded-xl p-4 bg-slate-50 flex items-center gap-3.5 mb-5">
                  <Avatar size={60} src={currentDoctor.avatar_url || currentDoctor.avatar} icon={<UserOutlined />} className="bg-blue-100 text-blue-600 shrink-0" />
                  <div>
                    <Tag color="blue" className="rounded font-semibold mb-1">{currentDoctor.specialty_display || 'Chuyên khoa'}</Tag>
                    <div className="font-bold text-sm sm:text-base text-slate-900">
                      {currentDoctor.academic_title ? `${currentDoctor.academic_title} ` : ''}
                      {currentDoctor.full_name || currentDoctor.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">⭐ 4.9 · Bác sĩ chuyên khoa</div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 inline-flex items-center justify-center mb-2.5 text-xl">🏥</div>
                  <div className="text-sm font-bold text-slate-700 mb-1">Chưa chọn Bác sĩ phụ trách</div>
                  <div className="text-xs text-slate-400">Vui lòng chọn bác sĩ ở danh sách bên cạnh</div>
                </div>
              )}

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngày khám:</span>
                  <span className="font-bold text-slate-900">{selectedDate ? selectedDate.format('DD/MM/YYYY') : '---'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Giờ khám:</span>
                  <span className={`font-bold ${selectedTime ? 'text-blue-600' : 'text-slate-400'}`}>
                    {selectedTime || 'Chưa chọn'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Địa điểm:</span>
                  <span className="font-bold text-slate-900">HEALTHCONNECT</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200">
                  <span className="text-slate-500">Phí đặt chỗ:</span>
                  <span className="font-bold text-emerald-600">Miễn phí</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Modal open={successModalOpen} footer={null} centered closable={false} width={400}>
        <div className="text-center py-4">
          <CheckCircleFilled className="text-5xl text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Đặt Lịch Thành Công!</h2>
          <p className="text-slate-500 text-sm mb-6">Khung giờ này đã được gán cho bạn và khóa lại đối với người khác.</p>
          <Button
            type="primary"
            block
            size="large"
            className="rounded-xl bg-blue-600 font-bold"
            onClick={() => {
              setSuccessModalOpen(false)
              router.push('/appointments')
            }}
          >
            Xem lịch hẹn đã đặt
          </Button>
        </div>
      </Modal>
    </PageLayout>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
            Đang tải trang đặt lịch...
          </div>
        </PageLayout>
      }
    >
      <BookingPageContent />
    </Suspense>
  )
}