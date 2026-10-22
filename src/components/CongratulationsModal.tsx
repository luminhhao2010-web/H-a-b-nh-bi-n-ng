import React, { useEffect } from 'react';
import { MascotKienSang } from './MascotKienSang';
import { Trophy, Award, Coins, Sparkles, X, ArrowRight, Flame } from 'lucide-react';
import { playClickSound, playFireworksSound } from '../utils/audio';
import { triggerFireworksConfetti } from '../utils/confetti';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleText: string;
  message: string;
  earnedCoins?: number;
  newTitle?: string;
  onAction?: () => void;
  actionText?: string;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  onClose,
  titleText,
  message,
  earnedCoins,
  newTitle,
  onAction,
  actionText = 'Tiếp tục học tập'
}) => {
  // Fire celebratory fireworks confetti and explosion audio whenever modal opens
  useEffect(() => {
    if (isOpen) {
      triggerFireworksConfetti();
      playFireworksSound();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFireAgain = () => {
    playClickSound();
    triggerFireworksConfetti();
    playFireworksSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center text-[#102A45] shadow-2xl shadow-amber-500/20 animate-scaleUp">
        {/* Floating Fireworks & Mascot celebration */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
            <MascotKienSang size={96} expression="celebrate" />
          </div>
        </div>

        <button
          onClick={() => { playClickSound(); onClose(); }}
          className="absolute top-4 right-4 text-[#517696] hover:text-[#102A45] p-1.5 rounded-lg hover:bg-[#F0F7FB] transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-2 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> Chúc Mừng Xuất Sắc!
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#102A45]">
            {titleText}
          </h3>

          <p className="text-xs sm:text-sm text-[#517696] mt-2 leading-relaxed font-medium">
            {message}
          </p>

          {/* Reward Badges */}
          <div className="my-5 flex flex-wrap items-center justify-center gap-3">
            {earnedCoins !== undefined && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs">
                <span className="text-xl animate-bounce">🪙</span>
                <div className="text-left">
                  <div className="text-[10px] text-amber-700 font-semibold uppercase">Thưởng thêm</div>
                  <div className="text-base font-black text-amber-600">+{earnedCoins} Xu</div>
                </div>
              </div>
            )}

            {newTitle && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#E1EFF7] border border-[#287BA6] text-[#183E65] shadow-2xs">
                <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-[10px] text-[#287BA6] font-semibold uppercase">Danh hiệu mới</div>
                  <div className="text-sm font-black text-[#102A45]">{newTitle}</div>
                </div>
              </div>
            )}
          </div>

          {/* Fireworks Re-fire Button for extra celebration fun */}
          <div className="mb-4">
            <button
              onClick={handleFireAgain}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF8E7] hover:bg-[#FFF0C8] border border-amber-300 text-amber-900 hover:text-amber-950 text-xs font-bold transition-all transform hover:scale-105 active:scale-95 shadow-2xs"
              title="Bắn pháo hoa rực rỡ và nghe tiếng nổ đùng đoàng!"
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>Bắn pháo hoa chúc mừng 🎆</span>
            </button>
          </div>

          {/* Action button */}
          <button
            onClick={() => {
              playClickSound();
              if (onAction) onAction();
              onClose();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#287BA6] to-[#183E65] hover:from-[#1F5E86] hover:to-[#0D1C31] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-transform transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
