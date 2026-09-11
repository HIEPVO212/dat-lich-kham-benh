'use client'

import { useCallback, useEffect, useMemo, useState, Suspense, type MouseEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Input, Select, Button, Rate, message, Spin, Modal, Form, InputNumber, Switch, Space, Popconfirm, Table, Empty, Pagination } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'
import { getCurrentUser } from '../../lib/auth'
import { normalizeDoctorBookingStatus } from '../../lib/doctors'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const PAGE_SIZE = 9

type Doctor = {
  id: number
  fullName: string
  avatarUrl: string | null
  academicTitle: string | null
  email: string | null
  specialty: string
  specialtyId: number
  experienceYears: number
  bio: string | null
  workplaceName: string | null
  workplaceAddress: string | null
  rating: number
  totalReviews: number
  totalPatients: number
  isAcceptingBookings: boolean
}

type SpecialtyOption = {
  specialty_id: number
  specialty_name: string
}

type DoctorFormValues = {
  full_name: string
  academic_title?: string
  email?: string
  avatar_url?: string
  specialty_id: number
  experience_years?: number
  bio?: string
  is_accepting_bookings: boolean
}

const SPECIALTY_THEMES = [
  { grad: 'from-blue-500 to-indigo-600', hex: ['#3B82F6', '#4F46E5'], tagBg: 'bg-blue-50', tagText: 'text-blue-700', tagBorder: 'border-blue-200', tint: 'from-blue-50', shadow: 'rgba(59,130,246,0.30)' },
  { grad: 'from-teal-500 to-cyan-600', hex: ['#14B8A6', '#0891B2'], tagBg: 'bg-teal-50', tagText: 'text-teal-700', tagBorder: 'border-teal-200', tint: 'from-teal-50', shadow: 'rgba(20,184,166,0.30)' },
  { grad: 'from-rose-500 to-pink-600', hex: ['#F43F5E', '#DB2777'], tagBg: 'bg-rose-50', tagText: 'text-rose-700', tagBorder: 'border-rose-200', tint: 'from-rose-50', shadow: 'rgba(244,63,94,0.30)' },
  { grad: 'from-amber-500 to-orange-600', hex: ['#F59E0B', '#EA580C'], tagBg: 'bg-amber-50', tagText: 'text-amber-700', tagBorder: 'border-amber-200', tint: 'from-amber-50', shadow: 'rgba(245,158,11,0.30)' },
  { grad: 'from-violet-500 to-purple-600', hex: ['#8B5CF6', '#9333EA'], tagBg: 'bg-violet-50', tagText: 'text-violet-700', tagBorder: 'border-violet-200', tint: 'from-violet-50', shadow: 'rgba(139,92,246,0.30)' },
  { grad: 'from-emerald-500 to-green-600', hex: ['#10B981', '#16A34A'], tagBg: 'bg-emerald-50', tagText: 'text-emerald-700', tagBorder: 'border-emerald-200', tint: 'from-emerald-50', shadow: 'rgba(16,185,129,0.30)' },
]

