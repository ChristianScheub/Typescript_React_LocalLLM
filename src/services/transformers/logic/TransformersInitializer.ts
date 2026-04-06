import Logger from '@services/logger';
import { HuggingFaceAuthService } from '@services/huggingfaceAuth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipeline: any = null;



export class TransformersInitializer {
  static async initializeModel(
    currentModel: { value: string | null },
    isLoading: { value: boolean },
    modelName: string,
    onStatusMessage?: (message: string) => void,
    dtype?: string,
  ): Promise<void> {
    Logger.infoService(`[transformersService] Starting model initialization for: ${modelName}`);
    isLoading.value = true;

    try {
      Logger.infoService(`[transformersService] Importing @huggingface/transformers library...`);
      const { pipeline: hfPipeline, env } = await import('@huggingface/transformers');

      // Explicitly allow remote model downloads from HuggingFace
      env.allowRemoteModels = true;
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      // Point ORT WASM to the locally installed onnxruntime-web 1.24.3 dist.
      // transformers.web.js imports onnxruntime-web as an external (1.24.3 JS),
      // but its CDN default points to ORT 1.22-dev WASM — a version mismatch that causes WASM aborts.
      // Serving from node_modules lets Vite handle them as proper ES modules (no "?import" suffix).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ortWasm = (env as any).backends?.onnx?.wasm;
      if (ortWasm) {
        ortWasm.wasmPaths = '/node_modules/onnxruntime-web/dist/';
        Logger.infoService('[transformersService] ORT wasmPaths → /node_modules/onnxruntime-web/dist/');
      }

      // Set HuggingFace token if available
      const hfToken = HuggingFaceAuthService.getToken();
      if (hfToken) {
        // Use global fetch interceptor to add Authorization header
        const originalFetch = globalThis.fetch;
        globalThis.fetch = ((url: RequestInfo | URL, options?: RequestInit) => {
          const fetchOptions = {
            ...options,
            headers: {
              ...(options?.headers || {}),
              'Authorization': `Bearer ${hfToken}`,
            },
          };
          Logger.cache(`[transformersService] Sending HF request with Authorization header`);
          return originalFetch(url, fetchOptions);
        }) as typeof fetch;

        Logger.infoService(`[transformersService] Global fetch interceptor configured with Authorization header`);
      }

      const device = 'wasm';
      const allowedDtypes = ["auto", "q4", "fp32", "fp16", "q8", "int8", "uint8", "bnb4", "q4f16"] as const;
      const modelDtype = (dtype && allowedDtypes.includes(dtype as typeof allowedDtypes[number]) ? dtype : "q4") as typeof allowedDtypes[number];
      Logger.infoService(`[transformersService] Device (forced): ${device}, dtype: ${modelDtype}`);
      Logger.infoService(`[transformersService] Loading text-generation pipeline for: ${modelName}`);

      try {
        pipeline = await hfPipeline('text-generation', modelName, {
          dtype: modelDtype,
          device,
          progress_callback: (progress: {
            status: string;
            name?: string;
            progress?: number;
            loaded?: number;
            total?: number;
          }) => {
            if (progress.status === 'downloading' && progress.progress != null) {
              const pct = Math.round(progress.progress);
              const file = progress.name ? ` (${progress.name.split('/').at(-1)})` : '';
              const msg = `Downloading${file}: ${pct}%`;
              Logger.cache(`[transformersService] ${msg}`);
              onStatusMessage?.(msg);
            } else if (progress.status === 'initiate') {
              onStatusMessage?.(`Loading ${progress.name?.split('/').at(-1) ?? 'model'}…`);
            } else if (progress.status === 'ready') {
              onStatusMessage?.('Model ready');
            }
          },
        });
      } catch (backendError) {
        Logger.errorStack(
          `[transformersService] Fehler beim Initialisieren des Backends (wasm) für ${modelName}`,
          backendError instanceof Error ? backendError : new Error(String(backendError)),
        );
        throw backendError;
      }

      Logger.infoService(`[transformersService] ✅ Model loaded: ${modelName}`);
      currentModel.value = modelName;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.errorStack(
        `[transformersService] Model initialization failed for ${modelName}`,
        error instanceof Error ? error : new Error(errorMsg),
      );
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getPipeline(): any {
    return pipeline;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static setPipeline(p: any) {
    pipeline = p;
  }
}
