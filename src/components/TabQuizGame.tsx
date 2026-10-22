import React, { useState } from 'react';
import { Question, StudentProfile } from '../types';
import { STATIONS, QUIZ_QUESTIONS } from '../data/quizData';
import { MascotKienSang } from './MascotKienSang';
import { CaptainChallengeCardGame } from './CaptainChallengeCardGame';
import { 
  Ship, 
  Coins, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Award,
  ChevronRight,
  BookOpen,
  MapPin,
  Trophy,
  Layers,
  Compass
} from 'lucide-react';
import { playTingTingSound, playHintSound, playFanfareSound, playClickSound, playFireworksSound } from '../utils/audio';
import { triggerFireworksConfetti } from '../utils/confetti';
import confetti from 'canvas-confetti';

interface TabQuizGameProps {
  profile: StudentProfile;
  onRewardCoins: (amount: number, questionId: string) => void;
  onCompleteStation: (stationId: number) => void;
}

export const TabQuizGame: React.FC<TabQuizGameProps> = ({
  profile,
  onRewardCoins,
  onCompleteStation,
}) => {
  const [gameMode, setGameMode] = useState<'lighthouses' | 'card_challenge'>('card_challenge');
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [floatingCoin, setFloatingCoin] = useState<boolean>(false);

  // Filter questions for current station and grade level
  const stationQuestions = QUIZ_QUESTIONS.filter((q) => {
    if (q.stationId !== selectedStationId) return false;
    if (profile.gradeLevel === 'tieuhoc') {
      return q.gradeLevel === 'all';
    }
    if (profile.gradeLevel === 'thcs') {
      return q.gradeLevel === 'all' || q.gradeLevel === 'thcs';
    }
    // THPT sees all questions including high school specialization
    return true;
  });

  const currentQ = stationQuestions[currentQuestionIndex] || stationQuestions[0];
  const isQuestionAnsweredCorrectly = currentQ ? profile.answeredQuestions[currentQ.id] : false;

  const currentStation = STATIONS.find(s => s.id === selectedStationId) || STATIONS[0];

  // Answer handler
  const handleSelectOption = (index: number) => {
    if (hasSubmitted) return;
    playClickSound();
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || hasSubmitted || !currentQ) return;
    setHasSubmitted(true);

    if (selectedAnswer === currentQ.correctIndex) {
      // Correct!
      playTingTingSound();
      setFloatingCoin(true);
      setTimeout(() => setFloatingCoin(false), 1500);

      // Trigger Confetti
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00E5FF', '#FFD700', '#FF7A00', '#10B981']
      });

      // Award coins if first time answering correctly
      if (!profile.answeredQuestions[currentQ.id]) {
        onRewardCoins(10, currentQ.id);
      }

      // Check if this completes the station (hoàn thành một chặng đường hải trình)
      const willAllBeAnswered = stationQuestions.every(q => 
        q.id === currentQ.id ? true : profile.answeredQuestions[q.id]
      );
      if (willAllBeAnswered && !profile.completedStations.includes(selectedStationId)) {
        onCompleteStation(selectedStationId);
        playFireworksSound();
        triggerFireworksConfetti();
      }
    } else {
      // Incorrect
      playHintSound();
      setShowHint(true);
    }
  };

  const handleNextQuestion = () => {
    playClickSound();
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setShowHint(false);

    if (currentQuestionIndex < stationQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Next station if available
      if (selectedStationId < STATIONS.length) {
        setSelectedStationId(prev => prev + 1);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handleSelectStation = (stationId: number) => {
    playClickSound();
    setSelectedStationId(stationId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setShowHint(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Voyage Overview & Animated Sea Route */}
      <div className="bg-gradient-to-r from-[#0D1C31] via-[#183E65] to-[#287BA6] border border-[#3897C0]/30 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden text-white">
        {/* Ocean Wave background flair */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MascotKienSang size={76} expression="captain" showBadge badgeText="Thuyền Trưởng" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold mb-1.5 shadow-sm">
                <Ship className="w-3.5 h-3.5 text-[#58B2D7]" /> Hải trình Tri thức Biển Đông
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Game "Hành Trình Vươn Khơi"
              </h2>
              <p className="text-xs sm:text-sm text-[#D8EBF5] mt-1 max-w-xl">
                Cùng Kiến Sáng thắp sáng 5 Trạm Hải Đăng kiến thức, khẳng định chủ quyền biển đảo thiêng liêng và tích lũy <span className="text-yellow-300 font-bold">+10 Xu</span> mỗi chặng!
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <div className="text-center px-3 border-r border-white/15">
              <div className="text-xs text-[#CBE2EE]">Trạm hoàn thành</div>
              <div className="text-lg font-black text-white">
                {profile.completedStations.length} / {STATIONS.length}
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-[#CBE2EE]">Xu thu thập</div>
              <div className="text-lg font-black text-yellow-300 flex items-center justify-center gap-1">
                <span>🪙</span> {profile.coins}
              </div>
            </div>
          </div>
        </div>

        {/* Game Mode Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => { playClickSound(); setGameMode('card_challenge'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
                gameMode === 'card_challenge'
                  ? 'bg-white text-[#102A45] shadow-lg ring-2 ring-[#58B2D7]'
                  : 'bg-white/10 text-[#CBE2EE] hover:text-white border border-white/15 hover:bg-white/15'
              }`}
            >
              <span className="text-base">🃏</span>
              <span>Lật Thẻ: Thuyền Trưởng Trổ Tài (Địa 11)</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E1EFF7] text-[10px] uppercase font-black text-[#183E65]">
                MỚI
              </span>
            </button>

            <button
              type="button"
              onClick={() => { playClickSound(); setGameMode('lighthouses'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
                gameMode === 'lighthouses'
                  ? 'bg-white text-[#102A45] shadow-lg ring-2 ring-[#58B2D7]'
                  : 'bg-white/10 text-[#CBE2EE] hover:text-white border border-white/15 hover:bg-white/15'
              }`}
            >
              <Compass className="w-4 h-4 text-[#287BA6]" />
              <span>Hải Trình 5 Trạm Hải Đăng (Trắc Nghiệm)</span>
            </button>
          </div>

          <div className="text-xs text-[#D8EBF5] italic hidden sm:block">
            {gameMode === 'card_challenge'
              ? 'Thử tài phản xạ với 10 nhận định Đúng / Sai & Bộ phát câu hỏi'
              : 'Vượt qua 5 hải đăng chủ quyền để mở khóa danh hiệu'}
          </div>
        </div>

        {/* Visual Ship Voyage Track (Interactive Stations) - Shown for lighthouses mode */}
        {gameMode === 'lighthouses' && (
          <div className="mt-8 pt-6 border-t border-white/15">
            <div className="relative flex items-center justify-between">
              {/* Connecting Route Line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-2 bg-black/30 rounded-full z-0 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#58B2D7] via-white to-yellow-300 transition-all duration-700"
                  style={{ width: `${((selectedStationId - 1) / (STATIONS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Stations */}
              {STATIONS.map((st, idx) => {
                const isCurrent = st.id === selectedStationId;
                const isCompleted = profile.completedStations.includes(st.id);

                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStation(st.id)}
                    className={`relative z-10 flex flex-col items-center group cursor-pointer transition-all duration-300 ${
                      isCurrent ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {/* Lighthouse Icon or Completed Badge */}
                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg ${
                      isCurrent 
                        ? 'bg-white border-white text-[#102A45] ring-4 ring-[#58B2D7]' 
                        : isCompleted
                        ? 'bg-emerald-500 border-white text-white'
                        : 'bg-white/20 border-white/30 text-white'
                    }`}>
                      {isCurrent ? (
                        <span className="text-xl animate-bounce">🚢</span>
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-sm font-black text-white">{idx + 1}</span>
                      )}
                    </div>

                    {/* Station Name Label */}
                    <span className={`text-[11px] font-bold mt-2 whitespace-nowrap text-center transition-colors ${
                      isCurrent ? 'text-white font-black' : isCompleted ? 'text-emerald-300' : 'text-[#CBE2EE]'
                    }`}>
                      <span className="hidden sm:inline">{st.lighthouseName}</span>
                      <span className="sm:hidden">Trạm {idx + 1}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RENDER ACTIVE MODE */}
      {gameMode === 'card_challenge' ? (
        <CaptainChallengeCardGame
          profile={profile}
          onRewardCoins={onRewardCoins}
        />
      ) : currentQ ? (
        <div className="bg-white border border-[#CBE2EE] rounded-3xl p-6 sm:p-8 shadow-sm relative text-[#102A45]">
          {/* Floating +10 Xu Award Animation */}
          {floatingCoin && (
            <div className="absolute top-8 right-8 z-30 flex items-center gap-2 bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-full shadow-2xl animate-bounce text-base">
              <span>🪙</span> +10 Xu Thưởng!
            </div>
          )}

          {/* Question Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E1EFF7]">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E1EFF7] border border-[#BCE0F1] text-[#183E65] text-xs font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#287BA6]" /> {currentStation.lighthouseName}
              </span>
              <span className="text-xs text-[#517696]">
                Câu {currentQuestionIndex + 1} / {stationQuestions.length}
              </span>
            </div>

            <div className="text-xs text-[#287BA6] font-medium italic flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#287BA6]" />
              <span>{currentQ.textbookRef}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="my-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#102A45] leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options.map((optionText, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQ.correctIndex;
              
              let cardStyle = 'bg-white border-[#D0E4F0] text-[#183E65] hover:border-[#3897C0] hover:bg-[#F0F7FB]';

              if (hasSubmitted) {
                if (isCorrect) {
                  cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400/40';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-semibold';
                } else {
                  cardStyle = 'bg-slate-50 border-[#E1EFF7] text-[#517696] opacity-60';
                }
              } else if (isSelected) {
                cardStyle = 'bg-[#EAF4FA] border-[#287BA6] text-[#102A45] font-bold ring-2 ring-[#3897C0]';
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-200 ${cardStyle}`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
                    hasSubmitted && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : hasSubmitted && isSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : isSelected
                      ? 'bg-[#287BA6] text-white'
                      : 'bg-[#E1EFF7] text-[#183E65]'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span className="text-xs sm:text-sm leading-snug flex-1">
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Mascot Explanation Box */}
          {hasSubmitted && (
            <div className={`mt-6 p-4 sm:p-5 rounded-2xl border animate-fadeIn ${
              selectedAnswer === currentQ.correctIndex 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <MascotKienSang 
                    size={60} 
                    expression={selectedAnswer === currentQ.correctIndex ? 'celebrate' : 'thinking'} 
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {selectedAnswer === currentQ.correctIndex ? (
                      <span className="font-black text-sm text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chính xác tuyệt đối! (+10 Xu)
                      </span>
                    ) : (
                      <span className="font-black text-sm text-amber-800 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-amber-600" /> Chưa đúng rồi, đừng nản lòng nhé!
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#183E65] leading-relaxed">
                    <span className="font-bold text-[#102A45]">Giải thích chi tiết: </span>
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mascot Hint before submitting */}
          {showHint && !hasSubmitted && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3 animate-fadeIn">
              <MascotKienSang size={46} expression="thinking" />
              <div className="text-xs">
                <span className="font-bold text-amber-900">Gợi ý từ Kiến Sáng: </span>
                {currentQ.kienSangHint}
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="mt-6 pt-5 border-t border-[#E1EFF7] flex flex-wrap items-center justify-between gap-3">
            {/* Left Action: Hint toggle */}
            {!hasSubmitted ? (
              <button
                type="button"
                onClick={() => { playClickSound(); setShowHint(prev => !prev); }}
                className="px-4 py-2 rounded-xl bg-[#F0F7FB] hover:bg-[#E1EFF7] border border-[#CBE2EE] text-xs text-[#183E65] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-[#287BA6]" />
                {showHint ? 'Ẩn gợi ý' : 'Hỏi gợi ý Kiến Sáng'}
              </button>
            ) : (
              <div className="text-xs text-[#517696] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Trạm: {currentStation.location}</span>
              </div>
            )}

            {/* Right Action: Check / Next Button */}
            <div className="flex items-center gap-3 ml-auto">
              {!hasSubmitted ? (
                <button
                  type="button"
                  disabled={selectedAnswer === null}
                  onClick={handleCheckAnswer}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all ${
                    selectedAnswer !== null
                      ? 'bg-[#287BA6] hover:bg-[#1F5E86] text-white'
                      : 'bg-[#F0F7FB] text-[#517696] cursor-not-allowed border border-[#D0E4F0]'
                  }`}
                >
                  Kiểm tra Đáp án
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-[#287BA6] hover:bg-[#1F5E86] text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all"
                >
                  <span>
                    {currentQuestionIndex < stationQuestions.length - 1 ? 'Câu tiếp theo' : 'Tiếp tục hải trình'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#CBE2EE] shadow-sm">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3 animate-bounce" />
          <h3 className="text-xl font-bold text-[#102A45]">Bạn đã hoàn thành trạm này!</h3>
          <p className="text-sm text-[#287BA6] mt-1">Hãy chuyển sang trạm hải đăng tiếp theo để tiếp tục hải trình.</p>
        </div>
      )}
    </div>
  );
};
