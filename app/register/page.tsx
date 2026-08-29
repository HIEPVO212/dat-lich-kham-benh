'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, message, Card } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { registerUser } from '../../lib/auth'
import { ArrowLeftOutlined } from '@ant-design/icons'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await registerUser({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })
      message.success('Đăng ký thành công, mời đăng nhập')
      router.push('/login')
    } catch (err: any) {
      message.error(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

return (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f5ff', position: 'relative' }}>
    <Link href="/" style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb' }}>
      <ArrowLeftOutlined /> Về trang chủ
    </Link>
    <Card style={{ width: 420 }} title="Đăng ký tài khoản">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="full_name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined />} placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Nhập lại mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}