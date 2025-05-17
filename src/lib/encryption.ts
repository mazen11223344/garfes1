// استخدام خوارزمية AES للتشفير
const ENCRYPTION_KEY = 'app-specific-key'; // سيتم إنشاؤه تلقائياً لكل تثبيت

export async function encryptData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // إنشاء مفتاح تشفير عشوائي
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  // إنشاء vector عشوائي
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // تشفير البيانات
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    dataBuffer
  );
  
  // تحويل البيانات المشفرة إلى سلسلة نصية
  const encryptedArray = new Uint8Array(encryptedData);
  return btoa(String.fromCharCode.apply(null, [...iv, ...encryptedArray]));
}

export async function decryptData(encryptedData: string): Promise<string> {
  const decoder = new TextDecoder();
  const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  // استخراج الـ IV والبيانات المشفرة
  const iv = data.slice(0, 12);
  const encryptedArray = data.slice(12);
  
  // إعادة إنشاء مفتاح التشفير
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  // فك تشفير البيانات
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encryptedArray
  );
  
  return decoder.decode(decryptedData);
} 