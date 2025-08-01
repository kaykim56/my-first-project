'use client';

import { useReducer, useCallback, useEffect } from 'react';
import { GameState, BettingAction, BettingState, UIState } from '@/types';
import { 
  createGameState, 
  startNewRound, 
  processBettingAction, 
  exchangeCards,
  determineWinner 
} from '@/utils/gameUtils';
import { 
  getAIBettingAction, 
  getAICardExchange, 
  isAITurn,
  getAIActionDelay 
} from '@/utils/aiUtils';

// 게임 액션 타입
type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'BETTING_ACTION'; playerId: string; action: BettingAction; amount?: number }
  | { type: 'EXCHANGE_CARDS'; playerId: string; cardIds: string[] }
  | { type: 'TOGGLE_CARD_SELECTION'; cardId: string }
  | { type: 'RESET_CARD_SELECTION' }
  | { type: 'SET_HOVER_CARD'; cardId?: string }
  | { type: 'AI_ACTION'; action: BettingAction; amount?: number }
  | { type: 'AI_CARD_EXCHANGE'; cardIds: string[] }
  | { type: 'PROCEED_TO_FINAL_BETTING' }
  | { type: 'NEW_GAME' };

// 게임 상태 + UI 상태
interface GameWithUI {
  game: GameState;
  ui: UIState;
}

// 리듀서 함수
function gameReducer(state: GameWithUI, action: GameAction): GameWithUI {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        game: startNewRound(state.game),
        ui: { ...state.ui, selectedCards: [], animating: false }
      };

    case 'BETTING_ACTION':
      const newGameState = processBettingAction(state.game, action.playerId, action.action, action.amount);
      return {
        ...state,
        game: newGameState,
        ui: { ...state.ui, animating: false }
      };

    case 'EXCHANGE_CARDS':
      const exchangedGame = exchangeCards(state.game, action.playerId, action.cardIds);
      return {
        ...state,
        game: exchangedGame,
        ui: { ...state.ui, selectedCards: [], animating: true }
      };

    case 'TOGGLE_CARD_SELECTION':
      const selectedCards = state.ui.selectedCards.includes(action.cardId)
        ? state.ui.selectedCards.filter(id => id !== action.cardId)
        : [...state.ui.selectedCards, action.cardId];
      
      return {
        ...state,
        ui: { ...state.ui, selectedCards }
      };

    case 'RESET_CARD_SELECTION':
      return {
        ...state,
        ui: { ...state.ui, selectedCards: [] }
      };

    case 'SET_HOVER_CARD':
      return {
        ...state,
        ui: { ...state.ui, hoveredCard: action.cardId }
      };

    case 'AI_ACTION':
      const aiGameState = processBettingAction(
        state.game, 
        'ai', 
        action.action, 
        action.amount
      );
      return {
        ...state,
        game: aiGameState,
        ui: { ...state.ui, animating: false }
      };

    case 'AI_CARD_EXCHANGE':
      const aiExchangedGame = exchangeCards(state.game, 'ai', action.cardIds);
      
      return {
        ...state,
        game: aiExchangedGame,
        ui: { ...state.ui, animating: true }
      };

    case 'PROCEED_TO_FINAL_BETTING':
      return {
        ...state,
        game: { ...state.game, phase: 'final-betting' }
      };

    case 'NEW_GAME':
      return {
        game: createGameState(),
        ui: {
          selectedCards: [],
          showingCards: true,
          animating: false,
          hoveredCard: undefined,
          draggedCard: undefined
        }
      };

    default:
      return state;
  }
}

// 초기 상태
const initialState: GameWithUI = {
  game: createGameState(),
  ui: {
    selectedCards: [],
    showingCards: true,
    animating: false,
    hoveredCard: undefined,
    draggedCard: undefined
  }
};

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  const humanPlayer = state.game.players.find(p => p.type === 'human');
  const aiPlayer = state.game.players.find(p => p.type === 'ai');

  // 베팅 상태 계산
  const getBettingState = useCallback((): BettingState => {
    if (!humanPlayer) {
      return {
        currentBet: 0,
        minRaise: 0,
        maxRaise: 0,
        canCheck: false,
        canCall: false,
        canRaise: false,
        canFold: false
      };
    }

    const callAmount = state.game.currentBet - humanPlayer.currentBet;
    
    return {
      currentBet: state.game.currentBet,
      minRaise: Math.max(state.game.currentBet * 2, 20),
      maxRaise: humanPlayer.chips,
      canCheck: callAmount === 0,
      canCall: callAmount > 0 && callAmount <= humanPlayer.chips,
      canRaise: humanPlayer.chips > state.game.currentBet,
      canFold: true
    };
  }, [state.game, humanPlayer]);

  // 게임 시작
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  // 베팅 액션
  const handleBettingAction = useCallback((action: BettingAction, amount?: number) => {
    if (!humanPlayer) return;
    dispatch({ type: 'BETTING_ACTION', playerId: humanPlayer.id, action, amount });
  }, [humanPlayer]);

  // 카드 선택 토글
  const toggleCardSelection = useCallback((cardId: string) => {
    dispatch({ type: 'TOGGLE_CARD_SELECTION', cardId });
  }, []);

  // 카드 교체 실행
  const exchangeSelectedCards = useCallback(() => {
    if (!humanPlayer) return;
    dispatch({ type: 'EXCHANGE_CARDS', playerId: humanPlayer.id, cardIds: state.ui.selectedCards });
  }, [humanPlayer, state.ui.selectedCards]);

  // 카드 선택 초기화
  const resetCardSelection = useCallback(() => {
    dispatch({ type: 'RESET_CARD_SELECTION' });
  }, []);

  // 카드 호버
  const setHoverCard = useCallback((cardId?: string) => {
    dispatch({ type: 'SET_HOVER_CARD', cardId });
  }, []);

  // 새 게임
  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  // AI 턴 처리
  useEffect(() => {
    if (!isAITurn(state.game) || !aiPlayer) return;

    const handleAITurn = async () => {
      if (state.game.phase === 'betting' || state.game.phase === 'final-betting') {
        // AI 베팅 결정
        const aiAction = getAIBettingAction(state.game, aiPlayer);
        const delay = getAIActionDelay(aiAction.action);
        
        setTimeout(() => {
          dispatch({ 
            type: 'AI_ACTION', 
            action: aiAction.action, 
            amount: aiAction.amount 
          });
        }, delay);
        
      } else if (state.game.phase === 'card-exchange') {
        // AI 카드 교체 결정
        const cardsToExchange = getAICardExchange(aiPlayer);
        
        setTimeout(() => {
          dispatch({ 
            type: 'AI_CARD_EXCHANGE', 
            cardIds: cardsToExchange 
          });
        }, 2000); // 2초 대기
      }
    };

    handleAITurn();
  }, [state.game.phase, state.game.currentPlayerIndex, aiPlayer]);

  return {
    // 상태
    gameState: state.game,
    uiState: state.ui,
    humanPlayer,
    aiPlayer,
    bettingState: getBettingState(),
    
    // 액션
    startGame,
    handleBettingAction,
    toggleCardSelection,
    exchangeSelectedCards,
    resetCardSelection,
    setHoverCard,
    newGame,
    
    // 유틸리티
    isHumanTurn: humanPlayer?.isTurn === true,
    isAITurn: isAITurn(state.game),
    canExchangeCards: state.game.phase === 'card-exchange' && state.game.exchangesRemaining > 0
  };
}