
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initialize GoogleGenAI with the API key from environment variables as required
    // The key is assumed to be valid and accessible in the current context
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Analyze attendance statistics using Gemini 3 Flash model
  async analyzeAttendance(stats: any) {
    try {
      const prompt = `Analisis data kehadiran sekolah SMAN 1 Kwanyar berikut: ${JSON.stringify(stats)}. Berikan ringkasan dalam 3 poin: 1. Tingkat kehadiran rata-rata, 2. Identifikasi masalah (jika ada siswa/kelas yang sering absen), dan 3. Saran tindakan untuk guru. Jawab dalam Bahasa Indonesia yang profesional.`;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // The text property returns the generated string output directly. Do not use text() method.
      return response.text;
    } catch (error) {
      console.error("AI Insight Error:", error);
      return "Gagal memuat analisis AI saat ini.";
    }
  }
}

export const geminiService = new GeminiService();
