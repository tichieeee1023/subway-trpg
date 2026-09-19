import { SCENE_ASSETS } from '../../data/assetDB.js';
import { CircleHelp, Settings2 } from 'lucide-react';
import CompletionCelebration from './CompletionCelebration.jsx';

export default function IntroScreen({ onStart, onContinue, hasActiveRun, onSettings, onHelp, onCollection, collectionUnlocked, collectionComplete, disableEffects, celebrationActive, onCelebrationFinish }) {
  return (
    <main className="intro-screen">
      <img className="intro-image" src={SCENE_ASSETS.INTRO.src} alt={SCENE_ASSETS.INTRO.alt} />
      <div className="intro-shade" aria-hidden="true" />
      <CompletionCelebration active={celebrationActive} disableEffects={disableEffects} onFinish={onCelebrationFinish} />
      <section className="intro-copy">
        <div className="intro-label">MIDNIGHT SUBWAY · SURVIVAL TRPG</div>
        <h1>00:37 AM</h1>
        <h2>심야 지하철: 사라진 다음역</h2>
        <p>막차에 올랐다.<br />다음 역은, 당신이 알던 곳이 아니다.</p>
        <div className="intro-actions">
          <button onClick={hasActiveRun ? onContinue : onStart} className="bg-amber-300 text-neutral-950 font-bold cursor-pointer">{hasActiveRun ? '이어하기' : '게임 시작'}</button>
          <button onClick={onSettings} className="bg-neutral-900 text-neutral-100 cursor-pointer"><Settings2 size={17} strokeWidth={1.8} aria-hidden="true" /><span>설정</span></button>
          <button onClick={onHelp} className="bg-neutral-900 text-neutral-100 cursor-pointer"><CircleHelp size={17} strokeWidth={1.8} aria-hidden="true" /><span>도움말</span></button>
          <button onClick={onCollection} disabled={!collectionUnlocked} title={collectionUnlocked ? '엔딩 도감' : '엔딩을 하나 이상 보면 열립니다'} className={`bg-neutral-900 text-neutral-100 cursor-pointer${collectionComplete ? ' collection-button-complete' : ''}`}>{collectionComplete ? '엔딩 도감' : collectionUnlocked ? '엔딩 도감' : '엔딩 도감 · 잠김'}</button>
        </div>
        <div className="intro-hint">D20 주사위 · 도구 수집 · 여섯 개의 결말</div>
        <a className="related-game-link" href="https://aquarium-trpg.vercel.app/" target="_blank" rel="noreferrer">
          <span>UNREGISTERED SIGNAL</span><strong>23:45 · 심야 아쿠아리움</strong><i aria-hidden="true">↗</i>
        </a>
      </section>
    </main>
  );
}
