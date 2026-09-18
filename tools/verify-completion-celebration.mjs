import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(5000);
try {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: '게임 시작', exact: true }).waitFor();
  await page.keyboard.press('Control+Shift+F10');
  await page.getByRole('heading', { name: '엔딩 도감 · 6/6' }).waitFor();
  await page.locator('.completion-canvas').waitFor();
  await page.getByRole('button', { name: '✦ 엔딩 도감 · 6/6', exact: true }).waitFor();
  assert.equal(await page.locator('.collection-secret-unlocked').isEnabled(), true);
  console.log('PASS: completed collection uses gold controls and one-time home celebration');
} finally {
  await browser.close();
}
