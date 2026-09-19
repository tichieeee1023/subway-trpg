import { useEffect, useRef } from 'react';

const COLORS = ['#ffd85e', '#fff1ad', '#ef8b66', '#7bd7e5', '#c89cff'];

export default function CompletionCelebration({ active, disableEffects, onFinish }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active || disableEffects) return undefined;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;
    let frame = 0, width = 0, height = 0, lastLaunch = 0;
    const rockets = [], sparks = [];
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * ratio; canvas.height = height * ratio;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const burst = (x, y, color) => {
      for (let index = 0; index < 56; index += 1) {
        const angle = (Math.PI * 2 * index) / 56 + Math.random() * .1;
        const speed = 2 + Math.random() * 5.4;
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, size: Math.random() > .75 ? 4 : 3 });
      }
    };
    const launch = () => rockets.push({ x: width * (.12 + Math.random() * .76), y: height + 20, targetY: height * (.1 + Math.random() * .35), vy: -(7.6 + Math.random() * 2.4), color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    resize();
    const started = performance.now();
    const draw = (now) => {
      const elapsed = now - started;
      context.clearRect(0, 0, width, height);
      if (elapsed < 5400 && now - lastLaunch > (elapsed < 2200 ? 230 : 390)) { launch(); lastLaunch = now; }
      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index]; rocket.y += rocket.vy; rocket.vy += .04;
        context.globalAlpha = .95; context.fillStyle = rocket.color; context.fillRect(rocket.x, rocket.y, 3, 10);
        if (rocket.y <= rocket.targetY || rocket.vy >= -1.2) { burst(rocket.x, rocket.y, rocket.color); rockets.splice(index, 1); }
      }
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index]; spark.x += spark.vx; spark.y += spark.vy; spark.vy += .06; spark.vx *= .992; spark.life -= .018;
        if (spark.life <= 0) { sparks.splice(index, 1); continue; }
        context.globalAlpha = spark.life; context.fillStyle = spark.color; context.fillRect(spark.x, spark.y, spark.size, spark.size);
      }
      context.globalAlpha = 1;
      if (elapsed < 6500 || rockets.length || sparks.length) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [active, disableEffects]);
  useEffect(() => {
    if (!active) return undefined;
    const timer = window.setTimeout(() => onFinish?.(), disableEffects ? 5200 : 7600);
    return () => window.clearTimeout(timer);
  }, [active, disableEffects, onFinish]);
  if (!active) return null;
  return <div className={`completion-celebration${disableEffects ? ' is-static' : ''}`} role="status" aria-live="polite">
    {!disableEffects && <canvas ref={canvasRef} className="completion-canvas" aria-hidden="true" />}
    <div className="completion-scan" aria-hidden="true" />
    <section className="completion-terminal">
      <header className="completion-header"><span>ARCHIVE STATUS</span><strong>COMPLETE</strong></header>
      <div className="completion-score"><span>ALL ENDINGS</span><strong>6 / 6</strong></div>
      <div className="completion-main"><p className="completion-code">MIDNIGHT SUBWAY // FINAL RECORD DECLASSIFIED</p><h2>THANK YOU FOR PLAYING</h2><h3>심야 서브웨이: 마지막 역의 기록</h3><p className="completion-copy">마지막 칸의 문을 지나, 숨겨진 기록까지 확인해 주셔서 감사합니다.<br />당신은 무사히 지상으로 돌아왔습니다.</p></div>
      <footer className="completion-footer"><div className="completion-signoff"><span>DESIGN &amp; DEVELOPMENT</span><strong>Lee YJ</strong></div><p className="completion-final-line">00:37 AM · SURVIVOR RECORD CLOSED</p></footer>
    </section>
  </div>;
}
