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

/**
 * Returns true for instruction-tuned / chat models that support a chat template.
 * Base models (GPT-2, etc.) use the raw text API instead.
 */
function isChatModel(modelName: string): boolean {
  return /(-it|-instruct|instruct|chat|smollm)/i.test(modelName);
}

export class TransformersGenerator {
  static async generate(
    currentModel: { value: string | null },
    isLoading: { value: boolean },
    prompt: string,
    options?: GenerateOptions,
  ): Promise<string> {
    Logger.infoService(`[transformersService.generate] Prompt: "${prompt.substring(0, 80)}..."`);

    if (!currentModel.value) {
      throw new Error('Kein Modell geladen. Bitte erst ein Modell herunterladen!');
    }

    const pipeline = TransformersInitializer.getPipeline();
    if (!pipeline) {
      throw new Error('Pipeline nicht initialisiert!');
    }

    if (isLoading.value) {
      throw new Error('Modell wird noch geladen…');
    }

    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 1024;
    const doSample = temperature > 0;

    const startTime = Date.now();

    try {
      if (isChatModel(currentModel.value)) {
        return await TransformersGenerator.generateChat(
          pipeline, prompt, options, temperature, maxTokens, doSample, startTime,
        );
      } else {
        return await TransformersGenerator.generateBase(
          pipeline, prompt, temperature, maxTokens, doSample, startTime,
        );
      }
    } catch (error) {
      Logger.errorStack(
        '[transformersService.generate] Inference fehler',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  private static async generateChat(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pipeline: any,
    prompt: string,
    options: GenerateOptions | undefined,
    temperature: number,
    maxTokens: number,
    doSample: boolean,
    startTime: number,
  ): Promise<string> {
    const messages: Array<{ role: string; content: string }> = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    if (options?.conversationHistory) {
      for (const msg of options.conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: prompt });

    Logger.infoService(`[transformersService.generate] Chat mode — ${messages.length} messages`);

    const result = await pipeline(messages, {
      max_new_tokens: maxTokens,
      temperature,
      top_p: 0.9,
      do_sample: doSample,
    });

    Logger.infoService(`[transformersService.generate] Inference: ${Date.now() - startTime}ms`);

    // v3 chat result: generated_text is an array of message objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output = result?.[0]?.generated_text as any;

    if (Array.isArray(output)) {
      const assistantMsg = output.at(-1);
      const content = assistantMsg?.content ?? '';
      if (!content) {
        throw new Error('Modell hat keine Antwort zurückgegeben');
      }
      Logger.infoService(`[transformersService.generate] ✅ Chat response length: ${content.length}`);
      return content;
    }

    // Fallback: string output
    if (typeof output === 'string' && output.length > 0) {
      return output;
    }

    throw new Error('Pipeline hat ein unerwartetes Ergebnis zurückgegeben');
  }

  private static async generateBase(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pipeline: any,
    prompt: string,
    temperature: number,
    maxTokens: number,
    doSample: boolean,
    startTime: number,
  ): Promise<string> {
    Logger.infoService(`[transformersService.generate] Base model mode`);

    const result = await pipeline(prompt, {
      max_new_tokens: maxTokens,
      temperature,
      top_p: 0.9,
      do_sample: doSample,
    });

    Logger.infoService(`[transformersService.generate] Inference: ${Date.now() - startTime}ms`);

    const rawText: string = result?.[0]?.generated_text ?? '';
    if (!rawText) {
      throw new Error('Pipeline hat leeres Ergebnis zurückgegeben');
    }

    // Base models echo the prompt — strip it
    const response = rawText.startsWith(prompt)
      ? rawText.slice(prompt.length).trim()
      : rawText.trim();

    Logger.infoService(`[transformersService.generate] ✅ Base response length: ${response.length}`);
    return response;
  }
}
