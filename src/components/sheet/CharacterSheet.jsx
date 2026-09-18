import ProfileCard from './ProfileCard.jsx';
import StatGrid from './StatGrid.jsx';
import InventorySlot from './InventorySlot.jsx';
import GameFooter from '../layout/GameFooter.jsx';
import ResponsivePanel from '../layout/ResponsivePanel.jsx';

export default function CharacterSheet({ player, handleUseItem, canUseItems, highlightedItemIds }) {
  return (
<aside className="character-sheet bg-[#0e1118] border-r border-[#1c2333] p-4 flex flex-col justify-between overflow-y-auto">
      <ResponsivePanel title="캐릭터 · 능력치 · 소지품">
        <div className="space-y-4">
          
          {/* 사원증 헤더 */}
          <ProfileCard player={player} />

          {/* 5대 D20 스탯 시트 */}
          <StatGrid player={player} />

          {/* 소지품 인벤토리 */}
          <InventorySlot player={player} handleUseItem={handleUseItem} canUseItems={canUseItems} highlightedItemIds={highlightedItemIds} />

        </div>

        {/* 하단 시스템 상태 안내 */}
        <GameFooter />
      </ResponsivePanel>
      </aside>
  );
}
