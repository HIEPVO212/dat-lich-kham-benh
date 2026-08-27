'use client'
import { Layout, Button } from 'antd'
import { HeartFilled } from '@ant-design/icons'
import Link from 'next/link'

const { Header: AntHeader } = Layout

export default function Header() {
  return (
    <AntHeader
      style={{
        background: 'linear-gradient(90deg, #0ea5e9, #2563eb)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,.12)',
      }}
    >
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ background: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HeartFilled style={{ color: '#2563eb', fontSize: 18 }} />
        </div>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Medicare</span>
      </Link>

<Link href="/login">
  <Button type="primary" ghost style={{ borderColor: '#fff', color: '#fff' }}>
    Đăng nhập
  </Button>
</Link>
    </AntHeader>
  )
}