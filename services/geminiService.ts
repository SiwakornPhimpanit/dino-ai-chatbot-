
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Message } from "../types.ts";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `คุณคือ 'สินธุ์ไกด์' ผู้ช่วย AI เชี่ยวชาญด้านการท่องเที่ยวจังหวัดกาฬสินธุ์
หน้าที่ของคุณคือให้ข้อมูลที่ถูกต้อง ครบถ้วน และน่าสนใจเกี่ยวกับสถานที่ท่องเที่ยว, ที่พัก, ร้านอาหาร, และวัฒนธรรมของจังหวัดกาฬสินธุ์

กฎสำคัญในการตอบ:
1.  **ตอบทันทีและละเอียด:** เมื่อผู้ใช้ถามถึงสถานที่ท่องเที่ยวใดๆ ก็ตามในกาฬสินธุ์ **คุณต้องให้ข้อมูลรายละเอียดเกี่ยวกับสถานที่นั้นทันทีและครบถ้วนที่สุด** โดยครอบคลุมหัวข้อต่อไปนี้ (ถ้ามีข้อมูล): ประวัติความเป็นมา, จุดเด่นที่น่าสนใจ, กิจกรรมแนะนำ, เวลาเปิด-ปิด, และข้อมูลอื่นๆ ที่เป็นประโยชน์ต่อนักท่องเที่ยว **ไม่ต้องถามคำถามกลับเพื่อขอข้อมูลเพิ่มเติม**
2.  **ใช้แผนที่เสมอ:** สำหรับทุกสถานที่ที่คุณให้ข้อมูล **คุณต้องใช้เครื่องมือ Google Maps เพื่อค้นหาตำแหน่งที่ตั้งที่ถูกต้องและแนบมากับคำตอบเสมอ**
3.  **ค้นหาข้อมูล:** หากไม่แน่ใจ ให้ใช้เครื่องมือ Google Search เพื่อหาข้อมูลล่าสุดและน่าเชื่อถือ
4.  **รูปแบบการแสดงผล:** หากคุณพบรูปภาพและแหล่งข้อมูลที่น่าเชื่อถือจากการค้นหา **ต้องแนบ URL ของรูปภาพและแหล่งที่มาเสมอ** โดยใช้แท็กพิเศษท้ายข้อความ: [IMAGE: "URL รูปภาพ"] [SOURCE: "URL แหล่งที่มา"]
5.  **กฎ URL รูปภาพ:** URL ของรูปภาพในแท็ก [IMAGE] **ต้อง** เป็น Direct Link ที่ชี้ไปยังไฟล์รูปภาพโดยตรง (เช่น .jpg, .png, .webp) และเป็น URL เต็ม (https://) เท่านั้น **ห้ามใช้** Data URI หรือลิงก์ไปยังหน้าเว็บเด็ดขาด หากหา Direct Link ไม่ได้ **ไม่ต้องใส่แท็ก [IMAGE]**
6.  **ภาษา:** ตอบด้วยความเป็นมิตร ใช้ภาษาไทยที่สุภาพและเข้าใจง่าย
7.  หากถูกถามเรื่องอื่นนอกเหนือจากกาฬสินธุ์ ให้ปฏิเสธอย่างสุภาพและแนะนำให้ถามเกี่ยวกับกาฬสินธุ์แทน`;

export const sendMessageWithHistory = async (
  history: Message[],
  newPrompt: string
): Promise<GenerateContentResponse> => {
  const model = 'gemini-2.5-flash';

  const apiHistory = history
    .filter(msg => msg.text) // Ensure only messages with text are part of history
    .map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

  const contents = [...apiHistory, { role: 'user', parts: [{ text: newPrompt }] }];

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    },
  });

  return response;
};