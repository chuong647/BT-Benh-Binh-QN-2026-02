import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Save, Copy, Check, FileText, AlertCircle } from 'lucide-react';
import { BinhBinhRecord, generateProfileTitle, toTitleCase } from '../types';

interface DetailModalProps {
  record: BinhBinhRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: BinhBinhRecord) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !record) return null;

  const [honorific, setHonorific] = useState(record.honorific || 'Ông');
  const [fullName, setFullName] = useState(record.fullName || '');
  const [birthDate, setBirthDate] = useState(record.birthDate || '');
  const [nativePlace, setNativePlace] = useState(record.nativePlace || '');
  const [residence, setResidence] = useState(record.residence || '');
  const [bodilyInjuryRate, setBodilyInjuryRate] = useState(record.bodilyInjuryRate || (record as any).economicBasisRate || '');
  const [documentType, setDocumentType] = useState(record.documentType || '');
  const [handwritingNotes, setHandwritingNotes] = useState(record.handwritingNotes || '');
  const [fullExtractedText, setFullExtractedText] = useState(record.fullExtractedText || '');

  // Ảnh xem trước thu phóng
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copiedTitle, setCopiedTitle] = useState(false);

  useEffect(() => {
    setHonorific(record.honorific || 'Ông');
    setFullName(record.fullName || '');
    setBirthDate(record.birthDate || '');
    setNativePlace(record.nativePlace || '');
    setResidence(record.residence || '');
    setBodilyInjuryRate(record.bodilyInjuryRate || (record as any).economicBasisRate || '');
    setDocumentType(record.documentType || '');
    setHandwritingNotes(record.handwritingNotes || '');
    setFullExtractedText(record.fullExtractedText || '');
    setZoomLevel(1);
    setRotation(0);
  }, [record]);

  // Tiêu đề hồ sơ tự động cập nhật theo các trường
  const currentCalculatedTitle = generateProfileTitle({
    honorific,
    fullName,
    birthDate,
    nativePlace,
    residence,
    bodilyInjuryRate,
  });

  const handleSave = () => {
    onSave({
      ...record,
      honorific,
      fullName: toTitleCase(fullName),
      birthDate,
      nativePlace,
      residence,
      bodilyInjuryRate,
      documentType,
      handwritingNotes,
      fullExtractedText,
      formattedTitle: currentCalculatedTitle,
    });
    onClose();
  };

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(currentCalculatedTitle);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">
              P.{record.pageNumber}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
                <span>Đối Chiếu & Chỉnh Sửa Hồ Sơ</span>
                <span className="text-xs font-normal text-slate-500">
                  (Tệp: {record.fileName} - Trang {record.pageNumber})
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTitle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedTitle ? 'Đã sao chép' : 'Sao chép tiêu đề'}</span>
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu thay đổi</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Calculated Title Preview Banner */}
        <div className="px-5 py-2.5 bg-red-50/70 border-b border-red-200 text-xs shrink-0 flex items-start gap-2">
          <span className="font-semibold text-red-900 shrink-0 mt-0.5">Tiêu đề tạo tự động:</span>
          <p className="font-mono text-red-950 font-medium leading-relaxed select-all">
            {currentCalculatedTitle}
          </p>
        </div>

        {/* Main Body: 2 Columns (Left: Original Scanned Page, Right: Extracted Data Fields) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Cột trái: Văn bản gốc (Ảnh scan / trang PDF) */}
          <div className="lg:col-span-6 bg-slate-950/95 flex flex-col border-r border-slate-200 min-h-0 relative">
            <div className="p-2.5 bg-slate-900/90 text-slate-300 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="font-medium flex items-center gap-1.5 text-slate-200">
                <FileText className="w-3.5 h-3.5 text-red-400" />
                Văn bản gốc (Chữ viết tay bút mực / bút bi)
              </span>

              {/* Bộ điều khiển phóng to/thu nhỏ */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-md p-0.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[11px] font-mono text-slate-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3 bg-slate-700 mx-0.5" />
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300"
                  title="Xoay 90 độ"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Khung hiển thị ảnh zoomable */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {record.previewUrl ? (
                <img
                  src={record.previewUrl}
                  alt={`Trang ${record.pageNumber}`}
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-h-full max-w-full object-contain rounded shadow-lg select-none"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs">
                  Không có hình ảnh xem trước của trang này
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Các trường bóc tách & chỉnh sửa */}
          <div className="lg:col-span-6 bg-white overflow-y-auto p-5 space-y-4 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Danh xưng (Ông / Bà)
                </label>
                <select
                  value={honorific}
                  onChange={(e) => setHonorific(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="Ông">Ông</option>
                  <option value="Bà">Bà</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên cá nhân (Chỉ viết hoa chữ cái đầu)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày sinh / Năm sinh
                </label>
                <input
                  type="text"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="Ví dụ: 15/08/1951 hoặc 1951"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tỷ lệ tổn thương cơ thể
                </label>
                <input
                  type="text"
                  value={bodilyInjuryRate}
                  onChange={(e) => setBodilyInjuryRate(e.target.value)}
                  placeholder="Ví dụ: 61% hoặc Hạng 2/3 - 61%"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nguyên quán (Quê quán)
              </label>
              <input
                type="text"
                value={nativePlace}
                onChange={(e) => setNativePlace(e.target.value)}
                placeholder="Ví dụ: Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trú quán (Nơi cư trú)
              </label>
              <input
                type="text"
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                placeholder="Ví dụ: Thôn Trinh Tiết, Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại văn bản
                </label>
                <input
                  type="text"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder="Quyết định / Biên bản giám định..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đặc điểm chữ viết (Bút bi / mực)
                </label>
                <input
                  type="text"
                  value={handwritingNotes}
                  onChange={(e) => setHandwritingNotes(e.target.value)}
                  placeholder="Chữ viết tay bút bi xanh..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Toàn văn nội dung bóc tách được (OCR Text)
              </label>
              <textarea
                rows={4}
                value={fullExtractedText}
                onChange={(e) => setFullExtractedText(e.target.value)}
                placeholder="Nội dung văn bản nhận dạng..."
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
