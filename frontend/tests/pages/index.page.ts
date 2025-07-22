import type { Page } from '@playwright/test';
import { VideoUploadStep } from '../steps/index.step';

export class HomePage {
  readonly step: VideoUploadStep;

  constructor(readonly page: Page) {
    this.step = new VideoUploadStep(this);
  }

  // Locators for video upload
  uploadArea() {
    return this.page.getByText('動画をドラッグ&ドロップ');
  }

  fileInput() {
    return this.page.locator('input[type="file"]');
  }

  uploadInstructions() {
    return this.page.getByText('または、クリックしてファイルを選択');
  }

  uploadFormats() {
    return this.page.getByText('対応形式: MP4, MOV, AVI, WebM（最大2GB）');
  }

  uploadProgress() {
    return this.page.getByText(/アップロード中/);
  }

  // Locators for uploaded video
  videoFileName() {
    return this.page.locator('.font-medium.text-gray-900');
  }

  changeVideoButton() {
    return this.page.getByRole('button', { name: '変更' });
  }

  // Locators for AI analysis
  analyzeButton() {
    return this.page.getByRole('button', { name: 'AIで解析' });
  }

  analyzingIndicator() {
    return this.page.getByText('AI解析中...');
  }

  // Locators for timeline
  timelineSection() {
    return this.page.getByRole('heading', { name: 'タイムライン' });
  }

  timelineCanvas() {
    return this.page.locator('canvas');
  }

  // Locators for error messages
  errorMessage() {
    return this.page.locator('.bg-red-50').getByRole('paragraph');
  }

  // Page title and header
  pageTitle() {
    return this.page.getByRole('heading', { name: 'AI Short Video Generator' });
  }

  pageDescription() {
    return this.page.getByText('動画をアップロードして、AIが自動的にハイライトを抽出します');
  }

  // Locators for highlight selection
  selectedHighlightTitle() {
    return this.page.getByRole('heading', { name: '選択したハイライト' });
  }

  noHighlightMessage() {
    return this.page.getByText('タイムラインからハイライトを選択してください');
  }

  selectedHighlightItem() {
    return this.page.locator('.bg-white.rounded-lg.border.shadow-sm.p-4');
  }

  deleteHighlightButton() {
    return this.page.locator('button[variant="ghost"]').filter({ has: this.page.locator('[data-lucide="trash-2"]') }).first();
  }

  downloadButton() {
    return this.page.getByRole('button', { name: '動画を生成してダウンロード' });
  }

  generatingMessage() {
    return this.page.getByText('生成中...');
  }
}