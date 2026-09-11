'use client'
import { Drawer, Layout, Menu } from 'antd'
import { useEffect, useState } from 'react'
import {
  HomeOutlined,
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const { Sider } = Layout

const items = [
  { key: '/', icon: <HomeOutlined />, label: <Link href="/">Trang chủ</Link> },
  { key: '/booking', icon: <CalendarOutlined />, label: <Link href="/booking">Đặt lịch khám</Link> },
  { key: '/doctors', icon: <TeamOutlined />, label: <Link href="/doctors">Bác sĩ</Link> },
  { key: '/appointments', icon: <FileTextOutlined />, label: <Link href="/appointments">Lịch hẹn</Link> },
  { key: '/services', icon: <MedicineBoxOutlined />, label: <Link href="/services">Dịch vụ</Link> },
  { key: '/contact', icon: <PhoneOutlined />, label: <Link href="/contact">Liên hệ</Link> },
  { key: '/profile', icon: <UserOutlined />, label: <Link href="/profile">Hồ sơ</Link> },
  { key: '/dashboard', icon: <DashboardOutlined />, label: <Link href="/dashboard">Tổng quan</Link> },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const toggleMobileMenu = () => setMobileOpen((open) => !open)
    window.addEventListener('healthconnect:toggle-mobile-menu', toggleMobileMenu)
    return () => window.removeEventListener('healthconnect:toggle-mobile-menu', toggleMobileMenu)
  }, [])

  const navigationMenu = (
    <Menu
      mode="inline"
      selectedKeys={[pathname]}
      items={items}
      style={{ height: '100%', borderRight: 0, paddingTop: 12, fontSize: 15 }}
      onClick={() => setMobileOpen(false)}
    />
  )

  return (
    <>
    <Sider
      className="app-sidebar"
      width={230}
      breakpoint="md"
      collapsedWidth={0}
      style={{
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)',
        alignSelf: 'flex-start',
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'auto',
      }}
    >
      {navigationMenu}
    </Sider>
    <Drawer
      className="mobile-navigation-drawer"
      title="Menu HEALTHCONNECT"
      placement="left"
      width={230}
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      styles={{ body: { padding: 0 } }}
    >
      {navigationMenu}
    </Drawer>
    </>
  )
}