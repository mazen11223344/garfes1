import { GoogleGenerativeAI } from '@google/generative-ai';

// تأكد من وجود مفتاح API
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
}

// إنشاء مثيل واحد من GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function generateResponse(prompt: string): Promise<string> {
  if (!API_KEY) {
    return 'عذراً، مفتاح API غير متوفر. الرجاء التحقق من الإعدادات.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error generating response:', error);
    if (error.message?.includes('404')) {
      return 'عذراً، هناك مشكلة في الوصول إلى خدمة Gemini. الرجاء التحقق من مفتاح API والاتصال بالإنترنت.';
    }
    return `عذراً، حدث خطأ: ${error.message || 'خطأ غير معروف'}`;
  }
}

export async function analyzeImage(imageData: string, prompt: string): Promise<string> {
  if (!API_KEY) {
    return 'عذراً، مفتاح API غير متوفر. الرجاء التحقق من الإعدادات.';
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
    if (error.message?.includes('404')) {
      return 'عذراً، هناك مشكلة في الوصول إلى خدمة Gemini Vision. الرجاء التحقق من مفتاح API والاتصال بالإنترنت.';
    }
    return `عذراً، حدث خطأ في تحليل الصورة: ${error.message || 'خطأ غير معروف'}`;
  }
} 