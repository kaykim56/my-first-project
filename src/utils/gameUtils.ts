import { GameState, Player, GamePhase, BettingAction, GameSettings } from '@/types';
import { createDeck, drawCards, evaluateHand, compareHands } from './cardUtils';
import { DEFAULT_GAME_SETTINGS } from '@/constants';

// 새 게임 상태 생성
export function createGameState(settings: GameSettings = DEFAULT_GAME_SETTINGS): GameState {
  const deck = createDeck();
  
  // 플레이어 생성 (사용자 + AI)
  const players: Player[] = [
    {
      id: 'human',
      name: '플레이어',
      type: 'human',
      chips: settings.initialChips,
      cards: [],
      currentBet: 0,
      folded: false,
      isDealer: true,
      isTurn: true
    },
    {
      id: 'ai',
      name: 'AI',
      type: 'ai',
      chips: settings.initialChips,
      cards: [],
      currentBet: 0,
      folded: false,
      isDealer: false,
      isTurn: false
    }
  ];

  return {
    id: generateGameId(),
    phase: 'lobby',
    players,
    currentPlayerIndex: 0,
    pot: 0,
    currentBet: 0,
    deck,
    round: 1,
    exchangesRemaining: settings.maxExchanges
  };
}

// 게임 시작
export function startNewRound(gameState: GameState): GameState {
  const newDeck = createDeck();
  
  // 각 플레이어에게 5장씩 카드 분배
  let remainingDeck = newDeck;
  const updatedPlayers = gameState.players.map(player => {
    const { cards, remainingDeck: newRemaining } = drawCards(remainingDeck, 5);
    remainingDeck = newRemaining;
    
    return {
      ...player,
      cards: cards.map(card => ({ ...card, selected: false })),
      currentBet: 0,
      folded: false,
      isTurn: player.id === 'human' // 사용자부터 시작
    };
  });

  return {
    ...gameState,
    phase: 'betting',
    players: updatedPlayers,
    currentPlayerIndex: 0,
    pot: 0,
    currentBet: 0,
    deck: remainingDeck,
    round: 1
  };
}

// 베팅 액션 처리
export function processBettingAction(
  gameState: GameState, 
  playerId: string, 
  action: BettingAction, 
  amount?: number
): GameState {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState;

  const player = gameState.players[playerIndex];
  let newGameState = { ...gameState };
  const newPlayers = [...gameState.players];

  switch (action) {
    case 'call':
      const callAmount = Math.min(gameState.currentBet - player.currentBet, player.chips);
      newPlayers[playerIndex] = {
        ...player,
        currentBet: player.currentBet + callAmount,
        chips: player.chips - callAmount,
        isTurn: false
      };
      newGameState.pot += callAmount;
      break;

    case 'raise':
      const raiseAmount = amount || gameState.currentBet * 2;
      const totalBet = Math.min(raiseAmount, player.chips);
      const addedAmount = totalBet - player.currentBet;
      
      newPlayers[playerIndex] = {
        ...player,
        currentBet: totalBet,
        chips: player.chips - addedAmount,
        isTurn: false
      };
      newGameState.pot += addedAmount;
      newGameState.currentBet = Math.max(newGameState.currentBet, totalBet);
      break;

    case 'fold':
      newPlayers[playerIndex] = {
        ...player,
        folded: true,
        isTurn: false
      };
      break;

    case 'check':
      newPlayers[playerIndex] = {
        ...player,
        isTurn: false
      };
      break;
  }

  newGameState.players = newPlayers;

  // 다음 플레이어 턴으로 이동
  const nextPlayerIndex = getNextPlayerIndex(newGameState, playerIndex);
  if (nextPlayerIndex !== -1) {
    newPlayers[nextPlayerIndex] = {
      ...newPlayers[nextPlayerIndex],
      isTurn: true
    };
    newGameState.currentPlayerIndex = nextPlayerIndex;
  } else {
    // 베팅 라운드 종료
    newGameState = endBettingRound(newGameState);
  }

  return newGameState;
}

