'use client'

import React, { useState } from 'react'
import { Form, Input, Button, message, Tabs, Divider } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  GoogleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [registerType, setRegisterType] = useState<'email' | 'phone'>('email')
  const [form] = Form.useForm()

  // 1. Đăng ký bằng Email & Mật khẩu
  async function handleRegister(values: any) {
    setLoading(true)
    try {
      const email =
        registerType === 'email'
          ? values.email.trim()
          : `${values.phone.replace(/\s+/g, '')}@healthconnect.vn` // Nếu dùng số điện thoại

      const { data, error } = await supabase.auth.signUp({
        email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            name: values.fullName,
            phone: values.phone || '',
            role: 'user',
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Email này đã được đăng ký tài khoản')
        }
        throw error
      }

      // Tự động thêm vào bảng public.users để đồng bộ thông tin ngay
      if (data.user) {
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email,
            full_name: values.fullName,
            role: 'user',
            status: 'pending',
          })
        } catch (e) {
          console.warn('Lưu users:', e)
        }
      }

      message.success('Đăng ký tài khoản thành công!')

      // Dùng window.location.href để load lại toàn bộ app và header nhận ngay session mới
      window.location.href = '/'
      router.refresh()
    } catch (err: any) {
      console.error('Lỗi đăng ký:', err)
      message.error(err.message || 'Đăng ký thất bại, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  // 2. Đăng nhập / Đăng ký 1 chạm bằng Google
  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      })
      if (error) throw error
    } catch (err: any) {
      message.error('Lỗi đăng nhập Google: ' + err.message)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Nút quay lại */}
      <div style={{ width: '100%', maxWidth: 440, marginBottom: 16 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#0284c7',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          <ArrowLeftOutlined /> Về trang chủ
        </Link>
      </div>

      {/* Card Form Đăng ký */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Tạo tài khoản mới
          </h2>
          <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 6, margin: 0 }}>
            Đăng ký để đặt khám, nhận thông báo và theo dõi hồ sơ sức khỏe
          </p>
        </div>

        {/* Tab chọn hình thức đăng ký */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setRegisterType('email')}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              backgroundColor: registerType === 'email' ? '#ffffff' : 'transparent',
              color: registerType === 'email' ? '#0284c7' : '#64748b',
              boxShadow: registerType === 'email' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setRegisterType('phone')}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              backgroundColor: registerType === 'phone' ? '#ffffff' : 'transparent',
              color: registerType === 'phone' ? '#0284c7' : '#64748b',
              boxShadow: registerType === 'phone' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Số điện thoại
          </button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleRegister} requiredMark={false}>
          {/* Họ và tên */}
          <Form.Item
            name="fullName"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Họ và tên bệnh nhân</span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Ví dụ: Nguyễn Văn An"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          {/* Nếu chọn Email */}
          {registerType === 'email' ? (
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, fontSize: 13 }}>Địa chỉ Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                placeholder="tenban@gmail.com"
                size="large"
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
          ) : (
            /* Nếu chọn Số điện thoại */
            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 600, fontSize: 13 }}>Số điện thoại</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                placeholder="0912 345 678"
                size="large"
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
          )}

          {/* Mật khẩu */}
          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Mật khẩu</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tối thiểu 6 ký tự"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          {/* Nút Đăng ký */}
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            style={{
              width: '100%',
              backgroundColor: '#0284c7',
              borderRadius: 12,
              fontWeight: 600,
              height: 46,
              fontSize: 15,
              marginTop: 6,
            }}
          >
            Đăng ký tài khoản
          </Button>
        </Form>

        <Divider plain style={{ color: '#94a3b8', fontSize: 12, margin: '20px 0' }}>
          hoặc
        </Divider>

        {/* Đăng nhập nhanh với Google */}
        <Button
          icon={<GoogleOutlined style={{ color: '#ea4335' }} />}
          size="large"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            borderRadius: 12,
            fontWeight: 600,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          Tiếp tục với Google
        </Button>

        {/* Chuyển sang Đăng nhập */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5, color: '#64748b' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  )
}