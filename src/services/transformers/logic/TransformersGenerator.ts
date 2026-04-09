import Logger from '@services/logger';
import { TransformersInitializer } from '@services/transformers/logic/TransformersInitializer';

type GenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  presencePenalty?: number;
  mode?: 'fast' | 'expert';
  systemPrompt?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

export class TransformersGenerator {
  /**
   * Generate text using Transformers.js Web Worker
   * Supports streaming via callbacks
   */
  static async generate(
    currentModel: { value: string | null },
    isLoading: { value: boolean },
    prompt: string,
    options?: GenerateOptions,
  ): Promise<string> {
    Logger.infoService(`[transformersGenerator] Generating: "${prompt.substring(0, 60)}..."`);

    if (!currentModel.value) {
      throw new Error('No model loaded. Please download a model first.');
    }

    const worker = TransformersInitializer.getWorker();
    if (!worker) {
      throw new Error('Worker not initialized. Model may not be loaded.');
    }

    if (isLoading.value) {
      throw new Error('Model is still loading. Please wait.');
    }

    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2048;

    try {
      // Build chat messages
      const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }

      if (options?.conversationHistory) {
        for (const msg of options.conversationHistory) {
          messages.push(msg);
        }
      }

      messages.push({ role: 'user', content: prompt });

      Logger.infoService(`[transformersGenerator] Messages: ${messages.length}`);

      // Generate with worker
      const result = await this.generateWithWorker(worker, messages, temperature, maxTokens);

      Logger.infoService(`[transformersGenerator] ✅ Generated: ${result.length} chars`);
      return result;
    } catch (error) {
      Logger.errorStack(
        '[transformersGenerator] Generation failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  private static generateWithWorker(
    worker: Worker,
    messages: Array<{ role: string; content: string }>,
    temperature: number,
    maxTokens: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let completeText = '';
      const timeout = setTimeout(() => {
        reject(new Error('GENERATION_TIMEOUT'));
      }, 30 * 60 * 1000); // 30 minute timeout for generation

      const handler = (e: MessageEvent) => {
        const data = e.data;

        if (data.type === 'token') {
          completeText += data.token;
        } else if (data.type === 'complete') {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          if (!completeText) {
            reject(new Error('Model returned empty response'));
          } else {
            resolve(completeText);
          }
        } else if (data.type === 'error') {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          reject(new Error(data.message || 'Generation failed'));
        }
      };

      worker.addEventListener('message', handler);

      // Post generate message to worker
      worker.postMessage({
        type: 'generate',
        messages,
        id: Math.random().toString(36).slice(2),
        generationConfig: {
          max_new_tokens: maxTokens,
          temperature,
          top_p: 0.95,
          top_k: 50,
        },
      });
    });
  }
}
