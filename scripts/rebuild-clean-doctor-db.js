const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const root = path.join(__dirname, '..');
const dbPath = path.join(root, 'data', 'databasedoctor.db');
const backupPath = path.join(root, 'data', 'databasedoctor.db.bak');

if (fs.existsSync(dbPath)) {
  if (fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { force: true });
  }
  fs.renameSync(dbPath, backupPath);
}

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

const specialtyRows = [
  { SpecialtyId: 1, SpecialtyName: 'Nội khoa', Description: 'Chẩn đoán và điều trị nội khoa tổng quát' },
  { SpecialtyId: 2, SpecialtyName: 'Nhi khoa', Description: 'Khám và điều trị bệnh cho trẻ em' },
  { SpecialtyId: 3, SpecialtyName: 'Sản phụ khoa', Description: 'Chăm sóc sức khỏe sinh sản, thai sản' },
  { SpecialtyId: 4, SpecialtyName: 'Da liễu', Description: 'Khám và điều trị các bệnh về da' },
  { SpecialtyId: 5, SpecialtyName: 'Tim mạch', Description: 'Chẩn đoán và điều trị bệnh tim mạch' },
  { SpecialtyId: 6, SpecialtyName: 'Răng Hàm Mặt', Description: 'Khám và điều trị răng, hàm, mặt' },
];

const facilityRows = [
  { FacilityId: 1, FacilityName: 'Bệnh viện Đa khoa Medicare', Address: '123 Nguyễn Văn C, Q.5, TP.HCM', Phone: '0283123456' },
  { FacilityId: 2, FacilityName: 'Phòng khám Đa khoa Medicare Q.7', Address: '45 Nguyễn Thị Thập, Q.7, TP.HCM', Phone: '0287123456' },
  { FacilityId: 3, FacilityName: 'Bệnh viện Nhi đồng Medicare', Address: '88 Lê Thị T, Q.10, TP.HCM', Phone: '0283988888' },
];

const doctors = [
  'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Hoàng Cường', 'Phạm Thu Dung', 'Hoàng Minh Đức', 'Vũ Thị Hằng', 'Đồng Quốc Huy',
  'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Hoàng Cường', 'Phạm Thu Dung', 'Hoàng Minh Đức', 'Vũ Thị Hằng', 'Đồng Quốc Huy',
  'Trương Thị Lan', 'Bùi Văn Nam', 'Đỗ Thị Hương', 'Mai Quốc Việt', 'Nguyễn Thị Lan Anh', 'Dương Văn Sơn',
  'Hoàng Thị Kim Nhi', 'Lâm Đức Huy', 'Tạ Thị Thu Hà', 'Phan Văn Khoa', 'Vũ Minh Thư', 'Chu Văn Long', 'Nguyễn Ánh Tuyết',
  'Lý Thị Ngọc Ánh', 'Tăng Văn Khánh', 'Hà Thị Bảo Châu', 'Nguyễn Quốc Duy', 'Nguyễn Thị Oanh', 'Đinh Hoàng Nam',
  'Trần Thị Yến', 'Bạch Văn Bình', 'Cao Thị Thúy', 'Phạm Quốc Toàn', 'Võ Ngọc Hải', 'Ngô Thị Hồng', 'Lê Thanh Tâm',
  'Đoàn Thị Mai', 'Huỳnh Văn Tài', 'Phạm Thị Loan', 'Quách Minh Huy', 'Tô Lan Hương', 'Kiều Mạnh Cường',
  'Nguyễn Thị Thanh Ngân', 'Ông Quốc Hưng', 'Phạm Văn Quang', 'Hoàng Thị Diệu Linh', 'Bùi Đức Thành', 'Trịnh Thị Nhi',
  'Lê Văn Phúc', 'Tăng Thị Hồng Nhung', 'Liêu Văn Dũng', 'Hà Nhật Linh', 'Đinh Thị Ngọc Nhi'
];

const doctorTitles = [
  'Tiến sĩ','Thạc sĩ','BS.CKII','BS.CKI','PGS.TS','Tiến sĩ','BS.CKI','Tiến sĩ','Thạc sĩ','BS.CKI','BS.CKII','PGS.TS','PGS.TS.BS','Tiến sĩ',
  'Thạc sĩ','BS.CKI','BS.CKII','PGS.TS','PGS.TS.BS','Tiến sĩ','Thạc sĩ','BS.CKI','BS.CKII','PGS.TS','PGS.TS.BS','Tiến sĩ','Thạc sĩ','BS.CKI','BS.CKII','PGS.TS','PGS.TS.BS','Tiến sĩ','Thạc sĩ','BS.CKI','BS.CKII','PGS.TS','PGS.TS.BS','Tiến sĩ','Thạc sĩ','BS.CKI','BS.CKII','PGS.TS','PGS.TS.BS','Tiến sĩ','Thạc sĩ','BS.CKI','BS.CKII','PGS.TS','PGS.TS.BS','Tiến sĩ','Thạc sĩ','BS.CKI','BS.CKII','PGS.TS','PGS.TS.BS'
];

