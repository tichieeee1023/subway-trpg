import SurveyView from './SurveyView.jsx';
import ActionPanel from './ActionPanel.jsx';
import SceneOverview from './SceneOverview.jsx';
import { EXPLORATION_STAGES } from '../../data/explorationDB.js';
import { getFakeStationActions } from '../../data/fakeStationActions.js';

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
  const hasExtinguisherContents = player.inventory.some((item) => item.id === 'extinguisher' && !item.empty);
  const fakeStationResistance = stage === 'STAGE_3_PLATFORM' && flags.fakeStationResistance;
  const resistanceOptions = fakeStationResistance
    ? getFakeStationActions(flags.fakeStationPhase, player.inventory, flags.fakeStationEscapeBonus ?? 0, flags)
    : [];
  const action = (label, hint, onClick, enabled = true) => <button key={label} disabled={!enabled} onClick={onClick} className="choice-card choice-card--route p-3 bg-[#141926] border border-cyan-500/40 text-left disabled:opacity-40"><span className="text-xs font-bold">{label}</span><span className="block text-[10px] text-cyan-300 mt-1">{enabled ? hint : '필요 도구 미보유'}</span></button>;
  const fanTools = [
    { id: 'wrench', action: 'TOOL_WRENCH', label: '비상 스패너', kind: '장비 재사용', hint: '확정 · 1턴' },
    { id: 'multitool', action: 'TOOL_MULTITOOL', label: '접이식 멀티툴', kind: '장비 사용', hint: '확정 · 1턴' },
    { id: 'acid_vial', action: 'TOOL_ACID_VIAL', label: '산성 점액 채취병', kind: '장비 사용', hint: owns('rubber_gloves') ? '확정 · 1턴 · 산성액 소모' : '확정 · HP -2 · 1턴 · 산성액 소모' },
  ].filter((tool) => owns(tool.id));
  const comboTools = [
    { id: 'wrench', label: '비상 스패너' },
    { id: 'tumbler', label: '보냉 텀블러' },
    { id: 'extinguisher', label: '빈 소화기' },
  ].filter((tool) => owns(tool.id));
  return <main className="game-narrative bg-[#0a0c12] p-6 flex flex-col overflow-y-auto">
    <SceneOverview key={stage} stage={stage} fakeStationResistance={fakeStationResistance} fakeStationSurvived={flags.fakeStationSurvived} />
    <SurveyView stage={stage} handleSelectArchetype={game.handleSelectArchetype} />
    {stage === 'DICE_CONDITION' && <section className="condition-panel my-auto mx-auto" aria-labelledby="condition-title">
      <div className="condition-panel__signal"><span>SHIFT STATUS // 00:00</span><i aria-hidden="true" /></div>
      <div className="condition-panel__body">
        <span className="condition-panel__eyebrow">NIGHT SHIFT READINESS CHECK</span>
        <h3 id="condition-title">오늘, 얼마나 버틸 수 있을까?</h3>
        <p>잔업의 강도와 피로도를 확인합니다. 결과에 따라 시작 HP · SAN과 특성이 결정됩니다.</p>
        <div className="condition-panel__range" aria-label="주사위 결과 범위">
          <span><b>01</b> 연속 철야</span><span><b>08–14</b> 표준 컨디션</span><span><b>20</b> 공포 면역</span>
        </div>
        <button className="condition-panel__roll" onClick={game.handleRollCondition}><span>ROLL D20</span><small>피로도 확인</small></button>
      </div>
      <p className="condition-panel__footnote">SAN 최대치는 15입니다. 주사위는 출발 전, 당신의 오늘을 기록합니다.</p>
    </section>}
    {exploration && <section className="exploration-section space-y-3">
      <div className="exploration-hud">
          <div className="location-readout"><span>현재 위치</span><strong>{fakeStationResistance ? '가짜역 식도 안쪽' : exploration.title}</strong></div>
        <div className="ap-readout" role="status" aria-live="polite">
          <span>남은 조사 기회</span><strong>{ap}<small>/3회</small></strong>
          <div className="ap-pips" aria-hidden="true">{[1, 2, 3].map((turn) => <i key={turn} className={turn <= ap ? 'is-available' : ''} />)}</div>
        </div>
      </div>
      <div className={`exploration-rule${ap === 0 ? ' is-empty' : ''}`}><strong>{fakeStationResistance ? `최후의 반항 · ${flags.fakeStationPhase}/2` : ap === 0 ? '조사 완료' : '조사 규칙'}</strong><span>{fakeStationResistance ? (flags.fakeStationPhase === 1 ? '통로가 닫히기 전에 수축을 늦추고, 빠져나갈 틈을 만들어라.' : '틈이 닫히기 전에 괴물의 입에서 빠져나와라.') : ap === 0 ? '이번 구역에서 사용할 수 있는 3번의 조사를 모두 썼습니다.' : `6곳 중 최대 3곳만 조사할 수 있습니다 · 남은 조사 ${ap}회`}</span></div>
      {stage === 'STAGE_3_PLATFORM' && ap === 0 && !fakeStationResistance ? <p>계단과 환승역 통로가 보인다. 어느 쪽으로 갈까?</p> : !fakeStationResistance ? <div className="grid grid-cols-2 gap-2.5"><ActionPanel points={exploration.points} examinedPoints={examinedPoints} ap={ap} onExamine={examine} color={exploration.color} /></div> : null}
      {stage === 'STAGE_3_PLATFORM' && ap === 0 && !fakeStationResistance && <div className="grid grid-cols-2 gap-2">{action('지상으로 가는 계단', '위쪽에서 불빛이 새어 나온다', () => game.choosePlatformExit('EXIT_3'))}{action('환승역 통로', '안내 표지가 안쪽을 가리킨다', () => game.choosePlatformExit('BREAKER'))}</div>}
      {fakeStationResistance && <div className="resistance-encounter">
        <div className="resistance-encounter__heading"><span>LAST RESISTANCE · {flags.fakeStationPhase === 1 ? '01' : '02'} / 02</span><h3>{flags.fakeStationPhase === 1 ? '좁아드는 통로를 버텨낸다' : '틈을 벌려 빠져나간다'}</h3><p>{flags.fakeStationPhase === 1 ? '도구나 맨몸으로 수축을 늦추고, 빠져나갈 틈을 만들어라.' : '한 번뿐인 틈이다. 손에 남은 도구를 골라 입 밖으로 나와라.'}</p></div>
        <div className="grid grid-cols-2 gap-2 resistance-encounter__actions">{resistanceOptions.map((option) => action(option.label, option.hint, () => game.handleFakeStationResistance(option.id)))}</div>
      </div>}
    </section>}
    {stage === 'STAGE_5_VENT' && <section className="final-encounter">
      <div className="final-hud"><div><span>FINAL ESCAPE PROTOCOL</span><strong>환기탑 갱도 · 탈출 시도</strong></div><div className="final-turns" role="status" aria-live="polite"><span>남은 시간</span><strong>{turnLimit}<small>턴</small></strong></div></div>
      <div className="final-briefing"><div className="final-phase-track" aria-label={`최종전 ${ventPhase} / 3단계`}>{[1, 2, 3].map((phase) => <i key={phase} className={phase === ventPhase ? 'is-current' : phase < ventPhase ? 'is-cleared' : ''}>{phase}</i>)}</div><span>PHASE {String(ventPhase).padStart(2, '0')} / 03 · {finalPhase.code}</span><h3>{finalPhase.title}</h3><p>{finalPhase.copy}</p></div>
      <div className="final-actions grid grid-cols-2 gap-2">
        {ventPhase === 1 && <>{action('[INT 판정] 회로 차단', `DC ${flags.knows_fan_circuit ? 9 : 12} · 1턴`, () => game.handleStage5Action('INT'))}{action('[STR 판정] 회전축 파괴', 'DC 11 · 1턴', () => game.handleStage5Action('STR'), owns('crowbar', 'laptop_bag', 'tumbler', 'extinguisher'))}{action('[DEX 판정] 날개 틈 도약', 'DC 14 · 1턴', () => game.handleStage5Action('DEX'))}{fanTools.map((tool) => action('[' + tool.kind + '] ' + tool.label, tool.hint, () => game.handleStage5Action(tool.action)))}</>}
        {ventPhase === 2 && <>{action('방수 랜턴 섬광', '확정 견제 · 0턴', () => game.handleVentDefense('LANTERN'), owns('lantern'))}{hasExtinguisherContents && action('소화기 분사', '확정 견제 · 0턴 · 내용물 소모', () => game.handleVentDefense('EXTINGUISHER'))}{action('커터칼로 촉수 절단', 'DEX DC 10 · 1턴', () => game.handleVentDefense('CUTTER'), owns('cutter'))}{action('맨몸으로 강행', 'HP -7 / SAN -4 · 1턴', () => game.handleVentDefense('NONE'))}</>}
        {ventPhase === 3 && <>{comboTools.map((tool) => action('[도구 조합] 쇠지렛대 + ' + tool.label, '확정 · 1턴', () => game.handleVentEscape('COMBO', tool.id), owns('crowbar')))}{action('[STR 판정] 맨홀 밀어 올리기', `DC ${owns('crowbar') ? 9 : 14} · 1턴`, () => game.handleVentEscape('STR'))}</>}
      </div><p className="final-warning">시간이 다하거나 HP / SAN이 0이 되면, 지상 바로 아래에서 탈출에 실패합니다.</p>
    </section>}
  </main>;
}
