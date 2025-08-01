import { Player, Card, BettingAction, GameState } from '@/types';
import { evaluateHand, isValidBadugiCard, CARD_VALUES } from './cardUtils';

// AI 난이도별 설정
interface AIPersonality {
  bluffChance: number;       // 블러프 확률 (0-1)
  aggressiveness: number;    // 공격성 (0-1)
  cardExchangeThreshold: number; // 카드 교체 임계값 (족보 점수)
  foldThreshold: number;     // 폴드 임계값
  raiseThreshold: number;    // 레이즈 임계값
}

const AI_PERSONALITIES = {
  easy: {
    bluffChance: 0.1,
    aggressiveness: 0.3,
    cardExchangeThreshold: 300000000, // three-card 이하에서 교체
    foldThreshold: 400000000,         // one-card에서 폴드
    raiseThreshold: 200000000         // three-card 이상에서 레이즈
  },
  medium: {
    bluffChance: 0.2,
    aggressiveness: 0.5,
    cardExchangeThreshold: 200000000,
    foldThreshold: 350000000,
    raiseThreshold: 150000000
  },
  hard: {
    bluffChance: 0.3,
    aggressiveness: 0.7,
    cardExchangeThreshold: 150000000,
    foldThreshold: 300000000,
    raiseThreshold: 100000000
  }
};

// AI 베팅 결정
export function getAIBettingAction(gameState: GameState, aiPlayer: Player): {
  action: BettingAction;
  amount?: number;
} {
  const difficulty = 'medium'; // 기본값, 추후 설정에서 가져올 예정
  const personality = AI_PERSONALITIES[difficulty];
  
  const handResult = evaluateHand(aiPlayer.cards);
  const handStrength = calculateHandStrength(handResult.value);
  
  // 팟 오즈 계산
  const potOdds = gameState.pot / Math.max(gameState.currentBet - aiPlayer.currentBet, 1);
  
  // 블러프 여부 결정
  const shouldBluff = Math.random() < personality.bluffChance;
  const effectiveStrength = shouldBluff ? Math.min(handStrength + 0.3, 1) : handStrength;
  
  // 베팅할 금액 (현재 베팅에서 차액)
  const callAmount = gameState.currentBet - aiPlayer.currentBet;
  
  // 폴드 조건 체크
  if (effectiveStrength < 0.3 && callAmount > aiPlayer.chips * 0.2) {
    return { action: 'fold' };
  }
  
  // 올인 조건 체크
  if (callAmount >= aiPlayer.chips) {
    if (effectiveStrength > 0.6 || potOdds > 3) {
      return { action: 'call' };
    } else {
      return { action: 'fold' };
    }
  }
  
  // 베팅 결정
  if (callAmount === 0) {
    // 체크 가능한 상황
    if (effectiveStrength > 0.7) {
      const raiseAmount = Math.min(
        gameState.currentBet + Math.floor(gameState.pot * 0.5),
        aiPlayer.chips
      );
      return { action: 'raise', amount: raiseAmount };
    } else {
      return { action: 'check' };
    }
  } else {
    // 콜 또는 레이즈 결정
    if (effectiveStrength > 0.8) {
      const raiseAmount = Math.min(
        gameState.currentBet * 2,
        aiPlayer.chips
      );
      return { action: 'raise', amount: raiseAmount };
    } else if (effectiveStrength > 0.4 || potOdds > 2) {
      return { action: 'call' };
    } else {
      return { action: 'fold' };
    }
  }
}

// AI 카드 교체 결정
export function getAICardExchange(aiPlayer: Player): string[] {
  const difficulty = 'medium';
  const personality = AI_PERSONALITIES[difficulty];
  
  const handResult = evaluateHand(aiPlayer.cards);
  
  // 이미 좋은 족보면 교체하지 않음
  if (handResult.value < personality.cardExchangeThreshold) {
    return [];
  }
  
  // 교체할 카드 결정
  const cardsToExchange: string[] = [];
  const keptCards = [...handResult.cards];
  
  // 족보에 포함되지 않은 카드들 중에서 교체 대상 선택
  for (const card of aiPlayer.cards) {
    const isInBestHand = keptCards.some(kept => kept.id === card.id);
    
    if (!isInBestHand) {
      cardsToExchange.push(card.id);
    }
  }
  
  // 족보에 포함된 카드 중에서도 개선 가능한 경우 교체
  if (cardsToExchange.length < 3) {
    const improvementCandidates = findImprovementCandidates(keptCards);
    for (const candidate of improvementCandidates) {
      if (cardsToExchange.length < 3 && !cardsToExchange.includes(candidate.id)) {
        cardsToExchange.push(candidate.id);
      }
    }
  }
  
  return cardsToExchange;
}

// 손패 강도 계산 (0-1 범위)
function calculateHandStrength(handValue: number): number {
  // badugi (best): 100000000대
  // three-card: 200000000대  
  // two-card: 300000000대
  // one-card (worst): 400000000대
  
  if (handValue < 150000000) {
    return 0.9 + (150000000 - handValue) / 150000000 * 0.1; // 0.9-1.0
  } else if (handValue < 250000000) {
    return 0.6 + (250000000 - handValue) / 100000000 * 0.3; // 0.6-0.9
  } else if (handValue < 350000000) {
    return 0.3 + (350000000 - handValue) / 100000000 * 0.3; // 0.3-0.6
  } else {
    return Math.max(0.1, 0.3 - (handValue - 350000000) / 100000000 * 0.2); // 0.1-0.3
  }
}

// 개선 가능한 카드 찾기
function findImprovementCandidates(cards: Card[]): Card[] {
  const candidates: Card[] = [];
  
  // 가장 높은 값의 카드들을 교체 후보로 고려
  const sortedCards = [...cards].sort((a, b) => CARD_VALUES[b.rank] - CARD_VALUES[a.rank]);
  
  // 상위 값 카드 중에서 교체하면 더 좋은 조합이 나올 수 있는 카드
  for (let i = 0; i < Math.min(2, sortedCards.length); i++) {
    const card = sortedCards[i];
    if (CARD_VALUES[card.rank] > 8) { // 9 이상의 카드는 교체 고려
      candidates.push(card);
    }
  }
  
  return candidates;
}

// AI의 카드 교체 후 베팅 지연 시뮬레이션
export function getAIActionDelay(action: BettingAction): number {
  const baseDelay = 1000; // 1초 기본 딜레이
  const randomFactor = Math.random() * 500; // 0-500ms 랜덤
  
  switch (action) {
    case 'fold':
      return baseDelay * 0.5 + randomFactor;
    case 'check':
    case 'call':
      return baseDelay + randomFactor;
    case 'raise':
      return baseDelay * 1.5 + randomFactor; // 레이즈는 더 오래 고민
    default:
      return baseDelay + randomFactor;
  }
}

// AI 플레이어의 턴인지 확인
export function isAITurn(gameState: GameState): boolean {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  return currentPlayer?.type === 'ai' && currentPlayer?.isTurn === true;
}

// AI 행동 패턴 분석 (추후 확장용)
export function analyzePlayerBehavior(gameState: GameState, humanPlayer: Player): {
  aggressiveness: number;
  bluffFrequency: number;
  foldRate: number;
} {
  // 기본값 반환 (추후 게임 히스토리 기반으로 확장 가능)
  return {
    aggressiveness: 0.5,
    bluffFrequency: 0.2,
    foldRate: 0.3
  };
}