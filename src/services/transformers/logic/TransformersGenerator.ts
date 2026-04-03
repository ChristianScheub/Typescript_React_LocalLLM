import Logger from '@services/logger';
import { TransformersInitializer } from '@services/transformers/logic/TransformersInitializer';

export class TransformersGenerator {
  static async generate(currentModel: { value: string | null }, isLoading: { value: boolean }, prompt: string, options?: { temperature?: number; maxTokens?: number; presencePenalty?: number; mode?: 'fast' | 'expert' }): Promise<string> {
    Logger.infoService(`[transformersService.generate] Generiere Response für Prompt: "${prompt.substring(0, 80)}..."`);
    
    if (!currentModel.value) {
      Logger.errorService(`[transformersService.generate] ❌ FEHLER: Kein Modell initialisiert!`);
      throw new Error('Kein Modell geladen. Bitte erst ein Modell in Settings herunterladen!');
    }

    const pipeline = TransformersInitializer.getPipeline();
    if (!pipeline) {
      Logger.errorService(`[transformersService.generate] ❌ FEHLER: Pipeline ist NULL!`);
      throw new Error('Pipeline nicht initialisiert!');
    }

    if (isLoading.value) {
      Logger.errorService(`[transformersService.generate] ❌ FEHLER: Modell wird noch geladen!`);
      throw new Error('Modell wird noch geladen...');
    }

    try {
      Logger.infoService(`[transformersService.generate] 🔄 Starte echte Transformers.js Inference`);
      Logger.infoService(`[transformersService.generate] Modell: ${currentModel.value}`);
      Logger.infoService(`[transformersService.generate] Prompt-Länge: ${prompt.length} Zeichen`);
      
      const temperature = options?.temperature ?? 0.7;
      const maxTokens = options?.maxTokens ?? 150;
      
      const startTime = Date.now();
      
      const result = await pipeline(prompt, {
        max_new_tokens: maxTokens,
        temperature: temperature,
        top_p: 0.9,
        do_sample: true,
      });

      const elapsedTime = Date.now() - startTime;
      Logger.infoService(`[transformersService.generate] ⏱️ Inference-Zeit: ${elapsedTime}ms`);
      Logger.infoService(`[transformersService.generate] Result-Array Länge: ${result?.length || 0}`);
      
      if (!result || result.length === 0) {
        Logger.errorService(`[transformersService.generate] ❌ Leeres Ergebnis von Pipeline`);
        throw new Error('Pipeline hat leeres Ergebnis zurückgegeben');
      }

      if (!result[0].generated_text) {
        Logger.errorService(`[transformersService.generate] ❌ Kein generated_text in Ergebnis`);
        Logger.infoService(`[transformersService.generate] Ergebnis-Struktur: ${JSON.stringify(result[0]).substring(0, 200)}`);
        throw new Error('Pipeline hat keinen Text generiert');
      }

      const generatedText = result[0].generated_text;
      Logger.infoService(`[transformersService.generate] ✅ Generierter Text-Länge: ${generatedText.length} Zeichen`);
      Logger.infoService(`[transformersService.generate] ✅✅ ECHTE INFERENCE ERFOLGREICH!`);
      
      return generatedText;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.errorStack(
        `[transformersService.generate] ❌ FEHLER bei Inference`,
        error instanceof Error ? error : new Error(errorMsg)
      );
      throw error;
    }
  }
}
