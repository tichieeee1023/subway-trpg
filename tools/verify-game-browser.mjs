import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.addInitScript(() => { Math.random = () => 0.999; });
await mkdir('artifacts/game-review', { recursive: true });

const next = async (outside = false) => {
  const backdrop = page.getByTestId('story-backdrop');
  await backdrop.waitFor();
  const nextButton = page.getByRole('button', { name: '[다음]', exact: true });
  if (await nextButton.getAttribute('data-typing') === 'typing') {
    await nextButton.click();
    await page.waitForFunction(() => document.querySelector('[data-typing]')?.dataset.typing === 'complete');
  }
  if (outside) await backdrop.click({ position: { x: 8, y: 8 } });
  else await page.getByRole('button', { name: '[다음]', exact: true }).click();
};
const checkChoices = async (stage) => {
  await page.waitForFunction(() => !document.querySelector('.game-chassis').classList.contains('invert'));
  for (const [width, height] of [[1920, 1080], [1680, 900], [1440, 900], [1366, 768], [1024, 768], [844, 390], [390, 844], [375, 667], [320, 568]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => document.querySelector('.scene-overview').open);
    assert.equal(await page.locator('.scene-description').evaluate((element) => element.open), width >= 701 && height >= 501, `${stage}: scene explanation matches the desktop/mobile layout at ${width}x${height}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${stage}: horizontal overflow at ${width}x${height}`);
    await page.screenshot({ path: `artifacts/game-review/choices-${stage}-${width}.png`, fullPage: true });
    for (const button of await page.locator('.game-narrative button').all()) {
      const box = await button.boundingBox();
      assert.ok(box && box.y >= 0 && box.y + box.height <= height, `${stage}: clipped choice ${await button.innerText()} at ${width}x${height} (${JSON.stringify(box)})`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.scene-description > summary').click();
  assert.equal(await page.locator('.scene-description').evaluate((element) => element.open), true, `${stage}: scene explanation opens on request`);
  await page.locator('.scene-overview > summary').click();
  assert.equal(await page.locator('.scene-overview').evaluate((element) => element.open), false, `${stage}: scene accordion closes`);
  await page.locator('.scene-overview > summary').click();
  assert.equal(await page.locator('.scene-description').evaluate((element) => element.open), false, `${stage}: closing scene accordion resets its explanation`);
  await page.setViewportSize({ width: 1440, height: 900 });
};
const roll = async (screenshot = false, outside = false) => {
  await page.getByTestId('dice-backdrop').waitFor();
  const idleBox = await page.getByRole('dialog').boundingBox();
  await page.getByRole('button', { name: '운명의 D20 주사위 굴리기' }).click();
  const image = page.getByRole('img', { name: '회전 중...' });
  await image.waitFor();
  assert.match(await image.getAttribute('src'), /item_dice_rolling2\.webp$/);
  await image.evaluate((element) => element.decode());
  assert.equal(await image.evaluate((element) => element.complete && element.naturalWidth > 0), true);
  assert.equal(await image.evaluate((element) => getComputedStyle(element).animationName), 'd20-roll');
  assert.equal((await page.getByRole('dialog').boundingBox()).height, idleBox.height, 'Dice rolling keeps the modal height');
  assert.ok(await page.locator('.dice-canvas').evaluate((canvas) => canvas.width > 0 && canvas.height > 0));
  if (screenshot) await page.screenshot({ path: 'artifacts/game-review/dice-rolling.png' });
  if (outside) await page.getByTestId('dice-backdrop').click({ position: { x: 8, y: 8 } });
  else {
    await page.getByRole('button', { name: '[다음]', exact: true }).waitFor();
    assert.equal((await page.getByRole('dialog').boundingBox()).height, idleBox.height, 'Dice result keeps the modal height');
    await page.getByRole('button', { name: '[다음]', exact: true }).click();
  }
  await page.getByTestId('dice-backdrop').waitFor({ state: 'hidden' });
};

const chooseCharacter = async (target = page) => {
  await target.getByRole('button', { name: /분석형 엔지니어.*주력/ }).click();
  await target.getByRole('heading', { name: '탑승 전 사원증 확인' }).waitFor();
  await target.getByRole('button', { name: '이 사원증으로 탑승' }).click();
};
const startGame = async (target = page) => {
  await target.getByRole('button', { name: '게임 시작', exact: true }).click();
  if (!await target.locator('.opening-screen').count()) {
    await target.getByRole('heading', { name: '막차에 오른 당신은 누구입니까?', exact: true }).waitFor();
    return;
  }
  await target.getByRole('heading', { name: '막차', exact: true }).waitFor();
  assert.match(await target.locator('.opening-image').getAttribute('src'), /scene_prologue_train\.webp$/);
  while (await target.locator('.opening-screen').count()) {
    const action = target.locator('.opening-next');
    const label = await action.innerText();
    await action.click();
    if (label === '텍스트 바로 보기') {
      await target.waitForFunction(() => document.querySelector('.opening-next')?.textContent?.trim() !== '텍스트 바로 보기');
    }
  }
};
const investigate = async (label) => {
  await page.getByRole('button', { name: label }).click();
  if (await page.getByTestId('dice-backdrop').count()) await roll();
  await next();
};
const restart = async (condition = .999) => {
  if (await page.locator('.ending-screen').count()) await page.getByRole('button', { name: '처음부터 다시 시도' }).click();
  else await page.reload();
  await page.evaluate((value) => { Math.random = () => value; }, condition);
  await startGame();
  await chooseCharacter();
  await page.getByRole('button', { name: 'D20 주사위 굴려 피로도 확정' }).click();
  await roll(); await next(); await next();
  await page.evaluate(() => { Math.random = () => .999; });
};
const reachVent = async ({ condition = .999, railFailure = false, viewportChecks = false } = {}) => {
  await restart(condition);
  if (viewportChecks) await checkChoices('stage1');
  for (const label of [/④ 선반 위 쇼핑백/, /③ 출입문 수동 코크/, /⑥ 바닥의 검붉은 얼룩/]) await investigate(label);
  await next(); await next();
  if (viewportChecks) await checkChoices('stage2');
  for (const label of [/① 벽면 비상 대피 홈/, /③ 보수용 손수레 트로리/]) await investigate(label);
  if (railFailure) {
    await page.evaluate(() => { Math.random = () => 0; }); await investigate(/④ 750V/);
    await page.evaluate(() => { Math.random = () => .999; });
  } else await investigate(/⑤ 집수정/);
  await next();
  if (viewportChecks) await checkChoices('stage3');
  for (const label of [/① 종합 노선도/, /④ 역무원 고객안내센터/, /⑥ 배전실/]) await investigate(label);
  await page.getByRole('button', { name: /경로 B/ }).click();
  if (viewportChecks) await checkChoices('stage4');
  for (const label of [/① 24시 편의점/, /③ CCTV/, /⑤ 셔터 틈 지하약국/]) await investigate(label);
  await next();
  if (viewportChecks) await checkChoices('stage5');
};
const finishEscape = async (defense, expected) => {
  await page.getByRole('button', { name: /도구 정공법/ }).click(); await next(true);
  assert.match(await page.locator('.game-narrative').innerText(), /2\/3단계/);
  await page.getByRole('button', { name: defense }).click(); await next(true);
  assert.match(await page.locator('.game-narrative').innerText(), /3\/3단계/);
  await page.getByRole('button', { name: /빠루 \+ 타격도구/ }).click();
  await page.getByRole('heading', { name: expected }).waitFor();
  const skip = page.getByRole('button', { name: '텍스트 바로 보기' });
  if (await skip.count()) await skip.click();
};

try {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await page.getByRole('button', { name: '크게', exact: true }).click();
  await page.getByRole('checkbox', { name: '번쩍이는 이펙트 제거' }).check();
  await page.reload();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.effects), 'off');
  await page.getByRole('button', { name: '설정', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: '크게', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: '기본', exact: true }).click();
  await page.getByRole('checkbox', { name: '번쩍이는 이펙트 제거' }).uncheck();
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await page.getByRole('button', { name: '도움말', exact: true }).click(); await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: '엔딩 도감 · 잠김', exact: true }).isDisabled(), true);
  assert.equal(await page.locator('.collection-grid').count(), 0);
  await startGame();
  await page.getByRole('button', { name: /분석형 엔지니어.*주력/ }).click();
  await page.getByRole('button', { name: '다시 선택' }).click();
  assert.equal(await page.locator('.condition-panel').count(), 0);
  await chooseCharacter(); await page.reload();
  console.log('PASS: preview cancel/confirm, settings persistence, locked collection');
  
  await reachVent({ viewportChecks: true });
  await finishEscape(/방수 랜턴 섬광/, /TRUE END/);
  for (const width of [1920, 1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.ending-card').evaluate((image) => image.decode());
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `artifacts/game-review/expanded-ending-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: /엔딩 도감 ·/ }).click();
  assert.equal(await page.locator('.collection-grid img').count(), 1); await page.keyboard.press('Escape');
  console.log('PASS: all 6-choice stages in 9 viewports, final 3 phases, zero-turn lantern, TRUE card and collection');
  
  await reachVent({ condition: 0 });
  await finishEscape(/맨몸으로 강행/, /GOOD END/);
  await page.locator('.ending-card').evaluate((image) => image.decode());
  assert.match(await page.locator('.ending-card').getAttribute('src'), /card_good_end.webp$/);
  console.log('PASS: GOOD END with actual gameplay and new card');
  
  await reachVent({ condition: 0, railFailure: true });
  await finishEscape(/맨몸으로 강행/, /NORMAL END/);
  console.log('PASS: NORMAL END with actual injuries and last-turn escape');
  
  await restart();
  for (const label of [/① 바닥의 롱패딩/, /③ 출입문 수동 코크/, /⑥ 바닥의 검붉은 얼룩/]) await investigate(label);
  await next();
  await page.getByRole('heading', { name: /BAD END 1/ }).waitFor();
  console.log('PASS: BAD END 1');
  
  await restart();
  for (const label of [/④ 선반 위 쇼핑백/, /③ 출입문 수동 코크/, /⑥ 바닥의 검붉은 얼룩/]) await investigate(label);
  await next(); await next();
  for (const label of [/① 벽면 비상 대피 홈/, /③ 보수용 손수레/, /⑤ 집수정/]) await investigate(label);
  await next();
  for (const label of [/② 승강장 캔/, /⑤ 스크린도어/, /⑥ 배전실/]) await investigate(label);
  await page.getByRole('button', { name: /경로 A/ }).click(); await next(true);
  await page.getByRole('heading', { name: /BAD END 2/ }).waitFor();
  console.log('PASS: BAD END 2');
  
  await reachVent();
  await page.evaluate(() => { Math.random = () => 0; });
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByRole('button', { name: /INT 판정/ }).click(); await roll(); await next(true);
  }
  await page.getByRole('heading', { name: /BAD END 3/ }).waitFor();
  console.log('PASS: BAD END 3 and turn exhaustion');
  await page.getByRole('button', { name: '엔딩 도감', exact: true }).click();
  assert.equal(await page.locator('.collection-grid img').count(), 6);
  for (const image of await page.locator('.collection-grid img').all()) await image.evaluate((element) => element.decode());
  await page.getByRole('button', { name: /04:44 AM — 히든 후일담 열기/ }).click();
  await page.locator('.secret-report > img').evaluate((element) => element.decode());
  await page.getByRole('dialog').getByRole('button', { name: '텍스트 바로 보기' }).click();
  assert.match(await page.locator('.secret-report .typed-visible').innerText(), /대형 수조 시설의 순환 펌프/);
  await page.screenshot({ path: 'artifacts/game-review/secret-report.png', fullPage: true });
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button', { name: '엔딩 도감', exact: true }).click();
  assert.equal(await page.locator('.collection-grid img').count(), 6); await page.keyboard.press('Escape');
  console.log('PASS: six endings collected, hidden report unlocked, WebP banner, persisted collection');
  
  for (const [width, height] of [[375, 667], [844, 390], [320, 568]]) {
    const accessible = await browser.newPage({ viewport: { width, height } });
    accessible.on('pageerror', (error) => errors.push(error.message));
    await accessible.addInitScript(() => {
      Math.random = () => .999;
      localStorage.setItem('subway-settings-v1', JSON.stringify({ textSize: 'large', disableEffects: true }));
      localStorage.setItem('subway_0037_endings', '{}');
    });
    await accessible.goto('http://127.0.0.1:4173/');
    assert.equal(await accessible.getByRole('button', { name: '엔딩 도감 · 잠김', exact: true }).isDisabled(), true);
    assert.equal(await accessible.locator('.collection-grid').count(), 0);
    await startGame(accessible); await chooseCharacter(accessible);
    await accessible.getByRole('button', { name: 'D20 주사위 굴려 피로도 확정' }).click();
    await accessible.getByRole('button', { name: '운명의 D20 주사위 굴리기' }).click();
    const image = accessible.getByRole('img', { name: '회전 중...' }); await image.waitFor();
    assert.equal(await image.evaluate((element) => getComputedStyle(element).animationName), 'none');
    await accessible.getByRole('button', { name: '[다음]', exact: true }).waitFor();
    const box = await accessible.getByRole('button', { name: '[다음]', exact: true }).boundingBox();
    assert.ok(box.y + box.height <= height);
    await accessible.screenshot({ path: `artifacts/game-review/expanded-accessible-${width}.png` });
    await accessible.close();
  }
  assert.deepEqual(errors, []);
  console.log('PASS: accessible dice geometry, corrupt saved data recovery, no page errors');
} finally { await browser.close(); }
