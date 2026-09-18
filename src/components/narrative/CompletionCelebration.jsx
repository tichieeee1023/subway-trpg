import { useEffect, useState } from 'react';

const CELEBRATION_KEY = 'subway-completion-celebrated-v1';
const COLORS = ['#ffe07a', '#f7b84b', '#fff5c3', '#e9a3d1', '#89d8dc'];

export default function CompletionCelebration({ complete, disableEffects }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!complete || disableEffects) return undefined;
    try {
      if (localStorage.getItem(CELEBRATION_KEY) === '1') return undefined;
      localStorage.setItem(CELEBRATION_KEY, '1');
    } catch { /* The celebration can still run for this session. */ }
    const start = window.setTimeout(() => setActive(true), 60);
    const finish = window.setTimeout(() => setActive(false), 4200);
    return () => { window.clearTimeout(start); window.clearTimeout(finish); };
  }, [complete, disableEffects]);

  useEffect(() => {
    if (!active) return undefined;
    const canvas = document.querySelector('.completion-canvas');
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;
    let frame;
    let width = 0;
    let height = 0;
    const particles = [];
    const bursts = [
      { x: .2, y: .32, delay: 0 }, { x: .76, y: .24, delay: 280 },
      { x: .48, y: .17, delay: 620 }, { x: .63, y: .46, delay: 980 },
    ];
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * ratio; canvas.height = height * ratio;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const explode = ({ x, y }) => {
      for (let index = 0; index < 38; index += 1) {
        const angle = (Math.PI * 2 * index) / 38 + Math.random() * .16;
        const speed = 1.2 + Math.random() * 3.8;
        particles.push({ x: width * x, y: height * y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.2, life: 1, color: COLORS[index % COLORS.length], size: 1.5 + Math.random() * 2.5 });
      }
    };
    resize();
    const started = performance.now();
    const draw = (now) => {
      const elapsed = now - started;
      while (bursts.length && elapsed >= bursts[0].delay) explode(bursts.shift());
      context.clearRect(0, 0, width, height);
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx; particle.y += particle.vy; particle.vy += .035; particle.life -= .012;
        if (particle.life <= 0) { particles.splice(index, 1); continue; }
        context.globalAlpha = particle.life;
        context.fillStyle = particle.color;
        context.fillRect(particle.x, particle.y, particle.size, particle.size);
      }
      context.globalAlpha = 1;
      if (elapsed < 3300 || particles.length) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [active]);

  if (!active) return null;
  return <div className="completion-celebration" role="status" aria-live="polite"><canvas className="completion-canvas" aria-hidden="true" /><p><strong>모든 기록을 수집했습니다.</strong><span>마지막 역까지 함께해 주셔서 감사합니다.</span></p></div>;
}
