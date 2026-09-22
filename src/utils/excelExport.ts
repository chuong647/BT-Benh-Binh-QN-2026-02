import * as XLSX from 'xlsx';
import { BinhBinhRecord } from '../types';

/**
 * Xuất dữ liệu danh sách hồ sơ bệnh binh ra tệp Excel (.xlsx)
 */
export function exportToExcel(records: BinhBinhRecord[], baseFileName = 'Danh_Sach_Tieu_De_Ho_So_Benh_Binh') {
  if (!records || records.length === 0) {
    throw new Error('Không có dữ liệu để xuất Excel');
  }

  // Chuẩn bị dữ liệu bảng tính
  const excelRows = records.map((record, index) => ({
    'STT': index + 1,
    'Tiêu đề hồ sơ (Chuẩn hóa)': record.formattedTitle,
    'Danh xưng': record.honorific || 'Ông',
    'Tên cá nhân': record.fullName,
    'Ngày sinh': record.birthDate,
    'Nguyên quán': record.nativePlace,
    'Trú quán': record.residence,
    'Tỷ lệ tổn thương cơ thể': record.bodilyInjuryRate || (record as any).economicBasisRate || '',
    'Loại văn bản': record.documentType || 'Văn bản bệnh binh',
    'Đặc điểm nét chữ': record.handwritingNotes || 'Chữ viết tay / in',
    'Tên tệp gốc': record.fileName,
    'Trang': record.pageNumber,
  }));

  // Tạo Worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  // Đặt độ rộng các cột tối ưu cho việc đọc
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 75 }, // Tiêu đề hồ sơ (rộng rãi)
    { wch: 12 }, // Danh xưng
    { wch: 26 }, // Tên cá nhân
    { wch: 15 }, // Ngày sinh
    { wch: 38 }, // Nguyên quán
    { wch: 38 }, // Trú quán
    { wch: 25 }, // Tỷ lệ tổn thương cơ thể
    { wch: 35 }, // Loại văn bản
    { wch: 35 }, // Đặc điểm nét chữ
    { wch: 28 }, // Tên tệp
    { wch: 8 },  // Trang
  ];

  // Tạo Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tiêu đề hồ sơ');

  // Đặt tên file xuất có gắn timestamp
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `${baseFileName}_${dateStr}.xlsx`;

  // Xuất file
  XLSX.writeFile(workbook, fileName);
}

/**
 * Sao chép danh sách Cột Tiêu đề hồ sơ vào Clipboard (mỗi tiêu đề một dòng)
 * Người dùng có thể dán thẳng vào một cột trong Excel hoặc Word
 */
export async function copyProfileTitlesToClipboard(records: BinhBinhRecord[]): Promise<boolean> {
  if (!records || records.length === 0) return false;

  const titlesText = records
    .map((r) => r.formattedTitle)
    .filter(Boolean)
    .join('\n');

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(titlesText);
      return true;
    } else {
      // Fallback cho môi trường không hỗ trợ navigator.clipboard trực tiếp
      const textArea = document.createElement('textarea');
      textArea.value = titlesText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Lỗi khi sao chép tiêu đề hồ sơ:', err);
    return false;
  }
}

/**
 * Sao chép toàn bộ bảng dưới dạng TSV (Tab-Separated Values)
 * Để người dùng dán lập tức vào Excel với đầy đủ các cột
 */
export async function copyTableAsTsv(records: BinhBinhRecord[]): Promise<boolean> {
  if (!records || records.length === 0) return false;

  const headers = [
    'STT',
    'Tiêu đề hồ sơ',
    'Danh xưng',
    'Tên cá nhân',
    'Ngày sinh',
    'Nguyên quán',
    'Trú quán',
    'Tỷ lệ tổn thương cơ thể',
    'Loại văn bản',
    'Tệp nguồn',
    'Trang'
  ];

  const rows = records.map((r, idx) => [
    idx + 1,
    r.formattedTitle,
    r.honorific,
    r.fullName,
    r.birthDate,
    r.nativePlace,
    r.residence,
    r.bodilyInjuryRate || (r as any).economicBasisRate || '',
    r.documentType,
    r.fileName,
    r.pageNumber
  ]);

  const tsvContent = [
    headers.join('\t'),
    ...rows.map(row => row.map(cell => String(cell).replace(/\t/g, ' ').replace(/\n/g, ' ')).join('\t'))
  ].join('\n');

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(tsvContent);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = tsvContent;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Lỗi khi sao chép bảng:', err);
    return false;
  }
}
