import type { HomePage } from '../pages/index.page';
import { expect } from '@playwright/test';
import path from 'path';

export class VideoUploadStep {
  constructor(private readonly homePage: HomePage) {}

  async visit() {
    await this.homePage.page.goto('/');
    await this.homePage.page.waitForLoadState('networkidle');
  }

  async verifyPageLoaded() {
    // ページタイトルとヘッダーが表示されることを確認
    await expect(this.homePage.pageTitle()).toBeVisible();
    await expect(this.homePage.pageDescription()).toBeVisible();
  }

  async verifyUploadAreaVisible() {
    // アップロードエリアが表示されることを確認
    await expect(this.homePage.uploadArea()).toBeVisible();
    await expect(this.homePage.uploadInstructions()).toBeVisible();
    await expect(this.homePage.uploadFormats()).toBeVisible();
  }

  async uploadVideo(fileName: string) {
    // テスト用の動画ファイルをアップロード
    const filePath = path.join(__dirname, '..', 'fixtures', fileName);
    await this.homePage.fileInput().setInputFiles(filePath);
  }

  async mockUploadVideo() {
    // モックAPIレスポンスを設定してアップロードをシミュレート
    await this.homePage.page.route('**/api/upload/signed-url', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadUrl: 'https://mock-storage.example.com/upload',
          fileId: 'mock-file-id-123'
        })
      });
    });

    // モックアップロードレスポンス
    await this.homePage.page.route('https://mock-storage.example.com/upload', route => {
      route.fulfill({
        status: 200
      });
    });
  }

  async verifyVideoUploaded(fileName: string) {
    // ファイル名が表示されることを確認
    await expect(this.homePage.videoFileName()).toContainText(fileName);
    // 変更ボタンが表示されることを確認
    await expect(this.homePage.changeVideoButton()).toBeVisible();
  }

  async verifyAnalyzeButtonVisible() {
    // AI解析ボタンが表示されることを確認
    await expect(this.homePage.analyzeButton()).toBeVisible();
  }

  async clickAnalyzeButton() {
    // AI解析ボタンをクリック
    await this.homePage.analyzeButton().click();
  }

  async mockAnalysisResponse() {
    // モックAI解析レスポンスを設定
    await this.homePage.page.route('**/api/analyze/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          highlights: [
            {
              start: 0,
              end: 30,
              title: 'オープニングシーン',
              description: '導入部分の説明',
              score: 0.85
            },
            {
              start: 30,
              end: 60,
              title: 'メインコンテンツ',
              description: '本編の開始',
              score: 0.92
            }
          ]
        })
      });
    });
  }

  async verifyAnalysisInProgress() {
    // AI解析中の表示を確認
    await expect(this.homePage.analyzingIndicator()).toBeVisible();
  }

  async verifyAnalysisComplete() {
    // タイムラインが表示されることを確認
    await expect(this.homePage.timelineSection()).toBeVisible();
    await expect(this.homePage.timelineCanvas()).toBeVisible();
    
    // ハイライトセレクターが表示されることを確認
    await expect(this.homePage.selectedHighlightTitle()).toBeVisible();
  }

  async verifyErrorMessage(expectedError: string) {
    // エラーメッセージが表示されることを確認
    await expect(this.homePage.errorMessage()).toBeVisible();
    await expect(this.homePage.errorMessage()).toContainText(expectedError);
  }

  // Highlight selection methods
  async clickOnTimeline(x: number, y: number) {
    const canvas = this.homePage.timelineCanvas();
    await canvas.click({ position: { x, y } });
  }

  async selectHighlightByIndex(index: number) {
    // Get canvas dimensions
    const canvas = this.homePage.timelineCanvas();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Click on the first highlight (simplified - in real test you'd calculate position)
    // Assuming highlights are evenly distributed
    const x = box.width * 0.2 * (index + 1);
    const y = box.height / 2;
    await this.clickOnTimeline(x, y);
  }

  async verifyHighlightSelected() {
    await expect(this.homePage.selectedHighlightItem()).toBeVisible();
    await expect(this.homePage.noHighlightMessage()).not.toBeVisible();
  }

  async verifyNoHighlightSelected() {
    await expect(this.homePage.noHighlightMessage()).toBeVisible();
    await expect(this.homePage.selectedHighlightItem()).not.toBeVisible();
  }

  async clickDownloadButton() {
    await this.homePage.downloadButton().click();
  }

  async verifyDownloadInProgress() {
    await expect(this.homePage.generatingMessage()).toBeVisible();
  }

  async verifyDownloadButtonEnabled() {
    await expect(this.homePage.downloadButton()).toBeEnabled();
  }

  async verifyDownloadButtonDisabled() {
    await expect(this.homePage.downloadButton()).toBeDisabled();
  }
}