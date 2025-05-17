// src/components/MessageBubble.tsx
import type { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react"; 
import Image from 'next/image'; 

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 py-3 px-2 rounded-lg",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3 shadow-md",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {message.imageDataUri && isUser && (
          <div className="mb-2">
            <p className="text-xs italic opacity-80 mb-1">الصورة المرفقة:</p>
            <Image 
              src={message.imageDataUri} 
              alt="صورة مرفقة من المستخدم" 
              width={200} 
              height={150} 
              className="rounded-md object-cover" 
              data-ai-hint="user image"
            />
          </div>
        )}
        {message.text && <p className="whitespace-pre-wrap text-sm">{message.text}</p>}
        
        {message.analysisResult && (
            <p className="mt-2 text-xs italic opacity-80 border-t border-current/20 pt-1">{message.analysisResult}</p>
        )}

        {message.chartAnalysis && !isUser && (
          <div className="mt-2 border-t border-current/20 pt-2">
            <h4 className="text-sm font-semibold mb-1">تحليل الرسم البياني:</h4>
            {message.chartAnalysis.asset && <p className="text-xs"><span className="font-medium">الأصل:</span> {message.chartAnalysis.asset}</p>}
            {message.chartAnalysis.supportLevels && message.chartAnalysis.supportLevels.length > 0 && (
              <p className="text-xs"><span className="font-medium">الدعم:</span> {message.chartAnalysis.supportLevels.join(', ')}</p>
            )}
            {message.chartAnalysis.resistanceLevels && message.chartAnalysis.resistanceLevels.length > 0 && (
              <p className="text-xs"><span className="font-medium">المقاومة:</span> {message.chartAnalysis.resistanceLevels.join(', ')}</p>
            )}
            <p className="text-xs mt-1 whitespace-pre-wrap"><span className="font-medium">التحليل:</span> {message.chartAnalysis.analysis}</p>
          </div>
        )}

         <p className={cn("text-xs mt-1 opacity-70", isUser ? "text-left" : "text-right")}>
          {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && <User className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />}
    </div>
  );
}
