Configure and apply Ruff formatting.

Refer the following docs:

# Ruff実践ガイド：VSCode設定と実装手順

## 1. インストールと初期セットアップ

### 1.1 Ruffのインストール

```bash
# pip経由でインストール
pip install ruff

# pipx経由でグローバルインストール（推奨）
pipx install ruff

# uvを使用（最新のAstralツール）
uv tool install ruff

# Homebrewを使用（macOS/Linux）
brew install ruff
```

### 1.2 バージョン確認と基本コマンド

```bash
# バージョン確認
ruff --version

# ヘルプの表示
ruff --help

# 利用可能なルール一覧を表示
ruff rule --all
```

## 2. VS Code詳細設定ガイド

### 2.1 拡張機能のインストール

1. VS Codeの拡張機能マーケットプレイスを開く（Ctrl+Shift+X）
2. "Ruff"で検索
3. "Ruff" by Astral Software Inc. (charliermarsh.ruff)をインストール

### 2.2 settings.jsonの完全設定例

VS Codeの設定ファイル（`.vscode/settings.json`）に以下を追加：

```json
{
  // Ruffを有効化
  "ruff.enable": true,
  
  // 保存時の動作設定
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    // 保存時にRuffで自動修正
    "source.fixAll.ruff": "explicit",
    // 保存時にインポートを整理
    "source.organizeImports.ruff": "explicit"
  },
  
  // Pythonファイルのデフォルトフォーマッター
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    // 他のフォーマッターを無効化
    "editor.formatOnSave": true
  },
  
  // Jupyter Notebook対応
  "[jupyter]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },
  
  // Ruffの設定ファイルパス（オプション）
  "ruff.configuration": "${workspaceFolder}/pyproject.toml",
  
  // Ruffの実行パス（カスタムインストールの場合）
  // "ruff.path": ["${workspaceFolder}/.venv/bin/ruff"],
  
  // リント実行タイミング
  "ruff.lint.enable": true,
  "ruff.lint.run": "onType",  // onType, onSave, または off
  
  // フォーマット設定
  "ruff.format.enable": true,
  
  // その他のPython拡張機能との競合回避
  "python.linting.enabled": false,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": false,
  "python.formatting.provider": "none"
}
```

### 2.3 ワークスペース固有の設定

プロジェクトごとに異なる設定が必要な場合：

```json
// .vscode/settings.json（プロジェクトルート）
{
  "ruff.lint.args": ["--config", "./custom-ruff.toml"],
  "ruff.format.args": ["--line-length", "100"]
}
```

## 3. 設定ファイルの詳細

### 3.1 pyproject.toml完全例

