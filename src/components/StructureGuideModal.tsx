import React from 'react';
import { X, CheckCircle2, AlertCircle, FileSpreadsheet, Copy } from 'lucide-react';

interface StructureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StructureGuideModal: React.FC<StructureGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
              TC
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Quy Chuẩn Cấu Trúc Tiêu Đề Hồ Sơ Bệnh Binh
              </h3>
              <p className="text-xs text-slate-500">
                Tuân thủ theo chỉ đạo bóc tách tài liệu lưu trữ chế độ chính sách
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-slate-700">
          {/* Cấu trúc chuẩn */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              1. Công thức cấu trúc tiêu đề:
            </span>
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-red-950 font-medium font-mono text-xs leading-relaxed">
              Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với (Ông/bà) + Tên cá nhân có trong văn bản + ngày sinh + nguyên quán + trú quán + tỷ lệ tổn thương cơ thể
            </div>
          </div>

          {/* Quy tắc quan trọng */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              2. Các quy tắc bắt buộc:
            </span>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Phân tách bằng dấu phẩy (comma):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Các trường thông tin trong tiêu đề được ngăn cách bằng dấu phẩy theo yêu cầu (Ví dụ: <em>... đối với Ông Nguyễn Văn A, sinh ngày 15/08/1951, nguyên quán..., trú quán..., tỷ lệ tổn thương cơ thể...</em>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Quy cách viết hoa tên cá nhân:</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tên cá nhân <strong>chỉ viết hoa chữ cái đầu</strong> (Title Case: <em>Nguyễn Văn Hoan</em>), tuyệt đối không viết hoa toàn bộ như <em>NGUYỄN VĂN HOAN</em>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Mỗi trang văn bản là 1 tiêu đề:</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mỗi trang trong tệp PDF khi bóc tách sẽ tự động sinh ra một hàng tương ứng với 1 tiêu đề hồ sơ độc lập.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Đọc kỹ tài liệu viết tay (bút mực, bút bi):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hệ thống tích hợp mô hình Gemini OCR tối ưu hóa cho chữ viết tay, con dấu mộc đỏ và giấy tờ ngả màu lưu trữ qua nhiều thập kỷ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ví dụ mẫu kết quả */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              3. Ví dụ tiêu đề hồ sơ hoàn chỉnh:
            </span>
            <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 text-xs text-slate-800 leading-relaxed font-sans">
              &ldquo;Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với Ông Trần Đình Hùng, sinh ngày 15/08/1951, nguyên quán Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây, trú quán Thôn Trinh Tiết, Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây, tỷ lệ tổn thương cơ thể 61%&rdquo;
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
