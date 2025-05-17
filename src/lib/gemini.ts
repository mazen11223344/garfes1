import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function generateResponse(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please set your API key first.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export async function analyzeImage(imageData: string, prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please set your API key first.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData.split(',')[1] // Remove the data:image/jpeg;base64, prefix
        }
      }
    ]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
} 