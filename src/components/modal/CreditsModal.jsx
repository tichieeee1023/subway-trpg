import DialogFrame from './DialogFrame.jsx';
import { ExternalLink } from 'lucide-react';

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
    <div className="credits-links">
      <a
        className="credits-source-link"
        href="https://github.com/tichieeee1023/subway-trpg#readme"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub에서 서브웨이 프로젝트 README 열기 (새 탭)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.09 24 17.59 24 12.297c0-6.627-5.373-12-12-12" /></svg>
        <span>SOURCE / README</span>
        <ExternalLink size={13} aria-hidden="true" />
      </a>
    </div>
    <button className="utility-done" onClick={onClose}>[닫기]</button>
  </DialogFrame>;
}
