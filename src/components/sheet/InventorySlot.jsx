export default function InventorySlot({ player, handleUseItem, canUseItems, highlightedItemIds = [], compact = false }) {
  return (
    <div className={`inventory-slot bg-[#121622] p-3 rounded-xl border border-[#1e2638]${compact ? ' inventory-slot--compact' : ''}`}>
      <div className="text-[11px] font-bold text-cyan-400 uppercase mb-2 flex items-center justify-between">
        <span>INVENTORY BAG</span>
        <span className="text-[10px] text-neutral-500">{player.inventory.length} SLOTS</span>
      </div>
      <div className="inventory-grid grid gap-2">
        {player.inventory.map((item, idx) => {
          const isRelevant = highlightedItemIds.includes(item.id);
          const isUnavailable = !canUseItems || (item.hpRestore ? player.hp >= player.maxHp : player.san >= player.maxSan);
          return <div key={idx} className={`inventory-item p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between min-h-20 gap-2${isRelevant ? ' is-relevant' : ''}`}>
            <div className="flex items-center gap-1.5 text-xs">
              {item.img ? <img src={item.img} alt="" className="w-12 h-8 object-contain rounded" /> : <span>{item.icon}</span>}
              <span className="font-bold text-neutral-200">{item.name}</span>
              {isRelevant && <span className="inventory-relevance" aria-label="현재 위기와 관련 있는 소지품">●</span>}
            </div>
            <div className="text-[9px] text-neutral-500">{item.desc}</div>
            {item.consumable && <button className="inventory-use p-2 bg-[#20323a] text-cyan-200" disabled={isUnavailable} onClick={() => handleUseItem(item.id)}>사용 {item.hpRestore ? `HP +${item.hpRestore}` : `SAN +${item.sanRestore}`}</button>}
          </div>;
        })}
        {Array.from({ length: Math.max(0, 4 - player.inventory.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="inventory-empty h-14 rounded-lg border border-dashed border-neutral-900 flex items-center justify-center text-neutral-700 text-xs">EMPTY</div>
        ))}
      </div>
    </div>
  );
}
