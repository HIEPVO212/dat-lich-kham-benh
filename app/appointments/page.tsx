'use client'

import PageLayout from '../../components/PageLayout'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const summaryData = [
  { label: 'Tổng lịch hẹn', value: '08', color: '#2563eb' },
  { label: 'Đã xác nhận', value: '05', color: '#10b981' },
  { label: 'Đang chờ', value: '02', color: '#f59e0b' },
  { label: 'Đã hoàn tất', value: '01', color: '#8b5cf6' },
]

const appointments = [
  {
    doctor: 'BS. Nguyễn Thị Lan',
    specialty: 'Da liễu',
    date: '12/09/2026',
    time: '08:30 - 09:00',
    room: 'Phòng 302',
    type: 'Khám định kỳ',
    status: 'Sắp tới',
    color: 'blue',
  },
  {
    doctor: 'BS. Trần Văn Hưng',
    specialty: 'Tim mạch',
    date: '14/09/2026',
    time: '14:00 - 14:30',
    room: 'Phòng 208',
    type: 'Tư vấn',
    status: 'Đã xác nhận',
    color: 'green',
  },
  {
    doctor: 'BS. Phạm Hồng Anh',
    specialty: 'Nhi khoa',
    date: '18/09/2026',
    time: '10:15 - 10:45',
    room: 'Phòng 120',
    type: 'Khám bệnh',
    status: 'Chờ xác nhận',
    color: 'gold',
  },
]

const upcomingCare = [
  'Đặt lịch khám theo dịch vụ ưu tiên',
  'Chuẩn bị hồ sơ sức khỏe trước 15 phút',
  'Liên hệ hotline nếu cần đổi giờ',
]

export default function AppointmentsPage() {
  return (
    <PageLayout>
      <div style={{ display: 'grid', gap: 24 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 35%, #eff6ff 100%)',
            border: '1px solid rgba(37, 99, 235, 0.12)',
            borderRadius: 24,
            padding: '28px 28px 22px',
            boxShadow: '0 12px 28px rgba(37, 99, 235, 0.08)',
          }}
        >
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Space direction="vertical" size={8}>
                <Tag color="blue" style={{ borderRadius: 999, fontWeight: 600, padding: '4px 12px' }}>
                  Lịch hẹn của tôi
                </Tag>
                <Title level={2} style={{ margin: 0, color: '#0f172a' }}>
                  Theo dõi lịch khám bệnh một cách dễ dàng
                </Title>
                <Text type="secondary" style={{ fontSize: 15 }}>
                  Quản lý các cuộc hẹn, thời gian khám và thông tin bác sĩ trong cùng một nơi.
                </Text>
              </Space>
            </Col>
            <Col xs={24} lg={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 12, height: 46 }}>
                Đặt lịch mới
              </Button>
            </Col>
          </Row>
        </div>

        <Row gutter={[16, 16]}>
          {summaryData.map((item) => (
            <Col xs={12} lg={6} key={item.label}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 18,
                  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                }}
              >
                <Statistic
                  title={<span style={{ color: '#64748b', fontWeight: 500 }}>{item.label}</span>}
                  value={item.value}
                  valueStyle={{ color: item.color, fontWeight: 700, fontSize: 28 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#2563eb' }} />
                  <span>Danh sách lịch hẹn</span>
                </Space>
              }
              extra={<Button type="link">Xem tất cả</Button>}
              bordered={false}
              style={{ borderRadius: 22, boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={appointments}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: '18px 12px',
                      borderRadius: 16,
                      marginBottom: 14,
                      background: '#f8fbff',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar size={52} icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }} />
                      }
                      title={
                        <Space size={8} wrap>
                          <Text strong style={{ fontSize: 16 }}>{item.doctor}</Text>
                          <Tag color={item.color}>{item.status}</Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={6} style={{ marginTop: 8 }}>
                          <Text type="secondary">{item.specialty} • {item.type}</Text>
                          <Space size={16} wrap>
                            <Text><CalendarOutlined style={{ color: '#2563eb' }} /> {item.date}</Text>
                            <Text><ClockCircleOutlined style={{ color: '#2563eb' }} /> {item.time}</Text>
                            <Text><EnvironmentOutlined style={{ color: '#2563eb' }} /> {item.room}</Text>
                          </Space>
                        </Space>
                      }
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Button type="primary" ghost style={{ borderRadius: 10 }}>
                        Chi tiết
                      </Button>
                      <Button style={{ borderRadius: 10 }}>Hủy lịch</Button>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#10b981' }} />
                  <span>Chăm sóc sớm</span>
                </Space>
              }
              bordered={false}
              style={{ borderRadius: 22, boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)' }}
            >
              <div style={{ background: '#eff6ff', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <Text strong style={{ fontSize: 16, color: '#1d4ed8' }}>Lịch khám gần nhất</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Space direction="vertical" size={4}>
                  <Text strong>BS. Nguyễn Thị Lan</Text>
                  <Text type="secondary">Thứ hai, 12/09/2026</Text>
                  <Text type="secondary">08:30 - 09:00 • Phòng 302</Text>
                </Space>
              </div>

              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {upcomingCare.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      background: '#f8fafc',
                      borderRadius: 12,
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Badge status="processing" color="#2563eb" />
                    <Text style={{ lineHeight: 1.6 }}>{item}</Text>
                  </div>
                ))}
              </Space>

              <Button type="primary" block style={{ marginTop: 20, borderRadius: 12, height: 42 }}>
                Liên hệ hỗ trợ
              </Button>
            </Card>

            <Card
              title={
                <Space>
                  <PhoneOutlined style={{ color: '#2563eb' }} />
                  <span>Thông tin liên hệ</span>
                </Space>
              }
              bordered={false}
              style={{ marginTop: 24, borderRadius: 22, boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)' }}
            >
              <Space direction="vertical" size={10}>
                <Text><PhoneOutlined style={{ color: '#2563eb', marginRight: 8 }} /> Hotline: 1900 9090</Text>
                <Text><EnvironmentOutlined style={{ color: '#2563eb', marginRight: 8 }} /> 345 Nguyễn Trãi, Hà Nội</Text>
                <Text><CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} /> Hỗ trợ 24/7</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </PageLayout>
  )
}