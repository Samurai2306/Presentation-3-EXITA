import { expect, test } from '@playwright/test'

test('role gate visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Как вы заходите/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Я пациент' })).toBeVisible()
})

test('patient flow: open Мой день', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Я пациент' }).click()
  await expect(page.getByRole('heading', { name: 'Мой день' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Лекарства на сегодня' })).toBeVisible()
})
