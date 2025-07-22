# Playwright Testing Guide

## 注意事項
- Playwrightはpage object modelを取っており、pages, steps, casesに分かれています。
  - pages: Locatorを返す関数を集約（ファイル名: hoge.page.ts）
    - Locatorはなるべくselectorから意味が汲み取りやすく、壊れにくいものを選んでください。
    - LocatorはgetByRoleなどPlaywrightが用意している関数を推奨します。それらが不足する場合は、.locatorを使って構いません。
    - xpathは可読性が落ちるため使わないでください。
   - steps: 実際のやりとりを行う関数を集約（ファイル名: hoge.step.ts）
    - stepsは直接newせず、pagesから呼んでください。（例：`hogePage.step.<method>`）
   - case: テストケースの記載（hoge.spec.ts）
  - ディレクトリはテストするページのpathに合わせてください。たとえば、/concertsの場合は`pages/concerts/index.page.ts`となります。
  - pagesを定義するとき、locatorの同定が難しい場合はテストするコードにdata-testidを加えても構いません。
- matcherにはPlaywrightが提供する**非同期のWeb First Matcher**をなるべく使用してください。
- casesには非エンジニアが流れを理解できる程度に要所にコメントを入れてください。（コメントは適度な量としてください。1行1行コメントする必要はありません。）
- テストを作成した場合は、その実行コマンドも教えてください。

## テストを書く手順
- 対応するpagesを作成 or 追記
- 対応するstepsを作成 or 追記
- casesにテストケースを作成
- 可能な場合はhelper切り出しなどのリファクタ。

## 実際のディレクトリ例
```
┣ tests/
┃ ┣ cases/
┃ ┃ ┣ login/
┃ ┃ ┣ ourmusic/
┃ ┃ ┣ index.spec.ts
┃ ┃ ┗ login.spec.ts
┃ ┣ config/
┃ ┃ ┣ auth.ts
┃ ┃ ┗ urls.ts
┃ ┣ pages/
┃ ┃ ┣ auth/
┃ ┃ ┣ login/
┃ ┃ ┣ ourmusic/
┃ ┃ ┗ index.page.ts
┃ ┣ setups/
┃ ┃ ┣ auth.setup.ts
┃ ┃ ┗ global.setup.ts
┃ ┣ steps/
┃ ┃ ┣ auth/
┃ ┃ ┣ login/
┃ ┃ ┣ ourmusic/
┃ ┃ ┗ index.step.ts
┃ ┣ utils/
┃ ┃ ┗ login.ts
┃ ┗ types.ts
```

## 実際のコード例

### pages

```ts
import type { Page } from "@playwright/test";
import { ConcertsIndexStep } from "../../steps/concerts/index.step";

export class ConcertsIndexPage {
  readonly step: ConcertsIndexStep; // Inject step

  constructor(readonly page: Page) { // page is not private to be accessible from step object
    this.step = new ConcertsIndexStep(this);
  }

// locator
  keywordSearchInput() {
    return this.page.getByTestId("keyword-search-input");
  }
}
```

### steps
```ts
import type { ConcertsIndexPage } from "../../pages/concerts/index.page";

export class ConcertsIndexStep {
  constructor(private readonly concertIndexPage: ConcertsIndexPage) { }

  // call Step methods from Page. e.g. concertIndexPage.step.visit
  async visit(baseUrl: string, queryString?: string) {
    const path = queryString ? `/concerts${queryString}` : "/concerts";
    const url = new URL(path, baseUrl).toString();
    await this.concertIndexPage.page.goto(url);
    await this.concertIndexPage.page.waitForLoadState("networkidle");
  }

  async openAreaSearch() {
    await this.concertIndexPage.areaSearchButton().click();
  }
}
```

## ベストプラクティス
以下はPlaywright公式のベストプラクティス集です。適宜参照してください。

以下は、提示されたテキストを見出し（Markdown の見出しレベル）およびコードブロックを復元し、整理したものです。必要に応じて適宜インデントや見出しレベルを調整しています。

---

# Best Practices

## Introduction

This guide should help you to make sure you are following our best practices and writing tests that are more resilient.

## Testing philosophy

### Test user-visible behavior

Automated tests should verify that the application code works for the end users, and avoid relying on implementation details such as things which users will not typically use, see, or even know about such as the name of a function, whether something is an array, or the CSS class of some element. The end user will see or interact with what is rendered on the page, so your test should typically only see/interact with the same rendered output.

### Make tests as isolated as possible

Each test should be completely isolated from another test and should run independently with its own local storage, session storage, data, cookies etc. Test isolation improves reproducibility, makes debugging easier and prevents cascading test failures.

In order to avoid repetition for a particular part of your test you can use **before** and **after** hooks. Within your test file add a **before** hook to run a part of your test before each test such as going to a particular URL or logging in to a part of your app. This keeps your tests isolated as no test relies on another. However it is also ok to have a little duplication when tests are simple enough especially if it keeps your tests clearer and easier to read and maintain.

```ts
import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Runs before each test and signs in each page.
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('username');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
});

test('first', async ({ page }) => {
  // page is signed in.
});

test('second', async ({ page }) => {
  // page is signed in.
});
```

You can also reuse the signed-in state in the tests with **setup project**. That way you can log in only once and then skip the log in step for all of the tests.

### Avoid testing third-party dependencies

Only test what you control. Don't try to test links to external sites or third party servers that you do not control. Not only is it time consuming and can slow down your tests but also you cannot control the content of the page you are linking to, or if there are cookie banners or overlay pages or anything else that might cause your test to fail.

Instead, use the Playwright Network API and guarantee the response needed.

