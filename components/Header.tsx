'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout, Button, Avatar, Dropdown, Tag } from 'antd'
import { HeartFilled, UserOutlined, LogoutOutlined, CrownOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { getCurrentUser, logoutUser } from '../lib/auth'

const { Header: AntHeader } = Layout

const roleLabel: Record<string, string> = {
  admin: 'Quản trị viên',
  doctor: 'Bác sĩ',
  patient: 'Bệnh nhân',
}

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    router.push('/dashboard')
  }

  const menuItems = [
    { key: 'profile', label: <Link href="/profile">Hồ sơ của tôi</Link>, icon: <UserOutlined /> },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout },
  ]

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
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ background: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HeartFilled style={{ color: '#2563eb', fontSize: 18 }} />
        </div>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Medicare</span>
      </Link>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user.role === 'admin' && (
            <Tag icon={<CrownOutlined />} color="gold">
              Admin
            </Tag>
          )}
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#fff' }}>
              <Avatar icon={<UserOutlined />} style={{ background: '#fff', color: '#2563eb' }} />
              <div style={{ lineHeight: 1.2 }}>
                <div>{user.full_name || user.email}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{roleLabel[user.role] || 'Thành viên'}</div>
              </div>
            </div>
          </Dropdown>
        </div>
      ) : (
        <Link href="/login">
          <Button type="primary" ghost style={{ borderColor: '#fff', color: '#fff' }}>
            Đăng nhập
          </Button>
        </Link>
      )}
    </AntHeader>
  )
}