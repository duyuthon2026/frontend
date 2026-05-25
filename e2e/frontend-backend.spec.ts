import { expect, test } from '@playwright/test'

test('binds frontend inventory, selection, recipes, and lens text to backend APIs', async ({ page }) => {
  const apiEvents: Array<{ method: string; status: number; url: string }> = []
  page.on('response', (response) => {
    const url = response.url()
    if (url.includes('/api/v1/')) {
      apiEvents.push({
        method: response.request().method(),
        status: response.status(),
        url,
      })
    }
  })

  const suffix = Date.now().toString().slice(-6)
  const itemName = `E2E 오이 ${suffix}`
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  await page.addInitScript(() => localStorage.clear())
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('식탁 위의 잔반을 제로로')).toBeVisible()

  await page.getByRole('button', { name: '보관함' }).click()
  await page.getByRole('button', { name: '재료 추가' }).click()
  await expect(page.getByRole('dialog', { name: '새로운 식재료 직접 등록' })).toBeVisible()
  await page.getByLabel('재료 이름').fill(itemName)
  await page.getByLabel('수량').fill('2')
  await page.getByLabel('소비기한').fill(futureDate)
  await page.getByRole('dialog', { name: '새로운 식재료 직접 등록' })
    .locator('form')
    .evaluate((form: { requestSubmit: () => void }) => form.requestSubmit())
  await expect(page.getByText(itemName)).toBeVisible()
  await page.getByRole('button', { name: `${itemName} 선택`, exact: true }).click()

  await page.getByRole('button', { name: '레시피' }).click()
  await expect(page.getByText('남은 식재료 맞춤 요리')).toBeVisible()

  await page.getByRole('button', { name: '촬영' }).click()
  await page.getByRole('button', { name: /자연어 타이핑 입력/ }).click()
  await page.getByPlaceholder('예: 두부 한 모 냉장 3일, 삼겹살 300g 냉동 14일').fill('두부 한 모 냉장 3일')
  await page.getByRole('button', { name: /분석 및 등록/ }).click()
  await expect(page.getByText('AI가 감지한 식재료 목록')).toBeVisible()
  await expect(page.getByText('두부').first()).toBeVisible()
  await page.getByRole('button', { name: '식재료 일괄 등록' }).click()
  await expect(page.getByText('보관 식재료 추가 완료!')).toBeVisible()
  await expect(page.getByText('나의 식재료 보관함')).toBeVisible()
  await expect(page.getByText('두부').first()).toBeVisible()

  expect(apiEvents.filter((event) => event.status >= 400)).toEqual([])
  expect(apiEvents).toEqual(expect.arrayContaining([
    expect.objectContaining({ method: 'GET', status: 200, url: expect.stringContaining('/api/v1/inventory') }),
    expect.objectContaining({ method: 'GET', status: 200, url: expect.stringContaining('/api/v1/inventory/selections') }),
    expect.objectContaining({ method: 'GET', status: 200, url: expect.stringContaining('/api/v1/recipes') }),
    expect.objectContaining({ method: 'POST', status: 201, url: expect.stringContaining('/api/v1/inventory') }),
    expect.objectContaining({ method: 'PUT', status: 200, url: expect.stringContaining('/api/v1/inventory/selections') }),
    expect.objectContaining({ method: 'POST', status: 200, url: expect.stringContaining('/api/v1/lens/analyze-text') }),
    expect.objectContaining({ method: 'POST', status: 201, url: expect.stringContaining('/api/v1/inventory/batch') }),
  ]))
})
