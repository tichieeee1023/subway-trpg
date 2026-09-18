import InventorySlot from './InventorySlot.jsx';

export default function MobileInventoryDock(props) {
  return <aside className="mobile-inventory-dock" aria-label="소지품 바로가기"><InventorySlot {...props} compact /></aside>;
}
