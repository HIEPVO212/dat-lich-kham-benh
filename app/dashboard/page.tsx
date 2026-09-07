'use client'

import { useEffect, useState } from 'react'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'
import { getAppointmentsTrend, type AppointmentTrendPoint } from '../../lib/appointments'
import { getDoctorCountBySpecialty, type SpecialtyDoctorCount } from '../../lib/doctors'
import { Card, Spin, Alert, message } from 'antd'
import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  TeamOutlined,
} from '@ant-design/icons'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'

type Counts = { total: number; confirmed: number; pending: number; cancelled: number; doctors: number }

const SPECIALTY_COLORS = [
  '#2563eb', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#f97316',
]

const cardBaseStyle: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid rgba(37, 99, 235, 0.08)',
  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.05)',
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<Counts>({ total: 0, confirmed: 0, pending: 0, cancelled: 0, doctors: 0 })
  const [specialtyData, setSpecialtyData] = useState<SpecialtyDoctorCount[]>([])
  const [trendData, setTrendData] = useState<AppointmentTrendPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsResult, specialties, trend] = await Promise.all([
          supabase.from('dashboard_stats').select('*').single(),
          getDoctorCountBySpecialty(),
          getAppointmentsTrend(7),
        ])
        if (statsResult.error) throw statsResult.error
        const data = statsResult.data

        setCounts({
          total: data.total_appointments,
          confirmed: data.confirmed_appointments,
          pending: data.pending_appointments,
          cancelled: data.cancelled_appointments,
          doctors: data.total_doctors,
        })
        setSpecialtyData(specialties.slice(0, 8))
        setTrendData(trend)
      } catch (loadError) {
        const errorMessage = loadError instanceof Error ? loadError.message : 'Không tải được dữ liệu tổng quan'
        setError(errorMessage)
        message.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const statCards = [
    { key: 'total', label: 'Tổng lịch hẹn', value: counts.total, icon: <CalendarOutlined />, color: '#2563eb', bg: '#eff6ff' },
    { key: 'confirmed', label: 'Đã duyệt', value: counts.confirmed, icon: <CheckCircleFilled />, color: '#22c55e', bg: '#f0fdf4' },
    { key: 'pending', label: 'Chờ xác nhận', value: counts.pending, icon: <ClockCircleFilled />, color: '#f59e0b', bg: '#fffbeb' },
    { key: 'cancelled', label: 'Đã hủy', value: counts.cancelled, icon: <CloseCircleFilled />, color: '#ef4444', bg: '#fef2f2' },
    { key: 'doctors', label: 'Bác sĩ', value: counts.doctors, icon: <TeamOutlined />, color: '#8b5cf6', bg: '#f5f3ff' },
  ]

  const statusData = [
    { name: 'Đã duyệt', value: counts.confirmed, color: '#22c55e' },
    { name: 'Chờ xác nhận', value: counts.pending, color: '#f59e0b' },
    { name: 'Đã hủy', value: counts.cancelled, color: '#ef4444' },
  ]
  const hasStatusData = statusData.some((item) => item.value > 0)

  const trendChartData = trendData.map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
  }))

  return (
    <PageLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Tổng Quan Hệ Thống</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Số liệu hoạt động đặt lịch khám và đội ngũ bác sĩ toàn hệ thống.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} showIcon />
      ) : (
        <>
          {/* KPI cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              marginBottom: 20,
            }}
          >
            {statCards.map((stat) => (
              <Card key={stat.key} style={cardBaseStyle} styles={{ body: { padding: 20 } }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      color: stat.color,
                      background: stat.bg,
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts row 1: status donut + specialty bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.6fr)',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <Card title="Trạng thái lịch hẹn" style={cardBaseStyle}>
              {hasStatusData ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: ValueType | undefined, name: NameType | undefined) => [
                          `${value} lịch hẹn`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
                    {statusData.map((item) => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                        {item.name} ({item.value})
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Chưa có lịch hẹn nào</div>
              )}
            </Card>

            <Card title="Bác sĩ theo chuyên khoa" style={cardBaseStyle}>
              {specialtyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(220, specialtyData.length * 34)}>
                  <BarChart data={specialtyData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis
                      type="category"
                      dataKey="specialty_name"
                      width={130}
                      tick={{ fontSize: 12, fill: '#334155' }}
                    />
                    <Tooltip formatter={(value: ValueType | undefined) => [`${value} bác sĩ`, 'Số lượng']} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                      {specialtyData.map((entry, index) => (
                        <Cell key={entry.specialty_name} fill={SPECIALTY_COLORS[index % SPECIALTY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu bác sĩ</div>
              )}
            </Card>
          </div>

          {/* Trend area chart */}
          <Card title="Lịch hẹn được đặt trong 7 ngày qua" style={cardBaseStyle}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendChartData} margin={{ left: -12, right: 16, top: 8 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value: ValueType | undefined) => [`${value} lịch hẹn`, 'Số lượt đặt']} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#trendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </PageLayout>
  )
}