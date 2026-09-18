import SurveyView from './SurveyView.jsx';
import ActionPanel from './ActionPanel.jsx';
import SceneOverview from './SceneOverview.jsx';
import { EXPLORATION_STAGES } from '../../data/explorationDB.js';

const FINAL_PHASES = {
  1: { code: 'OBSTRUCTION', title: '회전 배기팬 돌파', copy: '갱도 끝 사다리 앞을 거대한 날개가 막고 있다. 쇳조각이 튀고, 날개 너머에서는 차가운 빗물 냄새가 스며든다.' },
  2: { code: 'PURSUIT', title: '추격하는 촉수 견제', copy: '팬이 멎는 순간 찌그러진 철문이 벌어진다. 검은 촉수가 바닥을 훑으며 사다리 아래까지 기어오른다.' },
  3: { code: 'ESCAPE', title: '주철 맨홀 개방', copy: '손끝 위로 빗소리가 들린다. 마지막 맨홀만 열면 지상이지만, 뒤에서 금속을 긁는 소리가 더 가까워진다.' },
};

export default function GameNarrative(game) {
  const { stage, player, ap, turnLimit, ventPhase, flags, examinedPoints } = game;
  const exploration = EXPLORATION_STAGES[stage];
  const finalPhase = FINAL_PHASES[ventPhase];
  const examine = { STAGE_1_CAR6: game.examineCar6Point, STAGE_2_TUNNEL: game.examineTunnelPoint, STAGE_3_PLATFORM: game.examinePlatformPoint, STAGE_4_MALL: game.examineMallPoint }[stage];
  const owns = (...ids) => player.inventory.some((item) => ids.includes(item.id));
  const action = (label, hint, onClick, enabled = true) => <button key={label} disabled={!enabled} onClick={onClick} className="p-3 bg-[#141926] border border-cyan-500/40 text-left disabled:opacity-40"><span className="text-xs font-bold">{label}</span><span className="block text-[10px] text-cyan-300 mt-1">{enabled ? hint : '필요 도구 미보유'}</span></button>;
  return <main className="game-narrative bg-[#0a0c12] p-6 flex flex-col overflow-y-auto">
    <SceneOverview stage={stage} />
    <SurveyView stage={stage} handleSelectArchetype={game.handleSelectArchetype} />
    {stage === 'DICE_CONDITION' && <div className="condition-panel my-auto text-center space-y-6 mx-auto"><h3>오늘 하루의 잔업 강도와 피로도를 결정합니다</h3><p>컨디션에 따라 시작 HP / SAN과 특성이 달라집니다.</p><button className="p-4 bg-amber-300 text-neutral-950" onClick={game.handleRollCondition}>D20 주사위 굴려 피로도 확정</button><p>1은 연속 철야, 20은 공포 면역. SAN 최대치는 15입니다.</p></div>}
    {exploration && <section className="exploration-section space-y-3">
      <div className="exploration-hud">
        <div className="location-readout"><span>현재 위치</span><strong>{exploration.title}</strong></div>
        <div className="ap-readout" role="status" aria-live="polite">
          <span>남은 조사 기회</span><strong>{ap}<small>/3회</small></strong>
          <div className="ap-pips" aria-hidden="true">{[1, 2, 3].map((turn) => <i key={turn} className={turn <= ap ? 'is-available' : ''} />)}</div>
        </div>
      </div>
      <div className={`exploration-rule${ap === 0 ? ' is-empty' : ''}`}><strong>{ap === 0 ? '조사 완료' : '조사 규칙'}</strong><span>{ap === 0 ? '이번 구역에서 사용할 수 있는 3번의 조사를 모두 썼습니다.' : `6곳 중 최대 3곳만 조사할 수 있습니다 · 남은 조사 ${ap}회`}</span></div>
      {stage === 'STAGE_3_PLATFORM' && ap === 0 ? <p>탐사를 마쳤습니다. 이동 경로를 선택하세요.</p> : <div className="grid grid-cols-2 gap-2.5"><ActionPanel points={exploration.points} examinedPoints={examinedPoints} ap={ap} onExamine={examine} color={exploration.color} /></div>}
      {stage === 'STAGE_3_PLATFORM' && ap === 0 && <div className="grid grid-cols-2 gap-2">{action('[경로 A] 3번 출구', '지상으로 이동', () => game.choosePlatformExit('EXIT_3'))}{action('[경로 B] 직원 통로', '설비구역으로 이동', () => game.choosePlatformExit('BREAKER'))}</div>}
    </section>}
    {stage === 'STAGE_5_VENT' && <section className="final-encounter">
      <div className="final-hud"><div><span>FINAL ESCAPE PROTOCOL</span><strong>환기탑 갱도 · 탈출 시도</strong></div><div className="final-turns" role="status" aria-live="polite"><span>남은 시간</span><strong>{turnLimit}<small>턴</small></strong></div></div>
      <div className="final-briefing"><div className="final-phase-track" aria-label={`최종전 ${ventPhase} / 3단계`}>{[1, 2, 3].map((phase) => <i key={phase} className={phase === ventPhase ? 'is-current' : phase < ventPhase ? 'is-cleared' : ''}>{phase}</i>)}</div><span>PHASE {String(ventPhase).padStart(2, '0')} / 03 · {finalPhase.code}</span><h3>{finalPhase.title}</h3><p>{finalPhase.copy}</p></div>
      <div className="final-actions grid grid-cols-2 gap-2">
        {ventPhase === 1 && <>{action('[INT 판정] 회로 차단', `DC ${flags.knows_fan_circuit ? 9 : 12} · 1턴`, () => game.handleStage5Action('INT'))}{action('[STR 판정] 회전축 파괴', 'DC 11 · 1턴', () => game.handleStage5Action('STR'), owns('crowbar', 'laptop_bag', 'tumbler', 'extinguisher'))}{action('[DEX 판정] 날개 틈 도약', 'DC 14 · 1턴', () => game.handleStage5Action('DEX'))}{action('[도구 정공법] 배기팬 정지', '스패너 / 멀티툴 / 산성액 · 확정 · 1턴', () => game.handleStage5Action('TOOL_WRENCH'), owns('wrench', 'multitool', 'acid_vial'))}</>}
        {ventPhase === 2 && <>{action('방수 랜턴 섬광', '확정 견제 · 0턴', () => game.handleVentDefense('LANTERN'), owns('lantern'))}{action('소화기 분사', '확정 견제 · 0턴', () => game.handleVentDefense('EXTINGUISHER'), owns('extinguisher'))}{action('커터칼로 촉수 절단', 'DEX DC 10 · 1턴', () => game.handleVentDefense('CUTTER'), owns('cutter'))}{action('맨몸으로 강행', 'HP -7 / SAN -4 · 1턴', () => game.handleVentDefense('NONE'))}</>}
        {ventPhase === 3 && <>{action('빠루 + 타격도구 연계', '스패너 / 텀블러 / 소화기 · 확정 · 1턴', () => game.handleVentEscape('COMBO'), owns('crowbar') && owns('wrench', 'tumbler', 'extinguisher'))}{action('[STR 판정] 맨홀 밀어 올리기', `DC ${owns('crowbar') ? 9 : 14} · 1턴`, () => game.handleVentEscape('STR'))}</>}
      </div><p className="final-warning">시간이 다하거나 HP / SAN이 0이 되면, 지상 바로 아래에서 탈출에 실패합니다.</p>
    </section>}
  </main>;
}
