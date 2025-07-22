import { GoogleAuth, IdTokenClient } from 'google-auth-library';

// Cache the auth client
let cachedClient: IdTokenClient | null = null;
let cachedAudience: string | null = null;

/**
 * Server-side Google Cloud認証付きHTTPリクエスト
 * Next.js API Routesから使用
 * @param url - リクエスト先URL
 * @param options - リクエストオプション
 * @returns Response
 */
export const serverAuthenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // Get backend URL from environment variable
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    const audience = new URL(backendUrl).origin;

    // Reuse cached client if audience matches
    if (!cachedClient || cachedAudience !== audience) {
      // Google Authクライアントを初期化（ADCを使用）
      const auth = new GoogleAuth();
      cachedClient = await auth.getIdTokenClient(audience);
      cachedAudience = audience;
    }

    // Make authenticated request using client.request
    const response = await cachedClient.request({
      url,
      method: options.method || 'GET',
      data: options.body,
      headers: options.headers,
    });

    // Convert Google Auth Library response to standard Response object
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as unknown as Record<string, string>),
    });
  } catch (error) {
    console.error('Server authenticated fetch failed:', error);
    throw error;
  }
};