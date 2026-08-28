'use client'
import { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { getCurrentUser } from '../lib/auth'

const { Sider } = Layout

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then((u) => setRole(u?.role || null))
  }, [])

  const items = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: <Link href="/dashboard">Tổng quan</Link> },
    { key: '/booking', icon: <CalendarOutlined />, label: <Link href="/booking">Đặt lịch khám</Link> },
    { key: '/doctors', icon: <TeamOutlined />, label: <Link href="/doctors">Bác sĩ</Link> },
    { key: '/appointments', icon: <FileTextOutlined />, label: <Link href="/appointments">Lịch hẹn</Link> },
    { key: '/profile', icon: <UserOutlined />, label: <Link href="/profile">Hồ sơ</Link> },
    ...(role === 'admin'
      ? [{ key: '/admin', icon: <SettingOutlined />, label: <Link href="/admin">Quản lý</Link> }]
      : []),
  ]

  return (
    <Sider width={230} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <Menu mode="inline" defaultSelectedKeys={['/dashboard']} items={items} style={{ height: '100%', borderRight: 0, paddingTop: 12, fontSize: 15 }} />
    </Sider>
  )
}