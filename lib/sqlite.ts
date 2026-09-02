import path from 'path'
import Database from 'better-sqlite3'

// Đường dẫn tuyệt đối tới file SQLite, tính từ thư mục gốc của project.
// Không dùng đường dẫn tương đối vì Next.js có thể chạy process từ nơi khác.
// => Yêu cầu: đặt thư mục data/ (chứa databasedoctor.db) ở NGOÀI CÙNG project,
//    ngang hàng với app/, package.json.
const DB_PATH = path.join(process.cwd(), 'data', 'databasedoctor.db')

// Chỉ mở để ĐỌC (readonly) vì trang Bác sĩ chỉ hiển thị dữ liệu, không ghi.
// fileMustExist: báo lỗi rõ ràng ngay nếu quên copy file .db vào đúng chỗ,
// thay vì âm thầm tạo ra 1 file rỗng mới.
export function getDb() {
  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true })
  db.pragma('foreign_keys = ON')
  return db
}