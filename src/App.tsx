import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';
import { DataTable } from './components/DataTable';
import { DetailModal } from './components/DetailModal';
import { StructureGuideModal } from './components/StructureGuideModal';
import { BinhBinhRecord, ProcessingProgress, generateProfileTitle, toTitleCase } from './types';
import { extractPagesFromPdf, processImageFile } from './utils/pdfProcessor';
import { CheckCircle2, AlertTriangle, Plus, FileSpreadsheet, Sparkles, HelpCircle } from 'lucide-react';

export default function App() {
  // Danh sách hồ sơ bắt đầu rỗng theo yêu cầu xóa bảng mẫu của người dùng
  const [records, setRecords] = useState<BinhBinhRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BinhBinhRecord | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [progress, setProgress] = useState<ProcessingProgress>({
    currentPage: 0,
    totalPages: 0,
    currentFileName: '',
    isProcessing: false,
    statusText: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Xử lý tệp được người dùng chọn (PDF hoặc Ảnh)
  const handleFileSelected = async (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      alert('Vui lòng chọn tệp PDF hoặc ảnh scan tài liệu (JPG, PNG)');
      return;
    }

    setProgress({
      currentPage: 0,
      totalPages: 1,
      currentFileName: file.name,
      isProcessing: true,
      statusText: isPdf ? 'Đang trích xuất từng trang PDF thành hình ảnh độ nét cao...' : 'Đang xử lý ảnh tài liệu...',
    });

    try {
      let pagesToProcess: { pageNumber: number; dataUrl: string }[] = [];

      if (isPdf) {
        pagesToProcess = await extractPagesFromPdf(file, (current, total) => {
          setProgress((prev) => ({
            ...prev,
            currentPage: current,
            totalPages: total,
            statusText: `Đã trích xuất ${current}/${total} trang từ tệp ${file.name}...`,
          }));
        });
      } else {
        const singlePage = await processImageFile(file);
        pagesToProcess = [{ pageNumber: 1, dataUrl: singlePage.dataUrl }];
      }

      const totalPages = pagesToProcess.length;
      showToast(`Bắt đầu OCR bóc tách ${totalPages} trang văn bản bằng Gemini...`);

      const newExtractedRecords: BinhBinhRecord[] = [];

      // Xử lý OCR từng trang một cách tuần tự và hiển thị kết quả dần lên bảng
      for (let i = 0; i < totalPages; i++) {
        const pageItem = pagesToProcess[i];
        const pageNum = pageItem.pageNumber;

        // Giãn cách ngắn giữa các trang để tránh nghẽn tải hoặc rate limit
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        setProgress({
          currentPage: pageNum,
          totalPages,
          currentFileName: file.name,
          isProcessing: true,
          statusText: `Đang nhận diện OCR trang ${pageNum}/${totalPages} (bút mực, bút bi)...`,
        });

        try {
          // Thử gửi yêu cầu với cơ chế retry tự động
          let res: Response | null = null;
          let lastFetchError: any = null;

          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              res = await fetch('/api/ocr-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageBase64: pageItem.dataUrl,
                  mimeType: 'image/jpeg',
                  fileName: file.name,
                  pageNumber: pageNum,
                }),
              });

              if (res.ok) {
                break;
              } else {
                const errorData = await res.json().catch(() => ({}));
                const errMsg = errorData.error || `Lỗi máy chủ (${res.status})`;
                lastFetchError = new Error(errMsg);

                if (attempt < 2 && (res.status === 503 || res.status === 429)) {
                  setProgress((prev) => ({
                    ...prev,
                    statusText: `Máy chủ AI đang bận, tự động thử lại trang ${pageNum}...`,
                  }));
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                }
              }
            } catch (netErr: any) {
              lastFetchError = netErr;
              if (attempt < 2) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }
            }
          }

          if (!res || !res.ok) {
            throw lastFetchError || new Error('Không thể kết nối đến dịch vụ OCR');
          }

          const ocrResult = await res.json();

          // Chuẩn hóa tên viết hoa chữ cái đầu và tạo tiêu đề chuẩn
          const normalizedName = toTitleCase(ocrResult.fullName || `Hồ Sơ Trang ${pageNum}`);
          const injuryRate = ocrResult.bodilyInjuryRate || ocrResult.economicBasisRate || '';
          const formattedTitle =
            ocrResult.formattedTitle ||
            generateProfileTitle({
              honorific: ocrResult.honorific,
              fullName: normalizedName,
              birthDate: ocrResult.birthDate,
              nativePlace: ocrResult.nativePlace,
              residence: ocrResult.residence,
              bodilyInjuryRate: injuryRate,
            });

          const record: BinhBinhRecord = {
            id: `rec-${Date.now()}-${pageNum}-${Math.random().toString(36).substr(2, 5)}`,
            pageNumber: pageNum,
            fileName: file.name,
            previewUrl: pageItem.dataUrl,
            honorific: ocrResult.honorific || 'Ông',
            fullName: normalizedName,
            birthDate: ocrResult.birthDate || '',
            nativePlace: ocrResult.nativePlace || '',
            residence: ocrResult.residence || '',
            bodilyInjuryRate: injuryRate,
            formattedTitle,
            documentType: ocrResult.documentType || 'Văn bản hồ sơ bệnh binh',
            handwritingNotes: ocrResult.handwritingNotes || 'Chữ viết tay bút bi/bút mực',
            fullExtractedText: ocrResult.fullExtractedText || '',
            confidence: ocrResult.confidence || 'high',
            status: 'completed',
          };

          newExtractedRecords.push(record);
          // Cập nhật real-time vào bảng, luôn sắp xếp thứ tự từ trên xuống theo số trang (Trang 1, 2, 3...)
          setRecords((prev) => {
            const updated = [...prev, record];
            return updated.sort((a, b) => a.pageNumber - b.pageNumber);
          });
        } catch (pageError: any) {
          console.error(`Lỗi OCR trang ${pageNum}:`, pageError);
          // Vẫn tạo record với thông báo lỗi để người dùng có thể đối chiếu và nhập thủ công
          const errorRecord: BinhBinhRecord = {
            id: `rec-err-${Date.now()}-${pageNum}`,
            pageNumber: pageNum,
            fileName: file.name,
            previewUrl: pageItem.dataUrl,
            honorific: 'Ông',
            fullName: `Trang ${pageNum}`,
            birthDate: '',
            nativePlace: '',
            residence: '',
            bodilyInjuryRate: '',
            formattedTitle: `Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với Ông Trang ${pageNum}, chưa rõ ngày sinh, nguyên quán chưa rõ, trú quán chưa rõ, tỷ lệ tổn thương cơ thể chưa xác định`,
            documentType: 'Cần kiểm tra thủ công',
            handwritingNotes: `Gặp lỗi OCR: ${pageError.message}`,
            fullExtractedText: '',
            confidence: 'low',
            status: 'error',
            errorMessage: pageError.message,
          };
          setRecords((prev) => {
            const updated = [...prev, errorRecord];
            return updated.sort((a, b) => a.pageNumber - b.pageNumber);
          });
        }
      }

      setProgress({
        currentPage: totalPages,
        totalPages,
        currentFileName: file.name,
        isProcessing: false,
        statusText: `Hoàn tất bóc tách ${totalPages} trang!`,
      });

      showToast(`Đã hoàn tất bóc tách thành công ${totalPages} trang hồ sơ!`);
    } catch (err: any) {
      console.error('Lỗi khi bóc tách tệp:', err);
      alert(`Có lỗi xảy ra: ${err.message || 'Không thể xử lý tệp'}`);
      setProgress((prev) => ({
        ...prev,
        isProcessing: false,
        statusText: `Lỗi: ${err.message}`,
      }));
    }
  };

  // Cập nhật record sau khi chỉnh sửa
  const handleUpdateRecord = (updated: BinhBinhRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast('Đã lưu các thay đổi của hồ sơ');
  };

  // Xóa 1 record
  const handleDeleteRecord = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa dòng hồ sơ này?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('Đã xóa 1 dòng hồ sơ');
    }
  };

  // Xóa tất cả
  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách hồ sơ hiện tại?')) {
      setRecords([]);
      showToast('Đã dọn dẹp danh sách');
    }
  };

  // Thêm một dòng thủ công
  const handleAddNewRow = () => {
    const newPageNum = records.length + 1;
    const newRecord: BinhBinhRecord = {
      id: `manual-${Date.now()}`,
      pageNumber: newPageNum,
      fileName: 'Nhap_Thu_Cong.pdf',
      previewUrl: '',
      honorific: 'Ông',
      fullName: 'Nguyễn Văn Mới',
      birthDate: '01/01/1950',
      nativePlace: 'Hà Nội',
      residence: 'Hà Nội',
      bodilyInjuryRate: '61%',
      formattedTitle: generateProfileTitle({
        honorific: 'Ông',
        fullName: 'Nguyễn Văn Mới',
        birthDate: '01/01/1950',
        nativePlace: 'Hà Nội',
        residence: 'Hà Nội',
        bodilyInjuryRate: '61%',
      }),
      documentType: 'Quyết định bổ sung',
      handwritingNotes: 'Nhập thủ công',
      fullExtractedText: '',
      confidence: 'high',
      status: 'completed',
    };

    setRecords((prev) => {
      const updated = [...prev, newRecord];
      return updated.sort((a, b) => a.pageNumber - b.pageNumber);
    });
    setSelectedRecord(newRecord);
    showToast('Đã thêm 1 hồ sơ mới, vui lòng cập nhật thông tin');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased font-sans">
      {/* Header */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        recordCount={records.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner giới thiệu nhanh & tóm tắt cấu trúc tiêu đề */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-950 text-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-700/80 text-[11px] font-semibold tracking-wide uppercase border border-red-500/50">
                  Chuẩn hóa Lưu trữ Quốc gia
                </span>
                <span className="text-xs text-red-200">Bóc tách trang PDF tự động</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Cấu trúc tiêu đề hồ sơ cấp sổ bệnh binh và trợ cấp hàng tháng
              </h2>
              <p className="text-xs text-red-100 font-mono bg-red-950/60 p-2 rounded border border-red-700/50 leading-relaxed">
                Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với (Ông/bà), [Tên cá nhân], [ngày sinh], [nguyên quán], [trú quán], [tỷ lệ tổn thương cơ thể]
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <button
                id="btn-quick-add"
                onClick={handleAddNewRow}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white text-red-900 hover:bg-red-50 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm thủ công</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload dropzone */}
        <UploadDropzone
          onFileSelected={handleFileSelected}
          progress={progress}
          onCancel={() =>
            setProgress((prev) => ({
              ...prev,
              isProcessing: false,
              statusText: 'Đã dừng xử lý.',
            }))
          }
        />

        {/* Data Table */}
        <DataTable
          records={records}
          onSelectRecord={(rec) => setSelectedRecord(rec)}
          onDeleteRecord={handleDeleteRecord}
          onClearAll={handleClearAll}
          onAddNewRow={handleAddNewRow}
          onUpdateRecord={handleUpdateRecord}
        />
      </main>

      {/* Side-by-Side Detail & Verification Modal */}
      <DetailModal
        record={selectedRecord}
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        onSave={handleUpdateRecord}
      />

      {/* Guide Modal */}
      <StructureGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xl flex items-center gap-2 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
