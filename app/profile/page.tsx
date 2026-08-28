'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, message, Tabs } from 'antd'
import { UserOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons'
import PageLayout from '../../components/PageLayout'
import { getCurrentUser, updateProfile, changePassword } from '../../lib/auth'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [infoForm] = Form.useForm()
  const [passForm] = Form.useForm()
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)

  useEffect(() => {
    const load = async () => {
      const current = await getCurrentUser()
      if (!current) {
        message.warning('Vui lòng đăng nhập')
        router.push('/login')
        return
      }
      setUser(current)
      infoForm.setFieldsValue({ full_name: current.full_name, phone: current.phone, email: current.email })
    }
    load()
  }, [])

  const onUpdateInfo = async (values: { full_name: string; phone: string }) => {
    if (!user) return
    setLoadingInfo(true)
    try {
      await updateProfile(user.id, values)
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

  if (!user) return <PageLayout><p>Đang tải...</p></PageLayout>

  return (
    <PageLayout>
      <h1>Hồ sơ cá nhân</h1>
      <Tabs
        items={[
          {
            key: 'info',
            label: 'Thông tin cá nhân',
            children: (
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
            ),
          },
          {
            key: 'password',
            label: 'Đổi mật khẩu',
            children: (
              <Form form={passForm} layout="vertical" onFinish={onChangePassword} style={{ maxWidth: 420 }}>
                <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
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
    </PageLayout>
  )
}