'use client'
import { Layout, Menu } from 'antd'
import {
  HomeOutlined,
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const { Sider } = Layout

const items = [
  { key: '/', icon: <HomeOutlined />, label: <Link href="/">Trang chủ</Link> },
  { key: '/booking', icon: <CalendarOutlined />, label: <Link href="/booking">Đặt lịch khám</Link> },
  { key: '/doctors', icon: <TeamOutlined />, label: <Link href="/doctors">Bác sĩ</Link> },
  { key: '/appointments', icon: <FileTextOutlined />, label: <Link href="/appointments">Lịch hẹn</Link> },
  { key: '/profile', icon: <UserOutlined />, label: <Link href="/profile">Hồ sơ</Link> },
  { key: '/dashboard', icon: <DashboardOutlined />, label: <Link href="/dashboard">Tổng quan</Link> },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <Sider width={230} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={items}
        style={{ height: '100%', borderRight: 0, paddingTop: 12, fontSize: 15 }}
      />
    </Sider>
  )
}