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
    <div className="bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-blue-900/30 backdrop-blur-sm text-white rounded-2xl p-6 space-y-6 border border-indigo-500/30 shadow-2xl shadow-indigo-900/20">
      {/* 모던 게임 상태 */}
      <div className="text-center bg-gradient-to-r from-indigo-800/20 to-purple-800/20 rounded-xl p-4 border border-indigo-500/20">
        <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-1">
          {PHASE_NAMES[gameState.phase]}
        </h2>
        <div className="text-sm text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full inline-block">
          Round {gameState.round}
        </div>
      </div>

      {/* 모던 현재 턴 */}
      {currentPlayer && (
        <div className="text-center bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-xl p-4 border border-gray-600/30">
          <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {currentPlayer.type === 'human' ? '👤 YOUR TURN' : '🤖 AI TURN'}
          </div>
          {currentPlayer.isTurn && (
            <div className="text-green-400 text-sm animate-pulse mt-2 bg-green-900/20 px-3 py-1 rounded-full border border-green-500/30">
              ⚡ Waiting for action...
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