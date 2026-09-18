import { useCallback, useEffect, useState } from 'react';
import { useAudioSynth } from './hooks/useAudioSynth.js';
import { useGameEngine } from './hooks/useGameEngine.js';
import MainLayout from './components/layout/MainLayout.jsx';
import GameHeader from './components/layout/GameHeader.jsx';
import CharacterSheet from './components/sheet/CharacterSheet.jsx';
import GameNarrative from './components/narrative/GameNarrative.jsx';
import GameConsole from './components/console/GameConsole.jsx';
import DiceModal from './components/modal/DiceModal.jsx';
import StoryDisplay from './components/narrative/StoryDisplay.jsx';
import EndingModal from './components/modal/EndingModal.jsx';
import IntroScreen from './components/narrative/IntroScreen.jsx';
import OpeningSequence from './components/narrative/OpeningSequence.jsx';
import UtilityModal from './components/modal/UtilityModal.jsx';
import { useGameSettings } from './hooks/useGameSettings.js';
import { useEndingCollection } from './hooks/useEndingCollection.js';
import CollectionModal from './components/modal/CollectionModal.jsx';
import MobileInventoryDock from './components/sheet/MobileInventoryDock.jsx';
import CreditsModal from './components/modal/CreditsModal.jsx';
import { getRelevantItemIds } from './utils/itemRelevance.js';

const OPENING_STORAGE_KEY = 'subway-opening-seen-v1';

export default function App() {
  const sfx = useAudioSynth();
  const game = useGameEngine(sfx);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [showOpening, setShowOpening] = useState(false);
  const [hasSeenOpening, setHasSeenOpening] = useState(() => {
    try { return localStorage.getItem(OPENING_STORAGE_KEY) === '1'; } catch { return false; }
  });
  const [utility, setUtility] = useState(null);
  const { settings, updateSettings } = useGameSettings();
  const { collected, unlockAllEndings } = useEndingCollection(game.endingData);
  const collectionUnlocked = collected.length > 0;
  const collectionComplete = collected.length === 6;
  const highlightedItemIds = settings.easyMode ? getRelevantItemIds(game.stage, game.ventPhase) : [];
  const openCollection = () => { if (collectionUnlocked) setUtility('collection'); };
  useEffect(() => {
    if (!import.meta.env.DEV || showOpening || (!showIntro && game.stage !== 'SURVEY') || utility) return;
    const handleDeveloperKey = (event) => {
      if (event.repeat || event.isComposing || document.querySelector('[role="dialog"]') || event.target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.code !== 'F10' || !event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey) return;
      event.preventDefault();
      unlockAllEndings();
      setUtility('collection');
    };
    window.addEventListener('keydown', handleDeveloperKey);
    return () => window.removeEventListener('keydown', handleDeveloperKey);
  }, [showIntro, showOpening, game.stage, utility, unlockAllEndings]);
  const closeUtility = useCallback(() => setUtility(null), []);
  const toggleSound = () => {
    sfx.setEnabled(!soundEnabled);
    setSoundEnabled(!soundEnabled);
  };
  const completeOpening = () => {
    try { localStorage.setItem(OPENING_STORAGE_KEY, '1'); } catch { /* The current session can still continue. */ }
    setHasSeenOpening(true);
    sfx.playClick();
    setShowOpening(false);
  };
  const restart = () => { game.handleRestart(); setShowOpening(false); setShowIntro(true); };
  return (
    <MainLayout isGlitching={game.isGlitching && !settings.disableEffects}>
      {showIntro ? <IntroScreen onStart={() => { sfx.playClick(); setShowIntro(false); setShowOpening(!hasSeenOpening); }} onSettings={() => setUtility('settings')} onHelp={() => setUtility('help')} onCollection={openCollection} collectionUnlocked={collectionUnlocked} collectionComplete={collectionComplete} disableEffects={settings.disableEffects} /> : showOpening ? <OpeningSequence onComplete={completeOpening} onSkip={completeOpening} /> : <>
      <GameHeader {...game} soundEnabled={soundEnabled} toggleSound={toggleSound} onSettings={() => setUtility('settings')} onHelp={() => setUtility('help')} onHint={() => setUtility('hint')} />
      {game.stage === 'ENDING' ? (
        <EndingModal {...game} handleRestart={restart} onCollection={openCollection} collectedCount={collected.length} collectionComplete={collectionComplete} disableEffects={settings.disableEffects} />
      ) : <div className="game-columns flex-1 flex overflow-hidden">
        <CharacterSheet player={game.player} handleUseItem={game.handleUseItem} canUseItems={game.stage.startsWith('STAGE_') && !game.activeModalText && !game.diceModal.isOpen} highlightedItemIds={highlightedItemIds} />
        <GameNarrative {...game} />
        <GameConsole stage={game.stage} logs={game.logs} />
      </div>}
      {game.stage.startsWith('STAGE_') && <MobileInventoryDock player={game.player} handleUseItem={game.handleUseItem} canUseItems={!game.activeModalText && !game.diceModal.isOpen} highlightedItemIds={highlightedItemIds} />}
      <DiceModal {...game} disableEffects={settings.disableEffects} skipDiceAnimation={settings.skipDiceAnimation} />
      <StoryDisplay activeModalText={game.activeModalText} onAdvance={game.advanceStory} />
      </>}
      {utility === 'collection' ? collectionUnlocked && <CollectionModal collected={collected} onClose={closeUtility} /> : utility === 'credits' ? <CreditsModal onClose={closeUtility} /> : utility && <UtilityModal kind={utility} stage={game.stage} settings={settings} updateSettings={updateSettings} onCredits={() => setUtility('credits')} onClose={closeUtility} />}
    </MainLayout>
  );
}
