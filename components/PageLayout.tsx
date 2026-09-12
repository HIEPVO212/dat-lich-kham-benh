'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  PhoneOutlined,
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SettingOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { Drawer, Avatar, Dropdown, MenuProps, Button } from 'antd'
import { supabase } from '../lib/supabase'
import { CONTACT_INFO } from '../lib/contact'
import type { User } from '@supabase/supabase-js'

const MENU_ITEMS = [
  { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
  { key: '/booking', label: 'Đặt lịch khám', icon: <CalendarOutlined /> },
  { key: '/doctors', label: 'Bác sĩ', icon: <TeamOutlined /> },
  { key: '/appointments', label: 'Lịch hẹn của tôi', icon: <ClockCircleOutlined /> },
  { key: '/services', label: 'Dịch vụ', icon: <AppstoreOutlined /> },
  { key: '/contact', label: 'Liên hệ', icon: <PhoneOutlined /> },
  { key: '/profile', label: 'Hồ sơ', icon: <UserOutlined /> },
  { key: '/dashboard', label: 'Tổng quan', icon: <DashboardOutlined /> },
  { key: '/admin', label: 'Quản trị hệ thống', icon: <SettingOutlined /> },
]

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState('user')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    async function loadUser(session: { user: User | null } | null) {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (!currentUser) {
        setUserRole('user')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle()

      setUser({
        ...currentUser,
        user_metadata: {
          ...currentUser.user_metadata,
          avatar_url: profile?.avatar_url || currentUser.user_metadata?.avatar_url || '',
        },
      })

      setUserRole(
        currentUser.email?.toLowerCase() === 'hiepvo212600@gmail.com'
          ? 'admin'
          : profile?.role || currentUser.user_metadata?.role || 'user'
      )
    }

    supabase.auth.getSession().then(({ data: { session } }) => loadUser(session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => loadUser(session))

    function checkWidth() {
      setIsMobile(window.innerWidth < 1024)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('resize', checkWidth)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole('user')
    router.push('/')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard" className="font-bold text-blue-600">Trang Quản trị viên</Link>,
    },
    {
      key: 'appointments',
      icon: <ClockCircleOutlined />,
      label: <Link href="/appointments">Lịch hẹn của tôi</Link>,
    },
    {
      key: 'admin',
      icon: <SettingOutlined />,
      label: <Link href="/admin">Quản lý tài khoản</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">Hồ sơ cá nhân</Link>,
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

  const renderNavLinks = (onClickItem?: () => void) => (
    <nav className="flex flex-col gap-1 p-2">
      {MENU_ITEMS.map((item) => {
        const isActive =
          item.key === '/' ? pathname === '/' : pathname.startsWith(item.key)

        return (
          <Link
            key={item.key}
            href={item.key}
            onClick={() => {
              if (onClickItem) onClickItem()
            }}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
              isActive
                ? 'bg-blue-50 text-blue-600 font-bold shadow-sm'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70'
            }`}
          >
            <span className={`text-base ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Đinh Thị Bích Hằng'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* 1. HEADER CỐ ĐỊNH XANH FULL WIDTH */}
      <header className="sticky top-0 z-40 bg-[#1677ff] text-white shadow-sm w-full">
        <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              <MenuOutlined className="text-xl" />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold shadow-inner">
                ❤
              </div>
              <span className="text-lg sm:text-xl font-black tracking-widest text-white uppercase">
                HEALTHCONNECT
              </span>
            </Link>
          </div>

          {/* User Info góc phải */}
          <div className="flex items-center gap-3">
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                  <Avatar
                    size={36}
                    src={user.user_metadata?.avatar_url}
                    icon={<UserOutlined />}
                    className="bg-white text-[#1677ff] shadow-sm"
                  />
                  <div className="text-left leading-tight hidden sm:block">
                    <div className="text-sm font-bold text-white truncate max-w-[150px]">
                      {userName}
                    </div>
                    <div className="text-xs text-blue-100 font-normal">
                      {userRole === 'admin'
                        ? 'Quản trị viên'
                        : userRole === 'member'
                        ? 'Thành viên'
                        : 'Người dùng'}
                    </div>
                  </div>
                </div>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 rounded-lg border border-white/20 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-block px-3.5 py-1.5 text-sm font-semibold text-[#1677ff] bg-white rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. PHẦN THÂN WEB: GỒM SIDEBAR + NỘI DUNG CHÍNH */}
      <div className="flex-1 flex w-full">
        {!isMobile && (
          <aside className="w-56 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] sticky top-16 self-start">
            <div className="sticky top-16 py-3">
              {renderNavLinks()}
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0 w-full overflow-x-hidden pb-12">
          {children}
        </main>
      </div>

      {/* 3. FOOTER NẰM DƯỚI CÙNG TRÀN 100% TOÀN BỘ MÀN HÌNH (FULL WIDTH TỪ TRÁI SANG PHẢI) */}
      <footer className="w-full bg-[#0c1527] text-white border-t border-slate-800">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
            {/* Cột 1: Logo & Giới thiệu */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center text-xl font-black shadow-md">
                  ❤
                </div>
                <span className="text-xl font-black text-white tracking-wider uppercase">
                  HEALTHCONNECT
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                Nền tảng kết nối bệnh nhân và bác sĩ, giúp việc đặt lịch khám trở nên đơn giản và thuận tiện.
              </p>
            </div>

            {/* Cột 2: Về HEALTHCONNECT */}
            <div className="md:col-span-3">
              <h3 className="text-base font-bold text-white mb-4">
                Về HEALTHCONNECT
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Điều khoản sử dụng
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 3: Liên kết nhanh */}
            <div className="md:col-span-2">
              <h3 className="text-base font-bold text-white mb-4">
                Liên kết nhanh
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="/doctors" className="hover:text-white transition-colors">
                    Bác sĩ
                  </Link>
                </li>
                <li>
                  <Link href="/specialties" className="hover:text-white transition-colors">
                    Chuyên khoa
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="hover:text-white transition-colors">
                    Đặt lịch khám
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 4: Thông tin liên hệ */}
            <div className="md:col-span-3">
              <h3 className="text-base font-bold text-white mb-4">
                Thông tin liên hệ
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <PhoneOutlined className="text-slate-400 text-base" />
                  <span>Hotline: {CONTACT_INFO.hotline}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <MailOutlined className="text-slate-400 text-base" />
                  <span>Email: {CONTACT_INFO.email}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <EnvironmentOutlined className="text-slate-400 text-base mt-0.5" />
                  <span className="leading-snug">Địa chỉ: {CONTACT_INFO.address}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Dòng bản quyền dưới cùng căn giữa */}
          <div className="pt-8 border-t border-slate-800/80 text-center text-xs sm:text-sm text-slate-400">
            © 2026 HEALTHCONNECT. Mọi quyền được bảo lưu.
          </div>
        </div>
      </footer>

      {/* DRAWER CHO MOBILE */}
      <Drawer
        title={
          <div className="flex items-center gap-2 text-[#1677ff] font-black text-base">
            <span>❤</span> HEALTHCONNECT
          </div>
        }
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="py-2">
            {renderNavLinks(() => setMobileOpen(false))}
          </div>

          {user && (
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <Button
                danger
                block
                icon={<LogoutOutlined />}
                onClick={() => {
                  setMobileOpen(false)
                  handleLogout()
                }}
              >
                Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}