// 카드 교체 처리
export function exchangeCards(gameState: GameState, playerId: string, cardIds: string[]): GameState {
  if (gameState.exchangesRemaining <= 0) return gameState;

  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState;

  const player = gameState.players[playerIndex];
  const cardsToKeep = player.cards.filter(card => !cardIds.includes(card.id));
  
  // 새 카드 뽑기
  const { cards: newCards, remainingDeck } = drawCards(gameState.deck, cardIds.length);
  const updatedCards = [...cardsToKeep, ...newCards.map(card => ({ ...card, selected: false }))];

  const newPlayers = [...gameState.players];
  newPlayers[playerIndex] = {
    ...player,
    cards: updatedCards,
    isTurn: false
  };

  // 다음 플레이어로 턴 이동
  const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex);
  if (nextPlayerIndex !== -1) {
    newPlayers[nextPlayerIndex] = {
      ...newPlayers[nextPlayerIndex],
      isTurn: true
    };
  }

  return {
    ...gameState,
    players: newPlayers,
    deck: remainingDeck,
    currentPlayerIndex: nextPlayerIndex,
    exchangesRemaining: gameState.exchangesRemaining - 1
  };
}

// 승자 결정
export function determineWinner(gameState: GameState): GameState {
  const activePlayers = gameState.players.filter(p => !p.folded);
  
  if (activePlayers.length === 1) {
    // 한 명만 남은 경우
    const winner = activePlayers[0];
    const newPlayers = gameState.players.map(p => 
      p.id === winner.id ? { ...p, chips: p.chips + gameState.pot } : p
    );
    
    return {
      ...gameState,
      phase: 'game-over',
      players: newPlayers,
      winner,
      pot: 0
    };
  }

  // 족보 비교
  let bestHand = evaluateHand(activePlayers[0].cards);
  let winner = activePlayers[0];

  for (let i = 1; i < activePlayers.length; i++) {
    const playerHand = evaluateHand(activePlayers[i].cards);
    if (compareHands(playerHand, bestHand) < 0) {
      bestHand = playerHand;
      winner = activePlayers[i];
    }
  }

  const newPlayers = gameState.players.map(p => 
    p.id === winner.id ? { ...p, chips: p.chips + gameState.pot } : p
  );

  return {
    ...gameState,
    phase: 'game-over',
    players: newPlayers,
    winner,
    pot: 0
  };
}

// 베팅 라운드 종료
function endBettingRound(gameState: GameState): GameState {
  const activePlayers = gameState.players.filter(p => !p.folded);
  
  if (activePlayers.length === 1) {
    return determineWinner(gameState);
  }

  if (gameState.round === 1) {
    // 첫 번째 라운드 후 카드 교체 단계
    return {
      ...gameState,
      phase: 'card-exchange',
      round: 2,
      currentBet: 0,
      currentPlayerIndex: 0,
      players: gameState.players.map((p, index) => ({ 
        ...p, 
        currentBet: 0, 
        isTurn: index === 0 // 첫 번째 플레이어(human)부터 시작
      }))
    };
  } else {
    // 두 번째 라운드 후 승부 결정
    return determineWinner(gameState);
  }
}

// 다음 플레이어 인덱스 찾기
export function getNextPlayerIndex(gameState: GameState, currentIndex: number): number {
  const activePlayers = gameState.players.filter(p => !p.folded);
  if (activePlayers.length <= 1) return -1;

  // 모든 플레이어가 같은 금액을 베팅했는지 확인
  const bettingComplete = activePlayers.every(p => 
    p.currentBet === gameState.currentBet || p.chips === 0
  );

  if (bettingComplete) return -1;

  // 다음 활성 플레이어 찾기
  for (let i = 1; i < gameState.players.length; i++) {
    const nextIndex = (currentIndex + i) % gameState.players.length;
    const nextPlayer = gameState.players[nextIndex];
    
    if (!nextPlayer.folded && nextPlayer.currentBet < gameState.currentBet) {
      return nextIndex;
    }
  }

  return -1;
}

// 게임 ID 생성
function generateGameId(): string {
  return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}