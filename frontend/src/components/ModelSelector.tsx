'use client';

import { useModels } from '@/hooks/useModels';
import { useVideoStore } from '@/stores/videoStore';
import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ModelSelector() {
  const { models, selectedModel, loading, error, selectModel } = useModels();
  const { setSelectedModel } = useVideoStore();
  
  // Update video store when model selection changes
  useEffect(() => {
    if (selectedModel) {
      setSelectedModel(selectedModel);
    }
  }, [selectedModel, setSelectedModel]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error || !models) {
    return (
      <div className="text-red-500 text-sm">
        Error loading models
      </div>
    );
  }

  if (!selectedModel) {
    return null;
  }

  const currentValue = `${selectedModel.provider}:${selectedModel.modelKey}`;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        AIモデル
      </label>
      <Select
        value={currentValue}
        onValueChange={(value) => {
          const [provider, modelKey] = value.split(':');
          selectModel(provider, modelKey);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedModel ? (
              <div className="flex items-center">
                <span className="font-medium">{selectedModel.modelInfo.name}</span>
                <span className="text-gray-500 ml-2 text-sm">
                  ({models.providers[selectedModel.provider]?.name})
                </span>
              </div>
            ) : (
              'モデルを選択してください'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(models.providers).map(([providerKey, provider]) => (
            <SelectGroup key={providerKey}>
              <SelectLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {provider.name}
              </SelectLabel>
              {Object.entries(provider.models).map(([modelKey, model]) => (
                <SelectItem
                  key={`${providerKey}-${modelKey}`}
                  value={`${providerKey}:${modelKey}`}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col py-1">
                    <div className="font-medium text-gray-500">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {selectedModel && (
        <p className="mt-2 text-sm text-gray-500">
          Model ID: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{selectedModel.modelInfo.id}</code>
        </p>
      )}
    </div>
  );
}