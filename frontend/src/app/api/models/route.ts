import { NextResponse } from 'next/server';
import { ModelsResponse } from '@/types/models';
import { getErrorMessage } from '@/lib/error-handler';
import { serverAuthenticatedFetch } from '@/lib/api/server-auth';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await serverAuthenticatedFetch(`${BACKEND_API_URL}/api/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`${getErrorMessage('API_MODELS_FETCH_ERROR')}: ${response.statusText}`);
    }

    const data: ModelsResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: getErrorMessage('API_MODELS_FETCH_ERROR') },
      { status: 500 }
    );
  }
}