```toml
[tool.ruff]
# 基本設定
line-length = 88
target-version = "py39"  # Python 3.9以上を対象

# 除外するファイル/ディレクトリ
exclude = [
    ".git",
    ".venv",
    "__pycache__",
    "build",
    "dist",
    "migrations",
    ".mypy_cache",
    ".pytest_cache",
    ".tox",
]

# インクルードするファイルパターン
include = ["*.py", "*.pyi", "**/pyproject.toml", "*.ipynb"]

[tool.ruff.lint]
# 有効にするルールセット
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
    "I",    # isort
    "B",    # flake8-bugbear
    "C4",   # flake8-comprehensions
    "UP",   # pyupgrade
    "N",    # pep8-naming
    "S",    # flake8-bandit (security)
    "A",    # flake8-builtins
    "DTZ",  # flake8-datetimez
    "DJ",   # flake8-django
    "EM",   # flake8-errmsg
    "G",    # flake8-logging-format
    "INP",  # flake8-no-pep420
    "PIE",  # flake8-pie
    "T20",  # flake8-print
    "PYI",  # flake8-pyi
    "PT",   # flake8-pytest-style
    "Q",    # flake8-quotes
    "RSE",  # flake8-raise
    "RET",  # flake8-return
    "SLF",  # flake8-self
    "SIM",  # flake8-simplify
    "ARG",  # flake8-unused-arguments
    "PTH",  # flake8-use-pathlib
    "ERA",  # flake8-eradicate
    "PD",   # pandas-vet
    "PGH",  # pygrep-hooks
    "PL",   # Pylint
    "TRY",  # tryceratops
    "FLY",  # flynt
    "NPY",  # NumPy-specific rules
    "PERF", # Perflint
    "RUF",  # Ruff-specific rules
]

# 無視するルール
ignore = [
    "E501",   # 行の長さ（line-lengthで制御）
    "B008",   # 関数呼び出しのデフォルト引数
    "B904",   # raise ... from err を使用
    "S101",   # assertの使用（テストでは必要）
    "PLR0913", # 引数が多すぎる
]

# ファイルごとの除外設定
[tool.ruff.lint.per-file-ignores]
"__init__.py" = ["F401", "F403"]  # 未使用インポート、スターインポート
"tests/**/*.py" = [
    "S101",   # assert使用OK
    "S105",   # ハードコードされたパスワードOK（テスト用）
    "PLR2004", # マジックナンバーOK
]
"migrations/*.py" = ["E501"]  # 長い行OK
"scripts/*.py" = ["T20"]      # print文OK

# isort設定
[tool.ruff.lint.isort]
known-first-party = ["myproject"]
combine-as-imports = true
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]

# McCabe複雑度
[tool.ruff.lint.mccabe]
max-complexity = 10

# flake8-quotes設定
[tool.ruff.lint.flake8-quotes]
docstring-quotes = "double"
inline-quotes = "single"

# pydocstyle設定
[tool.ruff.lint.pydocstyle]
convention = "google"  # google, numpy, pep257

# pylint設定
[tool.ruff.lint.pylint]
max-args = 5
max-branches = 12
max-returns = 6
max-statements = 50

[tool.ruff.format]
# フォーマット設定
quote-style = "single"  # シングルクォート優先
indent-style = "space"  # スペースでインデント
skip-magic-trailing-comma = false
line-ending = "auto"    # LF or CRLF

# docstring設定
docstring-code-format = true
docstring-code-line-length = 72
```

### 3.2 独立したruff.toml例

```toml
# ruff.toml（pyproject.tomlを使わない場合）
line-length = 100
target-version = "py311"

# 継承設定（共通設定を読み込む）
extend = "../shared-ruff-config.toml"

[lint]
# Django/FastAPIプロジェクト向け設定
select = ["ALL"]
ignore = [
    "D",      # pydocstyle（docstring不要な場合）
    "ANN",    # flake8-annotations（型ヒント不要な場合）
    "COM812", # trailing comma
    "ISC001", # single line implicit string concatenation
]

[lint.flake8-pytest-style]
fixture-parentheses = false
mark-parentheses = false

[lint.flake8-tidy-imports]
ban-relative-imports = "all"

[format]
quote-style = "double"
indent-style = "space"
```

## 4. コマンドライン実践ガイド

### 4.1 基本的なリント実行

```bash
# カレントディレクトリをチェック
ruff check .

# 特定ファイルをチェック
ruff check src/main.py

# 詳細な出力
ruff check . --verbose

# 統計情報を表示
ruff check . --statistics

# 特定のルールのみ実行
ruff check . --select E,F

# 特定のルールを除外
ruff check . --ignore E501
```

### 4.2 自動修正

```bash
# 修正可能な問題を自動修正
ruff check . --fix

# 修正内容を表示（実際には修正しない）
ruff check . --fix --diff

# 安全でない修正も含める
ruff check . --fix --unsafe-fixes

# 修正内容を確認してから適用
ruff check . --fix --show-fixes
```

### 4.3 フォーマット実行

```bash
# フォーマット実行
ruff format .

# 変更内容を確認（dry-run）
ruff format . --diff

# 特定のファイルのみフォーマット
ruff format src/main.py src/utils.py

# フォーマットチェックのみ（CI用）
ruff format . --check
```

