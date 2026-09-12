'use client'

import { useEffect, useState, Suspense } from 'react'
import {
  Input,
  Select,
  Pagination,
  message,
  Button,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
  Switch,
  Tooltip,
  Upload,
  Avatar,
} from 'antd'
import {
  StarFilled,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  UploadOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'

const { Search } = Input

// Bảng màu giao diện theo từng chuyên khoa
const specialtyTheme: Record<
  string,
  {
    bg: string
    border: string
    tagBg: string
    tagColor: string
    tagBorder: string
    btnBg: string
    btnHover: string
  }
> = {
  'Sản phụ khoa': {
    bg: '#fbf7ff',
    border: '#f0e6fc',
    tagBg: '#ffffff',
    tagColor: '#8b5cf6',
    tagBorder: '#8b5cf6',
    btnBg: '#8b5cf6',
    btnHover: '#7c3aed',
  },
  'Da liễu': {
    bg: '#fff5f7',
    border: '#ffe0e6',
    tagBg: '#ffffff',
    tagColor: '#f43f5e',
    tagBorder: '#f43f5e',
    btnBg: '#f43f5e',
    btnHover: '#e11d48',
  },
  'Tim mạch': {
    bg: '#fffaf3',
    border: '#fcead2',
    tagBg: '#ffffff',
    tagColor: '#d97706',
    tagBorder: '#d97706',
    btnBg: '#ea580c',
    btnHover: '#c2410c',
  },
  'Răng Hàm Mặt': {
    bg: '#f0fdf9',
    border: '#ccfbf1',
    tagBg: '#ffffff',
    tagColor: '#059669',
    tagBorder: '#059669',
    btnBg: '#10b981',
    btnHover: '#059669',
  },
  'Thần kinh': {
    bg: '#f0fdf4',
    border: '#dcfce7',
    tagBg: '#ffffff',
    tagColor: '#16a34a',
    tagBorder: '#16a34a',
    btnBg: '#059669',
    btnHover: '#047857',
  },
  'Nhi khoa': {
    bg: '#f0f9ff',
    border: '#e0f2fe',
    tagBg: '#ffffff',
    tagColor: '#0284c7',
    tagBorder: '#0284c7',
    btnBg: '#0284c7',
    btnHover: '#0369a1',
  },
  'Mắt': {
    bg: '#eff6ff',
    border: '#dbeafe',
    tagBg: '#ffffff',
    tagColor: '#2563eb',
    tagBorder: '#2563eb',
    btnBg: '#2563eb',
    btnHover: '#1d4ed8',
  },
  'Tai Mũi Họng': {
    bg: '#fff7ed',
    border: '#ffedd5',
    tagBg: '#ffffff',
    tagColor: '#ea580c',
    tagBorder: '#ea580c',
    btnBg: '#f97316',
    btnHover: '#ea580c',
  },
  'Nội khoa': {
    bg: '#f0fdf4',
    border: '#dcfce7',
    tagBg: '#ffffff',
    tagColor: '#10b981',
    tagBorder: '#10b981',
    btnBg: '#10b981',
    btnHover: '#059669',
  },
}

const defaultTheme = {
  bg: '#f8fafc',
  border: '#e2e8f0',
  tagBg: '#ffffff',
  tagColor: '#3b82f6',
  tagBorder: '#3b82f6',
  btnBg: '#3b82f6',
  btnHover: '#2563eb',
}

type Doctor = {
  id: string
  name: string
  academic_title?: string
  specialty: string
  specialty_id?: any
  hospital: string
  hospital_address?: string
  experience_years: number
  avatar_url?: string
  bio?: string
  available: boolean
}

type SpecialtyItem = {
  id: string
  name: string
}

function DoctorsContent() {
  const searchParams = useSearchParams()
  const initialSpecialty = searchParams.get('specialty') || searchParams.get('specialtyName') || 'all'

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState<string>(initialSpecialty)
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  // Biến kiểm tra người dùng hiện tại có phải là ADMIN không
  const [isAdmin, setIsAdmin] = useState(false)

  // Modal Thêm Bác sĩ
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [form] = Form.useForm()

  // 1. Kiểm tra vai trò Admin
  useEffect(() => {
    async function checkAdminRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const email = session.user.email?.toLowerCase()
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle()

          const role = profile?.role || session.user.user_metadata?.role
          if (email === 'hiepvo212600@gmail.com' || role === 'admin') {
            setIsAdmin(true)
          }
        }
      } catch (err) {
        console.warn('Lỗi kiểm tra quyền admin:', err)
      }
    }
    checkAdminRole()
  }, [])

  // Cập nhật khi URL có tham số chuyên khoa
  useEffect(() => {
    const urlSpec = searchParams.get('specialty') || searchParams.get('specialtyName')
    if (urlSpec) {
      setSpecialty(urlSpec)
      setPage(1)
    }
  }, [searchParams])

  // 2. Tải danh sách bác sĩ & chuyên khoa từ CSDL
  async function loadData() {
    setLoading(true)
    try {
      const { data: doctorList, error } = await supabase
        .from('doctor')
        .select('*')
        .order('doctor_id', { ascending: true })

      if (error) throw error

      const { data: specs } = await supabase.from('specialty').select('*')
      const specMap = new Map<string, string>()
      const specArr: SpecialtyItem[] = []

      if (specs) {
        specs.forEach((s: any) => {
          const id = String(s.specialty_id || s.id)
          const name = s.specialty_name || s.name
          specMap.set(id, name)
          specArr.push({ id, name })
        })
      }
      setSpecialties(specArr)

      const { data: primaryFacilities } = await supabase
        .from('doctor_primary_facility')
        .select('*')

      const facilityMap = new Map<string, { name: string; address?: string }>()
      if (primaryFacilities) {
        primaryFacilities.forEach((f: any) => {
          const docId = String(f.doctor_id)
          facilityMap.set(docId, {
            name: f.facility_name || f.name || f.hospital_name || 'Chưa cập nhật cơ sở',
            address: f.facility_address || f.address || 'TP. Hồ Chí Minh',
          })
        })
      }

      const mapped: Doctor[] = (doctorList || []).map((doc: any) => {
        const docId = String(doc.doctor_id || doc.id)
        const specId = String(doc.specialty_id || '')
        const academic = doc.academic_title ? `${doc.academic_title} ` : ''
        const specName = specMap.get(specId) || doc.specialty || 'Đa khoa'
        const isAvail = doc.available !== false && doc.is_accepting_bookings !== false

        const fac = facilityMap.get(docId)
        const hospitalName =
          fac?.name ||
          doc.hospital ||
          'Chưa cập nhật cơ sở'

        return {
          id: docId,
          name: `${academic}${doc.full_name || 'Bác sĩ'}`,
          academic_title: doc.academic_title,
          specialty: specName,
          specialty_id: doc.specialty_id,
          hospital: hospitalName,
          hospital_address: fac?.address,
          experience_years: doc.experience_years || 5,
          avatar_url: doc.avatar_url,
          bio: doc.bio || `Tận tâm với bệnh nhân, chuyên sâu về ${specName.toLowerCase()} với ${doc.experience_years || 5} năm công tác.`,
          available: isAvail,
        }
      })

      setDoctors(mapped)
    } catch (err: any) {
      console.error('Lỗi loadData:', err)
      message.error('Không thể tải danh sách bác sĩ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Upload ảnh đại diện bác sĩ lên Supabase
  async function handleUploadAvatar(file: File) {
    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `doctor_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `doctors/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setUploadedAvatarUrl(data.publicUrl)
      message.success('Đã tải ảnh lên Supabase thành công!')
    } catch (err: any) {
      console.error('Lỗi upload ảnh:', err)
      message.error('Lỗi tải ảnh lên Supabase: ' + (err.message || 'Vui lòng thử lại'))
    } finally {
      setUploadingAvatar(false)
    }
    return false
  }

  // 3. Admin Bật / Tắt trạng thái nhận lịch của bác sĩ
  async function handleToggleAvailability(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, available: newStatus } : d))
    )

    try {
      const { error } = await supabase
        .from('doctor')
        .update({
          available: newStatus,
          is_accepting_bookings: newStatus,
        })
        .eq('doctor_id', id)

      if (error) {
        await supabase
          .from('doctor')
          .update({ available: newStatus })
          .eq('id', id)
      }

      if (newStatus) {
        message.success('Đã mở nhận lịch khám cho bác sĩ')
      } else {
        message.info('Đã chuyển bác sĩ sang trạng thái Tạm kín lịch')
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err)
      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, available: currentStatus } : d))
      )
    }
  }

  // 4. Admin Xóa bác sĩ
  async function handleDeleteDoctor(id: string) {
    try {
      const { error } = await supabase
        .from('doctor')
        .delete()
        .eq('doctor_id', id)

      if (error) throw error

      message.success('Đã xóa bác sĩ thành công')
      setDoctors((prev) => prev.filter((d) => d.id !== id))
    } catch (err: any) {
      console.error('Lỗi xóa bác sĩ:', err)
      message.error('Không thể xóa bác sĩ: ' + (err.message || 'Lỗi'))
    }
  }

  // 5. Admin Thêm bác sĩ mới
  async function handleAddDoctor(values: any) {
    setSubmitting(true)
    try {
      const avatarFinal =
        uploadedAvatarUrl ||
        'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=300'

      const payload: any = {
        full_name: values.full_name,
        academic_title: values.academic_title || null,
        specialty_id: values.specialty_id ? Number(values.specialty_id) : 1,
        experience_years: values.experience_years || 5,
        avatar_url: avatarFinal,
      }

      let { error } = await supabase.from('doctor').insert([
        {
          ...payload,
          available: values.available ?? true,
          hospital: values.hospital || 'Chưa cập nhật cơ sở',
        },
      ])

      if (error && error.message?.includes('available')) {
        const res = await supabase.from('doctor').insert([payload])
        error = res.error
      }

      if (error) throw error

      message.success('Thêm bác sĩ thành công!')
      setIsModalOpen(false)
      form.resetFields()
      setUploadedAvatarUrl('')
      loadData()
    } catch (err: any) {
      console.error('Lỗi thêm bác sĩ:', err)
      message.error('Lỗi thêm bác sĩ: ' + (err.message || 'Thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  // Lọc theo từ khóa và chuyên khoa
  const filtered = doctors.filter((doc) => {
    const matchName = doc.name.toLowerCase().includes(search.toLowerCase())
    const matchHospital = doc.hospital.toLowerCase().includes(search.toLowerCase())

    let matchSpec = true
    if (specialty && specialty !== 'all') {
      const target = specialty.toLowerCase().trim()
      const docSpec = doc.specialty.toLowerCase().trim()
      matchSpec = docSpec === target || docSpec.includes(target) || target.includes(docSpec)
    }

    return (matchName || matchHospital) && matchSpec
  })

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <PageLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 8px' }}>
        {/* Thanh tiêu đề */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Đội ngũ Bác sĩ ({filtered.length} bác sĩ{specialty !== 'all' ? ` - ${specialty}` : ''})
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: 14 }}>
              Danh sách bác sĩ, cơ sở bệnh viện và trạng thái tiếp nhận lịch
            </p>
          </div>

          {/* CHỈ HIỂN THỊ NÚT "THÊM BÁC SĨ" KHI LÀ ADMIN */}
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{
                borderRadius: 10,
                fontWeight: 600,
                backgroundColor: '#0284c7',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)',
              }}
              onClick={() => {
                setUploadedAvatarUrl('')
                form.resetFields()
                setIsModalOpen(true)
              }}
            >
              Thêm bác sĩ
            </Button>
          )}
        </div>

        {/* Thanh tìm kiếm & bộ lọc */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Search
              placeholder="Tìm kiếm theo tên hoặc bệnh viện..."
              allowClear
              style={{ width: 300 }}
              onSearch={(v) => {
                setSearch(v)
                setPage(1)
              }}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <Select
              value={specialty}
              style={{ width: 220 }}
              onChange={(v) => {
                setSpecialty(v)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'Tất cả chuyên khoa' },
                ...specialties.map((s) => ({ value: s.name, label: s.name })),
              ]}
            />
          </div>

          <Pagination
            current={page}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(p, ps) => {
              setPage(p)
              setPageSize(ps)
            }}
            showSizeChanger
            pageSizeOptions={['6', '9', '12', '18']}
          />
        </div>

        {/* Lưới thẻ danh sách bác sĩ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 24,
          }}
        >
          {paged.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Không tìm thấy bác sĩ nào thuộc chuyên khoa này.
            </div>
          ) : (
            paged.map((doc) => {
              const theme = specialtyTheme[doc.specialty] || defaultTheme
              const isAvailable = doc.available

              return (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: isAvailable ? theme.bg : '#f8fafc',
                    border: `1px solid ${isAvailable ? theme.border : '#e2e8f0'}`,
                    borderRadius: 20,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    position: 'relative',
                    opacity: isAvailable ? 1 : 0.88,
                    transition: 'all 0.25s ease',
                  }}
                >
                  {/* CÔNG TẮC ĐÓNG/MỞ LỊCH & NÚT XÓA: CHỈ HIỂN THỊ KHI LÀ ADMIN */}
                  {isAdmin && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Tooltip
                        title={
                          isAvailable
                            ? 'Đang nhận lịch (Click để đóng lịch)'
                            : 'Tạm kín lịch (Click để mở lại lịch)'
                        }
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: 20,
                            border: `1px solid ${isAvailable ? '#bbf7d0' : '#e2e8f0'}`,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          }}
                        >
                          <Switch
                            size="small"
                            checked={isAvailable}
                            checkedChildren={<CheckCircleOutlined />}
                            unCheckedChildren={<StopOutlined />}
                            style={{
                              backgroundColor: isAvailable ? '#10b981' : '#94a3b8',
                            }}
                            onChange={() => handleToggleAvailability(doc.id, isAvailable)}
                          />
                        </div>
                      </Tooltip>

                      <Popconfirm
                        title="Xóa bác sĩ"
                        description={`Bạn có chắc muốn xóa ${doc.name}?`}
                        onConfirm={() => handleDeleteDoctor(doc.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined style={{ fontSize: 15 }} />}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #fee2e2',
                            borderRadius: 8,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            padding: '2px 8px',
                            height: 26,
                          }}
                        />
                      </Popconfirm>
                    </div>
                  )}

                  <div>
                    {/* Avatar + Tên + Chuyên khoa */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        paddingRight: isAdmin ? 80 : 0,
                      }}
                    >
                      <img
                        src={
                          doc.avatar_url ||
                          'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=300'
                        }
                        alt={doc.name}
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 16,
                          objectFit: 'cover',
                          backgroundColor: '#fff',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          filter: isAvailable ? 'none' : 'grayscale(35%)',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 16.5,
                            fontWeight: 700,
                            color: isAvailable ? '#0f172a' : '#475569',
                            lineHeight: 1.3,
                          }}
                        >
                          {doc.name}
                        </h3>

                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: 8,
                            padding: '3px 14px',
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 20,
                            backgroundColor: theme.tagBg,
                            color: isAvailable ? theme.tagColor : '#64748b',
                            border: `1.5px solid ${isAvailable ? theme.tagBorder : '#cbd5e1'}`,
                          }}
                        >
                          {doc.specialty}
                        </span>
                      </div>
                    </div>

                    {/* Cơ sở y tế / Bệnh viện */}
                    <div
                      style={{
                        marginTop: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: isAvailable ? '#0284c7' : '#64748b',
                      }}
                    >
                      <EnvironmentOutlined style={{ fontSize: 14 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.hospital}
                      </span>
                    </div>

                    {/* Đánh giá sao */}
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarFilled key={s} style={{ color: '#f59e0b', fontSize: 13 }} />
                      ))}
                      <span
                        style={{
                          fontSize: 13,
                          color: '#64748b',
                          marginLeft: 6,
                          fontWeight: 500,
                        }}
                      >
                        5 · 0 đánh giá
                      </span>
                    </div>

                    {/* Mô tả */}
                    <p
                      style={{
                        margin: '10px 0 18px 0',
                        color: '#475569',
                        fontSize: 13,
                        lineHeight: 1.5,
                        minHeight: 38,
                      }}
                    >
                      {doc.bio}
                    </p>
                  </div>

                  {/* Nút đặt lịch khám */}
                  <div>
                    {isAvailable ? (
                      <Link href={`/booking?doctorId=${doc.id}`} style={{ textDecoration: 'none' }}>
                        <button
                          style={{
                            width: '100%',
                            backgroundColor: theme.btnBg,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 12,
                            padding: '11px 0',
                            fontSize: 14.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                          Đặt lịch khám
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        style={{
                          width: '100%',
                          backgroundColor: '#f1f5f9',
                          color: '#94a3b8',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: '11px 0',
                          fontSize: 14.5,
                          fontWeight: 500,
                          cursor: 'not-allowed',
                        }}
                      >
                        Tạm kín lịch
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Thêm Bác sĩ (Dành riêng cho Admin) */}
        <Modal
          title={<span style={{ fontSize: 18, fontWeight: 700 }}>Thêm Bác Sĩ Mới</span>}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddDoctor}
            initialValues={{
              academic_title: 'BS.CKI',
              hospital: 'Chưa cập nhật cơ sở',
              experience_years: 5,
              available: true,
              specialty_id: specialties[0]?.id || 1,
            }}
          >
            <Form.Item label="Ảnh đại diện bác sĩ">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar
                  size={68}
                  src={uploadedAvatarUrl}
                  icon={!uploadedAvatarUrl && <UserOutlined />}
                  style={{
                    border: '2px solid #e2e8f0',
                    backgroundColor: '#f1f5f9',
                  }}
                />
                <div>
                  <Upload
                    beforeUpload={handleUploadAvatar}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />} loading={uploadingAvatar}>
                      {uploadingAvatar ? 'Đang tải lên Supabase...' : 'Chọn ảnh từ máy tính'}
                    </Button>
                  </Upload>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    Hỗ trợ JPG, PNG, WEBP (Tự động lưu vào Supabase Storage)
                  </div>
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="full_name"
              label="Họ và tên bác sĩ"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên bác sĩ' }]}
            >
              <Input placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>

            <Form.Item name="academic_title" label="Học vị / Học hàm">
              <Select
                options={[
                  { value: 'BS', label: 'Bác sĩ (BS)' },
                  { value: 'ThS.BS', label: 'Thạc sĩ Bác sĩ (ThS.BS)' },
                  { value: 'BS.CKI', label: 'Bác sĩ Chuyên khoa I (BS.CKI)' },
                  { value: 'BS.CKII', label: 'Bác sĩ Chuyên khoa II (BS.CKII)' },
                  { value: 'Tiến sĩ', label: 'Tiến sĩ (TS.BS)' },
                  { value: 'PGS.TS', label: 'Phó Giáo sư (PGS.TS)' },
                  { value: 'GS.TS', label: 'Giáo sư (GS.TS)' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="specialty_id"
              label="Chuyên khoa"
              rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa' }]}
            >
              <Select
                options={specialties.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="hospital"
              label="Bệnh viện / Cơ sở y tế công tác"
              rules={[{ required: true, message: 'Vui lòng nhập bệnh viện công tác' }]}
            >
              <Input placeholder="Ví dụ: Bệnh viện Chợ Rẫy, Bệnh viện Da Liễu TP.HCM..." />
            </Form.Item>

            <Form.Item name="experience_years" label="Số năm kinh nghiệm">
              <InputNumber min={0} max={60} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="available" label="Trạng thái ban đầu" valuePropName="checked">
              <Switch checkedChildren="Đang nhận lịch" unCheckedChildren="Tạm kín lịch" defaultChecked />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ backgroundColor: '#0284c7' }}
              >
                Lưu Bác Sĩ
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </PageLayout>
  )
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <DoctorsContent />
    </Suspense>
  )
}