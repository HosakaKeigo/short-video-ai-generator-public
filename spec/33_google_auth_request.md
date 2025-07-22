## Problem
Backend Python is hosted on Google Cloud Run and IAM protected.

You need to implement Google Auth request to access the backend API.

Make api routes request with authenticated. Note you don't need authentication for gcs presigned url from client side.

## Sample implementation
```ts
import { GoogleAuth } from 'google-auth-library';



type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Google Cloud認証付きでHTTPリクエストを実行
 * @param url - リクエスト先URL
 * @param options - リクエストオプション
 * @returns Response
 */
export const authenticatedFetch = async (
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<Response> => {
  try {
    // Google Authクライアントを初期化（ADCを使用）
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(<Audience>) || ''); // audienceはバックエンドのURL（`https://api.example.com/`）

    const response = await client.request({
      url,
      method: options.method || 'GET',
      data: options.body,
      signal: options.signal,
    });

    // Response-likeオブジェクトを作成
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as Record<string, string>),
    });
  } catch (error) {
    console.error('Authenticated fetch failed:', error);
    const userFriendlyMessage = getJapaneseErrorMessage(error instanceof Error ? error : "Unknown error");
    throw new Error(userFriendlyMessage);
  }
};
```