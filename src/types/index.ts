// src/types/index.ts
export interface Reminder {
  id: string;
  text: string;
  time: Date;
  notified?: boolean;
}

export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  analysisResult?: string; // For smart memory, forex analysis results
  imageDataUri?: string; // For user messages with images to be analyzed
  chartAnalysis?: { // For assistant responses with chart analysis
    asset?: string;
    supportLevels?: string[];
    resistanceLevels?: string[];
    analysis: string;
  };
}
