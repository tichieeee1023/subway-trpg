import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.addInitScript(() => {
  Math.random = () => .999;
  localStorage.setItem('subway-settings-v1', JSON.stringify({ textSize: 'large', disableEffects: true }));
});
const drain = async () => {
  while (await page.getByTestId('story-backdrop').count()) {
    await page.getByRole('button', { name: '[다음]', exact: true }).click();
    await page.waitForTimeout(30);
  }
};
const investigate = async (name) => {
  await page.getByRole('button', { name }).click();
  if (await page.getByTestId('dice-backdrop').count()) {
    await page.getByRole('button', { name: '운명의 D20 주사위 굴리기' }).click();
    await page.getByRole('button', { name: '[다음]', exact: true }).click();
  }
  await drain();
};
const startGame = async () => {
  await page.getByRole('button', { name: '게임 시작', exact: true }).click();
  if (!await page.locator('.opening-screen').count()) {
    await page.getByRole('heading', { name: '막차에 오른 당신은 누구입니까?', exact: true }).waitFor();
    return;
  }
  await page.getByRole('heading', { name: '막차', exact: true }).waitFor();
  while (await page.locator('.opening-screen').count()) {
    const action = page.locator('.opening-next');
    const label = await action.innerText();
    await action.click();
    if (label === '텍스트 바로 보기') {
      await page.waitForFunction(() => document.querySelector('.opening-next')?.textContent?.trim() !== '텍스트 바로 보기');
    }
  }
};
const check = async (stage) => {
  for (const [width, height] of [[320, 568], [375, 667], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => !document.querySelector('.scene-overview').open);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `artifacts/game-review/large-${stage}-${width}.png`, fullPage: true });
    for (const button of await page.locator('.game-narrative button').all()) {
      const box = await button.boundingBox();
      assert.ok(box && box.y >= 0 && box.y + box.height <= height, `${stage}: ${await button.innerText()} clipped at ${width}x${height}: ${JSON.stringify(box)}`);
    }
    for (const hud of await page.locator('.header-status > *').all()) {
      const box = await hud.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width && box.y + box.height <= height, `${stage}: HUD clipped`);
    }
    await page.screenshot({ path: `artifacts/game-review/large-${stage}-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
};
try {
  await page.goto('http://127.0.0.1:4173/');
  await startGame();
  await page.getByRole('button', { name: /분석형 엔지니어.*주력/ }).click();
  await page.getByRole('button', { name: '이 사원증으로 탑승' }).click();
  await page.getByRole('button', { name: 'D20 주사위 굴려 피로도 확정' }).click();
  await page.getByRole('button', { name: '운명의 D20 주사위 굴리기' }).click();
  await page.getByRole('button', { name: '[다음]', exact: true }).click(); await drain();
  await check('stage1');
  for (const name of [/④ 선반/, /③ 출입문/, /⑥ 바닥/]) await investigate(name);
  await check('stage2');
  for (const name of [/① 벽면/, /③ 보수용/, /⑤ 집수정/]) await investigate(name);
  await check('stage3');
  for (const name of [/① 종합/, /④ 역무원/, /⑥ 배전실/]) await investigate(name);
  await check('stage3-route');
  await page.getByRole('button', { name: /경로 B/ }).click();
  await check('stage4');
  for (const name of [/① 24시/, /③ CCTV/, /⑤ 셔터/]) await investigate(name);
  await check('stage5-phase1');
  await page.getByRole('button', { name: /도구 정공법/ }).click(); await drain();
  await check('stage5-phase2');
  await page.getByRole('button', { name: /방수 랜턴 섬광/ }).click(); await drain();
  await check('stage5-phase3');
  assert.deepEqual(errors, []);
  console.log('PASS: large text + effects disabled, six choices and route/final phases, full HUD, 3 mobile/landscape sizes, zero errors');
} finally { await browser.close(); }
