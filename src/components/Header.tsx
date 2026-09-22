import React from 'react';
import { FileText, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  recordCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, recordCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Bóc Tách Tiêu Đề Hồ Sơ Bệnh Binh
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                <Sparkles className="w-3 h-3 text-red-600" />
                OCR Bút Mực & Bút Bi
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">
              Bóc tách từng trang PDF, tự động tạo tiêu đề hồ sơ chuẩn phân tách dấu phẩy & xuất Excel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã xử lý: <strong>{recordCount}</strong> hồ sơ</span>
          </div>

          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Quy chuẩn tiêu đề</span>
          </button>
        </div>
      </div>
    </header>
  );
};
