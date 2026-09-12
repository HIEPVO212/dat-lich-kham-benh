'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Drawer, Avatar, Dropdown, MenuProps } from 'antd'
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  AppstoreOutlined,
  PhoneOutlined,
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const menuItems = [
  { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
  { key: '/booking', label: 'Đặt lịch khám', icon: <CalendarOutlined /> },
  { key: '/doctors', label: 'Bác sĩ', icon: <TeamOutlined /> },
  { key: '/appointments', label: 'Lịch hẹn', icon: <ClockCircleOutlined /> },
  { key: '/services', label: 'Dịch vụ', icon: <AppstoreOutlined /> },
  { key: '/contact', label: 'Liên hệ', icon: <PhoneOutlined /> },
  { key: '/profile', label: 'Hồ sơ', icon: <UserOutlined /> },
  { key: '/dashboard', label: 'Tổng quan', icon: <DashboardOutlined /> },
  { key: '/admin', label: 'Quản trị hệ thống', icon: <SettingOutlined /> },
]

export default function Header() {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: 'appointments',
      icon: <ClockCircleOutlined />,
      label: <Link href="/appointments">Lịch hẹn của tôi</Link>,
    },
    {
      key: 'admin',
      icon: <SettingOutlined />,
      label: <Link href="/admin">Quản trị hệ thống</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ]

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#0088cc',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Nút 3 gạch mở menu trên điện thoại / màn hình nhỏ */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <MenuOutlined />
          </button>

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0088cc',
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              ❤
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#fff',
                letterSpacing: 1,
              }}
            >
              HEALTHCONNECT
            </span>
          </Link>
        </div>

        {/* User / Login */}
        <div>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  cursor: 'pointer',
                }}
              >
                <Avatar
                  size={28}
                  src={user.user_metadata?.avatar_url}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#fff', color: '#0088cc' }}
                />
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Người dùng'}
                </span>
              </div>
            </Dropdown>
          ) : (
            <Link
              href="/login"
              style={{
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '6px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {/* Menu dạng trượt cho màn hình nhỏ */}
      <Drawer
        title="HEALTHCONNECT"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{ body: { padding: '12px 8px' } }}
        size="default"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.key}
              onClick={() => setDrawerOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                color: '#334155',
              }}
            >
              <span style={{ fontSize: 18, color: '#0088cc' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </Drawer>
    </>
  )
}