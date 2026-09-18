const palette = {
  cyan: { border: 'hover:border-cyan-400', tag: 'text-cyan-400' },
  emerald: { border: 'hover:border-emerald-400', tag: 'text-emerald-400' },
  purple: { border: 'hover:border-purple-400', tag: 'text-purple-400' },
};
export default function ActionPanel({ points, examinedPoints, ap, onExamine, color = 'cyan', compact = false }) {
  const colors = palette[color];
  return points.map((point) => {
    const done = examinedPoints.includes(point.id);
    return (
      <button key={point.id} disabled={done || ap <= 0} onClick={() => onExamine(point.id)}
        className={`choice-card ${compact ? 'p-2.5' : 'p-3'} rounded-xl border text-left flex flex-col justify-between transition-all ${
          done ? 'is-complete bg-neutral-950/40 border-neutral-900 text-neutral-600 cursor-not-allowed'
            : `bg-[#141926] hover:bg-[#1c2336] border-[#222b3f] ${colors.border} text-neutral-200 cursor-pointer`
        }`}>
        <span className="text-xs font-bold">{point.title}</span>
        <span className={`text-[10px] ${colors.tag} mt-1`}>{done ? (compact ? '확인됨' : '조사 완료') : point.tag}</span>
      </button>
    );
  });
}
