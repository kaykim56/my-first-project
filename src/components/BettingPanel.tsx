'use client';

import { BettingAction, BettingState } from '@/types';

interface BettingPanelProps {
  currentBet: number;
  playerChips: number;
  playerCurrentBet: number;
  pot: number;
  bettingState: BettingState;
  onBettingAction: (action: BettingAction, amount?: number) => void;
  disabled?: boolean;
}

export default function BettingPanel({
  currentBet,
  playerChips,
  playerCurrentBet,
  pot,
  bettingState,
  onBettingAction,
  disabled = false
}: BettingPanelProps) {
  const callAmount = currentBet - playerCurrentBet;
  const minRaise = Math.max(currentBet * 2, bettingState.minRaise);
  const maxRaise = Math.min(playerChips, bettingState.maxRaise);

  const handleRaise = () => {
    // 간단한 레이즈: 현재 베팅의 2배
    const raiseAmount = Math.min(minRaise, playerChips);
    onBettingAction('raise', raiseAmount);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-purple-500/30 shadow-2xl shadow-purple-900/20">
      {/* 모던 팟 정보 */}
      <div className="text-center bg-gradient-to-r from-purple-800/20 to-blue-800/20 rounded-xl p-4 border border-purple-500/20">
        <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-1">
          💎 POT
        </div>
        <div className="text-xl font-bold text-white">
          {pot.toLocaleString()}
        </div>
        <div className="text-sm text-gray-300 mt-1">
          Current: {currentBet.toLocaleString()}
        </div>
      </div>

      {/* 모던 플레이어 정보 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-800/50 px-3 py-2 rounded-xl text-center border border-gray-600/30">
          <div className="text-gray-400 text-xs">CHIPS</div>
          <div className="text-white font-bold">{playerChips.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 px-3 py-2 rounded-xl text-center border border-gray-600/30">
          <div className="text-gray-400 text-xs">BET</div>
          <div className="text-white font-bold">{playerCurrentBet.toLocaleString()}</div>
        </div>
      </div>

      {/* 모던 베팅 버튼들 */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* 폴드 */}
          <button
            onClick={() => onBettingAction('fold')}
            disabled={disabled || !bettingState.canFold}
            className="
              bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
              disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50
              text-white font-bold py-3 px-4 rounded-xl transition-all duration-300
              shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105
              border border-red-500/30
            "
          >
            💀 FOLD
          </button>

          {/* 체크/콜 */}
          {callAmount === 0 ? (
            <button
              onClick={() => onBettingAction('check')}
              disabled={disabled || !bettingState.canCheck}
              className="
                bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700
                disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50
                text-white font-bold py-3 px-4 rounded-xl transition-all duration-300
                shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105
                border border-yellow-500/30
              "
            >
              ✋ CHECK
            </button>
          ) : (
            <button
              onClick={() => onBettingAction('call')}
              disabled={disabled || !bettingState.canCall || callAmount > playerChips}
              className="
                bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50
                text-white font-bold py-3 px-4 rounded-xl transition-all duration-300
                shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105
                border border-green-500/30
              "
            >
              💵 CALL ({callAmount.toLocaleString()})
            </button>
          )}
        </div>

        {/* 레이즈 */}
        <button
          onClick={handleRaise}
          disabled={
            disabled || 
            !bettingState.canRaise || 
            minRaise > playerChips ||
            minRaise > maxRaise
          }
          className="
            w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
            disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50
            text-white font-bold py-4 px-6 rounded-xl transition-all duration-300
            shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105
            border border-purple-500/30 text-lg
          "
        >
          🚀 RAISE ({minRaise.toLocaleString()})
        </button>
      </div>

      {/* 베팅 안내 */}
      {callAmount > 0 && (
        <div className="text-center text-sm text-yellow-300">
          콜하려면 {callAmount.toLocaleString()} 칩이 필요합니다
        </div>
      )}

      {callAmount > playerChips && (
        <div className="text-center text-sm text-red-400">
          칩이 부족합니다!
        </div>
      )}
    </div>
  );
}