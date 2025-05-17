import { encryptData, decryptData } from './encryption';

export async function storeApiKey(apiKey: string): Promise<void> {
  try {
    const encryptedKey = await encryptData(apiKey);
    localStorage.setItem('settings', JSON.stringify({
      apiKey: encryptedKey,
      isConfigured: true
    }));
  } catch (error) {
    console.error('Error storing API key:', error);
    throw error;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    const settings = localStorage.getItem('settings');
    if (!settings) return null;
    
    const { apiKey } = JSON.parse(settings);
    if (!apiKey) return null;
    
    return await decryptData(apiKey);
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
} 