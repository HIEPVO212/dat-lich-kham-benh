'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, message, Tabs, Upload, Avatar } from 'antd'
import { UserOutlined, PhoneOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons'
import PageLayout from '../../components/PageLayout'
import { updateProfile, changePassword, uploadAvatar } from '../../lib/auth'
import { useAuth } from '../../lib/AuthContext'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const [infoForm] = Form.useForm()
  const [passForm] = Form.useForm()
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      message.warning('Vui lòng đăng nhập')
      router.push('/login')
      return
    }
    if (user) {
      infoForm.setFieldsValue({
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
      })
    }
  }, [user, loading, router, infoForm])

  const onUpdateInfo = async (values: { full_name: string; phone: string }) => {
    if (!user?.id) return
    setLoadingInfo(true)
    try {
      await updateProfile(user.id, values)
      await refreshUser()
      message.success('Cập nhật thông tin thành công')
    } catch (err: any) {
      message.error(err.message || 'Cập nhật thất bại')
    } finally {
      setLoadingInfo(false)
    }
  }

  const onChangePassword = async (values: { newPassword: string }) => {
    setLoadingPass(true)
    try {
      await changePassword(values.newPassword)
      message.success('Đổi mật khẩu thành công')
      passForm.resetFields()
    } catch (err: any) {
      message.error(err.message || 'Đổi mật khẩu thất bại')
    } finally {
      setLoadingPass(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) {
      message.error('Vui lòng đăng nhập tài khoản chính thức để đổi avatar')
      return false
    }
    setUploadingAvatar(true)
    try {
      await uploadAvatar(user.id, file)
      message.success('Cập nhật ảnh đại diện thành công!')
      await refreshUser() // Cập nhật state toàn cục -> Header tự động đổi avatar tức thì
    } catch (err: any) {
      message.error(err.message || 'Upload ảnh thất bại')
    } finally {
      setUploadingAvatar(false)
    }
    return false
  }

  if (loading || !user) {
    return (
      <PageLayout>
        <p style={{ padding: 24 }}>Đang tải thông tin hồ sơ...</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Hồ sơ cá nhân</h1>

        <Tabs
          items={[
            {
              key: 'info',
              label: 'Thông tin cá nhân',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
                    <Avatar
                      size={72}
                      src={user.avatar_url}
                      icon={!user.avatar_url && <UserOutlined />}
                      style={{ background: '#1d4ed8' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Ảnh đại diện</div>
                      <Upload
                        beforeUpload={handleAvatarUpload}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button icon={<UploadOutlined />} loading={uploadingAvatar}>
                          Tải ảnh mới lên
                        </Button>
                      </Upload>
                    </div>
                  </div>

                  <Form form={infoForm} layout="vertical" onFinish={onUpdateInfo} style={{ maxWidth: 420 }}>
                    <Form.Item name="email" label="Email">
                      <Input disabled prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item name="full_name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loadingInfo}>
                        Lưu thay đổi
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ),
            },
            {
              key: 'password',
              label: 'Đổi mật khẩu',
              children: (
                <Form form={passForm} layout="vertical" onFinish={onChangePassword} style={{ maxWidth: 420 }}>
                  <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item
                    name="confirmNew"
                    label="Xác nhận mật khẩu mới"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Nhập lại mật khẩu mới' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loadingPass}>
                      Đổi mật khẩu
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </div>
    </PageLayout>
  )
}