export interface BinhBinhRecord {
  id: string;
  pageNumber: number;
  fileName: string;
  previewUrl: string; // Data URL or object URL of page thumbnail
  honorific: 'Ông' | 'Bà' | string;
  fullName: string;
  birthDate: string;
  nativePlace: string; // Nguyên quán
  residence: string; // Trú quán
  bodilyInjuryRate: string; // Tỷ lệ tổn thương cơ thể
  formattedTitle: string; // Tiêu đề hồ sơ chuẩn phân tách bằng dấu phẩy
  documentType: string;
  handwritingNotes: string;
  fullExtractedText: string;
  confidence: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  isEditing?: boolean;
}

export interface ProcessingProgress {
  currentPage: number;
  totalPages: number;
  currentFileName: string;
  isProcessing: boolean;
  statusText: string;
}

/**
 * Chuẩn hóa tên cá nhân: Viết hoa chữ cái đầu mỗi từ (Title Case)
 * Ví dụ: "NGUYỄN VĂN AN" -> "Nguyễn Văn An"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Tạo Tiêu đề hồ sơ chuẩn cấu trúc với các trường phân tách bằng dấu phẩy:
 * "Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với (Ông/bà) + Tên cá nhân có trong văn bản + ngày sinh + nguyên quán + trú quán + tỷ lệ tổn thương cơ thể"
 */
export function generateProfileTitle(data: {
  honorific?: string;
  fullName?: string;
  birthDate?: string;
  nativePlace?: string;
  residence?: string;
  bodilyInjuryRate?: string;
  economicBasisRate?: string; // Tương thích ngược
}): string {
  const honorific = (data.honorific || 'Ông').trim();
  const name = toTitleCase(data.fullName || 'Chưa rõ họ tên');
  
  // Xử lý ngày sinh
  let birth = (data.birthDate || '').trim();
  if (birth && !birth.toLowerCase().startsWith('sinh') && !birth.toLowerCase().startsWith('ngày sinh')) {
    birth = `sinh ngày ${birth}`;
  } else if (!birth) {
    birth = 'chưa rõ ngày sinh';
  }

  // Xử lý nguyên quán
  let native = (data.nativePlace || '').trim();
  if (native && !native.toLowerCase().startsWith('nguyên quán') && !native.toLowerCase().startsWith('quê quán')) {
    native = `nguyên quán ${native}`;
  } else if (!native) {
    native = 'nguyên quán chưa rõ';
  }

  // Xử lý trú quán (thay thế căn quán thành trú quán)
  let res = (data.residence || '').trim();
  if (res) {
    if (res.toLowerCase().startsWith('căn quán')) {
      res = `trú quán ${res.slice('căn quán'.length).trim()}`;
    } else if (!res.toLowerCase().startsWith('trú quán')) {
      res = `trú quán ${res}`;
    }
  } else {
    res = 'trú quán chưa rõ';
  }

  // Xử lý tỷ lệ tổn thương cơ thể
  const rateVal = data.bodilyInjuryRate || data.economicBasisRate || '';
  let rate = rateVal.trim();
  if (rate) {
    if (rate.toLowerCase().includes('tỷ lệ cơ sở kinh tế')) {
      rate = rate.replace(/tỷ lệ cơ sở kinh tế/gi, 'tỷ lệ tổn thương cơ thể').trim();
    } else if (!rate.toLowerCase().includes('tỷ lệ') && !rate.toLowerCase().includes('tổn thương') && !rate.toLowerCase().includes('mất sức')) {
      rate = `tỷ lệ tổn thương cơ thể ${rate}`;
    }
  } else {
    rate = 'tỷ lệ tổn thương cơ thể chưa xác định';
  }

  // Cấu trúc phân tách bằng dấu phẩy
  return `Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với ${honorific} ${name}, ${birth}, ${native}, ${res}, ${rate}`;
}
