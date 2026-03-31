// Message type definition for UI layer
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSettings {
  temperature: number;
  maxTokens: number;
  presencePenalty: number;
  mode: 'fast' | 'expert';
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'error' | 'warning' | 'debug';
  message: string;
  source?: string;
}
