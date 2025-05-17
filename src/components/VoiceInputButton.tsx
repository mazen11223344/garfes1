// src/components/VoiceInputButton.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  onListeningChange: (isListening: boolean) => void;
  disabled?: boolean;
}

type SpeechRecognitionType = any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

export function VoiceInputButton({ onTranscript, onListeningChange, disabled }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-SA';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        onListeningChange(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        onListeningChange(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        onListeningChange(false);
      };

      setRecognition(recognition);
    }
  }, [onTranscript, onListeningChange]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      onListeningChange(true);
    }
  };

  if (!recognition) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleListening}
      disabled={disabled || !recognition}
      className={`text-muted-foreground hover:text-primary ${isListening ? 'bg-primary/10' : ''}`}
      aria-label={isListening ? "إيقاف التسجيل" : "تسجيل صوتي"}
    >
      {isListening ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
