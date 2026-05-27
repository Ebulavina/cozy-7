/**
 * App — root component. Replaces the SwiftUI NavigationView in MainView.swift
 * with a simple two-screen router (no react-router needed for two views).
 *
 * Also wires lifecycle persistence (visibility change → saveSnapshot), which
 * matches `UIApplication.willResignActive` / `didBecomeActive` in
 * CombinationApp.swift.
 */
import { useEffect, useState } from 'react';
import { MainMenu } from '@widgets/main-menu/ui/MainMenu';
import { GameView } from '@widgets/game-view/ui/GameView';
import { useGameStore } from '@entities/game/model/gameStore';
import styles from './App.module.css';

type Route = 'menu' | 'play';

export default function App() {
  const [route, setRoute] = useState<Route>('menu');

  useEffect(() => {
    const save = () => useGameStore.getState().saveSnapshot();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save();
    };
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className={styles.app}>
      {route === 'menu' && <MainMenu onStart={() => setRoute('play')} />}
      {route === 'play' && <GameView onBack={() => setRoute('menu')} />}
    </div>
  );
}
