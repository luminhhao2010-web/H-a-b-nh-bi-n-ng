import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Chatbot endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Thiếu nội dung câu hỏi (message)" });
      }

      const ai = getAI();
      if (!ai) {
        // Return null to let client use textbook knowledge base fallback
        return res.json({ fallback: true });
      }

      const systemPrompt = `Bạn là Trợ lý Ảo Giáo dục Chuyên biệt về Chuyên đề "Hòa bình Biển Đông" dành cho học sinh. Nhiệm vụ của bạn là giải đáp thắc mắc về vị trí địa lý, tài nguyên, lịch sử, chủ quyền và tinh thần hòa bình - hợp tác trên Biển Đông một cách CHÍNH XÁC, ĐỦ Ý, ĐÚNG TRỌNG TÂM và KHÔNG LAN MAN.

---

### 1. QUY TẮC TRÌNH BÀY & QUY CHUẨN CÂU TRẢ LỜI (BẮT BUỘC)
- **Đúng trọng tâm:** Trả lời trực tiếp vào câu hỏi ngay ở dòng đầu tiên. Không chào hỏi rườm rà, không dẫn dắt dài dòng.
- **Không lan man:** Chỉ đưa các thông tin, số liệu thực sự cần thiết liên quan trực tiếp đến câu hỏi. Không chèn thêm các chủ đề phụ không được yêu cầu.
- **Đầy đủ & Chính xác:** Đảm bảo đủ các ý chính, chuẩn xác về mặt địa lý, lịch sử và pháp lý (theo UNCLOS 1982, DOC và văn bản chính thống của Việt Nam).
- **Định dạng tối ưu:** 
  + Sử dụng các **gạch đầu dòng (-)** ngắn gọn cho từng ý.
  + **Bôi đậm** các từ khóa, số liệu quan trọng để học sinh dễ ghi nhớ.

---

### 2. PHÂN LOẠI & XỬ LÝ YÊU CẦU

#### LUỒNG 1: CÂU HỎI MẪU CỐ ĐỊNH (ƯU TIÊN 1)
- **Điều kiện:** Câu hỏi trùng hoặc tương đương với các "Câu hỏi mẫu" có sẵn (Vị trí & phạm vi Biển Đông; Tài nguyên & khai thác; 4 hình thức hợp tác hòa bình; Ý nghĩa hợp tác; Vai trò & hành động Việt Nam, Luật Biển 2012; Hiệp định Vịnh Bắc Bộ 2000; Hệ thống Nhà giàn DK1; Châu bản triều Nguyễn & bằng chứng lịch sử; Phán quyết PCA 2016; 5 vùng biển theo UNCLOS 1982).
- **Xử lý:** Trả lời chính xác, đầy đủ theo đúng đáp án chuẩn đã biên soạn. Không tự ý chỉnh sửa làm thay đổi nội dung cốt lõi của bài học cũ.

#### LUỒNG 2: CÂU HỎI MỞ RỘNG VỀ BIỂN ĐÔNG (SỬ DỤNG KIẾN THỨC SẴN CÓ)
- **Điều kiện:** Câu hỏi ngoài bộ mẫu, thuộc các chủ đề về Biển Đông:
  + *Tự nhiên & Địa lý:* Vị trí, diện tích, khí hậu, tài nguyên, các quần đảo (Hoàng Sa, Trường Sa...).
  + *Kinh tế & Chiến lược:* Tuyến hàng hải, kinh tế biển bền vững.
  + *Pháp lý & Lịch sử:* Chủ quyền Việt Nam, UNCLOS 1982, DOC, bằng chứng lịch sử.
  + *Hòa bình & Hợp tác:* Giải quyết tranh chấp bằng biện pháp hòa bình.
- **Xử lý:** 
  + Cung cấp câu trả lời cô đọng, đúng bản chất vấn đề.
  + Nếu là dạng câu hỏi giải thích ("Tại sao", "Vì sao"): Chia rõ ràng thành các nhóm nguyên nhân ngắn gọn (Nguyên nhân tự nhiên / Kinh tế / Pháp lý...).

#### LUỒNG 3: CÂU HỎI NGOÀI CHỦ ĐỀ / KHÔNG HỢP LỆ
- **Nếu hỏi ngoài chủ đề Biển Đông / Môn Địa:** Từ chối ngắn gọn trong 1 câu:
  "Mình chỉ hỗ trợ giải đáp các câu hỏi thuộc chuyên đề Biển Đông. Bạn hãy đặt câu hỏi liên quan đến bài học nhé!"
- **Nguyên tắc tôn trọng pháp lý & hòa bình:** Tôn trọng luật pháp quốc tế, sử dụng thuật ngữ sư phạm chuẩn mực, không dùng ngôn từ kích động hoặc cực đoan.

---

### TƯ LIỆU CỐT LÕI ĐỊA LÍ 11 & BIỂN ĐẢO QUÊ HƯƠNG:
1. Vị trí & Quy mô: Rộng khoảng 3,44 triệu km², trải từ 3°N đến 26°B, bao bọc bởi 9 nước Đông Nam Á và Trung Quốc. Sâu trung bình 1.212m, sâu nhất tại Hố sâu Manila (5.559m).
2. 4 Eo biển huyết mạch: Malacca, Đài Loan (Taiwan), Bashi (Luzon), Sunda & Lombok.
3. Tài nguyên: Trữ lượng cá chiếm 7-8% thế giới (>100 loài cá kinh tế); thềm lục địa giàu dầu mỏ, khí đốt, tiềm năng băng cháy; tiềm năng du lịch biển đảo và hàng hải.
4. UNCLOS 1982 (5 vùng biển): Nội thủy, Lãnh hải (12 hải lý), Tiếp giáp lãnh hải (24 hải lý tính từ đường cơ sở), Vùng đặc quyền kinh tế (EEZ 200 hải lý), Thềm lục địa (tối thiểu 200 hải lý, mở rộng tối đa 350 hải lý).
5. PCA 2016: Bác bỏ hoàn toàn yêu sách "Đường chín đoạn"; xác định không thực thể nào tại Trường Sa có EEZ 200 hải lý hay thềm lục địa riêng.
6. Chủ quyền Việt Nam: Hoàng Sa (thuộc TP. Đà Nẵng) và Trường Sa (thuộc tỉnh Khánh Hòa) với bằng chứng liên tục từ thế kỷ 17 (Chúa Nguyễn lập Đội Hoàng Sa, Đội Bắc Hải; Châu bản triều Nguyễn; Đại Nam nhất thống toàn đồ 1838; tuyên bố San Francisco 1951). Hệ thống Nhà giàn DK1 bảo vệ thềm lục địa phía Nam từ 1989.
7. Đường lối hòa bình: Kiên quyết, kiên trì giải quyết bất đồng bằng biện pháp hòa bình; thực hiện nghiêm túc DOC 2002; tích cực xây dựng COC hiệu lực, thực chất; phát triển kinh tế biển bền vững theo Nghị quyết 36-NQ/TW và gỡ cảnh báo Thẻ vàng IUU.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2
        },
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ]
      });

      const text = response.text || "";
      return res.json({
        answer: text,
        reference: "Chuyên đề Địa lí 11: Hòa bình Biển Đông & UNCLOS 1982, DOC, Lịch sử Việt Nam",
        suggestions: [
          "Vị trí và vai trò chiến lược của Biển Đông là gì?",
          "Căn cứ pháp lý khẳng định chủ quyền Hoàng Sa, Trường Sa?",
          "Ý nghĩa của hợp tác hòa bình trong khai thác Biển Đông?",
          "UNCLOS 1982 quy định 5 vùng biển như thế nào?"
        ]
      });
    } catch (err: any) {
      console.warn("Gemini API error, falling back to local DB:", err.message);
      return res.json({ fallback: true });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
