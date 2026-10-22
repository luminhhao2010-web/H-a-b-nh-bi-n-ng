import React, { useState } from 'react';
import { CaptainCardStatement, StudentProfile } from '../types';
import { CAPTAIN_CARD_STATEMENTS } from '../data/quizData';
import { MascotKienSang } from './MascotKienSang';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  HelpCircle,
  Trophy,
  ArrowRight,
  Shuffle,
  Code2,
  Play,
  Check,
  Flame,
  Award,
  Layers
} from 'lucide-react';
import { playTingTingSound, playHintSound, playFanfareSound, playClickSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CaptainChallengeCardGameProps {
  profile: StudentProfile;
  onRewardCoins: (amount: number, questionId: string) => void;
}

export const CaptainChallengeCardGame: React.FC<CaptainChallengeCardGameProps> = ({
  profile,
  onRewardCoins,
}) => {
  // Statements list state (supports shuffling)
  const [statements, setStatements] = useState<CaptainCardStatement[]>([...CAPTAIN_CARD_STATEMENTS]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'play' | 'generator'>('play');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const currentStatement = statements[currentIndex];

  // Handle user choosing TRUE or FALSE
  const handleAnswer = (choice: boolean) => {
    if (isFlipped || !currentStatement) return;
    playClickSound();
    setUserChoice(choice);
    setIsFlipped(true);

    const isCorrect = choice === currentStatement.is_correct;
    if (isCorrect) {
      playTingTingSound();
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);

      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#00E5FF', '#FFD700', '#10B981']
      });

      // Reward 5 coins for each correct statement if not previously earned in this round
      if (!answeredMap[currentIndex]) {
        onRewardCoins(5, `card-statement-${currentIndex}`);
        setAnsweredMap(prev => ({ ...prev, [currentIndex]: true }));
      }
    } else {
      playHintSound();
      setStreak(0);
    }
  };

  const handleNextCard = () => {
    playClickSound();
    if (currentIndex < statements.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserChoice(null);
      setIsFlipped(false);
    } else {
      setIsGameOver(true);
      playFanfareSound();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    playClickSound();
    setCurrentIndex(0);
    setUserChoice(null);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
  };

  const handleShuffle = () => {
    playClickSound();
    const shuffled = [...statements].sort(() => Math.random() - 0.5);
    setStatements(shuffled);
    setCurrentIndex(0);
    setUserChoice(null);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
  };

  const jsonString = JSON.stringify(statements, null, 2);

  const handleCopyJson = () => {
    playClickSound();
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    playClickSound();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'thuyen_truong_tro_tai_10_nhan_dinh_dia_11.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Sub navigation between Play and Question Generator */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#CBE2EE] shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { playClickSound(); setActiveSubTab('play'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'play'
                ? 'bg-[#287BA6] text-white shadow-md'
                : 'text-[#517696] hover:text-[#102A45] hover:bg-[#F0F7FB]'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Chơi Lật Thẻ (10 Nhận Định)</span>
          </button>

          <button
            type="button"
            onClick={() => { playClickSound(); setActiveSubTab('generator'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'generator'
                ? 'bg-[#183E65] text-white shadow-md'
                : 'text-[#517696] hover:text-[#102A45] hover:bg-[#F0F7FB]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Bộ Phát Câu Hỏi & JSON Viewer</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            title="Xáo trộn thứ tự nhận định"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F7FB] hover:bg-[#E1EFF7] border border-[#CBE2EE] text-xs text-[#183E65] font-semibold transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xáo trộn câu</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'play' ? (
        <div className="space-y-6">
          {/* Header Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#CBE2EE] p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[11px] text-[#517696] font-semibold">Thẻ hiện tại</div>
                <div className="text-lg font-black text-[#183E65]">
                  {currentIndex + 1} <span className="text-xs text-[#517696]">/ {statements.length}</span>
                </div>
              </div>
              <Layers className="w-6 h-6 text-[#287BA6]/60" />
            </div>

            <div className="bg-white border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[11px] text-emerald-700 font-semibold">Điểm đúng</div>
                <div className="text-lg font-black text-emerald-700">
                  {score} <span className="text-xs text-emerald-600/70">/ {statements.length}</span>
                </div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>

            <div className="bg-white border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[11px] text-amber-700 font-semibold">Chuỗi liên tiếp</div>
                <div className="text-lg font-black text-amber-700 flex items-center gap-1">
                  <span>{streak}</span>
                  {streak >= 3 && <Flame className="w-4 h-4 text-orange-500 animate-bounce" />}
                </div>
              </div>
              <Flame className="w-6 h-6 text-amber-500" />
            </div>

            <div className="bg-white border border-[#CBE2EE] p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[11px] text-[#517696] font-semibold">Thưởng mỗi câu</div>
                <div className="text-lg font-black text-amber-600">
                  +5 Xu 🪙
                </div>
              </div>
              <Award className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#E1EFF7] rounded-full h-2.5 overflow-hidden border border-[#CBE2EE]">
            <div
              className="bg-gradient-to-r from-[#58B2D7] via-[#287BA6] to-[#183E65] h-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / statements.length) * 100}%` }}
            />
          </div>

          {/* Main Card Arena */}
          {!isGameOver && currentStatement ? (
            <div className="relative perspective-1000 max-w-2xl mx-auto">
              <div
                className={`relative w-full min-h-[380px] sm:min-h-[400px] transition-all duration-700 transform-style-3d rounded-3xl ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT OF CARD (Unflipped: Question Statement) */}
                <div className={`absolute inset-0 backface-hidden bg-white border-2 border-[#BCE0F1] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl ${
                  isFlipped ? 'pointer-events-none' : ''
                }`}>
                  {/* Card Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1EFF7] border border-[#BCE0F1] text-[#183E65] text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#287BA6]" />
                      <span>Thử Thách Thuyền Trưởng • Thẻ #{currentIndex + 1}</span>
                    </div>

                    <div className="text-xs text-[#517696] font-semibold">
                      Chuyên đề Địa lí 11
                    </div>
                  </div>

                  {/* Card Center: Mascot & Short Statement */}
                  <div className="my-auto py-4 text-center space-y-4">
                    <div className="flex justify-center">
                      <MascotKienSang size={70} expression="captain" showBadge badgeText="Đúng hay Sai?" />
                    </div>

                    <div className="px-3">
                      <span className="text-xs uppercase tracking-wider text-[#287BA6] font-bold block mb-1">
                        Nhận định địa lý:
                      </span>
                      <h3 className="text-lg sm:text-2xl font-black text-[#102A45] leading-relaxed tracking-tight">
                        "{currentStatement.statement}"
                      </h3>
                    </div>
                  </div>

                  {/* Card Bottom: 2 Action Buttons (ĐÚNG vs SAI) */}
                  <div className="space-y-3 pt-4 border-t border-[#E1EFF7]">
                    <p className="text-xs text-center text-[#517696] font-medium">
                      Nhận định trên là <strong className="text-emerald-700 font-bold">ĐÚNG</strong> hay <strong className="text-rose-700 font-bold">SAI</strong>? Hãy lật thẻ!
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleAnswer(true)}
                        className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>ĐÚNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAnswer(false)}
                        className="py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                      >
                        <XCircle className="w-5 h-5 text-white" />
                        <span>SAI</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK OF CARD (Flipped: Explanation & Result) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl ${
                  userChoice === currentStatement.is_correct
                    ? 'border-emerald-500 shadow-emerald-100'
                    : 'border-rose-500 shadow-rose-100'
                }`}>
                  {/* Result Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E1EFF7]">
                    <div className="flex items-center gap-2">
                      {userChoice === currentStatement.is_correct ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          CHÍNH XÁC (+5 Xu)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-800 text-xs font-black flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          CHƯA CHÍNH XÁC
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#102A45] font-bold">
                      Đáp án: <span className={currentStatement.is_correct ? 'text-emerald-700' : 'text-rose-700'}>
                        {currentStatement.is_correct ? 'ĐÚNG' : 'SAI'}
                      </span>
                    </div>
                  </div>

                  {/* Result Body with Mascot */}
                  <div className="my-auto py-4 flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <MascotKienSang
                        size={64}
                        expression={userChoice === currentStatement.is_correct ? 'celebrate' : 'thinking'}
                      />
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="text-xs text-[#287BA6] font-bold uppercase tracking-wider">
                        Giải thích ngắn gọn:
                      </div>
                      <p className="text-sm sm:text-base text-[#102A45] font-medium leading-relaxed bg-[#F8FBFE] p-4 rounded-2xl border border-[#D5E6F1]">
                        {currentStatement.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Next Step Action */}
                  <div className="pt-4 border-t border-[#E1EFF7] flex items-center justify-between gap-3">
                    <div className="text-xs text-[#517696] italic">
                      {currentIndex < statements.length - 1
                        ? `Còn ${statements.length - 1 - currentIndex} thẻ thử thách phía trước`
                        : 'Đây là thẻ cuối cùng của lượt chơi!'}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextCard}
                      className="px-6 py-2.5 rounded-xl bg-[#287BA6] hover:bg-[#1F5E86] text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all transform active:scale-95"
                    >
                      <span>{currentIndex < statements.length - 1 ? 'Thẻ tiếp theo' : 'Xem kết quả tổng kết'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Game Over Screen */
            <div className="bg-white border border-[#CBE2EE] rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-md relative overflow-hidden text-[#102A45]">
              <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-400 mx-auto flex items-center justify-center text-4xl mb-4 shadow-sm">
                🏆
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#102A45]">
                Hoàn Thành Thử Thách!
              </h3>
              <p className="text-sm text-[#517696] mt-2">
                Bạn đã trả lời đúng <strong className="text-amber-600 text-lg">{score} / {statements.length}</strong> nhận định Địa lý 11!
              </p>

              <div className="my-6 p-4 rounded-2xl bg-[#F8FBFE] border border-[#D5E6F1] inline-flex items-center gap-6">
                <div>
                  <div className="text-xs text-[#517696]">Tỷ lệ chính xác</div>
                  <div className="text-xl font-black text-emerald-600">{Math.round((score / statements.length) * 100)}%</div>
                </div>
                <div className="w-px h-8 bg-[#CBE2EE]" />
                <div>
                  <div className="text-xs text-[#517696]">Xu nhận được</div>
                  <div className="text-xl font-black text-amber-600">+{score * 5} 🪙</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-6 py-3 rounded-xl bg-[#287BA6] hover:bg-[#1F5E86] text-white font-bold text-sm flex items-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại lượt mới</span>
                </button>

                <button
                  type="button"
                  onClick={handleShuffle}
                  className="px-6 py-3 rounded-xl bg-[#F0F7FB] hover:bg-[#E1EFF7] text-[#183E65] font-semibold text-sm flex items-center gap-2 border border-[#CBE2EE]"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Xáo trộn ngẫu nhiên</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Question Generator & JSON Inspector Tab */
        <div className="bg-white border border-[#CBE2EE] rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 text-[#102A45]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E1EFF7]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-1">
                <Code2 className="w-3.5 h-3.5" /> Bộ phát câu hỏi chuẩn JSON
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#102A45]">
                Danh Sách 10 Nhận Định Chuyên Đề Địa Lí 11
              </h3>
              <p className="text-xs text-[#517696] mt-1">
                Gồm 5 câu ĐÚNG và 5 câu SAI được xáo trộn, mỗi nhận định dưới 20 từ, giải thích 1 câu ngắn gọn.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-4 py-2 rounded-xl bg-[#E1EFF7] hover:bg-[#D0E4F0] border border-[#BCE0F1] text-[#183E65] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#287BA6]" />
                    <span>Sao chép JSON</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="px-4 py-2 rounded-xl bg-[#F0F7FB] hover:bg-[#E1EFF7] border border-[#CBE2EE] text-[#183E65] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-[#287BA6]" />
                <span>Tải .JSON</span>
              </button>
            </div>
          </div>

          {/* Cards Table / List view */}
          <div className="space-y-3">
            {statements.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  item.is_correct
                    ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400'
                    : 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white border border-[#CBE2EE] text-[#183E65] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                        #{idx + 1}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        item.is_correct ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {item.is_correct ? 'ĐÚNG' : 'SAI'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-[#102A45] pl-8 sm:pl-0">
                      "{item.statement}"
                    </div>

                    <div className="text-xs text-[#517696] pl-8 sm:pl-0">
                      <span className="text-[#287BA6] font-semibold">Giải thích: </span>
                      {item.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Raw JSON Code Block */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#517696] flex items-center gap-1.5">
              <span>Định dạng mã JSON thô:</span>
            </div>
            <pre className="p-4 rounded-2xl bg-[#0D1C31] border border-[#287BA6]/30 text-[#9ECBE0] text-xs font-mono overflow-x-auto max-h-72 leading-relaxed shadow-inner">
              {jsonString}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
export default CaptainChallengeCardGame;
