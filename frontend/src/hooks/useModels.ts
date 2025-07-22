import { useState, useEffect } from 'react';
import { ModelsResponse, SelectedModel } from '@/types/models';
import { getErrorMessage } from '@/lib/error-handler';

export function useModels() {
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models');
      
      if (!response.ok) {
        throw new Error(getErrorMessage('API_MODELS_FETCH_ERROR'));
      }

      const data: ModelsResponse = await response.json();
      setModels(data);

      // Set default selection to first available model
      const firstProvider = Object.keys(data.providers)[0];
      if (firstProvider) {
        const firstModelKey = Object.keys(data.providers[firstProvider].models)[0];
        if (firstModelKey) {
          setSelectedModel({
            provider: firstProvider,
            modelKey: firstModelKey,
            modelInfo: data.providers[firstProvider].models[firstModelKey]
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : getErrorMessage('GENERAL_ERROR_OCCURRED'));
    } finally {
      setLoading(false);
    }
  };

  const selectModel = (provider: string, modelKey: string) => {
    if (!models) return;

    const modelInfo = models.providers[provider]?.models[modelKey];
    if (modelInfo) {
      setSelectedModel({
        provider,
        modelKey,
        modelInfo
      });
    }
  };

  return {
    models,
    selectedModel,
    loading,
    error,
    selectModel,
    refresh: fetchModels
  };
}