import { Suit, Rank, GameSettings } from '@/types';

// 카드 덱 생성을 위한 상수
export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 게임 기본 설정
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  initialChips: 1000,
  smallBlind: 10,
  bigBlind: 20,
  maxExchanges: 3,
  aiDifficulty: 'medium'
};

// 족보 순위 (낮을수록 좋음)
export const HAND_RANKINGS = {
  'badugi': 1,
  'three-card': 2,
  'two-card': 3,
  'one-card': 4
};

// 카드 수치 (A=1, 낮을수록 좋음)
export const CARD_VALUES: Record<Rank, number> = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13
};

// 애니메이션 지속시간 (ms)
export const ANIMATION_DURATION = {
  CARD_DEAL: 300,
  CARD_FLIP: 200,
  CARD_EXCHANGE: 400,
  CHIP_MOVE: 500,
  FADE_IN: 200,
  FADE_OUT: 200
};

// UI 상수
export const UI_CONSTANTS = {
  CARD_WIDTH: 80,
  CARD_HEIGHT: 112,
  CARD_SPACING: 10,
  MAX_CARDS_IN_HAND: 5
};