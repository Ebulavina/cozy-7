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
    howToPlayBtn: 'How to play',
    howToPlayTitle: 'How to play',
    htpIntro: 'Tap a column to drop the next tile into it.',
    htpMatch: 'Line up L tiles with the same number L — in a row or column — and they clear.',
    htpDouble: 'Match a number in both directions at once for double points.',
    htpObstacles: 'Gray tiles turn colorful when a neighbor is cleared; black tiles turn gray.',
    htpRows: 'Every few moves a new row of obstacles rises from the bottom.',
    htpGameOver: 'The game ends when the top row is completely full.',
    tutorialFirstMove: 'Tap a column to drop a tile',
    tutorialFirstMatch: 'Matched! Equal numbers in a row clear.',
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
    howToPlayBtn: 'Как играть',
    howToPlayTitle: 'Как играть',
    htpIntro: 'Нажмите на столбец, чтобы опустить в него фишку.',
    htpMatch: 'Соберите L фишек с числом L подряд — в строке или столбце — и они исчезнут.',
    htpDouble: 'Совпадение сразу по строке и столбцу даёт двойные очки.',
    htpObstacles: 'Серые фишки становятся цветными, если рядом убрать фишку; чёрные становятся серыми.',
    htpRows: 'Каждые несколько ходов снизу поднимается новый ряд препятствий.',
    htpGameOver: 'Игра заканчивается, когда верхний ряд полностью заполнен.',
    tutorialFirstMove: 'Нажмите на столбец, чтобы опустить фишку',
    tutorialFirstMatch: 'Совпадение! Одинаковые числа подряд исчезают.',
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
