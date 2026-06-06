import { useCallback, useState } from 'react';

type Locale = 'en' | 'ru';

const KEY = 'locale';

const translations = {
  en: {
    newGame: 'New game',
    resume: 'Resume',
    noSave: 'No saved game',
    toggleTheme: 'Toggle theme',
    toggleLocale: 'Русский',
    subtitle: 'A quiet 7×7 match puzzle.',
    best: 'Best',
    bestCombo: 'Combo',
    bestComboScore: 'Combo',
    newComboRecord: 'Combo record!',
    comboScore: 'Combo',
    newLine: 'New line!',
    clearBoard: 'Board cleared!',
    movesAriaLabel: 'Moves until next bottom row',
    gameOver: 'Game over',
    playAgain: 'Play again',
    backToMenuBtn: 'Back to menu',
    newRecord: '🎉 New record 🎉',
    statistics: 'Statistics',
    statBestScore: 'Best score',
    statBestCombo: 'Best combo',
    statBestComboScore: 'Best combo score',
    close: 'Close',
  },
  ru: {
    newGame: 'Новая игра',
    resume: 'Продолжить',
    noSave: 'Нет сохранения',
    toggleTheme: 'Сменить тему',
    toggleLocale: 'English',
    subtitle: 'A quiet 7×7 match puzzle.',
    best: 'Рекорд',
    bestCombo: 'Комбо',
    bestComboScore: 'Комбо',
    newComboRecord: 'Рекорд комбо!',
    comboScore: 'Комбо',
    newLine: 'Новая линия!',
    clearBoard: 'Очищенное поле!',
    movesAriaLabel: 'Ходов до следующего ряда',
    gameOver: 'Игра окончена',
    playAgain: 'Ещё раз',
    backToMenuBtn: 'В меню',
    newRecord: '🎉 Новый рекорд 🎉',
    statistics: 'Статистика',
    statBestScore: 'Лучший счёт',
    statBestCombo: 'Лучшее комбо',
    statBestComboScore: 'Лучший счёт за комбо',
    close: 'Закрыть',
  },
} satisfies Record<Locale, Record<string, string>>;

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(
    () => (localStorage.getItem(KEY) as Locale | null) ?? 'en',
  );

  const toggleLocale = useCallback(() => {
    setLocale((l) => {
      const next = l === 'en' ? 'ru' : 'en';
      localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  return { t: translations[locale], locale, toggleLocale };
}
