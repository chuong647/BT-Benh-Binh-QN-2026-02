import { BinhBinhRecord, generateProfileTitle } from '../types';

export const SAMPLE_RECORDS: BinhBinhRecord[] = [
  {
    id: 'sample-page-1',
    pageNumber: 1,
    fileName: 'HoSo_BenhBinh_1984_Tap1.pdf',
    previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    honorific: 'Ông',
    fullName: 'Trần Đình Hùng',
    birthDate: '15/08/1951',
    nativePlace: 'Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây',
    residence: 'Thôn Trinh Tiết, Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây',
    bodilyInjuryRate: '61%',
    formattedTitle: generateProfileTitle({
      honorific: 'Ông',
      fullName: 'Trần Đình Hùng',
      birthDate: '15/08/1951',
      nativePlace: 'Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây',
      residence: 'Thôn Trinh Tiết, Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây',
      bodilyInjuryRate: '61%',
    }),
    documentType: 'Quyết định cấp sổ bệnh binh và hưởng trợ cấp hàng tháng',
    handwritingNotes: 'Chữ viết tay bút bi mực xanh, chữ nghiêng nét thanh nét đậm, có mộc dấu tròn đỏ của Ty Thương binh Xã hội',
    fullExtractedText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

TY THƯƠNG BINH VÀ XÃ HỘI TỈNH HÀ TÂY
Số: 142/QĐ-TBXH

QUYẾT ĐỊNH
Về việc cấp sổ bệnh binh và trợ cấp hàng tháng

GIÁM ĐỐC TY THƯƠNG BINH VÀ XÃ HỘI
- Căn cứ Nghị định số 236-CP ngày 18-9-1975 của Hội đồng Chính phủ;
- Xét Biên bản giám định y khoa số 89/GĐYK ngày 10/05/1984 kết luận mất sức lao động do bệnh tật trong chiến đấu;

QUYẾT ĐỊNH:
Điều 1: Cấp sổ bệnh binh và trợ cấp hàng tháng đối với:
- Họ và tên: TRẦN ĐÌNH HÙNG (Nam)
- Sinh ngày: 15 tháng 08 năm 1951
- Nguyên quán: Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây
- Căn quán: Thôn Trinh Tiết, Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây
- Nhập ngũ: 02/1970 - Xuất ngũ: 12/1983
- Đơn vị khi xuất ngũ: Trung đoàn 33, Sư đoàn 304, Quân đoàn 2
- Tỷ lệ suy giảm khả năng lao động (tỷ lệ cơ sở kinh tế): 61% (Bệnh binh hạng 2/3)
Điều 2: Chế độ được hưởng từ ngày 01 tháng 06 năm 1984.`,
    confidence: 'high',
    status: 'completed',
  },
  {
    id: 'sample-page-2',
    pageNumber: 2,
    fileName: 'HoSo_BenhBinh_1984_Tap1.pdf',
    previewUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80',
    honorific: 'Bà',
    fullName: 'Nguyễn Thị Minh Nguyệt',
    birthDate: '20/10/1954',
    nativePlace: 'Xã Hải Anh, Huyện Hải Hậu, Tỉnh Nam Hà',
    residence: 'Xóm 5, Xã Hải Anh, Huyện Hải Hậu, Tỉnh Nam Định',
    bodilyInjuryRate: '41%',
    formattedTitle: generateProfileTitle({
      honorific: 'Bà',
      fullName: 'Nguyễn Thị Minh Nguyệt',
      birthDate: '20/10/1954',
      nativePlace: 'Xã Hải Anh, Huyện Hải Hậu, Tỉnh Nam Hà',
      residence: 'Xóm 5, Xã Hải Anh, Huyện Hải Hậu, Tỉnh Nam Định',
      bodilyInjuryRate: '41%',
    }),
    documentType: 'Biên bản giám định khả năng lao động hưởng trợ cấp bệnh tật',
    handwritingNotes: 'Văn bản viết tay bằng bút mực Cửu Long màu tím đen, chữ cổ điển ngay ngắn, con dấu Hội đồng Giám định Y khoa',
    fullExtractedText: `HỘI ĐỒNG GIÁM ĐỊNH Y KHOA QUÂN KHU 3
Số: 215/BB-GĐ

BIÊN BẢN HỘI CHẨN GIÁM ĐỊNH KHẢ NĂNG LAO ĐỘNG
Hôm nay, ngày 12 tháng 09 năm 1982
Hội đồng giám định y khoa tiến hành khám giám định cho:
- Bà: NGUYỄN THỊ MINH NGUYỆT (Nữ, Quân y sĩ)
- Sinh ngày: 20 tháng 10 năm 1954
- Nguyên quán: Xã Hải Anh, Huyện Hải Hậu, Tỉnh Nam Hà
- Trú quán: Xóm 5, Xã Hải Anh, Huyện Hải Hậu, Tỉnh Nam Định
- Tình trạng bệnh lý: Sốt rét ác tính di chứng xơ gan, suy nhược cơ thể mãn tính do công tác tại chiến trường đường 9 Nam Lào.
- Kết luận tỷ lệ tổn thương cơ thể: 41%
- Đề nghị chuyển cấp sổ bệnh binh hưởng trợ cấp hàng tháng theo chế độ nhà nước.`,
    confidence: 'high',
    status: 'completed',
  },
  {
    id: 'sample-page-3',
    pageNumber: 3,
    fileName: 'HoSo_BenhBinh_1984_Tap1.pdf',
    previewUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=400&q=80',
    honorific: 'Ông',
    fullName: 'Lê Văn Quang',
    birthDate: '04/03/1948',
    nativePlace: 'Xã Quỳnh Đôi, Huyện Quỳnh Lưu, Tỉnh Nghệ An',
    residence: 'Khối 3, Thị trấn Cầu Giát, Huyện Quỳnh Lưu, Tỉnh Nghệ An',
    bodilyInjuryRate: '71%',
    formattedTitle: generateProfileTitle({
      honorific: 'Ông',
      fullName: 'Lê Văn Quang',
      birthDate: '04/03/1948',
      nativePlace: 'Xã Quỳnh Đôi, Huyện Quỳnh Lưu, Tỉnh Nghệ An',
      residence: 'Khối 3, Thị trấn Cầu Giát, Huyện Quỳnh Lưu, Tỉnh Nghệ An',
      bodilyInjuryRate: '71%',
    }),
    documentType: 'Giấy chứng nhận bệnh binh và quyết định trợ cấp thương tật bệnh binh',
    handwritingNotes: 'Viết bằng bút bi đỏ kết hợp bút bi xanh trên giấy kẻ ngang cũ ngả vàng, nét bút còn sắc nét',
    fullExtractedText: `QUÂN ĐOÀN 1 - BINH ĐOÀN QUYẾT THẮNG
BỘ TƯ LỆNH
Số: 88/GCN-BB

GIẤY CHỨNG NHẬN BỆNH BINH
Chứng nhận:
- Đồng chí: LÊ VĂN QUANG (Ông)
- Cấp bậc: Đại úy - Chức vụ: Tiểu đoàn phó
- Sinh ngày: 04/03/1948
- Nguyên quán: Xã Quỳnh Đôi, Huyện Quỳnh Lưu, Tỉnh Nghệ An
- Căn quán: Khối 3, Thị trấn Cầu Giát, Huyện Quỳnh Lưu, Tỉnh Nghệ An
- Đã tham gia phục vụ quân đội từ tháng 08/1966 đến tháng 01/1985
- Bệnh chứng chính: Di chứng chấn thương sọ não kín và viêm phế quản mạn tính thời kỳ chiến tranh biên giới.
- Tỷ lệ cơ sở kinh tế mất sức lao động: 71% (Bệnh binh hạng 1/3).
Đề nghị Ty Lao động - Thương binh Xã hội địa phương làm thủ tục cấp sổ và chi trả chế độ hàng tháng.`,
    confidence: 'high',
    status: 'completed',
  },
];
