import { z } from 'zod'

/**
 * Zod schemas for API response validation
 */

// Highlight schema
export const HighlightSchema = z.object({
  start: z.number().min(0),
  end: z.number().min(0),
  title: z.string().min(1),
  description: z.string(),
  score: z.number().min(0).max(1),
})

// Analysis result schema
export const AnalysisResultSchema = z.object({
  highlights: z.array(HighlightSchema),
})

// Signed upload URL response schema
export const SignedUploadUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  fileId: z.string().min(1),
})

// Video segment schema
export const VideoSegmentSchema = z.object({
  start: z.number().min(0),
  end: z.number().min(0),
})

// Generate video response schema
export const GenerateVideoResponseSchema = z.object({
  downloadUrl: z.string().url(),
})

// Video metadata schema
export const VideoMetadataSchema = z.object({
  duration: z.number().min(0),
  width: z.number().min(1),
  height: z.number().min(1),
})

// Request schemas
export const SignedUploadUrlRequestSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().min(1),
  contentType: z.string().regex(/^video\/.+/),
})

export const ExtractRequestSchema = z.object({
  fileId: z.string().min(1),
  segments: z.array(VideoSegmentSchema).min(1),
})

// Model info schemas
export const ModelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
})

export const ProviderModelsSchema = z.object({
  name: z.string(),
  models: z.record(z.string(), ModelInfoSchema),
})

export const ModelsResponseSchema = z.object({
  providers: z.record(z.string(), ProviderModelsSchema),
})

// Error response schema
export const ErrorResponseSchema = z.object({
  detail: z.string(),
})

// App-specific schemas (not API-related)
export const VideoFileSchema = z.object({
  id: z.string(),
  file: z.instanceof(File),
  url: z.string(),
  duration: z.number().min(0),
})

export const SelectedHighlightSchema = HighlightSchema.extend({
  id: z.string(),
  selected: z.boolean(),
  editedStart: z.number().min(0).optional(),
  editedEnd: z.number().min(0).optional(),
})

export const UploadProgressSchema = z.object({
  loaded: z.number().min(0),
  total: z.number().min(0),
  percentage: z.number().min(0).max(100),
})

// Type exports from schemas
export type Highlight = z.infer<typeof HighlightSchema>
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>
export type SignedUploadUrlResponse = z.infer<typeof SignedUploadUrlResponseSchema>
export type VideoSegment = z.infer<typeof VideoSegmentSchema>
export type GenerateVideoResponse = z.infer<typeof GenerateVideoResponseSchema>
export type VideoMetadata = z.infer<typeof VideoMetadataSchema>
export type SignedUploadUrlRequest = z.infer<typeof SignedUploadUrlRequestSchema>
export type ExtractRequest = z.infer<typeof ExtractRequestSchema>
export type ModelInfo = z.infer<typeof ModelInfoSchema>
export type ProviderModels = z.infer<typeof ProviderModelsSchema>
export type ModelsResponse = z.infer<typeof ModelsResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type VideoFile = z.infer<typeof VideoFileSchema>
export type SelectedHighlight = z.infer<typeof SelectedHighlightSchema>
export type UploadProgress = z.infer<typeof UploadProgressSchema>

/**
 * Validation helper function
 */
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map(issue => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
        return `${path}${issue.message}`
      }).join(', ')
      throw new Error(`Validation error${context ? ` in ${context}` : ''}: ${details}`)
    }
    throw error
  }
}