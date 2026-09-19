import { useEffect, useRef, useState } from 'react';
import ModalLayer from './ModalLayer.jsx';

const STAGE_HINTS = {
  SURVEY: '이 밤에는 이름보다, 당신이 손에 쥘 물건이 오래 남습니다.',
  DICE_CONDITION: '오늘의 피로는 숫자가 아니라, 어둠을 버티는 숨의 길이입니다.',
  STAGE_1_CAR6: '고장 난 문 앞에서는 손잡이보다 먼저, 쇠의 이빨을 찾아라.',
  STAGE_2_TUNNEL: '갱도 끝의 무거운 뚜껑은 맨손을 믿지 않습니다.',
  STAGE_3_PLATFORM: '사람 없는 역에서 가장 밝게 빛나는 출구를 믿지 마세요.',
  STAGE_4_MALL: '닫힌 셔터 아래보다, 천장 가까이에 비 냄새가 남아 있습니다.',
  STAGE_5_VENT: '세 번의 숨이 끝나기 전, 길을 막는 것들을 차례로 지나가야 합니다.',
};

export default function UtilityModal({ kind, stage, settings, updateSettings, onCredits, onClose, canReplay = false, onReplay, onHome }) {
  const ref = useRef(null);
  const [confirmReplay, setConfirmReplay] = useState(false);
  useEffect(() => {
    const previousFocus = document.activeElement;
    ref.current.querySelector('button')?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); onClose(); }
      if (event.key === 'Tab') {
        const elements = [...ref.current.querySelectorAll('button, input, a[href]')];
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => { window.removeEventListener('keydown', handleKey, true); previousFocus?.focus(); };
  }, [onClose]);
  return (
    <ModalLayer>
      <div className="utility-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section ref={ref} className="utility-dialog" role="dialog" aria-modal="true" aria-labelledby="utility-title">
          <div className="utility-heading"><h2 id="utility-title">{kind === 'settings' ? '설정' : kind === 'hint' ? '현재 구역 힌트' : '처음 플레이하는 분께'}</h2><button onClick={onClose} aria-label="닫기">×</button></div>
          {kind === 'settings' ? <>
            <fieldset><legend>글씨 크기</legend><div className="setting-options">
              {[['normal', '기본'], ['large', '크게']].map(([value, label]) => <button key={value} aria-pressed={settings.textSize === value} onClick={() => updateSettings({ textSize: value })}>{label}</button>)}
            </div><p>UI와 이야기 글씨를 함께 키웁니다.</p></fieldset>
            <label className="setting-checkbox"><input type="checkbox" checked={settings.disableEffects} onChange={(event) => updateSettings({ disableEffects: event.target.checked })} /><span>번쩍이는 이펙트 제거</span></label>
            <p>암전 시 화면 반전, 점멸, 주사위 회전과 움직이는 캔버스 효과를 끕니다. 주사위 결과와 게임 진행은 그대로 유지됩니다.</p>
            <label className="setting-checkbox"><input type="checkbox" checked={settings.skipDiceAnimation} onChange={(event) => updateSettings({ skipDiceAnimation: event.target.checked })} /><span>주사위 연출 생략</span></label>
            <p>다회차에서는 주사위가 구르는 시간을 건너뛰고 결과를 바로 표시합니다.</p>
            <label className="setting-checkbox"><input type="checkbox" checked={settings.easyMode} onChange={(event) => updateSettings({ easyMode: event.target.checked })} /><span>이지 모드 · 생존 반응 표시</span></label>
            <p>지금 위기에 도움이 될 수 있는 보유 도구에 작은 점등 표시를 붙입니다. 정답이나 사용 방법은 알려주지 않습니다.</p>
            <p className="setting-note">설정은 이 브라우저에 자동 저장됩니다.</p>
          </> : kind === 'hint' ? <div className="stage-hint-content"><span className="stage-hint-icon" aria-hidden="true">💡</span><p>{STAGE_HINTS[stage] ?? '아직 보이지 않는 길에도, 지나온 흔적은 남아 있습니다.'}</p></div> : <div className="help-content">
            <h3>1. 캐릭터를 선택하세요</h3><p>캐릭터마다 능력치와 시작 도구가 다릅니다. 컨디션 주사위를 굴리면 탐사가 시작됩니다.</p>
            <h3>2. AP를 확인하고 조사하세요</h3><p>각 구역의 6곳 중 3곳을 조사할 수 있습니다. 이미 조사한 장소는 다시 선택할 수 없습니다. 승강장에서는 조사를 마친 뒤 이동 경로를 고릅니다.</p>
            <h3>3. D20 주사위로 판정합니다</h3><p>주사위 눈금과 능력치 보정의 합이 목표 난이도(DC)에 도달하면 성공합니다. 20은 대성공, 1은 대실패입니다.</p>
            <h3>4. 도구와 상태를 살펴보세요</h3><p>획득한 도구는 소지품에 자동 추가됩니다. HP는 체력, SAN은 정신력이며 최대 15입니다. 둘 중 하나가 0이면 생존에 실패합니다. 드링크·붕대·캔디는 소지품의 사용 버튼으로 회복할 수 있습니다.</p>
            <h3>최종전과 엔딩 도감</h3><p>배기팬 → 촉수 → 맨홀을 3턴 안에 돌파하세요. 랜턴과 소화기는 촉수 견제에 턴을 쓰지 않습니다. 완료한 6종 엔딩은 도감에 저장되고, 모두 모으면 후일담을 열 수 있습니다.</p>
            <h3>5. 이야기를 읽고 다음으로 진행하세요</h3><p>텍스트 출력 중에는 &gt;다음이나 모달 바깥을 누르면 문장이 완성됩니다. 한 번 더 누르면 다음 행동으로 진행합니다. Esc도 사용할 수 있습니다.</p>
            <h3>작은 화면에서는</h3><p>장면 설명과 캐릭터·진행 기록은 접혀 있습니다. 각 제목을 눌러 펼칠 수 있습니다. 글씨가 작거나 이펙트가 불편하면 설정을 열어 조정하세요.</p>
          </div>}
          {kind === 'help' && <button className="utility-credits" onClick={onCredits}>CREDITS</button>}
          {kind === 'settings' && canReplay && <div className="utility-navigation-actions">
            {confirmReplay ? <div className="utility-replay-confirm" role="alert"><p>현재 회차의 진행 상황은 초기화됩니다. 수집한 엔딩 기록은 유지됩니다.</p><div><button className="utility-replay-cancel" onClick={() => setConfirmReplay(false)}>취소</button><button className="utility-replay-accept" onClick={onReplay}>처음부터 시작</button></div></div> : <button className="utility-replay" onClick={() => setConfirmReplay(true)}>처음부터 다시 플레이</button>}
            <button className="utility-home" onClick={onHome}>홈으로 가기</button>
          </div>}
          <button className="utility-done" onClick={onClose}>확인</button>
        </section>
      </div>
    </ModalLayer>
  );
}
