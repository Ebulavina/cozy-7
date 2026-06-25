import { useMemo } from 'react';
import { create } from 'zustand';

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
    htpIntro: 'Tap a column to drop an element into the board.',
    htpMatch: 'Build chains: match 𝐿 elements with the number 𝐿 in a row or column to make them disappear and earn points.',
    htpDouble: 'Clear both a row and a column at once? Enjoy a double bonus!',
    htpObstacles: 'Unlock elements: pieces with 1-lock open when a nearby element disappears. Pieces with 2-locks first turn into 1-lock elements.',
    htpRows: 'Stay alert: every few moves, a new row of obstacles rises from the bottom.',
    htpGameOver: 'The game ends when a new row can no longer rise.',
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
    htpIntro: 'Нажимай на столбец, чтобы опустить элемент в поле.',
    htpMatch: 'Собирай цепочки: 𝐿 элементов с числом 𝐿 подряд по горизонтали или вертикали — и они исчезают, принося очки.',
    htpDouble: 'Собрал одновременно и строку, и столбец? Получай двойной бонус!',
    htpObstacles: 'Снимай замочки: элементы с 1 замком открываются, если рядом исчезает элемент. Элементы с 2 замками сначала превращаются в элементы с 1 замком.',
    htpRows: 'Будь готов к давлению: каждые несколько ходов снизу поднимается новый ряд препятствий.',
    htpGameOver: 'Игра заканчивается, когда новому ряду больше некуда подниматься.',
    tutorialFirstMove: 'Нажмите на столбец, чтобы опустить элемент',
    tutorialFirstMatch: 'Совпадение! Одинаковые числа подряд исчезают.',
  },
} satisfies Record<Locale, Record<string, string>>;

interface LocaleStore {
  locale: Locale;
  toggleLocale: () => void;
}

const useLocaleStore = create<LocaleStore>((set) => ({
  locale: (localStorage.getItem(KEY) as Locale | null) ?? 'en',
  toggleLocale: () => set((s) => {
    const next = s.locale === 'en' ? 'ru' : 'en';
    localStorage.setItem(KEY, next);
    return { locale: next };
  }),
}));

const fmt = new Intl.NumberFormat('ru-RU');
const formatNumber = (n: number) => fmt.format(n);

export function useLocale() {
  const locale = useLocaleStore((s) => s.locale);
  const toggleLocale = useLocaleStore((s) => s.toggleLocale);

  const t = useMemo(() => translations[locale], [locale]);

  return { t, locale, toggleLocale, formatNumber };
}
