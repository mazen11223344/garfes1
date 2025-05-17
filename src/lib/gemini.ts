import { GoogleGenerativeAI } from '@google/generative-ai';

// تأكد من وجود مفتاح API
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log('API Key length:', API_KEY?.length); // للتحقق من وجود المفتاح
console.log('API Key first 4 chars:', API_KEY?.substring(0, 4)); // للتحقق من بداية المفتاح

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
    console.log('Attempting to generate response with model: gemini-pro');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Model initialized, generating content...');
    const result = await model.generateContent(prompt);
    console.log('Content generated, getting response...');
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Detailed error:', JSON.stringify(error, null, 2));
    if (error.message?.includes('404')) {
      return 'خطأ 404: لا يمكن الوصول إلى خدمة Gemini. تأكد من أن المفتاح صحيح وأنه تم تفعيله لنموذج gemini-pro.';
    }
    if (error.message?.includes('403')) {
      return 'خطأ 403: المفتاح غير صالح أو لم يتم تفعيله بعد. الرجاء التحقق من المفتاح وتفعيله في لوحة تحكم Google AI Studio.';
    }
    return `خطأ: ${error.message || 'خطأ غير معروف'}. الرجاء المحاولة مرة أخرى.`;
  }
}

export async function analyzeImage(imageData: string, prompt: string): Promise<string> {
  if (!API_KEY) {
    return 'عذراً، مفتاح API غير متوفر. الرجاء التحقق من الإعدادات.';
  }

  try {
    console.log('Attempting to analyze image with model: gemini-pro-vision');
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
    console.error('Detailed image analysis error:', JSON.stringify(error, null, 2));
    if (error.message?.includes('404')) {
      return 'خطأ 404: لا يمكن الوصول إلى خدمة Gemini Vision. تأكد من أن المفتاح صحيح وأنه تم تفعيله لنموذج gemini-pro-vision.';
    }
    if (error.message?.includes('403')) {
      return 'خطأ 403: المفتاح غير صالح أو لم يتم تفعيله بعد. الرجاء التحقق من المفتاح وتفعيله في لوحة تحكم Google AI Studio.';
    }
    return `خطأ في تحليل الصورة: ${error.message || 'خطأ غير معروف'}. الرجاء المحاولة مرة أخرى.`;
  }
} 