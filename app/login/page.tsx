'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, message, Card } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { loginUser } from '../../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      await loginUser(values.email, values.password)
      message.success('Đăng nhập thành công')
      router.push('/dashboard')
    } catch (err: any) {
      message.error(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

 return (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f5ff', position: 'relative' }}>
    <Link href="/" style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb' }}>
      <ArrowLeftOutlined /> Về trang chủ
    </Link>
    <Card style={{ width: 400 }} title="Đăng nhập HEALTHCONNECT">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined />} placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}