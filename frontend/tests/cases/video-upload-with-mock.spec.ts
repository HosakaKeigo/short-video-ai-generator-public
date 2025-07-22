import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/index.page';
import { APIMockFactory } from '../mocks/api-mock-factory';

test.describe('動画アップロード機能（モックAPI使用）', () => {
  let apiMock: APIMockFactory;

  test.beforeEach(async ({ page }) => {
    // 各テストの前にAPIモックを初期化
    apiMock = new APIMockFactory(page, { delay: 200 });
  });

  test('動画をアップロードしてAI解析を実行する完全なフロー', async ({ page }) => {
    const homePage = new HomePage(page);

    // 標準的なモックをセットアップ
    await apiMock.setupStandardMocks();

    // ホームページにアクセス
    await homePage.step.visit();

    // ページが正しく読み込まれたことを確認
    await homePage.step.verifyPageLoaded();

    // テスト用動画ファイルを作成（実際のファイルの代わりにモックを使用）
    const testFileName = 'test-video.mp4';

    // ファイル入力要素を取得
    const fileInput = homePage.fileInput();

    // テスト用のファイルを設定（実際のファイルは不要）
    await fileInput.evaluate((input: HTMLInputElement) => {
      // Mock file upload by directly setting the files property
      const file = new File(['test content'], 'test-video.mp4', {
        type: 'video/mp4',
        lastModified: Date.now()
      });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // ファイルがアップロードされるまで少し待機
    await page.waitForTimeout(1000);

    // ファイル名が表示されることを確認
    await expect(homePage.videoFileName()).toContainText(testFileName);

    // AI解析ボタンが表示されることを確認
    await homePage.step.verifyAnalyzeButtonVisible();

    // AI解析ボタンをクリック
    await homePage.step.clickAnalyzeButton();

    // AI解析中の表示を確認
    await homePage.step.verifyAnalysisInProgress();

    // 解析完了を待機（モックの遅延を考慮）
    await expect(homePage.analyzingIndicator()).toBeHidden({ timeout: 5000 });

    // タイムラインが表示されることを確認
    await homePage.step.verifyAnalysisComplete();

    // ハイライトが表示されていることを確認
    const canvas = homePage.timelineCanvas();
    await expect(canvas).toBeVisible();

    // キャンバスにコンテンツが描画されていることを確認
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBeGreaterThan(0);
    expect(canvasBox!.height).toBeGreaterThan(0);
  });

  test('アップロードエラーが適切に表示される', async ({ page }) => {
    const homePage = new HomePage(page);

    // アップロードエラーのモックをセットアップ
    await apiMock.setupUploadErrorMocks();

    // ホームページにアクセス
    await homePage.step.visit();

    // ファイルアップロードをシミュレート
    await page.evaluate(() => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // エラーメッセージが表示されることを確認（実際のエラーメッセージに合わせる）
    await expect(homePage.errorMessage()).toBeVisible();
    await expect(homePage.errorMessage()).toContainText('Upload failed');
  });

  test('AI解析エラーが適切に表示される', async ({ page }) => {
    const homePage = new HomePage(page);

    // 解析エラーのモックをセットアップ
    await apiMock.setupAnalysisErrorMocks();

    // ホームページにアクセス
    await homePage.step.visit();

    // まず正常なアップロードを実行
    const fileInput = homePage.fileInput();
    await fileInput.evaluate((input: HTMLInputElement) => {
      const file = new File(['test content'], 'test-video.mp4', {
        type: 'video/mp4',
        lastModified: Date.now()
      });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // ファイルがアップロードされるまで待機
    await page.waitForTimeout(1000);

    // AI解析ボタンが表示されるまで待機
    await expect(homePage.analyzeButton()).toBeVisible({ timeout: 5000 });

    // AI解析ボタンをクリック
    await homePage.step.clickAnalyzeButton();

    // エラーメッセージが表示されることを確認
    await homePage.step.verifyErrorMessage('AI解析に失敗しました');
  });

  test('大きなファイルサイズのエラーが表示される', async ({ page }) => {
    const homePage = new HomePage(page);

    // ホームページにアクセス
    await homePage.step.visit();

    // 2GBを超えるファイルをシミュレート
    await page.evaluate(() => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        // 2.1GBのファイルをシミュレート
        const largeFile = new File(['x'.repeat(100)], 'large-video.mp4', {
          type: 'video/mp4'
        });
        Object.defineProperty(largeFile, 'size', {
          value: 2.1 * 1024 * 1024 * 1024, // 2.1GB
          writable: false
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(largeFile);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // エラーメッセージが表示されることを確認
    await homePage.step.verifyErrorMessage('ファイルサイズが大きすぎます');
  });

  test('解析結果の再生成ができる', async ({ page }) => {
    const homePage = new HomePage(page);

    // 標準的なモックをセットアップ
    await apiMock.setupStandardMocks();

    // ホームページにアクセス
    await homePage.step.visit();

    // テスト用動画ファイルをアップロード
    const fileInput = homePage.fileInput();
    await fileInput.evaluate((input: HTMLInputElement) => {
      const file = new File(['test content'], 'test-video.mp4', {
        type: 'video/mp4',
        lastModified: Date.now()
      });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // ファイルがアップロードされるまで待機
    await page.waitForTimeout(1000);

    // 初回のAI解析を実行
    await homePage.step.clickAnalyzeButton();
    await expect(homePage.analyzingIndicator()).toBeHidden({ timeout: 5000 });

    // タイムラインが表示されることを確認
    await homePage.step.verifyAnalysisComplete();

    // 再解析ボタンが表示されることを確認
    const regenerateButton = page.getByRole('button', { name: /再解析/ });
    await expect(regenerateButton).toBeVisible();

    // 初回の解析結果を記録（タイムラインが存在することを確認）
    const timelineCanvas = homePage.timelineCanvas();
    await expect(timelineCanvas).toBeVisible();

    // 再解析ボタンをクリック
    await regenerateButton.click();

    // 再解析中の表示を確認
    await expect(page.getByText('AI解析中...')).toBeVisible();

    // 再解析完了を待機
    await expect(page.getByText('AI解析中...')).toBeHidden({ timeout: 5000 });

    // タイムラインが再表示されることを確認
    await expect(timelineCanvas).toBeVisible();
    
    // 再解析ボタンが引き続き表示されることを確認
    await expect(regenerateButton).toBeVisible();
  });

  test.afterEach(async () => {
    // 各テスト後にモックをクリア
    if (apiMock) {
      await apiMock.clearAllMocks();
    }
  });
});

// 実行コマンド:
// npm run test:e2e tests/cases/video-upload-with-mock.spec.ts