```ts
await page.route('**/api/fetch_data_third_party_dependency', route => route.fulfill({
  status: 200,
  body: testData,
}));
await page.goto('https://example.com');
```

### Testing with a database

If working with a database then make sure you control the data. Test against a staging environment and make sure it doesn't change. For visual regression tests make sure the operating system and browser versions are the same.

---

# Best Practices

## Use locators

In order to write end to end tests we need to first find elements on the webpage. We can do this by using Playwright's built in locators. Locators come with auto waiting and retry-ability. Auto waiting means that Playwright performs a range of actionability checks on the elements, such as ensuring the element is visible and enabled before it performs the click. To make tests resilient, we recommend prioritizing user-facing attributes and explicit contracts.

```ts
// 👍
page.getByRole('button', { name: 'submit' });
```

## Use chaining and filtering

Locators can be chained to narrow down the search to a particular part of the page.

```ts
const product = page.getByRole('listitem').filter({ hasText: 'Product 2' });
```

You can also filter locators by text or by another locator.

```ts
await page
    .getByRole('listitem')
    .filter({ hasText: 'Product 2' })
    .getByRole('button', { name: 'Add to cart' })
    .click();
```

## Prefer user-facing attributes to XPath or CSS selectors

Your DOM can easily change so having your tests depend on your DOM structure can lead to failing tests. For example consider selecting this button by its CSS classes. Should the designer change something then the class might change, thus breaking your test.

```ts
// 👎
page.locator('button.buttonIcon.episode-actions-later');
```

Use locators that are resilient to changes in the DOM.

```ts
// 👍
page.getByRole('button', { name: 'submit' });
```


## Use web first assertions

Assertions are a way to verify that the expected result and the actual result matched or not. By using web first assertions Playwright will wait until the expected condition is met. For example, when testing an alert message, a test would click a button that makes a message appear and check that the alert message is there. If the alert message takes half a second to appear, assertions such as `toBeVisible()` will wait and retry if needed.

```ts
// 👍
await expect(page.getByText('welcome')).toBeVisible();

// 👎
expect(await page.getByText('welcome').isVisible()).toBe(true);
```

## Don't use manual assertions

Don't use manual assertions that are not awaiting the expect. In the code below the `await` is inside the `expect` rather than before it. When using assertions such as `isVisible()` the test won't wait a single second, it will just check the locator is there and return immediately.

```ts
// 👎
expect(await page.getByText('welcome').isVisible()).toBe(true);
```

Use web first assertions such as `toBeVisible()` instead.

```ts
// 👍
await expect(page.getByText('welcome')).toBeVisible();
```

## Configure debugging

### Local debugging

For local debugging we recommend you debug your tests live in VSCode by installing the VS Code extension. You can run tests in debug mode by right clicking on the line next to the test you want to run which will open a browser window and pause at where the breakpoint is set.

You can also debug your tests with the Playwright inspector by running your tests with the `--debug` flag.

```bash
# npm
npx playwright test --debug

# yarn
yarn playwright test --debug

# pnpm
pnpm playwright test --debug
```

You can then step through your test, view actionability logs and edit the locator live and see it highlighted in the browser window. This will show you which locators match and how many of them there are.

To debug a specific test add the name of the test file and the line number of the test followed by the `--debug` flag.

```bash
# npm
npx playwright test example.spec.ts:9 --debug

# yarn
yarn playwright test example.spec.ts:9 --debug

# pnpm
pnpm playwright test example.spec.ts:9 --debug
```

## Playwrights HTML report

Traces can be opened by clicking on the icon next to the test file name or by opening each of the test reports and scrolling down to the traces section.

## Use Playwright's Tooling

Playwright comes with a range of tooling to help you write tests.

- **The VS Code extension** gives you a great developer experience when writing, running, and debugging tests.  
- **The test generator** can generate tests and pick locators for you.  
- **The trace viewer** gives you a full trace of your tests as a local PWA that can easily be shared.  
- **The UI Mode** lets you explore, run and debug tests with a time travel experience complete with watch mode.  
- **TypeScript in Playwright** works out of the box and gives you better IDE integrations.  

## Test across all browsers

Playwright makes it easy to test your site across all browsers no matter what platform you are on. Testing across all browsers ensures your app works for all users. In your config file you can set up projects adding the name and which browser or device to use.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## Lint your tests

We recommend TypeScript and linting with ESLint for your tests to catch errors early. Use `@typescript-eslint/no-floating-promises` ESLint rule to make sure there are no missing awaits before the asynchronous calls to the Playwright API. On your CI you can run `tsc --noEmit` to ensure that functions are called with the right signature.

## Use parallelism and sharding

Playwright runs tests in parallel by default. Tests in a single file are run in order, in the same worker process. If you have many independent tests in a single file, you might want to run them in parallel:

```ts
import { test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('runs in parallel 1', async ({ page }) => {
  /* ... */
});

test('runs in parallel 2', async ({ page }) => {
  /* ... */
});
```

Playwright can shard a test suite, so that it can be executed on multiple machines.

```bash
# npm
npx playwright test --shard=1/3

# yarn
yarn playwright test --shard=1/3

# pnpm
pnpm playwright test --shard=1/3
```

## Productivity tips

### Use Soft assertions

If your test fails, Playwright will give you an error message showing what part of the test failed which you can see either in VS Code, the terminal, the HTML report, or the trace viewer. However, you can also use soft assertions. These do not immediately terminate the test execution, but rather compile and display a list of failed assertions once the test ended.

```ts
// Make a few checks that will not stop the test when failed...
await expect.soft(page.getByTestId('status')).toHaveText('Success');

// ... and continue the test to check more things.
await page.getByRole('link', { name: 'next page' }).click();
```

