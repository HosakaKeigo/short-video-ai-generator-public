export interface ModelInfo {
  id: string;
  name: string;
  description: string;
}

export interface ProviderModels {
  name: string;
  models: Record<string, ModelInfo>;
}

export interface ModelsResponse {
  providers: Record<string, ProviderModels>;
}

export interface SelectedModel {
  provider: string;
  modelKey: string;
  modelInfo: ModelInfo;
}