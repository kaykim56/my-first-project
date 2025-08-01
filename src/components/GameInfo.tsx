'use client';

import { GameState, Player } from '@/types';
import { evaluateHand } from '@/utils/cardUtils';

interface GameInfoProps {
  gameState: GameState;
  humanPlayer: Player;
}

const PHASE_NAMES = {
  'lobby': '로비',
  'dealing': '카드 분배 중',
  'betting': '베팅 라운드',
  'card-exchange': '카드 교체',
  'final-betting': '최종 베팅',
  'showdown': '승부 결정',
  'game-over': '게임 종료'
};

const HAND_RANK_NAMES = {
  'badugi': '바둑이',
  'three-card': '쓰리카드',
  'two-card': '투카드',
  'one-card': '원카드'
};

const HAND_RANK_DESCRIPTIONS = {
  'badugi': '4장 모두 다른 무늬, 다른 숫자 (최고)',
  'three-card': '3장이 서로 다른 무늬',
  'two-card': '2장이 서로 다른 무늬',
  'one-card': '1장만 유효 (최하)'
};

export default function GameInfo({ gameState, humanPlayer }: GameInfoProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const handResult = evaluateHand(humanPlayer.cards);
  const aiPlayer = gameState.players.find(p => p.type === 'ai');

  const formatCards = (cards: Array<{ rank: string; suit: string }>) => {
    return cards.map(card => `${card.rank}${card.suit === 'spades' ? '♠' : card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : '♣'}`).join(' ');
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 space-y-4">
      {/* 게임 상태 */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-yellow-400">
          {PHASE_NAMES[gameState.phase]}
        </h2>
        <div className="text-sm text-gray-300">
          라운드 {gameState.round}
        </div>
      </div>

      {/* 현재 턴 */}
      {currentPlayer && (
        <div className="text-center">
          <div className="text-lg font-semibold">
            {currentPlayer.type === 'human' ? '당신의 턴' : 'AI의 턴'}
          </div>
          {currentPlayer.isTurn && (
            <div className="text-green-400 text-sm animate-pulse">
              행동을 기다리고 있습니다...
            </div>
          )}
        </div>
      )}

      {/* 카드 교체 정보 */}
      {gameState.phase === 'card-exchange' && (
        <div className="bg-blue-900 rounded p-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-300">
              카드 교체
            </div>
            <div className="text-sm text-gray-300">
              남은 교체 횟수: {gameState.exchangesRemaining}회
            </div>
            <div className="text-xs text-gray-400 mt-1">
              교체할 카드를 선택하세요
            </div>
          </div>
        </div>
      )}

      {/* 현재 족보 */}
      <div className="bg-gray-700 rounded p-3">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-400">
            현재 족보: {HAND_RANK_NAMES[handResult.rank]}
          </div>
          <div className="text-sm text-gray-300 mb-2">
            {HAND_RANK_DESCRIPTIONS[handResult.rank]}
          </div>
          
          {/* 유효한 카드들 표시 */}
          <div className="text-sm">
            <span className="text-yellow-300">유효 카드: </span>
            <span className="font-mono text-white">
              {formatCards(handResult.cards)}
            </span>
          </div>
        </div>
      </div>

      {/* 플레이어 정보 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 사용자 */}
        <div className="bg-green-900 rounded p-3">
          <div className="text-center">
            <div className="font-semibold text-green-300">플레이어</div>
            <div className="text-sm text-gray-300">
              칩: {humanPlayer.chips.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">
              베팅: {humanPlayer.currentBet.toLocaleString()}
            </div>
            {humanPlayer.folded && (
              <div className="text-red-400 text-sm">폴드됨</div>
            )}
          </div>
        </div>

        {/* AI */}
        {aiPlayer && (
          <div className="bg-red-900 rounded p-3">
            <div className="text-center">
              <div className="font-semibold text-red-300">AI</div>
              <div className="text-sm text-gray-300">
                칩: {aiPlayer.chips.toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">
                베팅: {aiPlayer.currentBet.toLocaleString()}
              </div>
              {aiPlayer.folded && (
                <div className="text-red-400 text-sm">폴드됨</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 게임 종료 */}
      {gameState.phase === 'game-over' && gameState.winner && (
        <div className="bg-yellow-900 rounded p-3 text-center">
          <div className="text-xl font-bold text-yellow-300">
            🎉 게임 종료 🎉
          </div>
          <div className="text-lg text-white mt-2">
            승자: {gameState.winner.type === 'human' ? '플레이어' : 'AI'}
          </div>
          <div className="text-sm text-gray-300">
            획득한 팟: {gameState.pot > 0 ? '이미 정산됨' : '정산 완료'}
          </div>
        </div>
      )}

      {/* 팁 */}
      <div className="text-xs text-gray-400 text-center border-t border-gray-600 pt-3">
        💡 바둑이에서는 낮은 숫자와 다른 무늬의 카드가 좋습니다
      </div>
    </div>
  );
}