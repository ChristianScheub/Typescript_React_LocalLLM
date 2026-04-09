import { useState, useEffect } from 'react';
import { modelService } from '@services/model';
import { webllmAllModels } from '@services/webllm';
import Logger from '@services/logger';

export function useCachedModels(provider: 'transformers' | 'webllm'): Set<string> {
  const [cachedModelIds, setCachedModelIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (provider !== 'webllm') {
      setCachedModelIds(new Set());
      return;
    }

    const detectCachedModels = async () => {
      try {
        const { hasModelInCache } = await import('@mlc-ai/web-llm');
        const appConfig = { model_list: webllmAllModels };
        const allModels = modelService.getModelsByProvider(provider);
        const cached = new Set<string>();

        for (const model of allModels) {
          try {
            const inCache = await hasModelInCache(model.id, appConfig);
            if (inCache) cached.add(model.id);
          } catch {
            // Model not found in config, skip
          }
        }

        setCachedModelIds(cached);
        Logger.infoService(`[useCachedModels] Found ${cached.size} cached models via hasModelInCache`);
      } catch (err) {
        Logger.errorStack('[useCachedModels] Error detecting cached models', err instanceof Error ? err : new Error(String(err)));
      }
    };
    detectCachedModels();
  }, [provider]);

  return cachedModelIds;
}
