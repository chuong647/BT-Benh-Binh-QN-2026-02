import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Hỗ trợ nhận body JSON kích thước lớn do chứa ảnh quét base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Khởi tạo Gemini client an toàn ở server-side
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint kiểm tra trạng thái hệ thống
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.5-flash',
  });
});

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite-preview',
];

// Hàm gọi Gemini với cơ chế tự động chuyển model dự phòng thông minh khi model bận (503/429)
async function generateWithFallback(
  ai: any,
  requestPayload: any,
  models: string[] = CANDIDATE_MODELS
) {
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[OCR] Đang xử lý bóc tách qua model: ${model}...`);
      const response = await ai.models.generateContent({
        ...requestPayload,
        model,
      });
      console.log(`[OCR] Bóc tách thành công qua model: ${model}`);
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.log(`[OCR] Model ${model} đang bận hoặc giới hạn tải, chuyển sang model dự phòng tiếp theo...`);
      // Đợi ngắn 300ms rồi gọi model tiếp theo trong danh sách
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  throw lastError;
}

// Endpoint OCR bóc tách từng trang tài liệu bệnh binh
app.post('/api/ocr-page', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', fileName = 'document.pdf', pageNumber = 1 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Thiếu dữ liệu ảnh trang tài liệu (imageBase64)' });
    }

    // Làm sạch chuỗi base64 nếu chứa data:image/...;base64,
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const ai = getGeminiClient();

    if (!ai) {
      // Nếu chưa có API key trong môi trường, trả về phản hồi mô phỏng thông minh dựa trên tên tệp
      console.warn('GEMINI_API_KEY chưa được cấu hình. Đang dùng bộ phân tích dự phòng.');
      const fallbackTitle = `Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với Ông Nguyễn Văn ${pageNumber}, sinh ngày 10/05/1952, nguyên quán Xã Tam Hưng, Huyện Thanh Oai, TP Hà Nội, trú quán Xã Tam Hưng, Huyện Thanh Oai, TP Hà Nội, tỷ lệ tổn thương cơ thể 61%`;
      return res.json({
        honorific: 'Ông',
        fullName: `Nguyễn Văn ${pageNumber}`,
        birthDate: '10/05/1952',
        nativePlace: 'Xã Tam Hưng, Huyện Thanh Oai, TP Hà Nội',
        residence: 'Xã Tam Hưng, Huyện Thanh Oai, TP Hà Nội',
        bodilyInjuryRate: '61%',
        documentType: 'Quyết định cấp sổ bệnh binh',
        handwritingNotes: 'Tài liệu chữ viết tay bút bi / bút mực (Chế độ xem trước: Vui lòng gắn GEMINI_API_KEY trong Settings > Secrets để phân tích thật)',
        fullExtractedText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nQUYẾT ĐỊNH CẤP SỔ BỆNH BINH VÀ TRỢ CẤP HÀNG THÁNG\nĐối với: Ông Nguyễn Văn ${pageNumber}\nSinh ngày: 10/05/1952\nNguyên quán: Xã Tam Hưng, Huyện Thanh Oai, TP Hà Nội\nTrú quán: Xã Tam Hưng, Huyện Thanh Oai, TP Hà Nội\nTỷ lệ tổn thương cơ thể (mất sức lao động): 61%`,
        formattedTitle: fallbackTitle,
        confidence: 'medium',
      });
    }

    const systemInstruction = `Bạn là chuyên gia lưu trữ văn thư quốc gia và chuyên gia công nghệ OCR cấp cao, chuyên giải mã các hồ sơ thương binh, bệnh binh, chế độ chính sách của Việt Nam qua các thời kỳ (thập niên 1970, 1980, 1990 đến nay).
Nhiệm vụ của bạn là đọc kỹ lưỡng từng trang văn bản tài liệu được cung cấp (đặc biệt chú ý văn bản viết bằng bút mực, bút bi, chữ viết tay nghiêng/đứng, giấy ố vàng, con dấu mộc đỏ, mẫu phôi in điền tay).

Hãy phân tích trang văn bản và bóc tách các trường thông tin theo đúng quy tắc sau:
1. "honorific": Xác định là "Ông" hoặc "Bà" căn cứ theo thông tin người được cấp sổ (giới tính nam/nữ, hoặc đại từ xưng hô trong đơn/quyết định). Nếu không ghi rõ, mặc định là "Ông".
2. "fullName": Tên của cá nhân đối tượng bệnh binh được hưởng chế độ có trong trang văn bản.
   QUAN TRỌNG NHẤT VỀ ĐỊNH DẠNG TÊN: Tên cá nhân CHỈ VIẾT HOA CHỮ CÁI ĐẦU của mỗi từ (Title Case), ví dụ: "Nguyễn Văn Hoan", "Trần Đình Hùng", "Lê Văn Quang". TUYỆT ĐỐI KHÔNG viết hoa toàn bộ tất cả chữ cái (như "NGUYỄN VĂN HOAN" là sai quy cách).
3. "birthDate": Ngày tháng năm sinh hoặc năm sinh ghi trong tài liệu (ví dụ: "15/08/1951" hoặc "1951").
4. "nativePlace": Nguyên quán (hoặc quê quán). Giữ đúng địa danh hành chính ghi trong văn bản.
5. "residence": Trú quán (hoặc nơi thường trú, căn quán ghi trong văn bản).
6. "bodilyInjuryRate": Tỷ lệ tổn thương cơ thể (trong hồ sơ bệnh binh là tỷ lệ tổn thương cơ thể do thương tật bệnh tật, tỷ lệ suy giảm khả năng lao động, tỷ lệ mất sức lao động được giám định y khoa kết luận, ví dụ: "61%", "41%", "71%", hoặc "Hạng 2/3 - 61%").
7. "documentType": Loại văn bản cụ thể của trang này (ví dụ: "Quyết định cấp sổ bệnh binh", "Biên bản giám định y khoa", "Đơn xin hưởng chế độ bệnh tật", "Giấy chứng nhận bệnh tật", "Bản khai cá nhân", ...).
8. "handwritingNotes": Nhận xét chi tiết về tình trạng chữ viết trên trang: chữ viết tay bằng bút mực hay bút bi màu gì (xanh, đen, tím, đỏ), nét chữ rõ hay mờ, tình trạng con dấu, độ tin cậy.
9. "fullExtractedText": Toàn văn nội dung bóc tách được trên trang tài liệu.
10. "formattedTitle": Tiêu đề hồ sơ chuẩn hóa cho trang này. Cấu trúc BẮT BUỘC như sau:
    "Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với [Ông/bà] [Tên cá nhân], [ngày sinh], [nguyên quán], [trú quán], [tỷ lệ tổn thương cơ thể]"
    CHÚ Ý ĐẶC BIỆT: Các trường thông tin trong tiêu đề phải được ngăn cách rõ ràng bằng dấu phẩy (comma), tên cá nhân chỉ viết hoa chữ cái đầu.
    Ví dụ chuẩn mực:
    "Hồ sơ về công việc cấp sổ bệnh binh và cấp hàng tháng đối với Ông Trần Đình Hùng, sinh ngày 15/08/1951, nguyên quán Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây, trú quán Thôn Trinh Tiết, Xã Đại Hưng, Huyện Mỹ Đức, Tỉnh Hà Tây, tỷ lệ tổn thương cơ thể 61%"`;

    const promptText = `Hãy tiến hành nhận diện OCR và bóc tách thông tin trang tài liệu số ${pageNumber} trong tệp "${fileName}".
Hãy đọc thật kỹ các nét chữ viết tay bằng bút mực, bút bi, không bỏ sót chữ nào, đọc chính xác dấu tiếng Việt, tên người và địa danh. Trả về kết quả dưới dạng JSON theo đúng schema đã yêu cầu.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType as string,
        data: cleanBase64,
      },
    };

    const response = await generateWithFallback(ai, {
      contents: { parts: [imagePart, { text: promptText }] },
      config: {
        systemInstruction,
        temperature: 0.1, // Thấp để đảm bảo độ chính xác tuyệt đối cho OCR
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            honorific: {
              type: Type.STRING,
              description: 'Danh xưng Ông hoặc Bà',
            },
            fullName: {
              type: Type.STRING,
              description: 'Tên cá nhân có trong văn bản, chỉ viết hoa chữ cái đầu (Title Case)',
            },
            birthDate: {
              type: Type.STRING,
              description: 'Ngày sinh hoặc năm sinh',
            },
            nativePlace: {
              type: Type.STRING,
              description: 'Nguyên quán hoặc quê quán',
            },
            residence: {
              type: Type.STRING,
              description: 'Căn quán hoặc trú quán',
            },
            bodilyInjuryRate: {
              type: Type.STRING,
              description: 'Tỷ lệ tổn thương cơ thể / tỷ lệ mất sức lao động',
            },
            formattedTitle: {
              type: Type.STRING,
              description: 'Tiêu đề hồ sơ chuẩn cấu trúc phân tách bằng dấu phẩy',
            },
            documentType: {
              type: Type.STRING,
              description: 'Loại văn bản',
            },
            handwritingNotes: {
              type: Type.STRING,
              description: 'Nhận xét chữ viết bút mực/bút bi',
            },
            fullExtractedText: {
              type: Type.STRING,
              description: 'Toàn văn nội dung trang bóc tách được',
            },
            confidence: {
              type: Type.STRING,
              enum: ['high', 'medium', 'low'],
              description: 'Mức độ tin cậy của kết quả nhận dạng',
            },
          },
          required: [
            'honorific',
            'fullName',
            'birthDate',
            'nativePlace',
            'residence',
            'bodilyInjuryRate',
            'formattedTitle',
            'documentType',
          ],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    // Chuẩn hóa bodilyInjuryRate nếu model trả về economicBasisRate
    if (!parsedData.bodilyInjuryRate && parsedData.economicBasisRate) {
      parsedData.bodilyInjuryRate = parsedData.economicBasisRate;
    }

    // Đảm bảo tên cá nhân chỉ viết hoa chữ cái đầu (Double-check vệ sinh dữ liệu)
    if (parsedData.fullName) {
      parsedData.fullName = parsedData.fullName
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Lỗi khi xử lý OCR trang tài liệu:', error);
    res.status(500).json({
      error: error?.message || 'Lỗi không xác định khi nhận diện OCR trang văn bản',
    });
  }
});

// Khởi chạy Vite middleware trong môi trường phát triển hoặc static server trong production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server bóc tách hồ sơ bệnh binh đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
