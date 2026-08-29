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
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sidebar />
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}