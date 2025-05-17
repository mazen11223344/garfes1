"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeApiKey } from '@/lib/storage';

export function SetupScreen() {
  const [apiKey, setApiKey] = useState('');
  
  const handleSetup = async () => {
    if (apiKey.trim()) {
      await storeApiKey(apiKey);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">مرحباً بك في JarvisAI</h2>
          <p className="text-muted-foreground">
            للبدء، نحتاج إلى مفتاح API من Google. اتبع الخطوات التالية:
          </p>
        </div>
        
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>اذهب إلى <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
            <li>قم بتسجيل الدخول بحساب Google الخاص بك</li>
            <li>انقر على "Create API Key"</li>
            <li>انسخ المفتاح والصقه هنا</li>
          </ol>
          
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="أدخل مفتاح API هنا"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button 
              className="w-full"
              onClick={handleSetup}
              disabled={!apiKey.trim()}
            >
              بدء استخدام JarvisAI
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 