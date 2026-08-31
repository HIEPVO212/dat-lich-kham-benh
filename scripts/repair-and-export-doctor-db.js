const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, '..', 'data', 'databasedoctor.db');
const exportDir = path.join(__dirname, '..', 'data', 'exports');

fs.mkdirSync(exportDir, { recursive: true });

const db = new DatabaseSync(dbPath);

const repairMap = new Map([
  ['B?nh vi?n Nhi d?ng Medicare', 'Bệnh viện Nhi đồng Medicare'],
  ['B?nh vi?n Đa khoa Medicare', 'Bệnh viện Đa khoa Medicare'],
  ['B?nh vi?n �a khoa Medicare', 'Bệnh viện Đa khoa Medicare'],
  ['B?nh vi?n', 'Bệnh viện'],
  ['?a khoa', 'Đa khoa'],
  ['N?i khoa', 'Nội khoa'],
  ['S?n ph? khoa', 'Sản phụ khoa'],
  ['Da li?u', 'Da liễu'],
  ['Rang H�m M?t', 'Răng Hàm Mặt'],
  ['Tim m?ch', 'Tim mạch'],
  ['Th?c si', 'Thạc sĩ'],
  ['Ti?n si', 'Tiến sĩ'],
  ['B?c si', 'Bác sĩ'],
  ['B?c', 'Bác'],
  ['kh?m', 'khám'],
  ['t?ng qu?t', 'tổng quát'],
  ['s?c kho?', 'sức khỏe'],
  ['ni?ng rang', 'niềng răng'],
  ['t?n tâm', 'tận tâm'],
  ['ch?u', 'chú'],
  ['?n', 'Tốt'],
  ['b?ng', 'bụng'],
  ['d?u ng�nh', 'đầu ngành'],
  ['d? thuong', 'dịu dàng'],
  ['?i?u tr?', 'điều trị'],
  ['ng?c', 'ngọc'],
  ['?inh', 'Đinh'],
  ['Hu?nh', 'Huỳnh'],
  ['Võ Ng?c H?i', 'Võ Ngọc Hải'],
  ['Nguy?n', 'Nguyễn'],
  ['Tr?n', 'Trần'],
  ['Ph?m', 'Phạm'],
  ['L�', 'Lê'],
  ['?Đ', 'Đ'],
  ['Ð', 'Đ'],
  ['?i?u', 'điều'],
  ['?a', 'đa'],
  ['?u', 'đu'],
  ['?m', 'âm'],
  ['?ng', 'đồng'],
  ['?c', 'ức'],
  ['?u?', 'đu'],
  ['?n?', 'ăn'],
  ['?i?', 'di'],
  ['?i', 'đi'],
  ['?y', 'ấy'],
  ['?', ''],
  ['�', ''],
  ['B?i Th? Lan', 'Bùi Thị Lan'],
  ['B?i Th? Lan', 'Bùi Thị Lan'],
  ['Nguy?n Th? Mai', 'Nguyễn Thị Mai'],
  ['Tr?n Van B?o', 'Trần Văn Bảo'],
  ['L� Gia H�n', 'Lê Gia Hân'],
  ['Ph?m Anh Thu', 'Phạm Anh Thư'],
  ['�? Minh Tu?n', 'Đỗ Minh Tuấn'],
  ['Ng Thu Vy', 'Nguyễn Thị Vy'],
  ['Bùi Th? Lan', 'Bùi Thị Lan'],
  ['Cao Van Nam', 'Cao Văn Nam'],
  ['Tr?nh B?o Long', 'Trịnh Bảo Long'],
  ['Hu?nh Ng?c Di?p', 'Huỳnh Ngọc Diệp'],
  ['Phan Th?nh T?ng', 'Phan Thành Tùng'],
  ['Đoàn Thị Mai', 'Đoàn Thị Mai'],
  ['Tâng', 'Tăng'],
  ['T?ng', 'Tăng'],
  ['N?ng', 'Nặng'],
  ['B?ch', 'Bạch'],
  ['?ch', 'ch'],
  ['N?i', 'Nội'],
  ['H?ng', 'Hồng'],
  ['B?nh', 'Bệnh'],
  ['?inh', 'Đinh'],
  ['Bài', 'Bùi'],
  ['Bùi Th? Lan', 'Bùi Thị Lan'],
  ['đồng Quc Huy', 'Đồng Quốc Huy'],
  ['Ðđồng Quc Huy', 'Đồng Quốc Huy'],
  ['Vu Th HĐình', 'Vũ Thị Hằng'],
  ['Vu Th HĐình', 'Vũ Thị Hằng'],
  ['Truong Th Lan', 'Trương Thị Lan'],
  ['Tô Lan Huong', 'Tô Lan Hương'],
  ['Nguyễn Ánh Tuyt', 'Nguyễn Ánh Tuyết'],
  ['Trần Th YTốt', 'Trần Thị Yến'],
  ['Phạm Quc ToTốt', 'Phạm Quốc Toàn'],
  ['Ông Quc Hung', 'Ông Quốc Hưng'],
  ['Hoàng Thị Diệu Linh', 'Hoàng Thị Diệu Linh'],
  ['Vũ Thị Hằng', 'Vũ Thị Hằng'],
  ['Phạm Văn Quang', 'Phạm Văn Quang'],
  ['Liêu Van Dung', 'Liêu Văn Dũng'],
  ['Tăng Thị Hồng Nhung', 'Tăng Thị Hồng Nhung'],
  ['Nguyễn Thị Oanh', 'Nguyễn Thị Oanh'],
  ['Trịnh Thị Nhi', 'Trịnh Thị Nhi'],
  ['Nguyễn Thị Lan Anh', 'Nguyễn Thị Lan Anh'],
  ['Vũ Minh Thu', 'Vũ Minh Thư'],
  ['Nguyễn Thị Thanh Ngân', 'Nguyễn Thị Thanh Ngân'],
  ['Phan Van Khoa', 'Phan Văn Khoa'],
  ['Đỗ Minh Tuấn', 'Đỗ Minh Tuấn'],
  ['Cao Văn Nam', 'Cao Văn Nam'],
  ['Chu Van Long', 'Chu Văn Long'],
  ['Huỳnh Văn Tài', 'Huỳnh Văn Tài'],
  ['Lâm Đức Huy', 'Lâm Đức Huy'],
  ['Tạ Thị Thu Hà', 'Tạ Thị Thu Hà'],
  ['Bạch Văn Bình', 'Bạch Văn Bình'],
  ['Nguyễn Quốc Duy', 'Nguyễn Quốc Duy'],
  ['Bùi Đức Thành', 'Bùi Đức Thành'],
  ['Đoàn Thị Mai', 'Đoàn Thị Mai'],
  ['Hà Nhật Linh', 'Hà Nhật Linh'],
  ['Đinh Thị Ngọc Nhi', 'Đinh Thị Ngọc Nhi'],
  ['Huỳnh Ngọc Diệp', 'Huỳnh Ngọc Diệp'],
  ['Phạm Thị Loan', 'Phạm Thị Loan'],
  ['Quách Minh Huy', 'Quách Minh Huy'],
  ['Bùi Văn Nam', 'Bùi Văn Nam'],
  ['Lê Van Phúc', 'Lê Văn Phúc'],
  ['Tô Lan Hương', 'Tô Lan Hương'],
  ['Nguyễn Thị Bích', 'Nguyễn Thị Bích'],
  ['Trần Thị Bích', 'Trần Thị Bích'],
  ['Lê Hoàng Cường', 'Lê Hoàng Cường'],
  ['Phạm Thu Dung', 'Phạm Thu Dung'],
  ['Nguyễn Văn An', 'Nguyễn Văn An'],
  ['Khm tổng qut', 'Khám tổng quát'],
  ['Khm t?ng qu�t', 'Khám tổng quát'],
  ['Kh�m t?ng qu�t', 'Khám tổng quát'],
  ['Kh�m s?c kho? d?nh k? cho b�', 'Khám sức khỏe định kỳ cho bé'],
  ['B� b? s?t', 'Bị bệnh sốt'],
  ['B b st', 'Bị bệnh sốt'],
  ['Si�u �m thai 20 tu?n', 'Siêu âm thai 20 tuần'],
  ['Kh�m ph? khoa', 'Khám phụ khoa'],
  ['Tr? m?n', 'Trầm cảm'],
  ['Ni?ng rang - t�i kh�m', 'Niềng răng - tôi khám'],
  ['Ni?ng rang - t�i kh�m l?n 2', 'Niềng răng - tôi khám lần 2'],
  ['Kh�m tim m?ch', 'Khám tim mạch'],
  ['Khm tổng qut', 'Khám tổng quát'],
  ['Khm s?c kho? d?nh k? cho b�', 'Khám sức khỏe định kỳ cho bé'],
  ['B? b? s?t', 'Bị bệnh sốt'],
  ['Ti kh�m', 'Tái khám'],
  ['T�i kh�m', 'Tái khám'],
  ['Kh�m t?ng qu�t', 'Khám tổng quát'],
  ['�au b?ng', 'Đau bụng'],
  ['B?c si kh�m k?, tu v?n nhi?t t�nh.', 'Bác sĩ khám kỹ, tư vấn nhiệt tình.'],
  ['B?c si d? thuong v?i c�c b�.', 'Bác sĩ dịu dàng với các bé.'],
  ['B?c si gi?i, chuy�n m�n cao.', 'Bác sĩ giỏi, chuyên môn cao.'],
  ['?n, s? quay l?i.', 'Tốt, sẽ quay lại.'],
  ['Ch? hoi l�u nhung kh�m t?t.', 'Chỉ hỏi lâu nhưng khám tốt.'],
  ['Da c?i thi?n r� sau di?u tr?.', 'Da cải thiện rõ sau điều trị.'],
  ['B?nh thu?ng.', 'Bình thường.'],
  ['Si�u �m thai r?t k?.', 'Siêu âm thai rất kỹ.'],
  ['R?t h�i l�ng.', 'Rất hài lòng.'],
  ['Ni?ng rang d?p, t?n t�m.', 'Niềng răng đẹp, tận tâm.'],
  ['Bc si', 'Bác sĩ'],
  ['bc si', 'bác sĩ'],
  ['Ḿ', 'M'],
]);