### 4.4 出力フォーマット

```bash
# GitHub Actions形式
ruff check . --output-format=github

# GitLab形式
ruff check . --output-format=gitlab

# JSON形式（プログラム連携用）
ruff check . --output-format=json

# JUnit XML形式
ruff check . --output-format=junit

# カスタムフォーマット
ruff check . --output-format=text --format="{path}:{row}:{col}: {code} {message}"
```

## 5. CI/CD設定実例

### 5.1 GitHub Actions完全設定

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ruff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      # Ruffキャッシュ設定
      - name: Cache Ruff
        uses: actions/cache@v4
        with:
          path: ~/.cache/ruff
          key: ${{ runner.os }}-ruff-${{ hashFiles('**/pyproject.toml') }}
      
      # 方法1: Ruff Action使用
      - name: Run Ruff
        uses: astral-sh/ruff-action@v1
        with:
          version: "latest"
          args: "--output-format=github"
          
      # 方法2: 直接インストール
      - name: Install and run Ruff
        run: |
          pip install ruff
          ruff check . --output-format=github
          ruff format . --check
          
      # PR用アノテーション
      - name: Annotate PR
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const output = `
            ⚠️ **Ruff found issues in your code**
            
            Run \`ruff check . --fix\` locally to auto-fix issues.
            `;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })
```

### 5.2 pre-commit設定

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.13
    hooks:
      # リント実行
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
        types_or: [python, pyi, jupyter]
        
      # フォーマット実行
      - id: ruff-format
        types_or: [python, pyi, jupyter]

  # 他のツールとの組み合わせ例
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
```

インストールと使用：

```bash
# pre-commitインストール
pip install pre-commit

# フックのインストール
pre-commit install

# 手動実行
pre-commit run --all-files

# 特定のフックのみ実行
pre-commit run ruff --all-files
```

## 6. 既存プロジェクトへの段階的導入

### 6.1 移行戦略

```bash
# Step 1: 現状把握
ruff check . --statistics > ruff-baseline.txt

# Step 2: 修正可能な問題を自動修正
ruff check . --select I,UP --fix  # isortとpyupgradeのみ

# Step 3: 段階的にルールを追加
ruff check . --select E,W,F --fix  # 基本的なエラー

# Step 4: より厳格なルールを追加
ruff check . --select ALL --fix
```

### 6.2 移行用設定ファイル

```toml
# 移行期間中のpyproject.toml
[tool.ruff]
# 最初は緩い設定から開始
line-length = 120  # 既存コードに合わせて長めに

[tool.ruff.lint]
# 最小限のルールから開始
select = ["E", "F"]

# 多くのルールを一時的に無視
ignore = [
    "E501",    # 行の長さ
    "F401",    # 未使用インポート（後で対応）
    "F841",    # 未使用変数（後で対応）
]

# レガシーコード用の除外
[tool.ruff.lint.per-file-ignores]
"legacy/*.py" = ["ALL"]  # レガシーコードは全て無視
"*_old.py" = ["ALL"]     # 古いファイルは無視
```

## 7. よく使うルールの詳細設定

### 7.1 主要ルールカテゴリー解説

