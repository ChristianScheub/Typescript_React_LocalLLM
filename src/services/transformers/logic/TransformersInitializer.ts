import Logger from '@services/logger';
import type { TransformersModelConfig } from './TransformersModels';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let worker: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let currentModelConfig: TransformersModelConfig | null = null;

export class TransformersInitializer {
  /**
   * Initialize a Transformers.js model using Web Worker (like GemmaLocalUse.html)
   * Supports both causal and multimodal models
   */
  static async initializeModel(
    currentModel: { value: string | null },
    isLoading: { value: boolean },
    modelKey: string,
    modelConfig: TransformersModelConfig,
    onStatusMessage?: (message: string) => void,
  ): Promise<void> {
    Logger.infoService(`[transformersInitializer] Loading model: ${modelKey} (${modelConfig.label})`);
    isLoading.value = true;
    currentModelConfig = modelConfig;

    try {
      // Terminate existing worker if switching models
      if (worker) {
        worker.terminate();
        worker = null;
      }

      // Create new worker
      worker = this.createWorker();
      this.attachWorkerHandlers(worker, onStatusMessage);

      // Post load message to worker
      worker.postMessage({
        type: 'load',
        modelId: modelConfig.id,
        dtype: modelConfig.dtype,
        modelType: modelConfig.type,
      });

      // Wait for model to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('MODEL_LOADING_TIMEOUT'));
        }, 30 * 60 * 1000); // 30 minute timeout for large models

        const handler = (e: MessageEvent) => {
          if (e.data.type === 'ready') {
            clearTimeout(timeout);
            worker.removeEventListener('message', handler);
            currentModel.value = modelKey;
            resolve();
          } else if (e.data.type === 'error') {
            clearTimeout(timeout);
            worker.removeEventListener('message', handler);
            reject(new Error(e.data.message));
          }
        };

        worker.addEventListener('message', handler);
      });

      Logger.infoService(`[transformersInitializer] ✅ Model ready: ${modelKey}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.errorStack(
        `[transformersInitializer] Failed to load ${modelKey}: ${errorMsg}`,
        error instanceof Error ? error : new Error(errorMsg),
      );
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a Web Worker that runs Transformers.js models
   * Mirrors the createWorker function from GemmaLocalUse.html
   */
  private static createWorker() {
    const code = `
import {
  env,
  AutoTokenizer,
  AutoModelForCausalLM,
  AutoProcessor,
  Gemma4ForConditionalGeneration,
  load_image,
  TextStreamer,
  InterruptableStoppingCriteria,
} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4/+esm';

env.allowLocalModels  = true;
env.localModelPath    = '/models/';
env.allowRemoteModels = true;

let processor = null;
let tokenizer = null;
let model = null;
let stopping_criteria = new InterruptableStoppingCriteria();
let loadedType = null;

function progressCallback(p) {
  self.postMessage({ type: 'progress', data: p });
}

async function loadCausal(modelId, dtype) {
  processor = null;
  tokenizer = null;
  model = null;

  tokenizer = await AutoTokenizer.from_pretrained(modelId, {
    progress_callback: progressCallback,
  });

  model = await AutoModelForCausalLM.from_pretrained(modelId, {
    dtype: dtype,
    device: 'webgpu',
    progress_callback: progressCallback,
  });

  // Warmup: compile WebGPU shaders
  self.postMessage({ type: 'warmup' });
  const warmupInputs = tokenizer('a');
  await model.generate({ ...warmupInputs, max_new_tokens: 1 });

  loadedType = 'causal';
  self.postMessage({ type: 'ready' });
}

async function loadMultimodal(modelId, dtype) {
  processor = null;
  tokenizer = null;
  model = null;

  processor = await AutoProcessor.from_pretrained(modelId, {
    progress_callback: progressCallback,
  });
  tokenizer = processor.tokenizer;

  model = await Gemma4ForConditionalGeneration.from_pretrained(modelId, {
    dtype: dtype,
    device: 'webgpu',
    progress_callback: progressCallback,
  });

  // Warmup
  self.postMessage({ type: 'warmup' });
  const warmupInputs = tokenizer('a');
  await model.generate({ ...warmupInputs, max_new_tokens: 1 });

  loadedType = 'multimodal';
  self.postMessage({ type: 'ready' });
}

async function generateCausal(chatMessages, id, genConfig) {
  stopping_criteria.reset();

  try {
    const inputs = tokenizer.apply_chat_template(chatMessages, {
      add_generation_prompt: true,
      return_dict: true,
    });

    const streamer = new TextStreamer(tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (text) => {
        self.postMessage({ type: 'token', token: text, id });
      },
    });

    const gc = genConfig || {};
    await model.generate({
      ...inputs,
      max_new_tokens: gc.max_new_tokens || 2048,
      do_sample: true,
      temperature: gc.temperature ?? 0.7,
      top_k: gc.top_k ?? 50,
      top_p: gc.top_p ?? 0.95,
      repetition_penalty: gc.repetition_penalty ?? 1.0,
      streamer,
      stopping_criteria,
    });

    self.postMessage({ type: 'complete', id });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message || String(err) });
    self.postMessage({ type: 'complete', id });
  }
}

