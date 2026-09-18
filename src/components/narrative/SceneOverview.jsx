import { useEffect, useState } from 'react';
import { SCENE_ASSETS } from '../../data/assetDB.js';

const isDesktopViewport = () => window.matchMedia('(min-width: 701px) and (min-height: 501px)').matches;

const descriptions = {
  STAGE_1_CAR6: '형광등이 팝콘처럼 터지며 암전되었다. 승객들은 온데간데없고 바닥엔 옷가지와 이어폰만 널려 있다.\n7호차 연결문 너머에서 "질척... 질척..." 살덩이를 끄는 소리가 다가온다. 3번의 행동력 내에 탈출 수단을 확보해야 한다.',
  STAGE_2_TUNNEL: '전동차 밖 자갈밭으로 굴러떨어졌다. 짙은 쇳녹 냄새와 기름때가 진동한다.\n저 멀리 300m 앞 승강장의 깜빡이는 불빛이 아른거린다. 뒤편에서 터널 천장을 기어오는 소리가 들린다.',
  STAGE_3_PLATFORM: '형광등이 눈부시게 켜져 있고, 따뜻한 델리만쥬 냄새와 에어컨 냉기까지 감돈다.\n저 위 계단에 [3번 출구: 택시 승차장] 간판이 환하게 빛난다. 하지만... 왜 개미 새끼 한 마리 보이지 않는 걸까?',
  STAGE_4_MALL: '새벽 2시의 셔터 내린 대합실이다. 화강암 바닥은 차갑고 진짜 인간의 건축물이다.\n하지만 쇼윈도 속 목 없는 마네킹들이 고개를 꺾은 채 나를 내려다본다. 도구와 정보를 챙겨 환기탑으로 향해야 한다.',
  STAGE_5_VENT: '20m 수직 갱도 꼭대기 틈새로 차가운 밤비가 뺨 위로 쏟아진다. 지상 도로다!\n하지만 사다리 초입을 고속 회전하는 지름 2m 배기팬이 가로막고 있다. 등 뒤 철문이 찌그러지며 촉수들이 찢고 들어온다.',
};

export default function SceneOverview({ stage }) {
  const [expanded, setExpanded] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(isDesktopViewport);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 701px) and (min-height: 501px)');
    const syncDescription = () => setDescriptionExpanded(media.matches);
    syncDescription();
    media.addEventListener('change', syncDescription);
    return () => media.removeEventListener('change', syncDescription);
  }, []);
  const scene = SCENE_ASSETS[stage];
  if (!scene) return null;
  const toggleOverview = (event) => {
    const isOpen = event.currentTarget.open;
    setExpanded(isOpen);
    if (!isOpen && !isDesktopViewport()) setDescriptionExpanded(false);
  };
  return (
    <details className="scene-overview" open={expanded} onToggle={toggleOverview}>
      <summary>장면 · 상황 설명 <span>{expanded ? '접기 −' : '펼치기 +'}</span></summary>
      <div className="scene-overview-content">
        <img src={scene.src} alt={scene.alt} />
        <details className="scene-description" open={descriptionExpanded} onToggle={(event) => setDescriptionExpanded(isDesktopViewport() || event.currentTarget.open)}>
          <summary>상황 설명 읽기 <span>{descriptionExpanded ? '접기 −' : '펼치기 +'}</span></summary>
          <p>{descriptions[stage]}</p>
        </details>
      </div>
    </details>
  );
}
