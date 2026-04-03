import Logger from '@services/logger';
import { WebLLMInitializer } from '@services/webllm/logic/WebLLMInitializer';

export class WebLLMGenerator {
  static async generate(currentModel: { value: string | null }, isLoading: { value: boolean }, prompt: string, options?: { temperature?: number; maxTokens?: number; presencePenalty?: number; mode?: 'fast' | 'expert' }): Promise<string> {
    Logger.infoService(`[webllmService.generate] Starting generation for prompt: "${prompt.substring(0, 100)}..."`);
    
    if (!currentModel.value || isLoading.value) {
      Logger.errorService(`[webllmService.generate] Model not initialized. Current: ${currentModel.value}, Loading: ${isLoading.value}`);
      throw new Error('Model not initialized');
    }

    const engine = WebLLMInitializer.getEngine();
    if (!engine) {
      Logger.errorService(`[webllmService.generate] ❌ Web-LLM Engine nicht geladen! Echte Inference nicht möglich.`);
      throw new Error('Web-LLM Engine konnte nicht initialisiert werden. Echte Inference nicht verfügbar.');
    }

    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 200;
    
    Logger.infoService(`[webllmService.generate] Engine ready. Model: ${currentModel.value}`);
    Logger.infoService(`[webllmService.generate] Generating with max_tokens: ${maxTokens}, temperature: ${temperature}`);
    
    const messages = [
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    let fullResponse = '';
    Logger.infoService(`[webllmService.generate] Starting streaming generation...`);
    
    for await (const chunk of await engine.chat.completions.create({
      messages,
      max_tokens: maxTokens,
      temperature: temperature,
      stream: true,
    })) {
      if (chunk.choices[0]?.delta?.content) {
        fullResponse += chunk.choices[0].delta.content;
        Logger.cache(`[webllmService.generate] Chunk received. Total length: ${fullResponse.length}`);
      }
    }

    if (!fullResponse) {
      Logger.errorService(`[webllmService.generate] ❌ FEHLER: Engine hat leeren Response zurückgegeben!`);
      throw new Error('Engine returned empty response');
    }

    Logger.infoService(`[webllmService.generate] ✅ Real generation complete. Response length: ${fullResponse.length}`);
    return fullResponse;
  }
}
