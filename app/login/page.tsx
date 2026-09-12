'use client'

import React, { useState } from 'react'
import { Form, Input, Button, message, Divider } from 'antd'
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  GoogleOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // Đăng nhập bằng Email/SĐT và Mật khẩu
  async function handleLogin(values: any) {
    setLoading(true)
    try {
      const input = values.account.trim()
      const email = input.includes('@') ? input : `${input.replace(/\s+/g, '')}@healthconnect.vn`

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: values.password,
      })

      if (error) {
        throw new Error('Email/Số điện thoại hoặc mật khẩu không chính xác')
      }

      message.success('Đăng nhập thành công!')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err)
      message.error(err.message || 'Đăng nhập thất bại!')
    } finally {
      setLoading(false)
    }
  }

  // Đăng nhập với Google
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
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Chào mừng trở lại
          </h2>
          <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 6, margin: 0 }}>
            Đăng nhập vào hệ thống y tế HealthConnect
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleLogin} requiredMark={false}>
          <Form.Item
            name="account"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Email hoặc Số điện thoại</span>}
            rules={[{ required: true, message: 'Vui lòng nhập Email hoặc Số điện thoại' }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
              placeholder="name@gmail.com hoặc 0912..."
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Mật khẩu</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Nhập mật khẩu của bạn"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

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
            Đăng nhập
          </Button>
        </Form>

        <Divider plain style={{ color: '#94a3b8', fontSize: 12, margin: '20px 0' }}>
          hoặc
        </Divider>

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
          Đăng nhập với Google
        </Button>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5, color: '#64748b' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  )
}