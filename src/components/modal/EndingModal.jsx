import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ENDING_CARDS } from '../../data/assetDB.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import TypedText from '../narrative/TypedText.jsx';

export default function EndingModal({ stage, endingData, handleRestart, onCollection, collectedCount, disableEffects, collectionComplete }) {
  const text = endingData?.desc ?? '';
  const jobEpilogue = endingData?.jobEpilogue ?? '';
  const [revealed, setRevealed] = useState(() => disableEffects === true);
  const [chapter, setChapter] = useState('ending');
  const [isChangingChapter, setIsChangingChapter] = useState(false);
  useEffect(() => {
    if (stage !== 'ENDING' || !endingData || disableEffects) return undefined;
    const timer = window.setTimeout(() => setRevealed(true), 760);
    return () => window.clearTimeout(timer);
  }, [stage, endingData, disableEffects]);
  const { count, done, finish } = useTypewriter(text, revealed);
  const isJobChapter = chapter === 'job';
  const { count: jobCount, done: jobDone, finish: finishJobEpilogue } = useTypewriter(jobEpilogue, revealed && isJobChapter);
  useEffect(() => {
    if (!isChangingChapter) return undefined;
    const timer = window.setTimeout(() => {
      setChapter('job');
      setIsChangingChapter(false);
    }, disableEffects ? 0 : 520);
    return () => window.clearTimeout(timer);
  }, [isChangingChapter, disableEffects]);
  if (stage !== 'ENDING' || !endingData) return null;
  const card = ENDING_CARDS[endingData.cardId ?? endingData.type];
  const label = endingData.type === 'TRUE' ? 'TRUE CLEAR' : endingData.type === 'GOOD' ? 'GOOD END' : endingData.type === 'NORMAL' ? 'NORMAL END' : 'BAD END';
  return (
    <main className={`ending-screen ending-${endingData.type.toLowerCase()}${revealed ? ' is-revealed' : ''}`} aria-labelledby={revealed ? 'ending-title' : undefined}>
      {!revealed ? <div className="ending-transition" role="status" aria-live="polite"><span>CONNECTION LOST</span><i aria-hidden="true" /></div> : <div className="ending-layout">
        <figure className="ending-art">
          <div className="ending-card-halo" aria-hidden="true" />
          {card && <img className="ending-card" src={card} alt={endingData.title} />}
          <figcaption className="ending-card-caption">00:37 AM · EPILOGUE</figcaption>
        </figure>
        <section className={`ending-copy ending-page${isChangingChapter ? ' is-changing' : ''}`}>
          <div className="ending-label"><span aria-hidden="true">■</span> {isJobChapter ? 'EPILOGUE' : label}</div>
          <h2 id="ending-title">{isJobChapter ? '그 이후' : endingData.title}</h2>
          <div className="ending-prose">
            <p><TypedText text={isJobChapter ? jobEpilogue : text} count={isJobChapter ? jobCount : count} /></p>
          </div>
          <div className="ending-actions">
            {!isJobChapter && !done && <button onClick={finish} className="bg-neutral-900 text-neutral-100 cursor-pointer">텍스트 바로 보기</button>}
            {!isJobChapter && done && jobEpilogue && <button onClick={() => setIsChangingChapter(true)} className="bg-cyan-950 text-cyan-100 cursor-pointer">후일담 계속</button>}
            {isJobChapter && !jobDone && <button onClick={finishJobEpilogue} className="bg-neutral-900 text-neutral-100 cursor-pointer">텍스트 바로 보기</button>}
            {isJobChapter && <><button onClick={onCollection} className={collectionComplete ? 'collection-button-complete' : 'bg-cyan-950 text-cyan-200'}>{collectionComplete ? '✦ 엔딩 도감 · 7/7' : `엔딩 도감 · ${collectedCount}/7`}</button><button onClick={handleRestart} className="bg-neutral-800 text-neutral-100 font-bold cursor-pointer"><RotateCcw size={18} /><span>처음부터 다시 시도</span></button></>}
          </div>
          <details className="ending-credits">
            <summary>ENDING CREDITS</summary>
            <p>00:37 AM — 심야 지하철: 사라진 다음역</p>
            <dl><dt>게임 구현</dt><dd>React · Vite · Canvas</dd><dt>판정 시스템</dt><dd>D20 Survival TRPG</dd><dt>이야기 서체</dt><dd>둥근모꼴+Fixedsys · 길형진 / CACTUS</dd></dl>
            <p className="credits-thanks">마지막 역까지 함께해 주셔서 감사합니다.</p>
          </details>
        </section>
      </div>}
    </main>
  );
}
