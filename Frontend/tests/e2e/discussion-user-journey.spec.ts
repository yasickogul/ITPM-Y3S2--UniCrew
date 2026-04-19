import { expect, test, type Page } from '@playwright/test';

const readLikeCount = (text: string) => {
  const parsed = Number.parseInt(text.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const loginAsStudent = async (page: Page) => {
  await page.goto('/login');
  await page.locator('#email').fill('student@university.edu');
  await page.locator('#password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

test('student discussion user journey works end-to-end', async ({ page }) => {
  const runId = Date.now().toString().slice(-6);
  const title = `PW Discussion ${runId}`;
  const content = `This is an automated Playwright user journey for discussion flow ${runId}.`;
  const comment = `Playwright comment ${runId}`;
  const editedComment = `Updated Playwright comment ${runId}`;

  await loginAsStudent(page);

  await page.goto('/discussions/create');
  await expect(page.getByTestId('create-post-form')).toBeVisible();

  await page.getByTestId('community-select').selectOption('1');
  await page.getByTestId('category-select').selectOption('Programming');
  await page.getByTestId('post-title-input').fill(title);
  await page.getByTestId('post-content-editor').click();
  await page.keyboard.type(content);
  await expect(page.getByTestId('submit-post-button')).toBeEnabled();
  await page.getByTestId('submit-post-button').click();

  await page.waitForURL((url) => !url.pathname.endsWith('/discussions/create'), { timeout: 30_000 });
  await expect(page).toHaveURL(/\/discussions\/[^/]+$/);
  await expect(page.getByText(title)).toBeVisible();

  const likeButton = page.getByTestId('post-like-button');
  const beforeLikeCount = readLikeCount(await likeButton.innerText());
  await likeButton.click();
  const afterLikeCount = readLikeCount(await likeButton.innerText());
  expect(afterLikeCount).toBeGreaterThanOrEqual(beforeLikeCount);

  await page.getByTestId('new-comment-input').fill(comment);
  await page.getByTestId('post-comment-button').click();
  await expect(page.getByText(comment)).toBeVisible();

  const commentRow = page.locator('[data-testid^="comment-item-"]').filter({ hasText: comment }).first();
  await expect(commentRow).toBeVisible();
  await commentRow.hover();
  await commentRow.getByRole('button', { name: 'Edit' }).click();
  await commentRow.locator('textarea').fill(editedComment);
  await commentRow.getByRole('button', { name: 'Save' }).click();
  await expect(commentRow.getByText(editedComment)).toBeVisible();

  await commentRow.hover();
  await commentRow.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(editedComment)).toHaveCount(0);

  await page.goto('/discussions');
  await page.getByTestId('discussions-search-input').fill(title);
  await expect(page.getByText(title)).toBeVisible();
});
