'use client'
import { Layout, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'

const { Content } = Layout

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f9ff 0%, #eef6ff 100%)' }}>
      <Header />
      <Layout style={{ background: 'transparent' }}>
        <Sidebar />
        <Content
          style={{
            margin: 20,
            padding: 26,
            background: 'rgba(255,255,255,0.8)',
            borderRadius: 22,
            border: '1px solid rgba(37, 99, 235, 0.08)',
            boxShadow: '0 12px 30px rgba(37, 99, 235, 0.06)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{
              marginBottom: 18,
              borderRadius: 10,
              background: '#eff6ff',
              borderColor: '#bfdbfe',
              color: '#1d4ed8',
              fontWeight: 600,
            }}
          >
            Quay lại
          </Button>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}