import { useState } from 'react';
import DialogFrame from './DialogFrame.jsx';
import { ENDING_DEFINITIONS, SECRET_STORY } from '../../data/endingDB.js';
import { SCENE_ASSETS, ENDING_CARDS } from '../../data/assetDB.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import TypedText from '../narrative/TypedText.jsx';

function SecretReport({ onBack }) {
  const { count, done, finish } = useTypewriter(SECRET_STORY.content);
  return <div className="secret-report"><img src={SCENE_ASSETS.SECRET.src} alt={SCENE_ASSETS.SECRET.alt} /><h3>{SECRET_STORY.title}</h3><p>{SECRET_STORY.subtitle}</p><p><TypedText text={SECRET_STORY.content} count={count} /></p>{!done && <button className="utility-done" onClick={finish}>텍스트 바로 보기</button>}<button className="utility-done" onClick={onBack}>도감으로 돌아가기</button></div>;
}

export default function CollectionModal({ collected, onClose }) {
  const [secret, setSecret] = useState(false);
  const complete = Object.keys(ENDING_DEFINITIONS).every((id) => collected.includes(id));
  return <DialogFrame title={secret ? '히든 후일담' : `엔딩 도감 · ${collected.length}/6`} onClose={onClose} className="collection-dialog">
    {secret ? <SecretReport onBack={() => setSecret(false)} /> : <><p>완료한 엔딩이 이 브라우저에 기록됩니다.</p><div className="collection-grid">{Object.values(ENDING_DEFINITIONS).map((ending) => <article key={ending.id}>{collected.includes(ending.id) ? <><img src={ENDING_CARDS[ending.cardId]} alt={ending.title} /><h3>{ending.title}</h3></> : <div className="locked-card"><span aria-hidden="true">?</span><p>미발견 엔딩</p></div>}</article>)}</div><button className={`utility-done${complete ? ' collection-secret-unlocked' : ''}`} disabled={!complete} onClick={() => setSecret(true)}>{complete ? '✦ 04:44 AM — 히든 후일담 열기' : `히든 후일담 잠김 · ${collected.length}/6 수집`}</button></>}
  </DialogFrame>;
}
