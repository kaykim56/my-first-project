'use client';

import { useGame } from '@/hooks/useGame';
import Card from './Card';
import BettingPanel from './BettingPanel';
import GameInfo from './GameInfo';
import { evaluateHand } from '@/utils/cardUtils';
import { Player } from '@/types';

export default function GameBoard() {
  const {
    gameState,
    uiState,
    humanPlayer,
    aiPlayer,
    bettingState,
    startGame,
    handleBettingAction,
    toggleCardSelection,
    exchangeSelectedCards,
    resetCardSelection,
    setHoverCard,
    newGame,
    isHumanTurn,
    isAITurn,
    canExchangeCards
  } = useGame();

  if (!humanPlayer || !aiPlayer) {
    return <div>게임을 로딩하는 중...</div>;
  }

  const handleCardClick = (cardId: string) => {
    if (gameState.phase === 'card-exchange' && isHumanTurn) {
      toggleCardSelection(cardId);
    }
  };

  const handleCardExchange = () => {
    exchangeSelectedCards();
  };

  const handleSkipExchange = () => {
    exchangeSelectedCards(); // 빈 배열로 교체 (스킵)
  };

  // 족보 이름 변환
  const getHandRankName = (rank: string) => {
    const names: Record<string, string> = {
      'badugi': '바둑이',
      'three-card': '쓰리카드',
      'two-card': '투카드',
      'one-card': '원카드'
    };
    return names[rank] || rank;
  };

  // 족보 설명
  const getHandRankDescription = (rank: string) => {
    const descriptions: Record<string, string> = {
      'badugi': '4장 모두 다른 무늬, 다른 숫자 (최고)',
      'three-card': '3장이 서로 다른 무늬, 다른 숫자',
      'two-card': '2장이 서로 다른 무늬, 다른 숫자',
      'one-card': '1장만 유효 (최하)'
    };
    return descriptions[rank] || '';
  };

  // 카드 표시 형식
  const formatCard = (card: { rank: string; suit: string }) => {
    const suitSymbols: Record<string, string> = {
      'spades': '♠',
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣'
    };
    return `${card.rank}${suitSymbols[card.suit] || card.suit}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* 심플 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🃏 바둑이 포커
          </h1>
          <p className="text-gray-600">AI와 함께하는 바둑이 게임</p>
          <div className="w-24 h-0.5 bg-gray-400 mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 왼쪽: 게임 정보 */}
          <div className="lg:col-span-1">
            <GameInfo gameState={gameState} humanPlayer={humanPlayer} />
          </div>

          {/* 중앙: 게임 보드 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* AI 플레이어 영역 */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-red-600">
                  🤖 AI 플레이어
                </h3>
                <div className="text-sm text-gray-600 mt-2">
                  칩: {aiPlayer.chips.toLocaleString()} | 베팅: {aiPlayer.currentBet.toLocaleString()}
                </div>
                {aiPlayer.isTurn && (
                  <div className="text-orange-600 text-sm mt-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    🤖 AI가 생각 중...
                  </div>
                )}
              </div>
              
                            {/* AI 카드 */}
              <div className="flex justify-center space-x-2">
                {gameState.phase === 'game-over' ? (
                  // 게임 오버 시 실제 AI 카드 공개
                  aiPlayer.cards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      isHidden={false}
                      className="transform scale-90"
                    />
                  ))
                ) : (
                  // 게임 진행 중에는 뒷면 표시
                  aiPlayer.cards.map((_, index) => (
                    <Card
                      key={`ai-card-${index}`}
                      card={{ suit: 'spades', rank: 'A', id: `ai-${index}` }}
                      isHidden={true}
                      className="transform scale-90"
                    />
                  ))
                )}
              </div>
              
              {/* AI 승부 결과 */}
              {gameState.phase === 'game-over' && (
                <div className="mt-3">
                  {(() => {
                    const aiHand = evaluateHand(aiPlayer.cards);
                    return (
                      <div className={`text-center p-3 rounded-lg border-2 ${
                        gameState.winner?.type === 'ai' 
                          ? 'bg-red-100 border-red-500 text-red-700' 
                          : 'bg-gray-100 border-gray-400 text-gray-700'
                      }`}>
                        {gameState.winner?.type === 'ai' && (
                          <div className="text-lg font-bold text-red-600 mb-1">🏆 승리!</div>
                        )}
                        <div className="font-semibold">{getHandRankName(aiHand.rank)}</div>
                        <div className="text-sm">{aiHand.cards.map(formatCard).join(' ')}</div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 팟 영역 */}
            <div className="text-center bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300 shadow-md">
              <div className="text-2xl font-bold text-yellow-700 mb-2">
                💰 팟: {gameState.pot.toLocaleString()} 칩
              </div>
              <div className="text-sm text-gray-600">
                현재 베팅: {gameState.currentBet.toLocaleString()} 칩
              </div>
              
              {/* 게임 결과 요약 */}
              {gameState.phase === 'game-over' && gameState.winner && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-gray-800">
                    {gameState.winner.type === 'human' ? (
                      <span className="text-green-600">🎉 플레이어 승리!</span>
                    ) : (
                      <span className="text-red-600">🤖 AI 승리!</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 플레이어 영역 */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-green-600">
                  👤 플레이어 (당신)
                </h3>
                <div className="text-sm text-gray-600 mt-2">
                  칩: {humanPlayer.chips.toLocaleString()} | 베팅: {humanPlayer.currentBet.toLocaleString()}
                </div>
                {isHumanTurn && (
                  <div className="text-green-600 text-sm mt-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    ⭐ 당신의 차례입니다!
                  </div>
                )}
              </div>
              
              {/* 플레이어 카드 */}
              <div className="flex justify-center space-x-2 mb-4">
                {humanPlayer.cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    isSelected={uiState.selectedCards.includes(card.id)}
                    isHovered={uiState.hoveredCard === card.id}
                    onClick={() => handleCardClick(card.id)}
                    onMouseEnter={() => setHoverCard(card.id)}
                    onMouseLeave={() => setHoverCard(undefined)}
                  />
                ))}
              </div>

              {/* 카드 교체 버튼 */}
              {gameState.phase === 'card-exchange' && isHumanTurn && (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={handleCardExchange}
                    disabled={uiState.selectedCards.length === 0}
                    className="
                      bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:opacity-50
                      text-white font-bold py-2 px-4 rounded transition-colors
                    "
                  >
                    선택한 카드 교체 ({uiState.selectedCards.length}장)
                  </button>
                  <button
                    onClick={handleSkipExchange}
                    className="
                      bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors
                    "
                  >
                    교체 안함
                  </button>
                </div>
              )}
              
              {/* 플레이어 승부 결과 */}
              {gameState.phase === 'game-over' && (
                <div className="mt-3">
                  {(() => {
                    const humanHand = evaluateHand(humanPlayer.cards);
                    return (
                      <div className={`text-center p-3 rounded-lg border-2 ${
                        gameState.winner?.type === 'human' 
                          ? 'bg-green-100 border-green-500 text-green-700' 
                          : 'bg-gray-100 border-gray-400 text-gray-700'
                      }`}>
                        {gameState.winner?.type === 'human' && (
                          <div className="text-lg font-bold text-green-600 mb-1">🏆 승리!</div>
                        )}
                        <div className="font-semibold">{getHandRankName(humanHand.rank)}</div>
                        <div className="text-sm">{humanHand.cards.map(formatCard).join(' ')}</div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 베팅 패널 */}
          <div className="lg:col-span-1">
            {(gameState.phase === 'betting' || gameState.phase === 'final-betting') && (
              <BettingPanel
                currentBet={gameState.currentBet}
                playerChips={humanPlayer.chips}
                playerCurrentBet={humanPlayer.currentBet}
                pot={gameState.pot}
                bettingState={bettingState}
                onBettingAction={handleBettingAction}
                disabled={!isHumanTurn || uiState.animating}
              />
            )}
          </div>
        </div>

        {/* 게임 상태별 액션 버튼 */}
        <div className="mt-8 text-center space-x-4">
          {gameState.phase === 'lobby' && (
            <button
              onClick={startGame}
              className="
                bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors
              "
            >
              🎮 게임 시작
            </button>
          )}

                    {gameState.phase === 'game-over' && (
            <div className="text-center">
              <button
                onClick={newGame}
                className="
                  bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors
                "
              >
                🔄 새 게임
              </button>
            </div>
          )}
        </div>

        {/* 게임 설명 */}
        <div className="mt-8 bg-gray-800/50 rounded-lg p-4 text-center">
          <details>
            <summary className="text-yellow-400 font-semibold cursor-pointer hover:text-yellow-300">
              🎯 바둑이 게임 규칙
            </summary>
            <div className="mt-4 text-sm text-gray-300 text-left max-w-2xl mx-auto">
              <div className="space-y-2">
                <p><strong>목표:</strong> 가장 낮은 족보를 만드는 것이 목표입니다.</p>
                <p><strong>족보 순위:</strong> 바둑이 {'>'}  쓰리카드 {'>'} 투카드 {'>'} 원카드</p>
                <p><strong>바둑이:</strong> 4장 모두 다른 무늬, 다른 숫자 (최고)</p>
                <p><strong>카드 교체:</strong> 원하지 않는 카드를 선택하여 새 카드로 교체할 수 있습니다.</p>
                <p><strong>베팅:</strong> 폴드(포기), 체크/콜(따라가기), 레이즈(올리기) 중 선택하세요.</p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}