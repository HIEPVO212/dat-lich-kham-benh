'use client'
import PageLayout from '../../components/PageLayout'
import { Form, Input, Button, message } from 'antd'
import { CONTACT_INFO } from '../../lib/contact'

export default function ContactPage() {
  const onFinish = (values: any) => {
    console.log(values)
    message.success('Cảm ơn bạn đã liên hệ, chúng tôi sẽ phản hồi sớm nhất!')
  }

  return (
    <PageLayout>
      <h1>Liên hệ</h1>
      <p>Email: {CONTACT_INFO.email} — Hotline: {CONTACT_INFO.hotline}</p>
      <p>Địa chỉ: {CONTACT_INFO.address}</p>
      <Form layout="vertical" onFinish={onFinish} style={{ maxWidth: 420, marginTop: 24 }}>
        <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="message" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Gửi liên hệ
        </Button>
      </Form>
    </PageLayout>
  )
}