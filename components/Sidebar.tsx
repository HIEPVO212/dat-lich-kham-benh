'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  PhoneOutlined,
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons'

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

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // Tự động kiểm tra độ rộng màn hình bằng JavaScript, không lo Tailwind bị đè!
  useEffect(() => {
    function checkWidth() {
      setIsMobile(window.innerWidth < 1024)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  // Nếu màn hình hẹp (chia đôi màn hình, iPad, điện thoại) -> BIẾN MẤT HOÀN TOÀN KHÔNG RÁC GIAO DIỆN
  if (isMobile) {
    return null
  }

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        minHeight: 'calc(100vh - 64px)',
        padding: '16px 10px',
        position: 'sticky',
        top: 64,
        alignSelf: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {menuItems.map((item) => {
          const isActive =
            item.key === '/' ? pathname === '/' : pathname.startsWith(item.key)

          return (
            <Link
              key={item.key}
              href={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#2563eb' : '#475569',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}