import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult, AnalysisResultSchema, validateApiResponse } from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'
import { serverAuthenticatedFetch } from '@/lib/api/server-auth'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'
const USE_MOCK_RESPONSES = process.env.USE_MOCK_RESPONSES === 'true'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params

    // Mock mode
    if (USE_MOCK_RESPONSES) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if this is a mock file
      const mockFile = global.mockFiles?.get(fileId)

      const mockResponse: AnalysisResult = {
        highlights: [
          {
            start: 0,
            end: 30,
            title: 'オープニングシーン',
            description: mockFile ? `${mockFile.fileName}の導入部分` : 'モック動画の導入部分',
            score: 0.85
          },
          {
            start: 30,
            end: 60,
            title: 'メインコンテンツ',
            description: '重要な内容が始まる部分',
            score: 0.92
          },
          {
            start: 60,
            end: 90,
            title: 'ハイライトシーン',
            description: '最も注目すべきシーン',
            score: 0.95
          },
          {
            start: 90,
            end: 120,
            title: '詳細説明',
            description: '技術的な詳細や補足説明',
            score: 0.78
          },
          {
            start: 120,
            end: 150,
            title: 'クライマックス',
            description: '盛り上がりのピーク',
            score: 0.88
          },
          {
            start: 150,
            end: 180,
            title: 'まとめ',
            description: '要点のまとめと結論',
            score: 0.82
          }
        ]
      }
      return NextResponse.json(mockResponse)
    }

    // Parse request body for model options if provided
    const body = await request.json().catch(() => null)
    
    // Proxy to backend with authentication
    const response = await serverAuthenticatedFetch(`${BACKEND_API_URL}/api/analyze/${fileId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || getErrorMessage('API_ANALYSIS_FAILED') },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Validate the response from backend
    try {
      const validatedData = validateApiResponse(AnalysisResultSchema, data, 'backend analyze response')
      return NextResponse.json(validatedData)
    } catch (validationError) {
      console.error('Backend response validation error:', validationError)
      return NextResponse.json(
        { error: getErrorMessage('API_INVALID_RESPONSE') },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: getErrorMessage('API_INTERNAL_ERROR') },
      { status: 500 }
    )
  }
}