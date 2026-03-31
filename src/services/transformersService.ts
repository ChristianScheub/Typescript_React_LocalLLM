import Logger from './logger';

export interface TransformersModel {
  id: string;
  name: string;
  description: string;
  size: string;
  downloaded: boolean;
}

export interface TransformersGenerateOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

// Transformers.js pipeline
let pipeline: any = null;

class TransformersService {
  private currentModel: string | null = null;
  private isLoading: boolean = false;

  async initializeModel(modelName: string): Promise<void> {
    Logger.infoService(`[transformersService] Starting model initialization for: ${modelName}`);
    this.isLoading = true;
    
    try {
      Logger.infoService(`[transformersService] Importing @xenova/transformers library...`);
      const { pipeline: huggingFacePipeline } = await import('@xenova/transformers');
      Logger.infoService(`[transformersService] ✅ Xenova/Transformers imported successfully`);
      
      Logger.infoService(`[transformersService] Loading text-generation pipeline with model: ${modelName}`);
      Logger.infoService(`[transformersService] This may take a moment as the model is being downloaded...`);
      
      // Real pipeline loading without fallback
      pipeline = await huggingFacePipeline('text-generation', modelName, {
        progress_callback: (progress: any) => {
          Logger.cache(`[transformersService] Pipeline loading progress: ${JSON.stringify(progress).substring(0, 80)}`);
        }
      });
      
      Logger.infoService(`[transformersService] ✅✅✅ ECHTES MODELL VOLLSTÄNDIG GELADEN: ${modelName}`);
      this.currentModel = modelName;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.errorStack(
        `[transformersService] KRITISCH: Modell-Initialization fehlgeschlagen für ${modelName}`,
        error instanceof Error ? error : new Error(errorMsg)
      );
      Logger.infoService(`[transformersService] Details: ${errorMsg.substring(0, 200)}`);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async generate(prompt: string): Promise<string> {
    Logger.infoService(`[transformersService.generate] Generiere Response für Prompt: "${prompt.substring(0, 80)}..."`);
    
    if (!this.currentModel) {
      Logger.errorService(`[transformersService.generate] ❌ FEHLER: Kein Modell initialisiert!`);
      throw new Error('Kein Modell geladen. Bitte erst ein Modell in Settings herunterladen!');
    }

    if (!pipeline) {
      Logger.errorService(`[transformersService.generate] ❌ FEHLER: Pipeline ist NULL!`);
      throw new Error('Pipeline nicht initialisiert!');
    }

    if (this.isLoading) {
      Logger.errorService(`[transformersService.generate] ❌ FEHLER: Modell wird noch geladen!`);
      throw new Error('Modell wird noch geladen...');
    }

    try {
      Logger.infoService(`[transformersService.generate] 🔄 Starte echte Transformers.js Inference`);
      Logger.infoService(`[transformersService.generate] Modell: ${this.currentModel}`);
      Logger.infoService(`[transformersService.generate] Prompt-Länge: ${prompt.length} Zeichen`);
      
      const startTime = Date.now();
      
      const result = await pipeline(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
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

  async downloadModel(modelName: string, onProgress?: (progress: number) => void): Promise<void> {
    Logger.infoService(`[transformersService.downloadModel] Vorbereitung zum Download: ${modelName}`);
    Logger.infoService(`[transformersService.downloadModel] ⚠️ WICHTIG: Modell wird direkt vom transformers-Browser CDN geladen`);
    Logger.infoService(`[transformersService.downloadModel] Erste Nutzung kann 30-60 Sekunden dauern!`);
    
    try {
      Logger.infoService(`[transformersService.downloadModel] Browser lädt echtes Modell mit ONNX Runtime...`);
      Logger.infoService(`[transformersService.downloadModel] Die WASM-Runtime benötigt einige Zeit für Download+Caching`);
      
      // Simulate progressive loading indication
      // Real download happens during initializeModel
      for (let i = 0; i <= 50; i += 5) {
        Logger.cache(`[transformersService.downloadModel] Vorbereitung: ${i}%`);
        onProgress?.(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      Logger.infoService(`[transformersService.downloadModel] 🔄 Starte echte Modell-Initialization mit Transformers.js...`);
      Logger.infoService(`[transformersService.downloadModel] 🔄 Dies kann 30-60 Sekunden dauern - NICHT SCHLIESSEN!`);
      await this.initializeModel(modelName);
      
      // Complete progress
      for (let i = 50; i <= 100; i += 5) {
        Logger.cache(`[transformersService.downloadModel] Finalisierung: ${i}%`);
        onProgress?.(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      Logger.infoService(`[transformersService.downloadModel] ✅✅✅ ECHTES MODELL ERFOLGREICH GELADEN & CACHED: ${modelName}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.errorStack(
        `[transformersService.downloadModel] ❌ Download/Initialization fehlgeschlagen für ${modelName}`,
        error instanceof Error ? error : new Error(errorMsg)
      );
      Logger.infoService(`[transformersService.downloadModel] 📋 Details: ${errorMsg.substring(0, 300)}`);
      throw error;
    }
  }

  isModelLoaded(): boolean {
    const loaded = !!this.currentModel && !this.isLoading && !!pipeline;
    Logger.cache(`[transformersService.isModelLoaded] Status: ${loaded ? '✅ Geladen' : '❌ Nicht geladen'} (Modell: ${this.currentModel})`);
    return loaded;
  }

  getCurrentModel(): string | null {
    return this.currentModel;
  }

  getAvailableModels(): TransformersModel[] {
    Logger.infoService(`[transformersService.getAvailableModels] Verfügbare Modelle werden zurückgegeben`);
    return [
      {
        id: 'distilgpt2',
        name: 'DistilGPT-2 (Tiny)',
        description: 'Der Super-Schnelle - 82M params, blitzschnell für Tests',
        size: '150 MB',
        downloaded: false,
      },
      {
        id: 'gpt2',
        name: 'GPT-2 (Small)',
        description: 'Der Klassiker - 124M params, gute Balance zwischen Speed & Qualität',
        size: '500 MB',
        downloaded: false,
      },
      {
        id: 'gpt2-medium',
        name: 'GPT-2 (Medium)',
        description: 'Der Ausgewogene - 355M params, bessere Qualität, etwas langsamer',
        size: '1.5 GB',
        downloaded: false,
      },
      {
        id: 'gpt2-large',
        name: 'GPT-2 (Large)',
        description: 'Der Große - 774M params, beste Qualität, braucht Zeit zum Laden',
        size: '3.0 GB',
        downloaded: false,
      },
    ];
  }

  getStatus(): { loaded: boolean; model: string | null; pipeline: boolean; } {
    return {
      loaded: this.isModelLoaded(),
      model: this.currentModel,
      pipeline: !!pipeline
    };
  }
}

export const transformersService = new TransformersService();

