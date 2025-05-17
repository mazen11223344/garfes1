// src/lib/actions.ts

import { generateResponse, analyzeImage } from './gemini';

export async function analyzeAndStoreMemory(text: string, memory: string) {
  const prompt = `Given the following user input and existing memory, analyze the input and update the memory appropriately:
  
User Input: ${text}
Existing Memory: ${memory}

Please provide an updated version of the memory that incorporates the new information while maintaining relevance and conciseness.`;
  
  return await generateResponse(prompt);
}

export async function rewriteFinancialNews(article: string) {
  const prompt = `Please rewrite the following financial news article in a clear, concise, and engaging way while maintaining all important information:

${article}

Please provide the rewritten article.`;
  
  return await generateResponse(prompt);
}

export async function analyzeFinancialChart(imageDataUri: string, text: string) {
  const prompt = `Please analyze this financial chart and provide insights about: ${text}`;
  return await analyzeImage(imageDataUri, prompt);
}

export async function translateText(text: string, targetLanguage: 'English' | 'Arabic') {
  const prompt = `Please translate the following text to ${targetLanguage}:

${text}

Provide only the translated text without any additional comments.`;
  
  return await generateResponse(prompt);
}
