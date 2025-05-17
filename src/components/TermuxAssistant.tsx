// src/components/TermuxAssistant.tsx
"use client";

import type { Message, Reminder } from "@/types";
import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { VoiceInputButton } from "./VoiceInputButton";
import { useReminderManager } from "@/hooks/useReminderManager";
import { analyzeAndStoreMemory, rewriteFinancialNews, analyzeFinancialChart, translateText } from "@/lib/actions";
import { Send, Loader2, Zap, Paperclip, X } from "lucide-react"; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SetupScreen } from "./SetupScreen";

// Arabic reminder parsing
const parseArabicReminder = (text: string): { task: string; time: Date } | null => {
  const remindMatch = text.match(/(?:ذكرني بـ|ذكرني ان|ذكرني)\s*(.+?)\s*(?:في|خلال|بعد|الساعة)\s*(.+)/i);
  if (!remindMatch) return null;

  const task = remindMatch[1].trim();
  const timeStr = remindMatch[2].trim();
  let time = new Date();

  const specificTimeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(صباحا|مساء|ص|م)?/i);
  if (specificTimeMatch) {
    let hours = parseInt(specificTimeMatch[1]);
    const minutes = specificTimeMatch[2] ? parseInt(specificTimeMatch[2]) : 0;
    const period = specificTimeMatch[3]?.toLowerCase();

    if ((period === "مساء" || period === "م") && hours < 12) hours += 12;
    if ((period === "صباحا" || period === "ص") && hours === 12) hours = 0; 

    time.setHours(hours, minutes, 0, 0);
    if (time <= new Date()) { 
        time.setDate(time.getDate() + 1);
    }
    return { task, time };
  }

  const relativeTimeMatch = timeStr.match(/(\d+)\s*(دقيقة|دقائق|دقيقه|ساعة|ساعات|ساعه)/i);
  if (relativeTimeMatch) {
    const amount = parseInt(relativeTimeMatch[1]);
    const unit = relativeTimeMatch[2].toLowerCase();
    if (unit.startsWith("دقيقة") || unit.startsWith("دقيقه")) {
      time.setMinutes(time.getMinutes() + amount);
    } else if (unit.startsWith("ساعة") || unit.startsWith("ساعه")) {
      time.setHours(time.getHours() + amount);
    }
    return { task, time };
  }
  
  return null;
};


