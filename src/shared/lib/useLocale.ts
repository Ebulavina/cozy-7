import { useCallback, useMemo, useState } from 'react';

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
    bestCombo: 'Combo wave',
    bestComboScore: 'Combo',
    newComboRecord: 'New record: ',
    comboScore: 'Combo',
    newLine: 'New line!',
    clearBoard: 'Board cleared!',
    movesAriaLabel: 'Moves until next bottom row',
    gameOver: 'Game over',
    playAgain: 'Play again',
    backToMenuBtn: 'Back to menu',
    newRecord: 'New record',
    statistics: 'Statistics',
    statBestScore: 'Best score',
    statBestCombo: 'Max wave count',
    statBestComboScore: 'Best combo',
    settings: 'Settings',
    settingsTheme: 'Theme',
    settingsLanguage: 'Language',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeNeon: 'Neon',
    close: 'Close',
    removeBonusBtn: 'Remove',
    removeRowBonusBtn: 'Remove row',
    shuffleBonusBtn: 'Shuffle',
    removeTypeBonusBtn: 'Remove digit',
    removeColBonusBtn: 'Remove column',
    hintRemove: 'Tap a cell to remove it',
    hintRemoveRow: 'Tap a row to remove it',
    hintRemoveCol: 'Tap a column to remove it',
    hintRemoveType: 'Tap a digit to remove all matching',
    hintShuffle: 'Tap anywhere to shuffle',
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
    newComboRecord: 'Новый рекорд: ',
    comboScore: 'Комбо',
    newLine: 'Новая линия!',
    clearBoard: 'Очищенное поле!',
    movesAriaLabel: 'Ходов до следующего ряда',
    gameOver: 'Игра окончена',
    playAgain: 'Ещё раз',
    backToMenuBtn: 'В меню',
    newRecord: 'Новый рекорд',
    statistics: 'Статистика',
    statBestScore: 'Лучший счёт',
    statBestCombo: 'Лучшее комбо',
    statBestComboScore: 'Лучший счёт за комбо',
    settings: 'Настройки',
    settingsTheme: 'Тема',
    settingsLanguage: 'Язык',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',
    themeNeon: 'Неон',
    close: 'Закрыть',
    removeBonusBtn: 'Убрать',
    removeRowBonusBtn: 'Убрать строку',
    shuffleBonusBtn: 'Перемешать',
    removeTypeBonusBtn: 'Убрать цифру',
    removeColBonusBtn: 'Убрать столбец',
    hintRemove: 'Нажмите на ячейку, чтобы убрать её',
    hintRemoveRow: 'Нажмите на строку, чтобы убрать её',
    hintRemoveCol: 'Нажмите на столбец, чтобы убрать его',
    hintRemoveType: 'Нажмите на цифру, чтобы убрать все такие',
    hintShuffle: 'Нажмите в любом месте, чтобы перемешать',
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

  const fmt = useMemo(
    () => new Intl.NumberFormat('ru-RU'),
    [],
  );

  const formatNumber = useCallback((n: number) => fmt.format(n), [fmt]);

  return { t: translations[locale], locale, toggleLocale, formatNumber };
}
