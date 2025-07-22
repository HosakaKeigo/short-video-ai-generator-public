import { NextRequest, NextResponse } from 'next/server'
import { 
  ExtractRequest,
  ExtractRequestSchema,
  GenerateVideoResponseSchema,
  validateApiResponse 
} from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'
import { serverAuthenticatedFetch } from '@/lib/api/server-auth'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()
    
    // Validate request body
    let body: ExtractRequest
    try {
      body = validateApiResponse(ExtractRequestSchema, rawBody, 'extract request')
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid request body' },
        { status: 400 }
      )
    }

    // Proxy to backend with authentication
    const response = await serverAuthenticatedFetch(`${BACKEND_API_URL}/api/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || getErrorMessage('API_EXTRACT_FAILED') },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Validate backend response
    try {
      const validatedData = validateApiResponse(GenerateVideoResponseSchema, data, 'backend extract response')
      return NextResponse.json(validatedData)
    } catch (validationError) {
      console.error('Backend response validation error:', validationError)
      return NextResponse.json(
        { error: getErrorMessage('API_INVALID_RESPONSE') },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Extract error:', error)
    return NextResponse.json(
      { error: getErrorMessage('API_INTERNAL_ERROR') },
      { status: 500 }
    )
  }
}