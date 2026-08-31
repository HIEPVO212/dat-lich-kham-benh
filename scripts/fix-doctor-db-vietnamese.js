const { DatabaseSync } = require('node:sqlite');

const dbPath = 'D:/STUDY VB2/LT FRONTEND/dat-lich-kham-benh/data/databasedoctor.db';
const db = new DatabaseSync(dbPath);

const textColumns = {
  Doctor: ['FullName', 'AcademicTitle', 'Bio'],
  Specialty: ['SpecialtyName', 'Description'],
  MedicalFacility: ['FacilityName', 'Address'],
  DoctorReview: ['PatientName', 'Comment'],
  Appointment: ['PatientName', 'Reason'],
};

const replacements = [
  ['B?nh vi?n Nhi d?ng Medicare', 'Bệnh viện Nhi đồng Medicare'],
  ['B?nh vi?n ?a khoa Medicare', 'Bệnh viện Đa khoa Medicare'],
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
  ['Ch?n do�n v� di?u tr? n?i khoa t?ng qu�t', 'Chẩn đoán và điều trị nội khoa tổng quát'],
  ['Ch?n do�n v� di?u tr? b?nh tim m?ch', 'Chẩn đoán và điều trị bệnh tim mạch'],
  ['Cham s�c s?c kho? sinh s?n, thai s?n', 'Chăm sóc sức khỏe sinh sản, thai sản'],
  ['Kh�m v� di?u tr? b?nh cho tr? em', 'Khám và điều trị bệnh cho trẻ em'],
  ['Kh�m v� di?u tr? c�c b?nh v? da', 'Khám và điều trị các bệnh về da'],
  ['Kh�m v� di?u tr? rang, h�m, m?t', 'Khám và điều trị răng, hàm, mặt'],
  ['nhi?t t�nh', 'nhiệt tình'],
  ['tu v?n', 'tư vấn'],
  ['th?c hành', 'thực hành'],
  ['Chuy�n gia d?u ng�nh tim m?ch can thi?p.', 'Chuyên gia đầu ngành tim mạch can thiệp.'],
  ['Chuy�n kh�m nhi, t?n t�m v?i tr? nh?.', 'Chuyên khám nhi, tận tâm với trẻ nhỏ.'],
  ['Chuy�n s?n ph? khoa, si�u �m thai.', 'Chuyên sản phụ khoa, siêu âm thai.'],
  ['�i?u tr? c�c b?nh da li?u, th?m m? da.', 'Điều trị các bệnh da liễu, thẩm mỹ da.'],
  ['Hon 15 nam kinh nghi?m kh�m v� di?u tr? n?i khoa t?ng qu�t.', 'Hơn 15 năm kinh nghiệm khám và điều trị nội khoa tổng quát.'],
  ['N?i t?ng qu�t, kh�m s?c kho? d?nh k?.', 'Nội tổng quát, khám sức khỏe định kỳ.'],
  ['Nha khoa t?ng qu?t, ni?ng rang th?m m?.', 'Nha khoa tổng quát, niềng răng thẩm mỹ.'],
  ['T?n tâm v?i t?ng ca khám, chú tr?ng th?c hành lâm sàng và hu?ng d?n di?u tr?.', 'Tận tâm với từng ca khám, chú trọng thực hành lâm sàng và hướng dẫn điều trị.'],
  ['Thu?ng xuyên c?p nh?t ki?n th?c và áp d?ng phuong pháp di?u tr? hi?n d?i.', 'Thường xuyên cập nhật kiến thức và áp dụng phương pháp điều trị hiện đại.'],
  ['Cam sóc b?nh nhân chu dáo, t?p trung vào dánh giá b?nh lý và k? ho?ch di?u tr? cá nhân hóa.', 'Chăm sóc bệnh nhân chu đáo, tập trung vào đánh giá bệnh lý và kế hoạch điều trị cá nhân hóa.'],
  ['Có kinh nghi?m làm vi?c v?i nhi?u d? tu?i và b?nh lý khác nhau.', 'Có kinh nghiệm làm việc với nhiều độ tuổi và bệnh lý khác nhau.'],
  ['Có nhi?u nam kinh nghi?m trong khám và di?u tr? n?i khoa, phát hi?n s?m b?nh lý.', 'Có nhiều năm kinh nghiệm trong khám và điều trị nội khoa, phát hiện sớm bệnh lý.'],
  ['v?ng vàng', 'vững vàng'],
  ['d?u ng�nh', 'đầu ngành'],
  ['d? thuong', 'dịu dàng'],
  ['b?ng', 'bụng'],
  ['kh?m', 'khám'],
  ['vu?n', 'vườn'],
  ['t?ng qu?t', 'tổng quát'],
  ['c?p nh?t', 'cập nhật'],
  ['phuong phap', 'phương pháp'],
  ['kh?m s?c kho? d?nh k? cho b�', 'khám sức khỏe định kỳ cho bé'],
  ['Si�u �m thai 20 tu?n', 'Siêu âm thai 20 tuần'],
  ['Si�u �m thai r?t k?.', 'Siêu âm thai rất kỹ.'],
  ['�au b?ng', 'Đau bụng'],
  ['Ba?i', 'Bài'],
  ['B?i Th? Lan', 'Bùi Thị Lan'],
  ['Hu?nh Ng?c Di?p', 'Huỳnh Ngọc Diệp'],
  ['Nguy?n Th? Mai', 'Nguyễn Thị Mai'],
  ['Ph?m Anh Thu', 'Phạm Anh Thư'],
  ['Tr?n Van B?o', 'Trần Văn Bảo'],
  ['Tr?nh B?o Long', 'Trịnh Bảo Long'],
  ['�? Minh Tu?n', 'Đỗ Minh Tuấn'],
  ['Võ Ng?c H?i', 'Võ Ngọc Hải'],
  ['Ð? Th? Huong', 'Đỗ Thị Hương'],
  ['T? Th? Thu Hà', 'Tạ Thị Thu Hà'],
  ['Ngô Th? H?ng', 'Ngô Thị Hồng'],
  ['Ðoàn Th? Mai', 'Đoàn Thị Mai'],
  ['Ph?m Th? Loan', 'Phạm Thị Loan'],
  ['Tr?nh Th? Nhi', 'Trịnh Thị Nhi'],
  ['Tang Th? H?ng Nhung', 'Tăng Thị Hồng Nhung'],
  ['Ðinh Th? Ng?c Nhi', 'Đinh Thị Ngọc Nhi'],
  ['B?ch Van Bình', 'Bạch Văn Bình'],
  ['Bùi Ð?c Th?nh', 'Bùi Đức Thành'],
  ['Cao Th? Thuý', 'Cao Thị Thúy'],
  ['Hoàng Minh Ð?c', 'Hoàng Minh Đức'],
  ['Hoàng Th? Di?u Linh', 'Hoàng Thị Diệu Linh'],
  ['Hoàng Th? Kim Nhi', 'Hoàng Thị Kim Nhi'],
  ['Hu?nh Van Tài', 'Huỳnh Văn Tài'],
  ['Hà Nh?t Linh', 'Hà Nhật Linh'],
  ['Hà Th? B?o Châu', 'Hà Thị Bảo Châu'],
  ['Ki?u M?nh Cu?ng', 'Kiều Mạnh Cường'],
  ['Lâm Ð?c Huy', 'Lâm Đức Huy'],
  ['Lê Hoàng Cu?ng', 'Lê Hoàng Cường'],
  ['Lý Th? Ng?c Ánh', 'Lý Thị Ngọc Ánh'],
  ['Mai Qu?c Vi?t', 'Mai Quốc Việt'],
  ['Nguy?n Qu?c Duy', 'Nguyễn Quốc Duy'],
  ['Nguy?n Th? Lan Anh', 'Nguyễn Thị Lan Anh'],
  ['Nguy?n Th? Oanh', 'Nguyễn Thị Oanh'],
  ['Nguy?n Th? Thanh Ngân', 'Nguyễn Thị Thanh Ngân'],
  ['Nguy?n Van An', 'Nguyễn Văn An'],
  ['Tr?n Th? B�ch', 'Trần Thị Bích'],
  ['Tr?n Th? Bích', 'Trần Thị Bích'],
  ['Tr?n Th? B?ch', 'Trần Thị Bích'],
  ['L� Ho�ng Cu?ng', 'Lê Hoàng Cường'],
  ['Nguy?n Th? Oanh', 'Nguyễn Thị Oanh'],
  ['Nguy?n Th? Mai', 'Nguyễn Thị Mai'],
  ['Hi?u', 'Hiệu'],
  ['B?c si gi?i, chuy�n m�n cao.', 'Bác sĩ giỏi, chuyên môn cao.'],
  ['B?c si d? thuong v?i c�c b�.', 'Bác sĩ dịu dàng với các bé.'],
  ['B?c si kh�m k?, tu v?n nhi?t t�nh.', 'Bác sĩ khám kỹ, tư vấn nhiệt tình.'],
  ['R?t h�i l�ng.', 'Rất hài lòng.'],
  ['Ni?ng rang d?p, t?n t�m.', 'Niềng răng đẹp, tận tâm.'],
  ['?n, s? quay l?i.', 'Tốt, sẽ quay lại.'],
  ['Da c?i thi?n r� sau di?u tr?.', 'Da cải thiện rõ sau điều trị.'],
  ['B?nh thu?ng.', 'Bình thường.'],
  ['Ch? hoi l�u nhung kh�m t?t.', 'Chỉ hỏi lâu nhưng khám tốt.'],
  ['T?n tâm v?i t?ng ca khám', 'Tận tâm với từng ca khám'],
  ['�i?u tr? c�c b?nh da li?u, th?m m? da.', 'Điều trị các bệnh da liễu, thẩm mỹ da.'],
  ['kh�m', 'khám'],
  ['m?ch', 'mạch'],
  ['d?nh k?', 'định kỳ'],
  ['s?c kho?', 'sức khỏe'],
  ['th?m m?', 'thẩm mỹ'],
  ['?u ng�nh', 'đầu ngành'],
  ['?i?u tr?', 'điều trị'],
  ['s?c kho? d?nh k? cho b�', 'sức khỏe định kỳ cho bé'],
  ['b? m?c', 'bị mắc'],
  ['?au b?ng', 'Đau bụng'],
  ['Th?c si', 'Thạc sĩ'],
  ['Ti?n si', 'Tiến sĩ'],
  ['Ph?m', 'Phạm'],
  ['Tr?n', 'Trần'],
  ['Nguy?n', 'Nguyễn'],
  ['L�', 'Lê'],
  ['Hu?nh', 'Huỳnh'],
  ['?oc', 'ức'],
  ['Ð?c', 'Đức'],
  ['�?c', 'Đức'],
  ['?i?u', 'điều'],
  ['?a', 'đa'],
  ['?u', 'đu'],
  ['V?', 'Vũ'],
  ['V?i', 'Với'],
  ['t?ng', 'tổng'],
  ['?n', 'Tốt'],
  ['?i','Đi'],
  ['?u','Đu'],
  ['?ng','đồng'],
  ['?m', 'âm'],
  ['?n', 'ăn'],
  ['?l', 'đ'],
  ['?ch', 'ch'],
  ['?i�n', 'điển'],
  ['?i?m', 'điểm'],
  ['kh?m', 'khám'],
  ['d?c', 'đức'],
  ['th?', 'thị'],
  ['?y', 'ấy'],
  ['B�i', 'Bùi'],
  ['B?i', 'Bùi'],
  ['N?ng', 'Nặng'],
  ['?inh', 'Đinh'],
  ['N?i', 'Nội'],
  ['H?ng', 'Hồng'],
  ['L?ng', 'Lặng'],
  ['Ph?ng', 'Phòng'],
  ['T?i', 'Tại'],
  ['C?ng', 'Cường'],
  ['V?ng', 'Vững'],
  ['?h', 'đh'],
  ['t�?m', 'tăm'],
  ['n?i', 'nội'],
  ['?ang', 'đang'],
  ['B?ch', 'Bạch'],
  ['B?i', 'Bùi'],
  ['?a khoa', 'Đa khoa'],
  ['?nh', 'Đình'],
  ['?i?m', 'điểm'],
  ['Ng?c', 'Ngọc'],
  ['?inh', 'Đinh'],
];

function normalizeText(value) {
  if (value === null || value === undefined) return value;
  let result = String(value);
  const ordered = [...replacements].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of ordered) {
    result = result.replaceAll(from, to);
  }

  result = result
    .replace(/\?+/g, '')
    .replace(/�+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim();

  return result;
}

for (const [tableName, columns] of Object.entries(textColumns)) {
  for (const column of columns) {
    const rows = db.prepare(`SELECT rowid AS __rowid, ${column} AS value FROM ${tableName} WHERE ${column} IS NOT NULL`).all();
    for (const row of rows) {
      const original = row.value;
      const updated = normalizeText(original);
      if (updated !== original) {
        db.prepare(`UPDATE ${tableName} SET ${column} = ? WHERE rowid = ?`).run(updated, row.__rowid);
      }
    }
  }
}

console.log('Vietnamese text normalization complete.');
for (const [tableName, columns] of Object.entries(textColumns)) {
  for (const column of columns) {
    const sample = db.prepare(`SELECT ${column} FROM ${tableName} LIMIT 3`).all();
    console.log(`${tableName}.${column}:`, sample.map(r => r[column]));
  }
}

db.close();
