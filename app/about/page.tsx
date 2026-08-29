'use client'
import PageLayout from '../../components/PageLayout'

export default function AboutPage() {
  return (
    <PageLayout>
      <h1>Giới thiệu</h1>
      <p style={{ maxWidth: 700, lineHeight: 1.8 }}>
        Medicare là hệ thống đặt lịch khám bệnh trực tuyến, giúp kết nối bệnh nhân với
        đội ngũ bác sĩ chuyên khoa một cách nhanh chóng và tiện lợi. Chúng tôi hướng tới
        việc số hoá quy trình đặt lịch khám, giúp người dùng tiết kiệm thời gian chờ đợi
        và chủ động quản lý lịch hẹn của mình.
      </p>
      {/* TODO: người phụ trách bổ sung nội dung chi tiết */}
    </PageLayout>
  )
}