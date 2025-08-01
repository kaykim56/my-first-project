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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-950 p-4 relative overflow-hidden">
      {/* 배경 장식 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* 모던 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            ♠ BADUGI POKER ♠
          </h1>
          <p className="text-gray-300 text-lg">Next-Gen AI Poker Experience</p>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 왼쪽: 게임 정보 */}
          <div className="lg:col-span-1">
            <GameInfo gameState={gameState} humanPlayer={humanPlayer} />
          </div>

          {/* 중앙: 게임 보드 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* AI 플레이어 영역 - 모던 디자인 */}
            <div className="bg-gradient-to-br from-red-900/20 via-purple-900/30 to-indigo-900/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 shadow-2xl shadow-red-900/20">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                  🤖 AI OPPONENT
                </h3>
                <div className="text-sm text-gray-300 mt-2 space-x-4">
                  <span className="bg-gray-800/50 px-3 py-1 rounded-full">
                    💰 {aiPlayer.chips.toLocaleString()}
                  </span>
                  <span className="bg-gray-800/50 px-3 py-1 rounded-full">
                    🎯 {aiPlayer.currentBet.toLocaleString()}
                  </span>
                </div>
                {aiPlayer.isTurn && (
                  <div className="text-yellow-400 text-sm animate-pulse mt-3 bg-yellow-900/20 px-4 py-2 rounded-full border border-yellow-500/30">
                    ⚡ AI 분석 중...
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
            </div>

            {/* 모던 팟 영역 */}
            <div className="text-center bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-amber-900/30 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 shadow-2xl shadow-yellow-900/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  💎 POT
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {gameState.pot.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full inline-block">
                  Current Bet: {gameState.currentBet.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 플레이어 영역 - 모던 디자인 */}
            <div className="bg-gradient-to-br from-green-900/20 via-emerald-900/30 to-cyan-900/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-2xl shadow-green-900/20">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  👤 YOUR HAND
                </h3>
                <div className="text-sm text-gray-300 mt-2 space-x-4">
                  <span className="bg-gray-800/50 px-3 py-1 rounded-full">
                    💰 {humanPlayer.chips.toLocaleString()}
                  </span>
                  <span className="bg-gray-800/50 px-3 py-1 rounded-full">
                    🎯 {humanPlayer.currentBet.toLocaleString()}
                  </span>
                </div>
                {isHumanTurn && (
                  <div className="text-green-400 text-sm animate-pulse mt-3 bg-green-900/20 px-4 py-2 rounded-full border border-green-500/30">
                    ⚡ YOUR TURN!
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
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleCardExchange}
                    disabled={uiState.selectedCards.length === 0}
                    className="
                      bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                      disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50
                      text-white font-bold py-3 px-6 rounded-xl transition-all duration-300
                      shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105
                      border border-blue-500/30
                    "
                  >
                    ⚡ EXCHANGE ({uiState.selectedCards.length})
                  </button>
                  <button
                    onClick={handleSkipExchange}
                    className="
                      bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800
                      text-white font-bold py-3 px-6 rounded-xl transition-all duration-300
                      shadow-lg shadow-gray-500/30 hover:shadow-gray-500/50 hover:scale-105
                      border border-gray-500/30
                    "
                  >
                    ⏭ SKIP
                  </button>
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
                bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 
                hover:from-green-700 hover:via-emerald-700 hover:to-cyan-700
                text-white font-black py-4 px-8 rounded-2xl text-xl transition-all duration-300
                shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-110 transform
                border border-green-400/30 backdrop-blur-sm
                animate-pulse hover:animate-none
              "
            >
              🚀 START GAME
            </button>
          )}

          {gameState.phase === 'game-over' && (
            <div className="space-y-6">
              {/* 족보 비교 결과 */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-500">
                <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">
                  🃏 족보 비교 결과 🃏
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 플레이어 족보 */}
                  <div className={`p-4 rounded-lg border-2 ${gameState.winner?.type === 'human' ? 'border-green-500 bg-green-900/20' : 'border-gray-500 bg-gray-900/20'}`}>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-300 mb-2">
                        {gameState.winner?.type === 'human' ? '🏆 ' : ''}플레이어 (당신)
                      </h3>
                      
                      {(() => {
                        const humanHand = evaluateHand(humanPlayer.cards);
                        return (
                          <>
                            <div className="text-2xl font-bold text-white mb-2">
                              {getHandRankName(humanHand.rank)}
                            </div>
                            <div className="text-sm text-gray-300 mb-3">
                              {getHandRankDescription(humanHand.rank)}
                            </div>
                            <div className="text-lg font-mono text-yellow-300 mb-2">
                              유효 카드: {humanHand.cards.map(formatCard).join(' ')}
                            </div>
                            <div className="flex justify-center space-x-1">
                              {humanHand.cards.map((card, index) => (
                                <Card
                                  key={`result-human-${index}`}
                                  card={card}
                                  isHidden={false}
                                  className="transform scale-75"
                                />
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* AI 족보 */}
                  <div className={`p-4 rounded-lg border-2 ${gameState.winner?.type === 'ai' ? 'border-red-500 bg-red-900/20' : 'border-gray-500 bg-gray-900/20'}`}>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-red-300 mb-2">
                        {gameState.winner?.type === 'ai' ? '🏆 ' : ''}AI 플레이어
                      </h3>
                      
                      {(() => {
                        const aiHand = evaluateHand(aiPlayer.cards);
                        return (
                          <>
                            <div className="text-2xl font-bold text-white mb-2">
                              {getHandRankName(aiHand.rank)}
                            </div>
                            <div className="text-sm text-gray-300 mb-3">
                              {getHandRankDescription(aiHand.rank)}
                            </div>
                            <div className="text-lg font-mono text-yellow-300 mb-2">
                              유효 카드: {aiHand.cards.map(formatCard).join(' ')}
                            </div>
                            <div className="flex justify-center space-x-1">
                              {aiHand.cards.map((card, index) => (
                                <Card
                                  key={`result-ai-${index}`}
                                  card={card}
                                  isHidden={false}
                                  className="transform scale-75"
                                />
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 승부 결과 */}
                <div className="mt-6 text-center">
                  {gameState.winner && (
                    <div className="text-2xl font-bold">
                      {gameState.winner.type === 'human' ? (
                        <span className="text-green-400">🎉 축하합니다! 승리했습니다! 🎉</span>
                      ) : (
                        <span className="text-red-400">😔 아쉽게도 패배했습니다. 😔</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 새 게임 버튼 */}
              <div className="text-center">
                <button
                  onClick={newGame}
                  className="
                    bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 
                    hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700
                    text-white font-black py-4 px-8 rounded-2xl text-xl transition-all duration-300
                    shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-110 transform
                    border border-blue-400/30 backdrop-blur-sm
                  "
                >
                  🎮 NEW GAME
                </button>
              </div>
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