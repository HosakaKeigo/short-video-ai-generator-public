import { NextRequest, NextResponse } from 'next/server'
import { SignedUploadUrlRequest, SignedUploadUrlResponse, SignedUploadUrlRequestSchema, SignedUploadUrlResponseSchema, validateApiResponse } from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'
import { serverAuthenticatedFetch } from '@/lib/api/server-auth'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'
const USE_MOCK_RESPONSES = process.env.USE_MOCK_RESPONSES === 'true'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()

    // Validate request body
    let body: SignedUploadUrlRequest
    try {
      body = validateApiResponse(SignedUploadUrlRequestSchema, rawBody, 'upload init request')
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid request body' },
        { status: 400 }
      )
    }

    // Mock mode
    if (USE_MOCK_RESPONSES) {
      // Generate a consistent mock file ID based on the filename
      const mockFileId = `mock-${body.fileName.replace(/\.[^/.]+$/, '')}-${Date.now()}`

      const mockResponse: SignedUploadUrlResponse = {
        // Use a special mock URL that the frontend will recognize
        uploadUrl: 'mock://upload',
        fileId: mockFileId
      }

      // Store mock file info in memory (in a real app, use a proper store)
      if (global.mockFiles === undefined) {
        global.mockFiles = new Map()
      }
      global.mockFiles.set(mockFileId, {
        fileName: body.fileName,
        fileSize: body.fileSize,
        contentType: body.contentType,
        mockVideoPath: '/mock/mock.mp4'
      })

      return NextResponse.json(mockResponse)
    }

    // Proxy to backend with authentication
    const response = await serverAuthenticatedFetch(`${BACKEND_API_URL}/api/upload/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || getErrorMessage('API_UPLOAD_INIT_FAILED') },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Validate backend response
    try {
      const validatedData = validateApiResponse(SignedUploadUrlResponseSchema, data, 'backend upload init response')
      return NextResponse.json(validatedData)
    } catch (validationError) {
      console.error('Backend response validation error:', validationError)
      return NextResponse.json(
        { error: getErrorMessage('API_INVALID_RESPONSE') },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Upload init error:', error)
    return NextResponse.json(
      { error: getErrorMessage('API_INTERNAL_ERROR') },
      { status: 500 }
    )
  }
}