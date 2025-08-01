// 카드 관련 타입
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
  selected?: boolean;
}

// 게임 상태 타입
export type GamePhase = 'lobby' | 'dealing' | 'betting' | 'card-exchange' | 'final-betting' | 'showdown' | 'game-over';
export type PlayerType = 'human' | 'ai';
export type BettingAction = 'call' | 'raise' | 'fold' | 'check';

// 플레이어 타입
export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  chips: number;
  cards: Card[];
  currentBet: number;
  folded: boolean;
  isDealer?: boolean;
  isTurn?: boolean;
}

// 바둑이 족보 타입 (낮은 순으로 좋음)
export type HandRank = 
  | 'badugi'      // 4장 모두 다른 무늬, 다른 숫자 (최고)
  | 'three-card'  // 3장이 서로 다른 무늬
  | 'two-card'    // 2장이 서로 다른 무늬  
  | 'one-card';   // 모든 카드가 같은 무늬거나 같은 숫자

export interface HandResult {
  rank: HandRank;
  cards: Card[]; // 실제로 계산에 사용된 카드들
  value: number; // 비교를 위한 수치값 (낮을수록 좋음)
}

// 게임 상태
export interface GameState {
  id: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  pot: number;
  currentBet: number;
  deck: Card[];
  round: number; // 1: 첫 베팅, 2: 카드 교체 후 베팅
  exchangesRemaining: number; // 남은 카드 교체 횟수
  winner?: Player;
}

// 베팅 관련
export interface BettingState {
  currentBet: number;
  minRaise: number;
  maxRaise: number;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  canFold: boolean;
}

// UI 상태
export interface UIState {
  selectedCards: string[]; // 선택된 카드 ID들
  showingCards: boolean;
  animating: boolean;
  hoveredCard?: string;
  draggedCard?: string;
}

// 게임 설정
export interface GameSettings {
  initialChips: number;
  smallBlind: number;
  bigBlind: number;
  maxExchanges: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
}

// 애니메이션 상태
export interface AnimationState {
  dealing: boolean;
  cardExchange: boolean;
  betting: boolean;
  showdown: boolean;
}