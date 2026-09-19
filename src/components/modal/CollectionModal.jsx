import { useLayoutEffect, useRef, useState } from 'react';
import DialogFrame from './DialogFrame.jsx';
import { ENDING_DEFINITIONS, SECRET_STORY } from '../../data/endingDB.js';
import { SCENE_ASSETS, ENDING_CARDS } from '../../data/assetDB.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import TypedText from '../narrative/TypedText.jsx';

function SecretReport({ onBack, onReturnHome, reportRef }) {
  const { count, done, finish } = useTypewriter(SECRET_STORY.content);
  return <div ref={reportRef} className="secret-report"><img src={SCENE_ASSETS.SECRET.src} alt={SCENE_ASSETS.SECRET.alt} /><h3>{SECRET_STORY.title}</h3><p>{SECRET_STORY.subtitle}</p><p><TypedText text={SECRET_STORY.content} count={count} /></p>{!done && <button className="utility-done" onClick={finish}>텍스트 바로 보기</button>}<div className="secret-report-actions"><button className="utility-done" onClick={onBack}>도감으로 돌아가기</button>{done && <button className="utility-done secret-return-home" onClick={onReturnHome}>모든 기록을 닫고 홈으로 돌아가기</button>}</div></div>;
}

export default function CollectionModal({ collected, onClose, onSecretComplete }) {
  const [secret, setSecret] = useState(false);
  const [activeHintId, setActiveHintId] = useState(null);
  const secretReportRef = useRef(null);
  useLayoutEffect(() => {
    if (!secret) return;
    const dialog = secretReportRef.current?.closest('[role="dialog"]');
    if (dialog) dialog.scrollTop = 0;
  }, [secret]);
  const complete = Object.keys(ENDING_DEFINITIONS).every((id) => collected.includes(id));
  return <DialogFrame title={secret ? '히든 후일담' : `엔딩 도감 · ${collected.length}/6`} onClose={onClose} className="collection-dialog">
    {secret ? <SecretReport reportRef={secretReportRef} onBack={() => setSecret(false)} onReturnHome={onSecretComplete} /> : <><p>완료한 엔딩이 이 브라우저에 기록됩니다.<span className="collection-hint-guide">미수집 카드는 마우스를 올리거나 눌러 힌트를 확인하세요.</span></p><div className="collection-grid">{Object.values(ENDING_DEFINITIONS).map((ending) => {
      const isCollected = collected.includes(ending.id);
      const isHintOpen = activeHintId === ending.id;
      return <article key={ending.id}>{isCollected ? <><img src={ENDING_CARDS[ending.cardId]} alt={ending.title} /><h3>{ending.title}</h3></> : <div className={`locked-card${isHintOpen ? ' is-hint-open' : ''}`} tabIndex={0} role="button" aria-expanded={isHintOpen} aria-label={`미수집 엔딩 힌트: ${ending.hint}`} onClick={(event) => { setActiveHintId(isHintOpen ? null : ending.id); if (isHintOpen) event.currentTarget.blur(); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }}><div className="locked-card-default"><span aria-hidden="true">?</span><p>미발견 엔딩</p><small>HINT</small></div><div className="ending-hint" aria-hidden="true"><span>RECOVERY HINT</span><p>{ending.hint}</p></div></div>}</article>;
    })}</div><button className={`utility-done${complete ? ' collection-secret-unlocked' : ''}`} disabled={!complete} onClick={() => setSecret(true)}>{complete ? '✦ 04:44 AM — 히든 후일담 열기' : `히든 후일담 잠김 · ${collected.length}/6 수집`}</button></>}
  </DialogFrame>;
}
