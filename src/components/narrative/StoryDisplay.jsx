import { useCallback, useEffect } from 'react';
import ModalLayer from '../modal/ModalLayer.jsx';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import TypedText from './TypedText.jsx';

export default function StoryDisplay({ activeModalText, onAdvance }) {
  const text = activeModalText?.body ?? '';
  const illustrations = activeModalText?.illustrations ?? (activeModalText?.illustration ? [activeModalText.illustration] : []);
  const { count, done, finish } = useTypewriter(text);
  const advance = useCallback(() => { if (!done) finish(); else onAdvance(); }, [done, finish, onAdvance]);
  useEffect(() => {
    if (!activeModalText) return;
    const handleKey = (event) => { if (event.key === 'Escape') advance(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeModalText, advance]);
  return (
activeModalText && (
    <ModalLayer>
      <div data-testid="story-backdrop" onClick={(event) => { if (event.target === event.currentTarget) advance(); }} className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-40">
        <div role="dialog" aria-modal="true" aria-labelledby="story-title" className="story-dialog w-full overflow-y-auto">
          {activeModalText.image && <img src={activeModalText.image.src} alt={activeModalText.image.alt} className="story-dialog__scene" />}
          <div className="story-dialog__heading">
            <span className="story-dialog__kicker">INCIDENT LOG</span>
            <div className="story-dialog__title-row">
              <h3 id="story-title">{activeModalText.title}</h3>
            {activeModalText.tag && (
              <span className="story-dialog__tag">
                {activeModalText.tag}
              </span>
            )}
            </div>
          </div>
          {illustrations.length > 0 && (
            <div className={'story-illustrations' + (illustrations.length > 1 ? ' story-illustrations--paired' : '')}>
              {illustrations.map((item) => (
                <figure key={item.id} className="story-illustration">
                  <img src={item.img} alt={item.name} />
                  <figcaption>{item.name}</figcaption>
                </figure>
              ))}
            </div>
          )}
          {activeModalText.modifiers?.length > 0 && (
            <div className="story-modifiers" aria-label="판정 및 피해 변화">
              {activeModalText.modifiers.map(({ label, from, to, tone = 'damage' }, index) => (
                <p key={label + '-' + index}>
                  <span>{label}</span>
                  <strong><i className={tone === 'benefit' ? 'typed-benefit' : 'typed-damage'}>{from}</i> → <i className={tone === 'benefit' ? 'typed-benefit' : 'typed-damage'}>{to}</i></strong>
                </p>
              ))}
            </div>
          )}
          {activeModalText.rewardItems?.length > 0 && (
            <div className={`story-rewards ${activeModalText.rewardItems.length === 1 ? 'story-rewards--single' : ''}`} aria-label="획득한 도구">
              {activeModalText.rewardItems.map((item) => (
                <figure key={item.id} className="story-reward-card">
                  <img src={item.img} alt={item.name} />
                  <figcaption><span>ACQUIRED</span> {item.name}</figcaption>
                </figure>
              ))}
            </div>
          )}
          <p className="story-dialog__copy">
            <TypedText text={text} count={count} />
          </p>
          <button
            onClick={advance}
            data-typing={done ? 'complete' : 'typing'}
            className="story-dialog__advance"
          >
            <span>[다음]</span><b aria-hidden="true">›</b>
          </button>
        </div>
      </div>
    </ModalLayer>
    )
  );
}
