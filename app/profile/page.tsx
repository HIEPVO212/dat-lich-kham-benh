'use client'

import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Avatar, message, Tag, Spin, Upload } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'
type UserProfile = {
  id: string
  email: string | null | undefined
  fullName: string
  phone: string
  avatarUrl: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          message.warning('Vui lòng đăng nhập để xem hồ sơ')
          router.push('/login')
          return
        }

        const user = session.user
        const email = user.email?.toLowerCase()

        // Lấy thông tin từ bảng users
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        const role =
          email === 'hiepvo212600@gmail.com'
            ? 'admin'
            : dbUser?.role || user.user_metadata?.role || 'user'

        const fullName =
          dbUser?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ''

        const phone = dbUser?.phone || user.user_metadata?.phone || ''

        setUserProfile({
          id: user.id,
          email: user.email,
          fullName,
          phone,
          avatarUrl: dbUser?.avatar_url || user.user_metadata?.avatar_url || '',
          role,
        })

        form.setFieldsValue({
          fullName,
          email: user.email,
          phone,
        })
      } catch (err) {
        console.error('Lỗi load profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, form])

  async function handleSave(values: { fullName: string; phone?: string }) {
    setSaving(true)
    try {
      if (!userProfile?.id) return

      let avatarUrl = userProfile.avatarUrl
      if (pendingAvatarFile) {
        const fileExt = pendingAvatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filePath = `profiles/${userProfile.id}/${Date.now()}.${fileExt}`
        let uploadError
        for (let attempt = 0; attempt < 2; attempt += 1) {
          const result = await supabase.storage.from('avatars').upload(filePath, pendingAvatarFile, {
            cacheControl: '3600',
            contentType: pendingAvatarFile.type,
            upsert: true,
          })
          uploadError = result.error
          if (!uploadError || String(uploadError.statusCode) !== '520') break
        }

        if (uploadError) throw uploadError
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl
      }

      // Lưu hồ sơ trong Auth metadata để không phụ thuộc schema users tùy môi trường.
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: values.fullName,
          phone: values.phone,
          avatar_url: avatarUrl || null,
        },
      })
      if (metadataError) throw metadataError

      message.success('Cập nhật thông tin hồ sơ thành công!')
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              fullName: values.fullName,
              phone: values.phone || '',
              avatarUrl,
            }
          : prev,
      )
      setPendingAvatarFile(null)
      setAvatarPreviewUrl('')
    } catch (err) {
      console.error('Lỗi lưu profile:', err)
      const saveError = err as { message?: string; details?: string }
      message.error('Không thể cập nhật hồ sơ: ' + (saveError.message || saveError.details || 'Vui lòng thử lại'))
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadAvatar(file: File) {
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn tệp hình ảnh')
      return false
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Ảnh đại diện không được vượt quá 5MB')
      return false
    }

    try {
      if (!userProfile?.id) throw new Error('Không tìm thấy người dùng hiện tại')

      setPendingAvatarFile(file)
      setAvatarPreviewUrl(URL.createObjectURL(file))
      message.info('Đã chọn ảnh. Bấm "Lưu thay đổi" để cập nhật.')
    } catch (err) {
      console.error('Lỗi chọn ảnh đại diện:', err)
      message.error(err instanceof Error ? err.message : 'Không thể chọn ảnh')
    }

    return false
  }

  if (loading) {
    return (
      <PageLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Đang tải hồ sơ..." />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 12px' }}>
        <Card
          style={{
            borderRadius: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Header Hồ sơ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              paddingBottom: 24,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                size={72}
                src={avatarPreviewUrl || userProfile?.avatarUrl}
                icon={<UserOutlined />}
                style={{
                  backgroundColor:
                    userProfile?.role === 'admin'
                      ? '#f59e0b'
                      : userProfile?.role === 'member'
                      ? '#10b981'
                      : '#0284c7',
                  fontSize: 32,
                }}
              />
              <Upload
                beforeUpload={handleUploadAvatar}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<UploadOutlined />}
                  aria-label="Tải ảnh đại diện"
                  title="Tải ảnh đại diện"
                  style={{ position: 'absolute', right: -4, bottom: -2 }}
                />
              </Upload>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                  {userProfile?.fullName || 'Hồ sơ người dùng'}
                </h2>
                {userProfile?.role === 'admin' && (
                  <Tag icon={<CrownOutlined />} color="gold" style={{ borderRadius: 10 }}>
                    Quản trị viên
                  </Tag>
                )}
                {userProfile?.role === 'member' && (
                  <Tag icon={<SafetyCertificateOutlined />} color="green" style={{ borderRadius: 10 }}>
                    Thành viên
                  </Tag>
                )}
                {userProfile?.role === 'user' && (
                  <Tag color="blue" style={{ borderRadius: 10 }}>
                    Người dùng
                  </Tag>
                )}
              </div>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13.5 }}>
                {userProfile?.email}
              </p>
            </div>
          </div>

          {/* Form chỉnh sửa */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
              Thông tin cá nhân
            </h3>

            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item
                name="fullName"
                label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                  size="large"
                  placeholder="Nhập họ và tên"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 600 }}>Email (Tài khoản)</span>}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                  size="large"
                  disabled
                  style={{ borderRadius: 10, backgroundColor: '#f8fafc', color: '#64748b' }}
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 600 }}>Số điện thoại liên hệ</span>}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                  size="large"
                  placeholder="Nhập số điện thoại của bạn"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  size="large"
                  style={{
                    backgroundColor: '#0284c7',
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: '0 24px',
                  }}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}