function getTheme(specialty: string) {
  let hash = 0
  for (let i = 0; i < specialty.length; i++) hash = (hash * 31 + specialty.charCodeAt(i)) >>> 0
  return SPECIALTY_THEMES[hash % SPECIALTY_THEMES.length]
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const theme = getTheme(doctor.specialty)
  const accepting = doctor.isAcceptingBookings

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({ rx: (0.5 - py) * 12, ry: (px - 0.5) * 12 })
    setGlare({ x: px * 100, y: py * 100 })
  }
  const resetTilt = () => { setTilt({ rx: 0, ry: 0 }); setGlare({ x: 50, y: 50 }); }

  return (
    <div style={{ perspective: '1000px' }}>
      <div onMouseMove={handleMouseMove} onMouseLeave={resetTilt} style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: 'transform 200ms ease-out' }} className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br ${theme.tint} to-white p-6`}>
        <div className="relative flex gap-4">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${theme.grad} text-xl font-bold text-white shadow-lg`}>
            {doctor.avatarUrl ? <img src={doctor.avatarUrl} alt={doctor.fullName} className="h-full w-full object-cover object-top" /> : getInitials(doctor.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-900">{doctor.academicTitle} {doctor.fullName}</h3>
            <span className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.tagBg} ${theme.tagText}`}>{doctor.specialty}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <Rate disabled allowHalf value={doctor.rating} style={{ fontSize: 13, color: '#F59E0B' }} />
          <span className="text-xs text-slate-500">{doctor.rating} · {doctor.totalReviews} đánh giá</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-slate-500">{doctor.bio || 'Bác sĩ chưa cập nhật giới thiệu.'}</p>
        <div className="mt-auto pt-5">
          {accepting ? (
            <Link href={`/booking?doctorId=${doctor.id}`}><Button type="primary" block style={{ height: 40, borderRadius: 12, background: theme.hex[0] }}>Đặt lịch khám</Button></Link>
          ) : (
            <Button block disabled style={{ height: 40, borderRadius: 12 }}>Tạm kín lịch</Button>
          )}
        </div>
      </div>
    </div>
  )
}

type DoctorRow = {
  doctor_id: number
  full_name: string | null
  avatar_url: string | null
  academic_title: string | null
  email: string | null
  specialty_id: number
  experience_years: number | null
  bio: string | null
  rating: number | null
  total_reviews: number | null
  is_accepting_bookings: boolean | number | string | null
  workplace_name: string | null
  workplace_address: string | null
  total_patients: number | null
}

function DoctorsContent() {
  const searchParams = useSearchParams()
  const requestedSpecialty = searchParams.get('specialty')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [specialty, setSpecialty] = useState(requestedSpecialty || 'all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminSearchText, setAdminSearchText] = useState('')
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([])
  const [doctorModalOpen, setDoctorModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [savingDoctor, setSavingDoctor] = useState(false)
  const [deletingDoctorId, setDeletingDoctorId] = useState<number | null>(null)
  const [doctorForm] = Form.useForm<DoctorFormValues>()

  const loadSpecialties = useCallback(async () => {
    const { data, error } = await supabase.from('specialty').select('specialty_id, specialty_name').order('specialty_name')
    if (error) {
      message.error('Không tải được danh sách chuyên khoa')
      return
    }
    setSpecialties((data || []) as SpecialtyOption[])
  }, [])

  const loadDoctors = useCallback(async () => {
      setLoading(true)
      try {
        const [doctorRes, specRes] = await Promise.all([
          supabase.from('doctor').select('*'),
          supabase.from('specialty').select('*')
        ])
        if (doctorRes.error) throw doctorRes.error
        if (specRes.error) throw specRes.error
        const allSpecs = specRes.data || []

        const mapped: Doctor[] = (doctorRes.data || []).map((d: DoctorRow) => {
          const s = allSpecs.find(item => (item.specialty_id === d.specialty_id || item.id === d.specialty_id))
          const specName = s?.name || s?.specialty_name || `Chuyên khoa ${d.specialty_id}`

          return {
            id: d.doctor_id, 
            fullName: d.full_name || 'Bác sĩ',
            avatarUrl: d.avatar_url || null,
            academicTitle: d.academic_title || null,
            email: d.email || null,
            bio: d.bio || null,
            specialty: specName,
            specialtyId: Number(d.specialty_id),
            experienceYears: d.experience_years || 0,
            rating: d.rating || 5,
            totalReviews: d.total_reviews || 0,
            isAcceptingBookings: normalizeDoctorBookingStatus(d.is_accepting_bookings),
            workplaceName: d.workplace_name || null,
            workplaceAddress: d.workplace_address || null,
            totalPatients: d.total_patients || 0
          }
        })
        setDoctors(mapped)
      } catch (err) {
        console.error(err)
        message.error('Lỗi tải dữ liệu bác sĩ')
      } finally {
        setLoading(false)
      }
    }, [])

  useEffect(() => {
    // The initial Supabase request updates the list after the component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDoctors()
  }, [loadDoctors])

  useEffect(() => {
    const loadAdminState = async () => {
      const user = await getCurrentUser()
      setIsAdmin(user?.role === 'admin')
      if (user?.role === 'admin') await loadSpecialties()
    }
    void loadAdminState()
  }, [loadSpecialties])

  const openCreateModal = () => {
    setEditingDoctor(null)
    doctorForm.resetFields()
    doctorForm.setFieldsValue({ is_accepting_bookings: true, experience_years: 0 })
    setDoctorModalOpen(true)
  }

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    doctorForm.setFieldsValue({
      full_name: doctor.fullName,
      academic_title: doctor.academicTitle || undefined,
      email: doctor.email || undefined,
      specialty_id: doctor.specialtyId,
      experience_years: doctor.experienceYears,
      bio: doctor.bio || undefined,
      avatar_url: doctor.avatarUrl || undefined,
      is_accepting_bookings: doctor.isAcceptingBookings,
    })
    setDoctorModalOpen(true)
  }

  const saveDoctor = async (values: DoctorFormValues) => {
    setSavingDoctor(true)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Tài khoản hiện tại chưa có role admin trong bảng profiles. Hãy đăng xuất và đăng nhập lại sau khi cấp quyền.')
      }

      const payload = {
        full_name: values.full_name.trim(),
        academic_title: values.academic_title?.trim() || null,
        email: values.email?.trim() || null,
        avatar_url: values.avatar_url?.trim() || null,
        specialty_id: values.specialty_id,
        experience_years: values.experience_years ?? 0,
        bio: values.bio?.trim() || null,
        is_accepting_bookings: values.is_accepting_bookings,
      }
      const result = editingDoctor
        ? await supabase.from('doctor').update(payload).eq('doctor_id', editingDoctor.id).select('doctor_id').maybeSingle()
        : await supabase.from('doctor').insert(payload).select('doctor_id').single()
      const { data, error } = result
      if (error) throw error
      if (!data) throw new Error('Không có bản ghi nào được thay đổi. Kiểm tra role admin và policy RLS trên Supabase.')
      message.success(editingDoctor ? 'Đã cập nhật bác sĩ' : 'Đã thêm bác sĩ')
      setDoctorModalOpen(false)
      await loadDoctors()
    } catch (error) {
      console.error(error)
      const detail = error instanceof Error ? error.message : 'Lỗi không xác định'
      message.error(`Không thể lưu bác sĩ: ${detail}`)
    } finally {
      setSavingDoctor(false)
    }
  }

  const deleteDoctor = async (doctorId: number) => {
    setDeletingDoctorId(doctorId)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Tài khoản hiện tại chưa có role admin trong bảng profiles. Hãy đăng xuất và đăng nhập lại sau khi cấp quyền.')
      }

      const { data, error } = await supabase
        .from('doctor')
        .delete()
        .eq('doctor_id', doctorId)
        .select('doctor_id')
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error('Không có bản ghi nào được xóa. Kiểm tra role admin, policy RLS hoặc liên kết lịch hẹn.')
      message.success('Đã xóa bác sĩ')
      await loadDoctors()
    } catch (error) {
      console.error(error)
      const detail = error instanceof Error ? error.message : 'Lỗi không xác định'
      message.error(`Không thể xóa bác sĩ: ${detail}`)
    } finally {
      setDeletingDoctorId(null)
    }
  }

  const filteredDoctors = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    return doctors.filter(d => d.fullName.toLowerCase().includes(keyword) && (specialty === 'all' || d.specialty === specialty))
  }, [doctors, searchText, specialty])

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / PAGE_SIZE))
  const visiblePage = Math.min(currentPage, totalPages)
  const pagedDoctors = useMemo(
    () => filteredDoctors.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE),
    [filteredDoctors, visiblePage],
  )

  return (
    <PageLayout>
      <div className={beVietnamPro.className}>
        <div className="relative mb-8 rounded-3xl bg-gradient-to-br from-blue-50 to-teal-50 p-10">
           <h1 className="text-3xl font-extrabold text-slate-900">Danh sách bác sĩ</h1>
           <p className="text-slate-500">Tìm bác sĩ và đặt lịch khám nhanh chóng.</p>
        </div>
        <div className="mb-8 flex flex-wrap gap-3 rounded-2xl border bg-white p-3 shadow-sm">
          <Input
            placeholder="Tìm tên bác sĩ..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => {
              setSearchText(e.target.value)
              setCurrentPage(1)
            }}
            style={{ maxWidth: 280 }}
          />
          <Select
            value={specialty}
            onChange={value => {
              setSpecialty(value)
              setCurrentPage(1)
            }}
            style={{ minWidth: 200 }}
            options={[{label: 'Tất cả', value: 'all'}, ...Array.from(new Set(doctors.map(d => d.specialty))).map(s => ({label: s, value: s}))]}
          />
        </div>
        {isAdmin && (
          <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Quản lý bác sĩ</h2>
                <p className="text-sm text-slate-500">Dữ liệu được lưu trực tiếp trên Supabase.</p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                className="!flex !items-center !rounded-xl !border-0 !bg-blue-600 !font-semibold !shadow-md !shadow-blue-200 transition-all hover:!-translate-y-0.5 hover:!bg-blue-700"
              >
                Thêm bác sĩ
              </Button>
            </div>
            <Input
              allowClear
              value={adminSearchText}
              onChange={(event) => setAdminSearchText(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Tìm nhanh bác sĩ theo tên hoặc chuyên khoa..."
              className="mb-4 !rounded-xl !border-blue-200 !bg-white"
              style={{ maxWidth: 420 }}
            />
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={doctors.filter((doctor) => {
                const keyword = adminSearchText.trim().toLowerCase()
                return !keyword
                  || doctor.fullName.toLowerCase().includes(keyword)
                  || doctor.specialty.toLowerCase().includes(keyword)
              })}
              columns={[
                { title: 'Bác sĩ', dataIndex: 'fullName', key: 'fullName', render: (name: string, doctor: Doctor) => `${doctor.academicTitle ? `${doctor.academicTitle} ` : ''}${name}` },
                { title: 'Chuyên khoa', dataIndex: 'specialty', key: 'specialty' },
                { title: 'Kinh nghiệm', key: 'experience', render: (_: unknown, doctor: Doctor) => `${doctor.experienceYears} năm` },
                { title: 'Trạng thái', key: 'status', render: (_: unknown, doctor: Doctor) => doctor.isAcceptingBookings ? 'Đang nhận lịch' : 'Tạm kín lịch' },
                {
                  title: 'Thao tác',
                  key: 'actions',
                  render: (_: unknown, doctor: Doctor) => (
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(doctor)}
                        className="!rounded-lg !border-blue-200 !text-blue-600 hover:!border-blue-500 hover:!bg-blue-50"
                      >
                        Sửa
                      </Button>
                      <Popconfirm title="Xóa bác sĩ này?" description="Thao tác này không thể hoàn tác." onConfirm={() => deleteDoctor(doctor.id)} okText="Xóa" cancelText="Hủy">
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          loading={deletingDoctorId === doctor.id}
                          className="!rounded-lg hover:!shadow-sm"
                        >
                          Xóa
                        </Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        )}
        {loading ? <div className="p-20 text-center"><Spin size="large" /></div> : filteredDoctors.length === 0 ? (
          <Empty description="Không tìm thấy bác sĩ phù hợp" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pagedDoctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
            </div>
            <div className="mt-8 flex justify-center">
              <Pagination
                current={visiblePage}
                pageSize={PAGE_SIZE}
                total={filteredDoctors.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showLessItems
                showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} bác sĩ`}
              />
            </div>
          </>
        )}
      </div>
      <Modal
        title={editingDoctor ? 'Sửa thông tin bác sĩ' : 'Thêm bác sĩ'}
        open={doctorModalOpen}
        onCancel={() => setDoctorModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={doctorForm} layout="vertical" onFinish={saveDoctor}>
          <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="academic_title" label="Học hàm / học vị"><Input placeholder="Ví dụ: BS.CKII" /></Form.Item>
          <Form.Item name="specialty_id" label="Chuyên khoa" rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa' }]}>
            <Select options={specialties.map((item) => ({ label: item.specialty_name, value: item.specialty_id }))} />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="experience_years" label="Số năm kinh nghiệm" style={{ width: '50%' }}><InputNumber min={0} max={80} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="email" label="Email" style={{ width: '50%' }}><Input type="email" /></Form.Item>
          </Space.Compact>
          <Form.Item name="avatar_url" label="URL ảnh đại diện"><Input /></Form.Item>
          <Form.Item name="bio" label="Giới thiệu"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="is_accepting_bookings" label="Nhận đặt lịch" valuePropName="checked"><Switch /></Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDoctorModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={savingDoctor}>Lưu</Button>
          </div>
        </Form>
      </Modal>
    </PageLayout>
  )
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center"><Spin size="large" /></div>}>
      <DoctorsContent />
    </Suspense>
  )
}