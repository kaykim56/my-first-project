import { Card, Suit, Rank, HandResult, HandRank } from '@/types';
import { SUITS, RANKS, CARD_VALUES, HAND_RANKINGS } from '@/constants';

// Re-export CARD_VALUES for other modules
export { CARD_VALUES };

// 새로운 덱 생성
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
        selected: false
      });
    }
  }
  
  return shuffleDeck(deck);
}

// 덱 섞기 (Fisher-Yates 알고리즘)
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// 카드 n장 뽑기
export function drawCards(deck: Card[], count: number): { cards: Card[], remainingDeck: Card[] } {
  const cards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  
  return { cards, remainingDeck };
}

// 바둑이 족보 판별 (낮을수록 좋음)
export function evaluateHand(cards: Card[]): HandResult {
  // 중복 제거를 위한 맵
  const suitMap = new Map<Suit, Card>();
  const rankMap = new Map<Rank, Card>();
  
  // 각 무늬와 숫자별로 가장 낮은 카드만 유지
  for (const card of cards) {
    // 같은 무늬가 있으면 더 낮은 값의 카드를 선택
    if (!suitMap.has(card.suit) || CARD_VALUES[card.rank] < CARD_VALUES[suitMap.get(card.suit)!.rank]) {
      suitMap.set(card.suit, card);
    }
    
    // 같은 숫자가 있으면 무시 (바둑이에서는 같은 숫자 불가)
    if (!rankMap.has(card.rank)) {
      rankMap.set(card.rank, card);
    }
  }
  
  // 서로 다른 무늬이면서 서로 다른 숫자인 카드들만 선택
  const validCards: Card[] = [];
  const usedRanks = new Set<Rank>();
  
  for (const [suit, card] of suitMap) {
    if (!usedRanks.has(card.rank)) {
      validCards.push(card);
      usedRanks.add(card.rank);
    }
  }
  
  // 값이 낮은 순으로 정렬
  validCards.sort((a, b) => CARD_VALUES[a.rank] - CARD_VALUES[b.rank]);
  
  // 족보 결정
  let rank: HandRank;
  let resultCards: Card[];
  
  if (validCards.length >= 4) {
    rank = 'badugi';
    resultCards = validCards.slice(0, 4);
  } else if (validCards.length === 3) {
    rank = 'three-card';
    resultCards = validCards;
  } else if (validCards.length === 2) {
    rank = 'two-card';
    resultCards = validCards;
  } else {
    rank = 'one-card';
    resultCards = validCards.slice(0, 1);
  }
  
  // 비교값 계산 (낮을수록 좋음)
  const value = calculateHandValue(rank, resultCards);
  
  return {
    rank,
    cards: resultCards,
    value
  };
}

// 족보 비교값 계산
function calculateHandValue(rank: HandRank, cards: Card[]): number {
  const baseValue = HAND_RANKINGS[rank] * 100000000; // 족보별 기본값
  
  // 카드들의 값을 조합하여 세부 비교값 생성
  let cardValue = 0;
  const multipliers = [1000000, 10000, 100, 1]; // 4장까지 지원
  
  for (let i = 0; i < cards.length; i++) {
    cardValue += CARD_VALUES[cards[i].rank] * multipliers[i];
  }
  
  return baseValue + cardValue;
}

// 두 족보 비교 (음수: hand1이 좋음, 양수: hand2가 좋음, 0: 동점)
export function compareHands(hand1: HandResult, hand2: HandResult): number {
  return hand1.value - hand2.value;
}

// 카드가 바둑이에 유효한지 확인 (서로 다른 무늬, 서로 다른 숫자)
export function isValidBadugiCard(newCard: Card, existingCards: Card[]): boolean {
  return !existingCards.some(card => 
    card.suit === newCard.suit || card.rank === newCard.rank
  );
}

// 카드 배열에서 최적의 바둑이 조합 찾기
export function findBestBadugiCombination(cards: Card[]): Card[] {
  if (cards.length <= 4) {
    return evaluateHand(cards).cards;
  }
  
  // 모든 4장 조합을 시도하여 최적의 조합 찾기
  let bestHand: HandResult | null = null;
  const combinations = getCombinations(cards, 4);
  
  for (const combination of combinations) {
    const hand = evaluateHand(combination);
    if (!bestHand || compareHands(hand, bestHand) < 0) {
      bestHand = hand;
    }
  }
  
  return bestHand?.cards || [];
}

// 조합 생성 헬퍼 함수
function getCombinations<T>(array: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (array.length === 0) return [];
  
  const [first, ...rest] = array;
  const withFirst = getCombinations(rest, size - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, size);
  
  return [...withFirst, ...withoutFirst];
}