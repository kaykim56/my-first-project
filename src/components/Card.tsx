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
  spades: 'text-black',
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black'
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
      {/* 심플 카드 본체 */}
      <div className={`
        w-full h-full rounded-lg border-2 shadow-lg transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 shadow-blue-300 bg-blue-50 scale-105' 
          : 'border-gray-300 shadow-gray-200'
        }
        ${isHidden 
          ? 'bg-blue-600 border-blue-700' 
          : 'bg-white border-gray-300'
        }
        flex flex-col justify-between p-2
      `}>
        
        {isHidden ? (
          // 심플 카드 뒷면
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-blue-200 text-2xl font-bold">
              🂠
            </div>
          </div>
        ) : (
          // 심플 카드 앞면
          <>
            {/* 상단 좌측 */}
            <div className={`text-sm font-bold ${SUIT_COLORS[card.suit]}`}>
              <div>{card.rank}</div>
              <div>{SUIT_SYMBOLS[card.suit]}</div>
            </div>

            {/* 중앙 심볼 */}
            <div className={`text-3xl ${SUIT_COLORS[card.suit]} self-center`}>
              {SUIT_SYMBOLS[card.suit]}
            </div>

            {/* 하단 우측 (뒤집어짐) */}
            <div className={`text-sm font-bold ${SUIT_COLORS[card.suit]} self-end transform rotate-180`}>
              <div>{card.rank}</div>
              <div>{SUIT_SYMBOLS[card.suit]}</div>
            </div>
          </>
        )}
      </div>

      {/* 심플 선택 표시 */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}