const specialtiesByDoctor = [
  1,2,3,4,5,1,6,1,2,3,4,5,6,1,
  2,3,4,5,6,1,2,3,4,5,6,1,2,3,
  4,5,6,1,2,3,4,5,6,1,2,3,4,5,
  6,1,2,3,4,5,6,1,2,3,4,5,6,1,
  2,3,4,5,6
];

const experienceYears = [
  15,8,12,6,20,10,9,4,5,6,7,8,9,10,
  11,12,13,14,15,16,17,18,19,20,21,4,5,6,
  7,8,9,10,11,12,13,14,15,16,17,18,19,20,
  21,4,5,6,7,8,9,10,11,12,13,14,15,16,
  17,18,19,20,21
];

const acceptPattern = [
  1,1,1,1,0,1,1,0,1,1,1,1,1,1,
  0,1,1,1,1,1,1,0,1,1,1,1,1,1,
  0,1,1,1,1,1,1,0,1,1,1,1,1,1,
  0,1,1,1,1,1,1,0,1,1,1,1,1,1,
  0,1,1,1,1,1
];

const avatarPattern = [
  '/avatars/doctor1.jpg','/avatars/doctor2.jpg','/avatars/doctor3.jpg','/avatars/doctor4.jpg','/avatars/doctor5.jpg','/avatars/doctor6.jpg','/avatars/doctor7.jpg',
  '/avatars/doctor1.jpg','/avatars/doctor2.jpg','/avatars/doctor3.jpg','/avatars/doctor4.jpg','/avatars/doctor5.jpg','/avatars/doctor6.jpg','/avatars/doctor7.jpg',
  '/avatars/doctor8.jpg','/avatars/doctor9.jpg','/avatars/doctor10.jpg','/avatars/doctor11.jpg','/avatars/doctor12.jpg','/avatars/doctor13.jpg','/avatars/doctor14.jpg',
  '/avatars/doctor15.jpg','/avatars/doctor16.jpg','/avatars/doctor17.jpg','/avatars/doctor18.jpg','/avatars/doctor19.jpg','/avatars/doctor20.jpg','/avatars/doctor21.jpg',
  '/avatars/doctor22.jpg','/avatars/doctor23.jpg','/avatars/doctor24.jpg','/avatars/doctor25.jpg','/avatars/doctor26.jpg','/avatars/doctor27.jpg','/avatars/doctor28.jpg',
  '/avatars/doctor29.jpg','/avatars/doctor30.jpg','/avatars/doctor31.jpg','/avatars/doctor32.jpg','/avatars/doctor33.jpg','/avatars/doctor34.jpg','/avatars/doctor35.jpg',
  '/avatars/doctor36.jpg','/avatars/doctor37.jpg','/avatars/doctor38.jpg','/avatars/doctor39.jpg','/avatars/doctor40.jpg','/avatars/doctor41.jpg','/avatars/doctor42.jpg',
  '/avatars/doctor43.jpg','/avatars/doctor44.jpg','/avatars/doctor45.jpg','/avatars/doctor46.jpg','/avatars/doctor47.jpg','/avatars/doctor48.jpg','/avatars/doctor49.jpg',
  '/avatars/doctor50.jpg','/avatars/doctor51.jpg','/avatars/doctor52.jpg','/avatars/doctor53.jpg','/avatars/doctor54.jpg'
];

const bioBySpecialty = {
  1: 'Nội tổng quát, khám sức khỏe định kỳ.',
  2: 'Chuyên khám nhi, tận tâm với trẻ nhỏ.',
  3: 'Chuyên sản phụ khoa, siêu âm thai.',
  4: 'Điều trị các bệnh da liễu, thẩm mỹ da.',
  5: 'Chuyên gia đầu ngành tim mạch can thiệp.',
  6: 'Nha khoa tổng quát, niềng răng thẩm mỹ.'
};

const cleanPhone = (id) => `090${String(1000000 + id).padStart(7, '0')}`;
const normalizeNameForEmail = (name) => {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .toLowerCase();
};