export function TermuxAssistant() {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [assistantMemory, setAssistantMemory] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addMessage = (
    sender: "user" | "assistant", 
    text: string, 
    _analysisResult_deprecated?: string, // analysisResult is now part of the main response from analyzeAndStoreMemory
    timestamp?: Date,
    chartAnalysis?: Message["chartAnalysis"],
    imageDataUri?: string,
  ): string => {
    const newMessageId = `${sender}-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: newMessageId, sender, text, timestamp: timestamp || new Date(), chartAnalysis, imageDataUri },
    ]);
    return newMessageId;
  };
  
  const handleReminderDue = (reminder: Reminder) => {
    addMessage("assistant", `🔔 تذكير: ${reminder.text}`);
  };

  const { addReminder: scheduleReminder } = useReminderManager({ onReminderDue: handleReminderDue });


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreview(null);
    }
  };

  const processUserInput = async (text: string, imageFile?: File | null) => {
    if (!text.trim() && !imageFile) return;
    
    let imageDataUri: string | undefined = undefined;
    if (imageFile) {
      imageDataUri = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    }

    addMessage("user", text, undefined, new Date(), undefined, imageFile ? imagePreview || undefined : undefined);
    setIsLoading(true);
    setInputValue("");
    setSelectedImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }

    try {
      const reminderDetails = parseArabicReminder(text);
      const lowerCaseText = text.toLowerCase(); 
      const arabicText = text; 

      if (reminderDetails) {
        scheduleReminder(reminderDetails.task, reminderDetails.time);
        const assistantMsg = `حسنًا، سأذكرك بـ "${reminderDetails.task}" في الساعة ${reminderDetails.time.toLocaleTimeString('ar-EG')}.`;
        addMessage("assistant", assistantMsg);
      } else if (arabicText.startsWith("إعادة صياغة الخبر:") || arabicText.startsWith("اعد صياغة خبر:")) {
        const article = text.substring(text.indexOf(":") + 1).trim();
        if (article) {
          const rewrittenArticle = await rewriteFinancialNews(article);
          addMessage("assistant", "📰 الخبر المعاد صياغته:", rewrittenArticle);
        } else {
          addMessage("assistant", "يرجى تقديم محتوى الخبر بعد 'إعادة صياغة الخبر:'.");
        }
      } else if ((arabicText.includes("حلل الصورة") || arabicText.includes("حلل هذه الصورة")) && imageDataUri) {
        const chartResponse = await analyzeFinancialChart(imageDataUri, text);
        addMessage("assistant", chartResponse);
      } else if (arabicText.startsWith("جلب مستويات الفوركس")) {
        addMessage("assistant", "جلب مستويات الفوركس والذهب الحية هي ميزة مخطط لها. حاليًا، يمكنني المساعدة في إعادة صياغة المقالات الإخبارية إذا قدمتها باستخدام 'إعادة صياغة الخبر: [نص المقال]' أو تحليل صور المخططات إذا أرفقتها مع طلب 'حلل الصورة'.");
      } else if (arabicText.startsWith("ترجم إلى الإنجليزية:") || arabicText.startsWith("ترجم للانجليزية:")) {
        const textToTranslate = text.substring(text.indexOf(":") + 1).trim();
        if (textToTranslate) {
          const translatedText = await translateText(textToTranslate, 'English');
          addMessage("assistant", `الترجمة إلى الإنجليزية: ${translatedText}`);
        } else {
          addMessage("assistant", "يرجى تقديم النص للترجمة بعد الأمر.");
        }
      } else if (lowerCaseText.startsWith("translate to arabic:") || arabicText.startsWith("ترجم إلى العربية:") || arabicText.startsWith("ترجم للعربية:")) {
        const textToTranslate = text.substring(text.indexOf(":") + 1).trim();
        if (textToTranslate) {
          const translatedText = await translateText(textToTranslate, 'Arabic');
          addMessage("assistant", `الترجمة إلى العربية: ${translatedText}`);
        } else {
          addMessage("assistant", "Please provide the text to translate after the command / يرجى تقديم النص للترجمة بعد الأمر.");
        }
      } else { // Handles explicit memory commands ("تذكر أن", "ما هو") and general conversation with implicit memory
        const updatedMemory = await analyzeAndStoreMemory(arabicText, assistantMemory);
        setAssistantMemory(updatedMemory);
        addMessage("assistant", updatedMemory);
      }
    } catch (error) {
      console.error("Error processing input:", error);
      let errorMsgText = "عذرًا، لقد واجهت خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.";
      if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
        errorMsgText = "حدث خطأ في الاتصال بخدمات الذكاء الاصطناعي. يرجى التأكد من صحة مفتاح GEMINI_API_KEY وأنه تم تفعيل واجهات برمجة التطبيقات اللازمة في مشروع Google Cloud."
      }
       if (error instanceof Error && error.message.includes('Cloud Text-to-Speech API has not been used')) {
        errorMsgText = "يبدو أن واجهة برمجة تطبيقات تحويل النص إلى كلام من Google Cloud غير مفعلة في مشروعك. يرجى تفعيلها من خلال Google Cloud Console والمحاولة مرة أخرى."
      }
      addMessage("assistant", errorMsgText);
      toast({ title: "خطأ في المعالجة", description: String(error) || "حدث خطأ غير معروف.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    processUserInput(inputValue, selectedImageFile);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(transcript); 
  };
  
  useEffect(() => {
    const welcomeText = "مرحباً! أنا مساعد JarvisAI. يمكنك سؤالي عن أي شيء، أو استخدام أوامر مثل 'ذكرني بـ...'، 'إعادة صياغة الخبر:'، 'تذكر أن...' لمعلومة معينة، 'ما هو...؟' للاستعلام، 'حلل الصورة' (مع إرفاق صورة)، أو 'ترجم إلى الإنجليزية/العربية:'. كيف يمكنني مساعدتك اليوم؟";
    if (!messages.find(msg => msg.text === welcomeText && msg.sender === 'assistant')) {
        addMessage("assistant", welcomeText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // التحقق من وجود مفتاح API عند بدء التطبيق
    const settings = localStorage.getItem('settings');
    if (settings) {
      const { isConfigured } = JSON.parse(settings);
      setIsConfigured(isConfigured);
    }
  }, []);

  if (!isConfigured) {
    return <SetupScreen />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground p-4 font-mono" dir="rtl">
      <header className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <Zap className="h-8 w-8" /> مساعد JarvisAI
        </h1>
      </header>

      <Card className="flex-grow flex flex-col overflow-hidden shadow-2xl border-2 border-primary/50">
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-lg text-primary/90">سجل المحادثة</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start items-center p-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary ml-2" /> 
                <span className="text-sm text-muted-foreground">المساعد يفكر...</span>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-3 border-t border-border bg-background/50">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="text-muted-foreground hover:text-primary"
              aria-label="إرفاق صورة"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleImageFileChange} 
              className="hidden"
              disabled={isLoading}
            />
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "أستمع..." : (selectedImageFile ? `تم تحديد الصورة: ${selectedImageFile.name.substring(0,20)}... اكتب رسالتك أو "حلل الصورة"` : "اكتب سؤالك أو أمر 'تذكر أن...' أو اطلب ترجمة...")}
              className="flex-grow bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary focus:ring-offset-background"
              disabled={isLoading || isListening}
              aria-label="إدخال الدردشة"
            />
            <VoiceInputButton 
              onTranscript={handleVoiceTranscript} 
              onListeningChange={setIsListening} 
              disabled={isLoading} 
            />
            <Button type="submit" disabled={isLoading || (!inputValue.trim() && !selectedImageFile)} className="bg-primary hover:bg-primary/80 text-primary-foreground" aria-label="إرسال الرسالة">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          {imagePreview && (
            <div className="mt-2 p-2 border border-border rounded-md relative max-w-xs">
              <img src={imagePreview} alt="معاينة الصورة المرفقة" className="max-h-24 w-auto rounded-md" data-ai-hint="image preview" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-0 right-0 h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSelectedImageFile(null); 
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">إزالة الصورة</span>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      <footer className="mt-4 text-center text-xs text-muted-foreground">
        <p>مدعوم بواسطة Genkit و Next.js. جرب: "ما هي عاصمة فرنسا؟"، "تذكر أن اسمي أحمد"، "ما هو اسمي؟"، "حلل الصورة" (مع إرفاق صورة)، أو "ترجم إلى الإنجليزية: مرحبا".</p>
      </footer>
    </div>
  );
}
