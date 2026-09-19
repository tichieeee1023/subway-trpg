import DialogFrame from './DialogFrame.jsx';

const NOTES = [
  ['FRONTEND', 'React · Vite'],
  ['NARRATIVE SYSTEM', '상태 기반 서사 분기 · D20 판정 · 멀티 엔딩'],
  ['GAME STATE', '인벤토리 · AP · HP / SAN · 배터리 · 플래그 기반 분기'],
  ['INTERACTION', 'Canvas 주사위 · 타입라이터 · Web Audio API · 화면 연출'],
  ['RESPONSIVE UI', '반응형 레이아웃 · 모바일 인벤토리'],
  ['ACCESSIBILITY', '키보드 포커스 · 모션 감소 · 글자 크기 조절'],
  ['TYPEFACE', 'DungGeunMo'],
  ['AI & ASSETS', '개발 보조: Codex · GPT · Gemini · 일부 이미지는 AI 생성'],
];

export default function CreditsModal({ onClose }) {
  return <DialogFrame title="SYSTEM NOTES" onClose={onClose} className="credits-dialog">
    <p className="credits-lead">심야 지하철: 사라진 다음역 | 텍스트로그 게임 1</p>
    <div className="credits-author"><span>DESIGN & DEVELOPMENT</span><strong>Lee YJ</strong></div>
    <dl className="credits-list">
      {NOTES.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}
    </dl>
    <p className="credits-footnote">막차 이후 사라진 역을 탐사하는 분기형 생존 텍스트로그 TRPG.</p>
    <button className="utility-done" onClick={onClose}>[닫기]</button>
  </DialogFrame>;
}
