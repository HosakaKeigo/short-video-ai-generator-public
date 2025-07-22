# Add Playwright for E2E Testing

## 1. プロジェクトの作成
1. プロジェクトのディレクトリを作成。場所やプロジェクト名はユーザーに確認すること。
2. `pnpm init`を実行し、プロジェクトの初期化。
3. Playwrightプロジェクトのセットアップを行う。
```bash
pnpm create playwright --quiet
```

## 2. 基本設定
- Chromeのみのテストを行うため、`playwright.config.ts`を修正

## 3. テストガイドの確認
@E2E_TESTING_GUIDE.md を確認し、pages/steps/casesの構成を把握

## 4. テストケースの作成
- `tests/`ディレクトリに1つ簡単なテストを作成