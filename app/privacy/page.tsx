'use client'

import PageLayout from '../../components/PageLayout'

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div style={{ maxWidth: 900, lineHeight: 1.8 }}>
        <h1>Chính sách bảo mật</h1>
        <p>
          HEALTHCONNECT cam kết bảo mật thông tin cá nhân của bệnh nhân và khách hàng theo các tiêu chuẩn an toàn hiện hành.
        </p>
        <p>
          Thông tin như tên, email, số điện thoại, lịch khám và dữ liệu sức khỏe được sử dụng chỉ để hỗ trợ đặt lịch, xác nhận lịch hẹn và cải thiện trải nghiệm dịch vụ.
        </p>
        <p>
          Chúng tôi không chia sẻ thông tin cá nhân cho bên thứ ba khi chưa có sự đồng ý rõ ràng, trừ khi bắt buộc theo quy định pháp luật hoặc để cung cấp dịch vụ cần thiết.
        </p>
        <p>
          Người dùng có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình trong thời gian phù hợp theo quy định làm việc của hệ thống.
        </p>
      </div>
    </PageLayout>
  )
}
