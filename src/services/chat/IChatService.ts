export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatConfig {
  modelProvider: 'transformers' | 'webllm';
  modelName: string;
  temperature: number;
  maxTokens: number;
}