const doctorRows = doctors.map((fullName, idx) => ({
  DoctorId: idx + 1,
  FullName: fullName,
  AvatarUrl: avatarPattern[idx] || '/avatars/doctor-default.jpg',
  AcademicTitle: doctorTitles[idx] || 'BS.CKI',
  SpecialtyId: specialtiesByDoctor[idx] || 1,
  ExperienceYears: experienceYears[idx] || 5,
  Bio: bioBySpecialty[specialtiesByDoctor[idx]] || 'Chuyên khám và điều trị bệnh lý theo từng ca bệnh.',
  Phone: cleanPhone(idx + 1),
  Email: `${normalizeNameForEmail(fullName)}${(idx + 1).toString()}@medicare.vn`,
  IsAcceptingBookings: acceptPattern[idx] || 1,
  CreatedAt: '2026-08-30 01:19:55'
}));

const doctorFacilityRows = [];
const doctorPrimaryRows = [];
const doctorStatsRows = [];

for (const row of doctorRows) {
  const facilityId = row.DoctorId % 3 === 0 ? 3 : (row.DoctorId % 2 === 0 ? 2 : 1);
  doctorFacilityRows.push({ DoctorFacilityId: row.DoctorId, DoctorId: row.DoctorId, FacilityId: facilityId, IsPrimary: 1 });
  doctorPrimaryRows.push({ DoctorId: row.DoctorId, FacilityId: facilityId, FacilityName: facilityRows.find(f => f.FacilityId === facilityId).FacilityName, Address: facilityRows.find(f => f.FacilityId === facilityId).Address });
  const rating = [4.2, 4.5, 4.7, 4.8, 4.4, 4.6, 4.9][(row.DoctorId - 1) % 7];
  const totalReviews = row.DoctorId % 5 === 0 ? 4 : (row.DoctorId % 3 === 0 ? 3 : 2);
  const totalPatients = 80 + row.DoctorId * 11;
  doctorStatsRows.push({ DoctorId: row.DoctorId, Rating: Number(rating.toFixed(1)), TotalReviews: totalReviews, TotalPatients: totalPatients });
}

