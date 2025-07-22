from pydantic import BaseModel


class SignedUploadUrlRequest(BaseModel):
    fileName: str
    fileSize: int
    contentType: str


class SignedUploadUrlResponse(BaseModel):
    uploadUrl: str
    fileId: str


class Highlight(BaseModel):
    start: float
    end: float
    title: str
    description: str
    score: float


class AnalysisResult(BaseModel):
    highlights: list[Highlight]


class VideoSegment(BaseModel):
    start: float
    end: float


class ExtractRequest(BaseModel):
    fileId: str
    segments: list[VideoSegment]


class GenerateVideoResponse(BaseModel):
    downloadUrl: str


class VideoMetadata(BaseModel):
    duration: float
    width: int
    height: int


class ModelInfo(BaseModel):
    id: str
    name: str
    description: str


class ProviderModels(BaseModel):
    name: str
    models: dict[str, ModelInfo]


class ModelsResponse(BaseModel):
    providers: dict[str, ProviderModels]