function normalizeValue(value) {
  if (value === null || value === undefined) return value;
  let result = String(value);
  const ordered = [...repairMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of ordered) {
    result = result.split(from).join(to);
  }
  result = result
    .replace(/[�?]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return result;
}

const textColumns = {
  Doctor: ['FullName', 'AcademicTitle', 'Bio'],
  Specialty: ['SpecialtyName', 'Description'],
  MedicalFacility: ['FacilityName', 'Address'],
  DoctorReview: ['PatientName', 'Comment'],
  Appointment: ['PatientName', 'Reason'],
};

for (const [tableName, columns] of Object.entries(textColumns)) {
  for (const column of columns) {
    const rows = db.prepare(`SELECT rowid AS __rowid, ${column} AS value FROM ${tableName} WHERE ${column} IS NOT NULL`).all();
    for (const row of rows) {
      const fixed = normalizeValue(row.value);
      if (fixed !== row.value) {
        db.prepare(`UPDATE ${tableName} SET ${column} = ? WHERE rowid = ?`).run(fixed, row.__rowid);
      }
    }
  }
}

const tables = ['Doctor', 'Specialty', 'MedicalFacility', 'DoctorFacility', 'DoctorReview', 'Appointment'];
const exportData = {};

for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY 1`).all();
  exportData[table] = rows;

  const columns = Object.keys(rows[0] ?? {});
  const csvLines = [];
  csvLines.push(columns.join(','));
  for (const row of rows) {
    const values = columns.map((col) => {
      const v = row[col];
      const text = v === null || v === undefined ? '' : String(v);
      return `"${text.replace(/"/g, '""')}"`;
    });
    csvLines.push(values.join(','));
  }
  fs.writeFileSync(path.join(exportDir, `${table}.csv`), csvLines.join('\n'), 'utf8');
}

fs.writeFileSync(path.join(exportDir, 'doctor-db-utf8.json'), JSON.stringify(exportData, null, 2), 'utf8');

console.log('DB repair complete. Exported files:');
for (const table of tables) {
  console.log('-', path.join(exportDir, `${table}.csv`));
}
console.log('-', path.join(exportDir, 'doctor-db-utf8.json'));

db.close();
