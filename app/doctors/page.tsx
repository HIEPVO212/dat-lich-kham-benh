'use client'
import { useEffect, useState } from 'react'
import { Card, Tag, Button, Input, Select, Rate, Pagination, message, Modal, Form, InputNumber, Upload, Avatar } from 'antd'
import { EnvironmentOutlined, PlusOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

const { Search } = Input

type Doctor = {
  id: string
  name: string
  specialty: string
  hospital?: string
  experience_years: number
  avatar_url?: string
  bio?: string
  rating?: number
  total_reviews?: number
  available?: boolean
}

const specialtyColors: Record<string, string> = {
  'Tim mạch': 'orange',
  'Da liễu': 'magenta',
  'Thần kinh': 'green',
  'Sản phụ khoa': 'purple',
  'Nhi khoa': 'cyan',
  'Răng Hàm Mặt': 'geekblue',
  'Mắt': 'blue',
  'Tai Mũi Họng': 'volcano',
  'Chấn thương chỉnh hình': 'gold',
  'Nội tiết': 'lime',
  'Đa khoa': 'blue',
}

export default function DoctorsPage() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  // State cho Modal thêm bác sĩ
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addingDoctor, setAddingDoctor] = useState(false)
  const [doctorAvatarUrl, setDoctorAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [form] = Form.useForm()

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name')
      if (error) throw error
      setDoctors(data || [])
    } catch (err: any) {
      message.error('Lỗi tải danh sách bác sĩ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  // Xử lý upload ảnh bác sĩ lên Supabase Storage
  const handleUploadDoctorAvatar = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `doctor-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setDoctorAvatarUrl(data.publicUrl)
      message.success('Tải ảnh bác sĩ thành công!')
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tải ảnh bác sĩ')
    } finally {
      setUploadingAvatar(false)
    }
    return false
  }

  // Thêm bác sĩ mới vào database
  const handleAddDoctor = async (values: any) => {
    setAddingDoctor(true)
    try {
      const newDoctor = {
        name: values.name,
        specialty: values.specialty,
        hospital: values.hospital || 'Bệnh viện Đa khoa Quốc tế',
        experience_years: values.experience_years || 5,
        bio: values.bio || `Bác sĩ chuyên khoa ${values.specialty}`,
        avatar_url: doctorAvatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
        rating: 5,
        total_reviews: 0,
        available: true,
      }

      const { error } = await supabase.from('doctors').insert([newDoctor])
      if (error) throw error

      message.success('Thêm bác sĩ mới thành công!')
      form.resetFields()
      setDoctorAvatarUrl('')
      setIsModalOpen(false)
      fetchDoctors()
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi thêm bác sĩ')
    } finally {
      setAddingDoctor(false)
    }
  }

  const filtered = doctors.filter((doc) => {
    const matchName = doc.name.toLowerCase().includes(search.toLowerCase())
    const matchHospital = (doc.hospital || '').toLowerCase().includes(search.toLowerCase())
    const matchSpec = specialty === 'all' || doc.specialty === specialty
    return (matchName || matchHospital) && matchSpec
  })

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <PageLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Đội ngũ Bác sĩ</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Đội ngũ chuyên gia y tế tại các bệnh viện hàng đầu</p>
        </div>

        {/* Nút thêm bác sĩ (Admin) */}
        {user?.role === 'admin' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#0284c7' }}
          >
            Thêm bác sĩ mới
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Search
          placeholder="Tìm theo tên bác sĩ hoặc bệnh viện..."
          allowClear
          style={{ width: 320 }}
          onSearch={(v) => { setSearch(v); setPage(1) }}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <Select
          defaultValue="all"
          style={{ width: 220 }}
          onChange={(v) => { setSpecialty(v); setPage(1) }}
          options={[
            { value: 'all', label: 'Tất cả chuyên khoa' },
            ...Object.keys(specialtyColors).map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {paged.map((doc) => (
          <Card
            key={doc.id}
            hoverable
            style={{ borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <img
                  src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                  alt={doc.name}
                  style={{ width: 84, height: 84, borderRadius: 14, objectFit: 'cover', border: '1px solid #cbd5e1' }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{doc.name}</h3>
                  <Tag color={specialtyColors[doc.specialty] || 'blue'} style={{ marginTop: 6, fontWeight: 500 }}>
                    {doc.specialty || 'Đa khoa'}
                  </Tag>
                  
                  {/* HIỂN THỊ BỆNH VIỆN RÕ RÀNG */}
                  <div style={{ marginTop: 8, fontSize: 13, color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <EnvironmentOutlined />
                    <span>{doc.hospital || 'Bệnh viện Đa khoa Quốc tế'}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Rate disabled defaultValue={doc.rating || 5} style={{ fontSize: 13 }} />
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  {doc.rating || 5} · {doc.total_reviews || 0} đánh giá
                </span>
              </div>

              <p style={{ margin: '10px 0', color: '#475569', fontSize: 13, minHeight: 38, lineHeight: 1.4 }}>
                {doc.bio || `Bác sĩ giàu kinh nghiệm với hơn ${doc.experience_years || 5} năm công tác chuyên khoa ${doc.specialty}.`}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                {doc.experience_years ? `${doc.experience_years} năm kinh nghiệm` : 'Nhiều năm kinh nghiệm'}
              </span>
              <Link href={`/booking?doctorId=${doc.id}`}>
                <Button type="primary" style={{ background: '#0284c7', borderRadius: 8 }}>
                  Đặt lịch khám
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filtered.length}
          onChange={(p, ps) => { setPage(p); setPageSize(ps) }}
          showSizeChanger
        />
      </div>

      {/* MODAL THÊM BÁC SĨ MỚI (DÀNH CHO ADMIN CÓ UPLOAD ẢNH) */}
      <Modal
        title="Thêm bác sĩ mới vào hệ thống"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddDoctor} style={{ marginTop: 16 }}>
          {/* Upload ảnh đại diện bác sĩ từ máy tính */}
          <Form.Item label="Ảnh đại diện bác sĩ">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                size={64}
                src={doctorAvatarUrl}
                icon={!doctorAvatarUrl && <UserOutlined />}
                style={{ border: '1px solid #ccc' }}
              />
              <Upload beforeUpload={handleUploadDoctorAvatar} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />} loading={uploadingAvatar}>
                  Tải ảnh từ máy tính
                </Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item name="name" label="Họ tên bác sĩ" rules={[{ required: true, message: 'Vui lòng nhập tên bác sĩ' }]}>
            <Input placeholder="Ví dụ: BS.CKII Nguyễn Văn A" />
          </Form.Item>

          <Form.Item name="specialty" label="Chuyên khoa" rules={[{ required: true, message: 'Chọn chuyên khoa' }]}>
            <Select placeholder="Chọn chuyên khoa">
              {Object.keys(specialtyColors).map((s) => (
                <Select.Option key={s} value={s}>{s}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="hospital" label="Bệnh viện / Cơ sở làm việc" rules={[{ required: true, message: 'Vui lòng nhập bệnh viện' }]}>
            <Input placeholder="Ví dụ: Bệnh viện Chợ Rẫy, BV Bạch Mai..." />
          </Form.Item>

          <Form.Item name="experience_years" label="Số năm kinh nghiệm">
            <InputNumber min={1} max={50} defaultValue={5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="bio" label="Mô tả ngắn">
            <Input.TextArea rows={3} placeholder="Giới thiệu về chuyên môn và quá trình đào tạo..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={addingDoctor} style={{ background: '#0284c7' }}>
              Lưu bác sĩ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  )
}