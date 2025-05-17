import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
let genAI: GoogleGenerativeAI | null = new GoogleGenerativeAI(API_KEY);

export function initializeGemini(apiKey: string = API_KEY) {
  if (!apiKey) {
    throw new Error('API key is required. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
  }
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function generateResponse(prompt: string): Promise<string> {
  if (!genAI) {
    initializeGemini();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error generating response:', error);
    return `عذراً، حدث خطأ: ${error.message || 'خطأ غير معروف'}`;
  }
}

export async function analyzeImage(imageData: string, prompt: string): Promise<string> {
  if (!genAI) {
    initializeGemini();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData.split(',')[1]
        }
      }
    ]);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return `عذراً، حدث خطأ في تحليل الصورة: ${error.message || 'خطأ غير معروف'}`;
  }
} 