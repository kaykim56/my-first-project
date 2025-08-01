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
    <div className="bg-white rounded-lg p-4 space-y-4 shadow-md border border-gray-200">
      {/* 팟 정보 */}
      <div className="text-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
        <div className="text-lg font-bold text-yellow-700">
          팟: {pot.toLocaleString()} 칩
        </div>
        <div className="text-sm text-gray-600">
          현재 베팅: {currentBet.toLocaleString()} 칩
        </div>
      </div>

      {/* 플레이어 정보 */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>보유 칩: {playerChips.toLocaleString()}</span>
        <span>현재 베팅: {playerCurrentBet.toLocaleString()}</span>
      </div>

      {/* 베팅 버튼들 */}
      <div className="grid grid-cols-2 gap-2">
        {/* 폴드 */}
        <button
          onClick={() => onBettingAction('fold')}
          disabled={disabled || !bettingState.canFold}
          className="
            bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:opacity-50
            text-white font-bold py-2 px-4 rounded transition-colors
          "
        >
          폴드
        </button>

        {/* 체크/콜 */}
        {callAmount === 0 ? (
          <button
            onClick={() => onBettingAction('check')}
            disabled={disabled || !bettingState.canCheck}
            className="
              bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:opacity-50
              text-white font-bold py-2 px-4 rounded transition-colors
            "
          >
            체크
          </button>
        ) : (
          <button
            onClick={() => onBettingAction('call')}
            disabled={disabled || !bettingState.canCall || callAmount > playerChips}
            className="
              bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-50
              text-white font-bold py-2 px-4 rounded transition-colors
            "
          >
            콜 ({callAmount.toLocaleString()})
          </button>
        )}

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
            bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:opacity-50
            text-white font-bold py-2 px-4 rounded transition-colors col-span-2
          "
        >
          레이즈 ({minRaise.toLocaleString()})
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