async function generateMultimodal(chatMessages, id, attachmentData, enableThinking, genConfig) {
  stopping_criteria.reset();

  try {
    const prompt = processor.apply_chat_template(chatMessages, {
      add_generation_prompt: true,
      enable_thinking: enableThinking || false,
    });

    const images = [];
    const audios = [];

    if (attachmentData) {
      for (const att of attachmentData) {
        if (att.type === 'image') {
          const blob = new Blob([att.data], { type: att.mimeType || 'image/jpeg' });
          const blobUrl = URL.createObjectURL(blob);
          const img = await load_image(blobUrl);
          URL.revokeObjectURL(blobUrl);
          images.push(img);
        } else if (att.type === 'audio') {
          const pcm = att.pcmData instanceof Float32Array
            ? att.pcmData
            : new Float32Array(att.pcmData);
          audios.push(pcm);
        }
      }
    }

    const imageArg = images.length > 0 ? (images.length === 1 ? images[0] : images) : null;
    const audioArg = audios.length > 0 ? (audios.length === 1 ? audios[0] : audios) : null;
    const inputs = await processor(prompt, imageArg, audioArg, { add_special_tokens: false });

    const streamer = new TextStreamer(processor.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (text) => {
        self.postMessage({ type: 'token', token: text, id });
      },
    });

    const gc = genConfig || {};
    await model.generate({
      ...inputs,
      max_new_tokens: gc.max_new_tokens || 2048,
      do_sample: true,
      temperature: gc.temperature ?? 1.0,
      top_k: gc.top_k ?? 64,
      top_p: gc.top_p ?? 0.95,
      repetition_penalty: gc.repetition_penalty ?? 1.0,
      streamer,
      stopping_criteria,
    });

    self.postMessage({ type: 'complete', id });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message || String(err) });
    self.postMessage({ type: 'complete', id });
  }
}

self.addEventListener('message', async (e) => {
  const { type, messages, id, modelId, dtype, modelType, attachments: attData, enableThinking, generationConfig } = e.data;

  if (type === 'load') {
    try {
      if (modelType === 'multimodal') {
        await loadMultimodal(modelId, dtype);
      } else {
        await loadCausal(modelId, dtype);
      }
    } catch (err) {
      self.postMessage({ type: 'error', message: 'Failed to load model: ' + (err.message || String(err)) });
    }
  } else if (type === 'generate') {
    if (loadedType === 'multimodal') {
      await generateMultimodal(messages, id, attData, enableThinking, generationConfig);
    } else {
      await generateCausal(messages, id, generationConfig);
    }
  } else if (type === 'stop') {
    stopping_criteria.interrupt();
  }
});
`;

    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    return new Worker(url, { type: 'module' });
  }

  private static attachWorkerHandlers(
    w: Worker,
    onStatusMessage?: (message: string) => void,
  ) {
    w.addEventListener('error', (e) => {
      Logger.errorStack('[transformersInitializer] Worker error', new Error(e.message));
    });

    w.addEventListener('message', (e) => {
      const data = e.data;

      if (data.type === 'progress') {
        const p = data.data;
        if (p.status === 'downloading' || p.status === 'loading') {
          const pct = p.total ? Math.round((p.loaded / p.total) * 100) : 0;
          const fileName = p.file ? p.file.split('/').pop() : 'files';
          if (p.status === 'downloading' && p.loaded && p.total) {
            const loadedMB = (p.loaded / 1024 / 1024).toFixed(0);
            const totalMB = (p.total / 1024 / 1024).toFixed(0);
            const msg = `Downloading ${fileName} — ${loadedMB} / ${totalMB} MB (${pct}%)`;
            Logger.cache(`[transformersInitializer] ${msg}`);
            onStatusMessage?.(msg);
          } else {
            const msg = `Loading ${fileName}...`;
            onStatusMessage?.(msg);
          }
        } else if (p.status === 'initiate') {
          const fileName = p.file ? p.file.split('/').pop() : '';
          onStatusMessage?.(`Fetching ${fileName}…`);
        }
      } else if (data.type === 'warmup') {
        onStatusMessage?.('Compiling shaders and warming up...');
      } else if (data.type === 'ready') {
        Logger.infoService('[transformersInitializer] Model ready');
      } else if (data.type === 'error') {
        Logger.errorStack('[transformersInitializer] Model error', new Error(data.message));
      }
    });
  }

  static getWorker() {
    return worker;
  }

  static getCurrentModelConfig(): TransformersModelConfig | null {
    return currentModelConfig;
  }

  // Legacy compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getPipeline(): any {
    return worker ? {} : null; // Return truthy if worker exists
  }
}
