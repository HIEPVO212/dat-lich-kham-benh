'use client'
import { useRouter } from 'next/navigation'
import { Layout, Button, Avatar, Dropdown, Tag } from 'antd'
import { HeartFilled, UserOutlined, LogoutOutlined, CrownOutlined, MenuOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useAuth } from '../lib/AuthContext'

const { Header: AntHeader } = Layout

const roleLabel: Record<string, string> = {
  admin: 'Quản trị viên',
  doctor: 'Bác sĩ',
  patient: 'Bệnh nhân',
}

export default function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/dashboard')
  }

  const toggleMobileMenu = () => {
    window.dispatchEvent(new CustomEvent('healthconnect:toggle-mobile-menu'))
  }

  const menuItems = [
    { key: 'profile', label: <Link href="/profile">Hồ sơ của tôi</Link>, icon: <UserOutlined /> },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout },
  ]

  return (
    <AntHeader
      className="app-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'linear-gradient(90deg, #0891b2, #1d4ed8)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,.12)',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 12,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HeartFilled style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <span className="app-brand-name" style={{ color: '#fff', fontSize: 18, fontWeight: 900, letterSpacing: '0.18em' }}>
          HEALTHCONNECT
        </span>
      </Link>

      <Button
        className="mobile-menu-button"
        type="text"
        icon={<MenuOutlined />}
        aria-label="Mở menu điều hướng"
        onClick={toggleMobileMenu}
      />

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user.role === 'admin' && (
            <Tag icon={<CrownOutlined />} color="gold">
              Admin
            </Tag>
          )}
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#fff' }}>
              <Avatar
                src={user.avatar_url}
                icon={!user.avatar_url && <UserOutlined />}
                style={{ background: '#fff', color: '#1d4ed8' }}
              />
              <div className="app-user-details" style={{ lineHeight: 1.2 }}>
                <div className="app-user-name">{user.full_name || user.email}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  {roleLabel[user.role ?? ''] || 'Thành viên'}
                </div>
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