const doctorReviewRows = [
  { ReviewId: 1, DoctorId: 1, PatientName: 'Nguyễn Thị Mai', Rating: 5, Comment: 'Bác sĩ khám kỹ, tư vấn nhiệt tình.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 2, DoctorId: 1, PatientName: 'Trần Văn Bảo', Rating: 4, Comment: 'Chỉ hỏi lâu nhưng khám tốt.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 3, DoctorId: 1, PatientName: 'Lê Gia Hân', Rating: 5, Comment: 'Rất hài lòng.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 4, DoctorId: 2, PatientName: 'Phạm Anh Thư', Rating: 5, Comment: 'Bác sĩ dịu dàng với các bé.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 5, DoctorId: 2, PatientName: 'Đỗ Minh Tuấn', Rating: 4, Comment: 'Tốt, sẽ quay lại.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 6, DoctorId: 3, PatientName: 'Nguyễn Thị Vy', Rating: 5, Comment: 'Siêu âm thai rất kỹ.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 7, DoctorId: 3, PatientName: 'Bùi Thị Lan', Rating: 3, Comment: 'Bình thường.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 8, DoctorId: 4, PatientName: 'Cao Văn Nam', Rating: 4, Comment: 'Da cải thiện rõ sau điều trị.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 9, DoctorId: 5, PatientName: 'Trịnh Bảo Long', Rating: 5, Comment: 'Bác sĩ giỏi, chuyên môn cao.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 10, DoctorId: 6, PatientName: 'Huỳnh Ngọc Diệp', Rating: 4, Comment: 'Khám nhanh, chính xác.', CreatedAt: '2026-08-30 01:19:55' },
  { ReviewId: 11, DoctorId: 7, PatientName: 'Phan Thành Tùng', Rating: 5, Comment: 'Niềng răng đẹp, tận tâm.', CreatedAt: '2026-08-30 01:19:55' },
];

const appointmentRows = [
  { AppointmentId: 1, DoctorId: 1, FacilityId: 1, PatientName: 'Nguyễn Thị Mai', PatientPhone: '0909000001', AppointmentDate: '2026-08-10', AppointmentTime: '08:00', Status: 'completed', Reason: 'Khám tổng quát', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 2, DoctorId: 1, FacilityId: 1, PatientName: 'Trần Văn Bảo', PatientPhone: '0909000002', AppointmentDate: '2026-08-12', AppointmentTime: '09:00', Status: 'completed', Reason: 'Đau bụng', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 3, DoctorId: 1, FacilityId: 2, PatientName: 'Lê Gia Hân', PatientPhone: '0909000003', AppointmentDate: '2026-09-02', AppointmentTime: '10:00', Status: 'confirmed', Reason: 'Tái khám', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 4, DoctorId: 2, FacilityId: 3, PatientName: 'Phạm Anh Thư', PatientPhone: '0909000004', AppointmentDate: '2026-08-15', AppointmentTime: '14:00', Status: 'completed', Reason: 'Khám sức khỏe định kỳ cho bé', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 5, DoctorId: 2, FacilityId: 3, PatientName: 'Đỗ Minh Tuấn', PatientPhone: '0909000005', AppointmentDate: '2026-09-05', AppointmentTime: '15:00', Status: 'pending', Reason: 'Bị bệnh sốt', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 6, DoctorId: 3, FacilityId: 1, PatientName: 'Nguyễn Thị Vy', PatientPhone: '0909000006', AppointmentDate: '2026-08-20', AppointmentTime: '08:30', Status: 'completed', Reason: 'Siêu âm thai 20 tuần', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 7, DoctorId: 3, FacilityId: 1, PatientName: 'Bùi Thị Lan', PatientPhone: '0909000007', AppointmentDate: '2026-08-22', AppointmentTime: '09:30', Status: 'completed', Reason: 'Khám phụ khoa', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 8, DoctorId: 4, FacilityId: 2, PatientName: 'Cao Văn Nam', PatientPhone: '0909000008', AppointmentDate: '2026-08-25', AppointmentTime: '13:00', Status: 'completed', Reason: 'Trầm cảm', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 9, DoctorId: 5, FacilityId: 1, PatientName: 'Trịnh Bảo Long', PatientPhone: '0909000009', AppointmentDate: '2026-08-05', AppointmentTime: '07:30', Status: 'completed', Reason: 'Khám tim mạch', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 10, DoctorId: 6, FacilityId: 1, PatientName: 'Huỳnh Ngọc Diệp', PatientPhone: '0909000010', AppointmentDate: '2026-09-10', AppointmentTime: '08:00', Status: 'confirmed', Reason: 'Khám tổng quát', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 11, DoctorId: 7, FacilityId: 2, PatientName: 'Phan Thành Tùng', PatientPhone: '0909000011', AppointmentDate: '2026-08-18', AppointmentTime: '16:00', Status: 'completed', Reason: 'Niềng răng - tái khám', CreatedAt: '2026-08-30 01:19:55' },
  { AppointmentId: 12, DoctorId: 7, FacilityId: 2, PatientName: 'Phan Thành Tùng', PatientPhone: '0909000012', AppointmentDate: '2026-09-15', AppointmentTime: '16:00', Status: 'pending', Reason: 'Niềng răng - tái khám lần 2', CreatedAt: '2026-08-30 01:19:55' },
];

const schema = `
CREATE TABLE Specialty (
  SpecialtyId INTEGER PRIMARY KEY,
  SpecialtyName TEXT NOT NULL,
  Description TEXT
);

CREATE TABLE Doctor (
  DoctorId INTEGER PRIMARY KEY,
  FullName TEXT NOT NULL,
  AvatarUrl TEXT,
  AcademicTitle TEXT,
  SpecialtyId INTEGER,
  ExperienceYears INTEGER,
  Bio TEXT,
  Phone TEXT,
  Email TEXT,
  IsAcceptingBookings INTEGER,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (SpecialtyId) REFERENCES Specialty(SpecialtyId)
);

CREATE TABLE MedicalFacility (
  FacilityId INTEGER PRIMARY KEY,
  FacilityName TEXT NOT NULL,
  Address TEXT,
  Phone TEXT
);

CREATE TABLE DoctorFacility (
  DoctorFacilityId INTEGER PRIMARY KEY AUTOINCREMENT,
  DoctorId INTEGER NOT NULL,
  FacilityId INTEGER NOT NULL,
  IsPrimary INTEGER DEFAULT 0,
  FOREIGN KEY (DoctorId) REFERENCES Doctor(DoctorId),
  FOREIGN KEY (FacilityId) REFERENCES MedicalFacility(FacilityId)
);

CREATE TABLE DoctorReview (
  ReviewId INTEGER PRIMARY KEY AUTOINCREMENT,
  DoctorId INTEGER NOT NULL,
  PatientName TEXT NOT NULL,
  Rating INTEGER,
  Comment TEXT,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (DoctorId) REFERENCES Doctor(DoctorId)
);

CREATE TABLE Appointment (
  AppointmentId INTEGER PRIMARY KEY AUTOINCREMENT,
  DoctorId INTEGER NOT NULL,
  FacilityId INTEGER NOT NULL,
  PatientName TEXT NOT NULL,
  PatientPhone TEXT,
  AppointmentDate TEXT,
  AppointmentTime TEXT,
  Status TEXT,
  Reason TEXT,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (DoctorId) REFERENCES Doctor(DoctorId),
  FOREIGN KEY (FacilityId) REFERENCES MedicalFacility(FacilityId)
);

CREATE TABLE DoctorPrimaryFacility (
  DoctorId INTEGER PRIMARY KEY,
  FacilityId INTEGER,
  FacilityName TEXT,
  Address TEXT,
  FOREIGN KEY (DoctorId) REFERENCES Doctor(DoctorId),
  FOREIGN KEY (FacilityId) REFERENCES MedicalFacility(FacilityId)
);

CREATE TABLE DoctorStats (
  DoctorId INTEGER PRIMARY KEY,
  Rating REAL,
  TotalReviews INTEGER,
  TotalPatients INTEGER,
  FOREIGN KEY (DoctorId) REFERENCES Doctor(DoctorId)
);
`;

db.exec(schema);

const insertSpecialty = db.prepare('INSERT INTO Specialty (SpecialtyId, SpecialtyName, Description) VALUES (?, ?, ?)');
for (const row of specialtyRows) insertSpecialty.run(row.SpecialtyId, row.SpecialtyName, row.Description);

const insertFacility = db.prepare('INSERT INTO MedicalFacility (FacilityId, FacilityName, Address, Phone) VALUES (?, ?, ?, ?)');
for (const row of facilityRows) insertFacility.run(row.FacilityId, row.FacilityName, row.Address, row.Phone);

const insertDoctor = db.prepare('INSERT INTO Doctor (DoctorId, FullName, AvatarUrl, AcademicTitle, SpecialtyId, ExperienceYears, Bio, Phone, Email, IsAcceptingBookings, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
for (const row of doctorRows) insertDoctor.run(row.DoctorId, row.FullName, row.AvatarUrl, row.AcademicTitle, row.SpecialtyId, row.ExperienceYears, row.Bio, row.Phone, row.Email, row.IsAcceptingBookings, row.CreatedAt);

const insertDoctorFacility = db.prepare('INSERT INTO DoctorFacility (DoctorFacilityId, DoctorId, FacilityId, IsPrimary) VALUES (?, ?, ?, ?)');
for (const row of doctorFacilityRows) insertDoctorFacility.run(row.DoctorFacilityId, row.DoctorId, row.FacilityId, row.IsPrimary);

const insertDoctorPrimaryFacility = db.prepare('INSERT INTO DoctorPrimaryFacility (DoctorId, FacilityId, FacilityName, Address) VALUES (?, ?, ?, ?)');
for (const row of doctorPrimaryRows) insertDoctorPrimaryFacility.run(row.DoctorId, row.FacilityId, row.FacilityName, row.Address);

const insertStats = db.prepare('INSERT INTO DoctorStats (DoctorId, Rating, TotalReviews, TotalPatients) VALUES (?, ?, ?, ?)');
for (const row of doctorStatsRows) insertStats.run(row.DoctorId, row.Rating, row.TotalReviews, row.TotalPatients);

const insertReview = db.prepare('INSERT INTO DoctorReview (ReviewId, DoctorId, PatientName, Rating, Comment, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)');
for (const row of doctorReviewRows) insertReview.run(row.ReviewId, row.DoctorId, row.PatientName, row.Rating, row.Comment, row.CreatedAt);

const insertAppointment = db.prepare('INSERT INTO Appointment (AppointmentId, DoctorId, FacilityId, PatientName, PatientPhone, AppointmentDate, AppointmentTime, Status, Reason, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
for (const row of appointmentRows) insertAppointment.run(row.AppointmentId, row.DoctorId, row.FacilityId, row.PatientName, row.PatientPhone, row.AppointmentDate, row.AppointmentTime, row.Status, row.Reason, row.CreatedAt);

console.log('Rebuilt clean SQLite database at:', dbPath);
console.log('Doctor count:', db.prepare('SELECT COUNT(*) AS c FROM Doctor').get().c);
console.log('Specialty count:', db.prepare('SELECT COUNT(*) AS c FROM Specialty').get().c);
console.log('Appointment count:', db.prepare('SELECT COUNT(*) AS c FROM Appointment').get().c);
console.log('Sample rows:', JSON.stringify(db.prepare('SELECT DoctorId, FullName, SpecialtyId, IsAcceptingBookings FROM Doctor ORDER BY DoctorId LIMIT 5').all(), null, 2));

db.close();
