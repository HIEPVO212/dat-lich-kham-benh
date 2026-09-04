'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Alert, Button, Card, Form, Input, Segmented, Typography, message } from 'antd'
import { ArrowLeftOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { createDemoAuthSession, sendOtp, verifyOtp } from '../../lib/auth'

const { Title, Text } = Typography

type Method = 'email' | 'phone' | 'cccd'

type RegisterValues = { full_name: string; email?: string; phone?: string; cccd?: string }

export default function RegisterPage() {
  const router = useRouter()
  const [method, setMethod] = useState<Method>('email')
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [values, setValues] = useState<RegisterValues | null>(null)
  const [loading, setLoading] = useState(false)
  const [demoCode, setDemoCode] = useState('')
  const [form] = Form.useForm<RegisterValues>()

  const handleSendOtp = async (nextValues: RegisterValues) => {
    setLoading(true)
    try {
      const value = method === 'email' ? nextValues.email || '' : method === 'cccd' ? nextValues.cccd || '' : nextValues.phone || ''
      const result = await sendOtp({ method, value, full_name: nextValues.full_name, phone: nextValues.phone })
      setValues(nextValues)
      setDemoCode(result.demoCode || '')
      setStep('otp')
      message.success(method === 'email' ? 'Mã OTP đã gửi tới email' : 'Mã OTP đã gửi tới số điện thoại')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không gửi được mã OTP')
    } finally { setLoading(false) }
  }

  const handleVerify = async ({ otp }: { otp: string }) => {
    if (!values) return
    setLoading(true)
    try {
      const value = method === 'email' ? values.email || '' : method === 'cccd' ? values.cccd || '' : values.phone || ''
      await verifyOtp({ method, value, phone: values.phone, token: otp })
      if (method !== 'email') await createDemoAuthSession({ full_name: values.full_name, phone: values.phone, cccd: values.cccd })
      message.success('Đăng ký thành công')
      router.push('/dashboard')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Mã OTP không đúng hoặc đã hết hạn')
    } finally { setLoading(false) }
  }

  const methodLabel = method === 'email' ? 'Gmail' : method === 'phone' ? 'Số điện thoại' : 'CCCD'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', padding: 20 }}>
      <Link href="/" style={{ position: 'fixed', top: 24, left: 24, color: '#2563eb', fontSize: 16 }}><ArrowLeftOutlined /> Về trang chủ</Link>
      <Card style={{ width: '100%', maxWidth: 460, borderRadius: 18 }}>
        <Title level={2} style={{ marginTop: 0 }}>Tạo tài khoản</Title>
        <Text type="secondary">Đăng ký nhanh bằng một mã OTP, không cần nhớ mật khẩu.</Text>
        {step === 'details' ? (
          <>
            <Segmented
              block
              value={method}
              onChange={(value) => { setMethod(value as Method); form.resetFields(['email', 'phone', 'cccd']) }}
              options={[{ label: 'Gmail', value: 'email' }, { label: 'Số điện thoại', value: 'phone' }, { label: 'CCCD', value: 'cccd' }]}
              style={{ margin: '24px 0' }}
            />
            <Form form={form} layout="vertical" onFinish={handleSendOtp} requiredMark="optional">
              <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                <Input size="large" prefix={<UserOutlined />} placeholder="Nguyễn Văn An" />
              </Form.Item>
              {method === 'email' && <Form.Item name="email" label="Gmail" rules={[{ required: true, message: 'Vui lòng nhập Gmail' }, { type: 'email', message: 'Gmail không hợp lệ' }]}><Input size="large" prefix={<MailOutlined />} placeholder="ten@gmail.com" /></Form.Item>}
              {method === 'phone' && <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}><Input size="large" prefix={<PhoneOutlined />} placeholder="0912 345 678" /></Form.Item>}
              {method === 'cccd' && <><Form.Item name="cccd" label="Số CCCD" rules={[{ required: true, len: 12, message: 'CCCD gồm 12 số' }]}><Input size="large" prefix={<IdcardOutlined />} inputMode="numeric" placeholder="Nhập 12 số CCCD" /></Form.Item><Form.Item name="phone" label="Số điện thoại nhận OTP" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}><Input size="large" prefix={<PhoneOutlined />} placeholder="0912 345 678" /></Form.Item><Alert type="info" showIcon message="CCCD dùng để nhận diện tài khoản; mã OTP sẽ gửi qua số điện thoại." /></>}
              <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ marginTop: 20 }}>Gửi mã OTP</Button>
            </Form>
          </>
        ) : (
          <Form layout="vertical" onFinish={handleVerify} style={{ marginTop: 24 }}>
            <Alert
              type="info"
              showIcon
              message={demoCode ? `Mã OTP demo: ${demoCode}` : `Nhập mã OTP đã gửi qua ${methodLabel}`}
              description={demoCode ? 'Đây là chế độ mô phỏng, không gửi SMS thật.' : undefined}
            />
            <Form.Item name="otp" label="Mã OTP" rules={[{ required: true, len: 6, message: 'Nhập đủ 6 số OTP' }]} style={{ marginTop: 20 }}>
              <Input size="large" inputMode="numeric" maxLength={6} placeholder="000000" autoFocus />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>Xác nhận đăng ký</Button>
            <Button type="link" block onClick={() => setStep('details')}>Đổi thông tin hoặc gửi lại mã</Button>
          </Form>
        )}
        <div style={{ textAlign: 'center', marginTop: 20 }}>Đã có tài khoản? <Link href="/login">Đăng nhập</Link></div>
      </Card>
    </div>
  )
}