```toml
[tool.ruff.lint]
select = [
    # 必須レベル
    "E",      # pycodestyle エラー（PEP 8準拠）
    "F",      # Pyflakes（未使用変数、インポートエラー等）
    "W",      # pycodestyle 警告
    
    # 推奨レベル
    "I",      # isort（インポート順序）
    "N",      # pep8-naming（命名規則）
    "UP",     # pyupgrade（古い構文を新しい構文に）
    "B",      # flake8-bugbear（バグになりやすいコード）
    "A",      # flake8-builtins（組み込み名の隠蔽）
    "C4",     # flake8-comprehensions（内包表記の最適化）
    "DTZ",    # flake8-datetimez（タイムゾーン関連）
    "T20",    # flake8-print（print文の検出）
    "PT",     # flake8-pytest-style（pytest規約）
    "RET",    # flake8-return（return文の最適化）
    "SIM",    # flake8-simplify（コードの簡略化）
    "ARG",    # flake8-unused-arguments（未使用引数）
    "PTH",    # flake8-use-pathlib（pathlibの使用推奨）
    
    # プロジェクト別
    "DJ",     # flake8-django（Django固有）
    "PD",     # pandas-vet（pandas固有）
    "NPY",    # NumPy固有
    
    # 厳格レベル
    "ERA",    # eradicate（コメントアウトされたコード）
    "PL",     # Pylint（複雑度、設計）
    "TRY",    # tryceratops（例外処理）
    "FLY",    # flynt（f-string変換）
    "PERF",   # Perflint（パフォーマンス）
    "FURB",   # refurb（モダンな書き方）
    "RUF",    # Ruff独自ルール
]
```

### 7.2 特定用途向け設定

```toml
# Djangoプロジェクト
[tool.ruff.lint]
select = ["DJ"]
[tool.ruff.lint.flake8-django]
django-settings-module = "myproject.settings"

# データサイエンスプロジェクト
[tool.ruff.lint]
select = ["PD", "NPY"]
[tool.ruff.lint.pandas-vet]
check-attr = false  # df.column_name形式を許可

# FastAPIプロジェクト
[tool.ruff.lint]
select = ["FA"]  # FastAPI固有
ignore = ["B008"]  # 関数のデフォルト引数でDepends()を許可
```

## 8. トラブルシューティング

### 8.1 よくある問題と解決策

```bash
# 問題: Ruffが見つからない
# 解決: パスを確認
which ruff
echo $PATH

# 問題: 設定ファイルが読み込まれない
# 解決: 設定ファイルの場所を明示
ruff check . --config ./custom-ruff.toml

# 問題: VS Codeで動作しない
# 解決: Python環境を確認
# Ctrl+Shift+P → "Python: Select Interpreter"

# 問題: 特定のルールが動作しない
# 解決: ルールの詳細を確認
ruff rule E501  # ルールの説明を表示
```

### 8.2 デバッグモード

```bash
# 詳細なデバッグ情報
RUST_LOG=debug ruff check .

# 設定の確認
ruff check . --show-settings

# 適用されているルールの確認
ruff check . --show-files
```

## 9. パフォーマンスチューニング

### 9.1 キャッシュの活用

```toml
[tool.ruff]
cache-dir = "~/.cache/ruff"  # デフォルト

# CI環境でのキャッシュ無効化
# ruff check . --no-cache
```

### 9.2 並列処理の設定

```bash
# CPUコア数に応じた並列処理
ruff check . --threads 0  # 自動（デフォルト）
ruff check . --threads 4  # 4スレッド固定
```

## 10. 他ツールとの連携

### 10.1 Makefileの例

```makefile
.PHONY: lint format check

lint:
	ruff check . --fix

format:
	ruff format .

check:
	ruff check . --exit-non-zero-on-fix
	ruff format . --check

watch:
	watchmedo shell-command \
		--patterns="*.py" \
		--recursive \
		--command='ruff check . --fix' \
		.
```

### 10.2 Poetry統合

```toml
# pyproject.toml
[tool.poetry.scripts]
lint = "scripts:lint"
format = "scripts:format"

# scripts.py
def lint():
    import subprocess
    subprocess.run(["ruff", "check", ".", "--fix"])

def format():
    import subprocess
    subprocess.run(["ruff", "format", "."])
```

## まとめ

Ruffは従来のPythonリンター・フォーマッターを統合し、圧倒的な速度向上を実現します。この実践ガイドを参考に、プロジェクトに合わせた設定を行い、開発効率を大幅に向上させることができます。段階的な導入により、既存プロジェクトでもスムーズに移行が可能です。