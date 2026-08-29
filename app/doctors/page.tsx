'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Input,
  Select,
  Button,
  Skeleton,
  Empty,
  Typography,
  message,
} from 'antd'
import { UserOutlined, SearchOutlined, CalendarOutlined, PhoneOutlined } from '@ant-design/icons'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'

const { Paragraph, Text } = Typography

type Doctor = {
  id: string
  full_name: string
  phone: string | null
  specialty: string | null
  bio: string | null
  avatar_url: string | null
  experience_years: number | null
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [specialty, setSpecialty] = useState('all')

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    setLoading(true)
    // Bác sĩ = các dòng trong bảng profiles có role = 'doctor'.
    // Dùng select('*') thay vì liệt kê tên cột cụ thể để trang không bị lỗi
    // nếu nhóm chưa kịp thêm đủ các cột specialty/bio/avatar_url/experience_years.
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'doctor')
      .order('full_name', { ascending: true })

    if (error) {
      message.error('Không tải được danh sách bác sĩ, vui lòng thử lại')
    } else {
      setDoctors((data as Doctor[]) || [])
    }
    setLoading(false)
  }

  // Danh sách chuyên khoa để lọc, lấy từ chính dữ liệu bác sĩ đang có (không hard-code)
  const specialtyOptions = useMemo(() => {
    const unique = Array.from(
      new Set(doctors.map((d) => d.specialty).filter((s): s is string => !!s))
    )
    return [
      { label: 'Tất cả chuyên khoa', value: 'all' },
      ...unique.map((s) => ({ label: s, value: s })),
    ]
  }, [doctors])

  const filteredDoctors = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    return doctors.filter((d) => {
      const matchName = (d.full_name || '').toLowerCase().includes(keyword)
      const matchSpecialty = specialty === 'all' || d.specialty === specialty
      return matchName && matchSpecialty
    })
  }, [doctors, searchText, specialty])

  return (
    <PageLayout>
      <h1 style={{ marginBottom: 4 }}>Danh sách bác sĩ</h1>
      <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
        Tìm và chọn bác sĩ phù hợp, sau đó đặt lịch khám chỉ với vài bước
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Input
          placeholder="Tìm theo tên bác sĩ..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 280 }}
          allowClear
        />
        <Select
          value={specialty}
          onChange={setSpecialty}
          options={specialtyOptions}
          style={{ minWidth: 220 }}
        />
      </div>

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card>
                <Skeleton avatar active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filteredDoctors.length === 0 ? (
        <Empty
          description={
            doctors.length === 0
              ? 'Chưa có bác sĩ nào trong hệ thống'
              : 'Không tìm thấy bác sĩ phù hợp'
          }
          style={{ marginTop: 48 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredDoctors.map((doctor) => (
            <Col xs={24} sm={12} lg={8} key={doctor.id}>
              <Card hoverable>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <Avatar
                    size={56}
                    src={doctor.avatar_url || undefined}
                    icon={<UserOutlined />}
                    style={{ background: '#2563eb', flexShrink: 0 }}
                  />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      BS. {doctor.full_name}
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      {doctor.specialty ? (
                        <Tag color="blue">{doctor.specialty}</Tag>
                      ) : (
                        <Tag>Chưa cập nhật chuyên khoa</Tag>
                      )}
                    </div>
                  </div>
                </div>

                {typeof doctor.experience_years === 'number' && (
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                    {doctor.experience_years} năm kinh nghiệm
                  </Text>
                )}

                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 12, fontSize: 13, minHeight: 40 }}
                >
                  {doctor.bio || 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}
                </Paragraph>

                {doctor.phone && (
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                    <PhoneOutlined /> {doctor.phone}
                  </Text>
                )}

                <Link href={`/booking?doctorId=${doctor.id}`}>
                  <Button type="primary" icon={<CalendarOutlined />} block>
                    Đặt lịch khám
                  </Button>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </PageLayout>
  )
}
