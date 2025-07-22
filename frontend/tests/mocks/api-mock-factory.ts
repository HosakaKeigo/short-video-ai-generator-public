import { Page, Route } from '@playwright/test';

interface MockAPIConfig {
  baseURL?: string;
  delay?: number;
}

interface UploadMockResponse {
  uploadUrl: string;
  fileId: string;
}

interface AnalysisMockResponse {
  highlights: Array<{
    start: number;
    end: number;
    title: string;
    description: string;
    score: number;
  }>;
}

interface GenerateVideoMockResponse {
  downloadUrl: string;
}

export class APIMockFactory {
  private delay: number;

  constructor(private page: Page, config: MockAPIConfig = {}) {
    this.delay = config.delay || 100;
  }

  private async handleRoute(route: Route, response: unknown, status = 200) {
    // オプションで遅延を追加（リアルなAPIの動作をシミュレート）
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  }

  // 署名付きURLの取得をモック
  async mockGetSignedUrl(response?: Partial<UploadMockResponse>) {
    const defaultResponse: UploadMockResponse = {
      uploadUrl: 'https://mock-storage.example.com/upload/test-video',
      fileId: 'mock-file-id-' + Date.now(),
      ...response,
    };

    await this.page.route('**/api/upload/init', route =>
      this.handleRoute(route, defaultResponse)
    );
  }

  // Cloud Storageへのアップロードをモック
  async mockUploadToStorage(uploadUrl?: string) {
    const url = uploadUrl || 'https://mock-storage.example.com/upload/**';

    await this.page.route(url, async route => {
      // PUTリクエストの場合のみモック
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          body: '',
        });
      } else {
        await route.continue();
      }
    });
  }

  // AI解析APIをモック
  async mockAnalyzeVideo(response?: Partial<AnalysisMockResponse>) {
    const defaultResponse: AnalysisMockResponse = {
      highlights: [
        {
          start: 0,
          end: 30,
          title: 'オープニングシーン',
          description: '導入部分の説明',
          score: 0.85,
        },
        {
          start: 30,
          end: 60,
          title: 'メインコンテンツ開始',
          description: '本編の開始部分',
          score: 0.92,
        },
        {
          start: 60,
          end: 90,
          title: '重要なポイント',
          description: 'キーポイントの説明',
          score: 0.88,
        },
        {
          start: 120,
          end: 150,
          title: 'ハイライトシーン',
          description: '最も重要な場面',
          score: 0.95,
        },
      ],
      ...response,
    };

    await this.page.route('**/api/analyze/**', route =>
      this.handleRoute(route, defaultResponse, 200)
    );
  }

  // 動画生成APIをモック
  async mockGenerateVideo(response?: Partial<GenerateVideoMockResponse>) {
    const defaultResponse: GenerateVideoMockResponse = {
      downloadUrl: 'https://mock-storage.example.com/download/generated-video.mp4',
      ...response,
    };

    await this.page.route('**/api/extract', route =>
      this.handleRoute(route, defaultResponse)
    );
  }

  // エラーレスポンスをモック
  async mockAPIError(urlPattern: string, status: number, errorMessage: string) {
    await this.page.route(urlPattern, route =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: errorMessage,
          message: errorMessage
        }),
      })
    );
  }

  // すべてのモックを設定（標準的なフロー用）
  async setupStandardMocks() {
    await this.mockGetSignedUrl();
    await this.mockUploadToStorage();
    await this.mockAnalyzeVideo();
    await this.mockGenerateVideo();
  }

  // アップロードエラーをシミュレート
  async setupUploadErrorMocks() {
    await this.mockGetSignedUrl();
    // ストレージへのアップロードで失敗
    await this.page.route('https://mock-storage.example.com/upload/**', route =>
      route.fulfill({ status: 500, body: 'Upload failed' })
    );
  }

  // 解析エラーをシミュレート
  async setupAnalysisErrorMocks() {
    await this.mockGetSignedUrl();
    await this.mockUploadToStorage();
    await this.mockAPIError('**/api/analyze/**', 500, 'AI解析に失敗しました');
  }

  // ネットワークタイムアウトをシミュレート
  async setupTimeoutMocks() {
    await this.page.route('**/api/**', async route => {
      // 長い遅延後にタイムアウト
      await new Promise(resolve => setTimeout(resolve, 30000));
      await route.abort('failed');
    });
  }

  // モックをクリア
  async clearAllMocks() {
    await this.page.unroute('**/*');
  }
}