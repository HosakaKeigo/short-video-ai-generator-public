# E2E Tests for AI Short Video Generator

このディレクトリには、AI Short Video GeneratorのE2Eテストが含まれています。

## ディレクトリ構造

```
tests/
├── cases/          # テストケース
├── pages/          # Page Objectモデル（ロケーター定義）
├── steps/          # ステップ定義（操作とアサーション）
├── mocks/          # APIモックファクトリー
└── fixtures/       # テスト用ファイル
```

## Page Object Model

テストは以下の3層構造で実装されています：

1. **Pages** (`pages/`): UI要素のロケーターを定義
2. **Steps** (`steps/`): 実際の操作とアサーションを実装
3. **Cases** (`cases/`): テストシナリオを記述

## API Mock Factory

`mocks/api-mock-factory.ts`は、APIレスポンスをモックするためのユーティリティです：

- 署名付きURLの取得
- Cloud Storageへのアップロード
- AI解析
- 動画生成
- エラーレスポンス

## テストの実行

```bash
# すべてのテストを実行
npm run test:e2e

# 特定のテストファイルを実行
npm run test:e2e tests/cases/simple-upload.spec.ts

# UIモードで実行（デバッグに便利）
npm run test:e2e:ui

# 特定のテストケースを実行
npm run test:e2e -- -g "基本的なUIが正しく表示される"
```

## テストケース

### simple-upload.spec.ts
- 基本的なUIの表示確認
- モックAPIの動作確認

### video-upload.spec.ts
- 動画アップロードUIの表示
- アップロード後のUI変化
- AI解析の実行フロー

### video-upload-with-mock.spec.ts
- 完全なアップロード・解析フロー
- エラーハンドリング
- ファイルサイズ制限

## デバッグ

```bash
# デバッグモードで実行
npx playwright test --debug

# トレースを有効にして実行
npx playwright test --trace on
```

## 注意事項

- テストは実際のファイルアップロードをシミュレートしますが、実際のビデオファイルは使用しません
- APIレスポンスはすべてモックされています
- テスト環境では`http://localhost:3000`でアプリケーションが起動している必要があります