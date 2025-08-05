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
  
  // 각 플레이어에게 4장씩 카드 분배
  let remainingDeck = newDeck;
  const updatedPlayers = gameState.players.map(player => {
    const { cards, remainingDeck: newRemaining } = drawCards(remainingDeck, 4);
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
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState;

  const player = gameState.players[playerIndex];
  const cardsToKeep = player.cards.filter(card => !cardIds.includes(card.id));
  
  // 새 카드 뽑기 (교체할 카드가 있는 경우에만)
  let remainingDeck = gameState.deck;
  let updatedCards = player.cards;
  
  if (cardIds.length > 0) {
    const { cards: newCards, remainingDeck: newDeck } = drawCards(gameState.deck, cardIds.length);
    remainingDeck = newDeck;
    updatedCards = [...cardsToKeep, ...newCards.map(card => ({ ...card, selected: false }))];
  }

  const newPlayers = [...gameState.players];
  newPlayers[playerIndex] = {
    ...player,
    cards: updatedCards,
    isTurn: false
  };

  // 다음 플레이어로 턴 이동 또는 최종 베팅 단계로 진행
  let nextPlayerIndex = gameState.currentPlayerIndex;
  let newPhase = gameState.phase;
  
  // 다음 플레이어가 있는지 확인 (간단한 2인 게임 로직)
  if (playerIndex === 0 && !gameState.players[1].folded) {
    // 첫 번째 플레이어(human)가 교체했으면 AI 턴  
    nextPlayerIndex = 1;
    newPlayers[1] = {
      ...newPlayers[1],
      isTurn: true
    };
  } else {
    // AI가 교체했거나 모든 플레이어가 교체 완료 -> 최종 베팅 단계
    newPhase = 'final-betting';
    nextPlayerIndex = 0;
    newPlayers[0] = {
      ...newPlayers[0],
      isTurn: true
    };
    // 모든 플레이어의 베팅을 리셋 (final-betting 단계용)
    newPlayers.forEach((player, index) => {
      newPlayers[index] = {
        ...player,
        currentBet: 0,
        isTurn: index === 0 // 첫 번째 플레이어(human)부터 시작
      };
    });
  }

  return {
    ...gameState,
    phase: newPhase,
    players: newPlayers,
    deck: remainingDeck,
    currentPlayerIndex: nextPlayerIndex,
    currentBet: newPhase === 'final-betting' ? 0 : gameState.currentBet,
    round: newPhase === 'final-betting' ? 2 : gameState.round // final-betting은 2라운드
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
  } else if (gameState.phase === 'final-betting') {
    // 최종 베팅 라운드 후 승부 결정
    return determineWinner(gameState);
  } else {
    // 기타 상황에서도 승부 결정
    return determineWinner(gameState);
  }
}

// 다음 플레이어 인덱스 찾기
export function getNextPlayerIndex(gameState: GameState, currentIndex: number): number {
  const activePlayers = gameState.players.filter(p => !p.folded);
  if (activePlayers.length <= 1) return -1;

  // 모든 활성 플레이어가 행동했는지 확인
  const allPlayersActed = activePlayers.every(p => !p.isTurn);
  
  // 모든 플레이어가 같은 금액을 베팅했는지 확인
  const bettingComplete = activePlayers.every(p => 
    p.currentBet === gameState.currentBet || p.chips === 0
  );

  // 모든 플레이어가 행동했고 베팅이 완료되었으면 라운드 종료
  if (allPlayersActed && bettingComplete) return -1;

  // 다음 활성 플레이어 찾기
  for (let i = 1; i < gameState.players.length; i++) {
    const nextIndex = (currentIndex + i) % gameState.players.length;
    const nextPlayer = gameState.players[nextIndex];
    
    if (!nextPlayer.folded) {
      // 베팅이 필요하거나 아직 행동하지 않은 플레이어
      if (nextPlayer.currentBet < gameState.currentBet || nextPlayer.isTurn) {
        return nextIndex;
      }
    }
  }

  return -1;
}

// 게임 ID 생성
function generateGameId(): string {
  return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}