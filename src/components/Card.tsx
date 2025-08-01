'use client';

import { Card as CardType } from '@/types';
import { UI_CONSTANTS } from '@/constants';

interface CardProps {
  card: CardType;
  isHidden?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

const SUIT_SYMBOLS = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
};

const SUIT_COLORS = {
  spades: 'text-purple-300',
  hearts: 'text-pink-400', 
  diamonds: 'text-cyan-400',
  clubs: 'text-green-400'
};

export default function Card({ 
  card, 
  isHidden = false, 
  isSelected = false,
  isHovered = false,
  onClick, 
  onMouseEnter,
  onMouseLeave,
  className = '' 
}: CardProps) {
  const handleClick = () => {
    if (onClick && !isHidden) {
      onClick();
    }
  };

  return (
    <div
      className={`
        relative cursor-pointer select-none transform transition-all duration-200
        ${isSelected ? 'scale-105 -translate-y-2' : ''}
        ${isHovered ? 'scale-102' : ''}
        ${onClick ? 'hover:scale-102' : ''}
        ${className}
      `}
      style={{
        width: UI_CONSTANTS.CARD_WIDTH,
        height: UI_CONSTANTS.CARD_HEIGHT
      }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 모던 카드 본체 */}
      <div className={`
        w-full h-full rounded-2xl border shadow-2xl backdrop-blur-sm transition-all duration-300
        ${isSelected 
          ? 'border-cyan-400 shadow-cyan-400/50 shadow-2xl bg-gray-900/90 scale-105' 
          : 'border-gray-600/50 shadow-purple-900/30'
        }
        ${isHidden 
          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 border-purple-500/50' 
          : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50'
        }
        flex flex-col justify-between p-3 relative overflow-hidden
      `}>
        
        {/* 카드 내부 글로우 효과 */}
        <div className={`absolute inset-0 rounded-2xl ${
          isSelected 
            ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10' 
            : isHidden 
              ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'
              : 'bg-gradient-to-br from-gray-500/5 to-transparent'
        }`}></div>
        
        {isHidden ? (
          // 모던 카드 뒷면
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <div className="text-center">
              <div className="text-4xl mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                ♦
              </div>
              <div className="w-8 h-8 mx-auto bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full opacity-60 animate-pulse"></div>
              <div className="text-4xl mt-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ♠
              </div>
            </div>
          </div>
        ) : (
          // 모던 카드 앞면
          <>
            {/* 상단 좌측 */}
            <div className={`text-lg font-black ${SUIT_COLORS[card.suit]} relative z-10 drop-shadow-lg`}>
              <div className="leading-none">{card.rank}</div>
              <div className="text-xl leading-none">{SUIT_SYMBOLS[card.suit]}</div>
            </div>

            {/* 중앙 심볼 - 네온 효과 */}
            <div className={`text-5xl ${SUIT_COLORS[card.suit]} self-center relative z-10 drop-shadow-2xl filter ${
              card.suit === 'spades' ? 'drop-shadow-[0_0_10px_rgba(196,181,253,0.8)]' :
              card.suit === 'hearts' ? 'drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]' :
              card.suit === 'diamonds' ? 'drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' :
              'drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]'
            }`}>
              {SUIT_SYMBOLS[card.suit]}
            </div>

            {/* 하단 우측 (뒤집어짐) */}
            <div className={`text-lg font-black ${SUIT_COLORS[card.suit]} self-end transform rotate-180 relative z-10 drop-shadow-lg`}>
              <div className="leading-none">{card.rank}</div>
              <div className="text-xl leading-none">{SUIT_SYMBOLS[card.suit]}</div>
            </div>
          </>
        )}
      </div>

      {/* 모던 선택 표시 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      )}
    </div>
  );
}