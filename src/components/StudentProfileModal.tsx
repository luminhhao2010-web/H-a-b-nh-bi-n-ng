import React, { useState, useEffect } from 'react';
import { StudentProfile, GradeLevel } from '../types';
import { STUDENT_TITLES } from '../data/quizData';
import { MascotKienSang } from './MascotKienSang';
import { User, School, GraduationCap, Award, Coins, CheckCircle, X, Sparkles, Check } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updated: Partial<StudentProfile>) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [name, setName] = useState(profile.name || 'Lư Minh Hảo');
  const [school, setSchool] = useState(profile.school || 'Trường THPT Chuyên');
  const [className, setClassName] = useState(profile.className || '11 Chuyên Địa');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(profile.gradeLevel || 'thpt');

  // Keep form values in sync when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'Lư Minh Hảo');
      setSchool(profile.school || 'Trường THPT Chuyên');
      setClassName(profile.className || '11 Chuyên Địa');
      setGradeLevel(profile.gradeLevel || 'thpt');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    onSave({
      name: name.trim() || 'Lư Minh Hảo',
      school: school.trim() || 'Trường THPT Chuyên',
      className: className.trim() || '11 Chuyên Địa',
      gradeLevel
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white border border-[#CBE2EE] rounded-2xl shadow-2xl overflow-hidden text-[#102A45] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#287BA6] via-[#3897C0] to-[#58B2D7] shrink-0" />

        {/* Modal Top Bar (Sticky) */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E1EFF7] flex items-center justify-between gap-3 shrink-0 bg-gradient-to-r from-[#0D1C31] via-[#183E65] to-[#287BA6] text-white">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <MascotKienSang size={52} expression="happy" />
              <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 p-0.5 rounded-full text-[10px] font-bold shadow">
                ⚓
              </span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Hồ sơ Thủy thủ Tri thức</span>
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse shrink-0" />
              </h2>
              <p className="text-xs text-[#D8EBF5] line-clamp-1">
                Cá nhân hóa trải nghiệm học tập Chuyên đề Địa lí 11 Biển Đông
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playClickSound(); onClose(); }}
            className="text-[#D8EBF5] hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form 
          id="student-profile-form" 
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-5 custom-scrollbar bg-white"
        >
          {/* Current Stats Ribbon */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#F0F7FB] border border-[#CBE2EE] rounded-xl shrink-0 shadow-2xs">
            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-[11px] text-[#517696] flex items-center gap-1 font-semibold">
                <Coins className="w-3.5 h-3.5 text-amber-500" /> Xu tích lũy
              </span>
              <span className="text-lg font-black text-amber-600 mt-0.5">{profile.coins}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-1 border-x border-[#CBE2EE]">
              <span className="text-[11px] text-[#517696] flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5 text-[#287BA6]" /> Tiến độ
              </span>
              <span className="text-lg font-black text-[#287BA6] mt-0.5">{profile.progress}%</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-[11px] text-[#517696] flex items-center gap-1 font-semibold">
                <Award className="w-3.5 h-3.5 text-orange-500" /> Danh hiệu
              </span>
              <span className="text-xs font-bold text-orange-600 truncate max-w-[110px] mt-1">{profile.title}</span>
            </div>
          </div>

          {/* Student Name */}
          <div className="space-y-1.5">
            <label 
              htmlFor="student-name-input"
              className="block text-xs font-semibold text-[#183E65] flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-[#287BA6] shrink-0" />
              <span>Họ và tên học sinh</span>
            </label>
            <input
              id="student-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên học sinh..."
              className="w-full h-11 px-4 bg-[#F8FBFE] border border-[#CBE2EE] rounded-xl text-[#102A45] font-medium text-sm sm:text-base placeholder-[#517696] focus:outline-none focus:border-[#287BA6] focus:ring-2 focus:ring-[#3897C0]/20 transition-all leading-normal"
            />
          </div>

          {/* School and Class 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label 
                htmlFor="student-school-input"
                className="block text-xs font-semibold text-[#183E65] flex items-center gap-1.5"
              >
                <School className="w-4 h-4 text-[#287BA6] shrink-0" />
                <span>Trường học</span>
              </label>
              <input
                id="student-school-input"
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ví dụ: THPT Chuyên"
                className="w-full h-11 px-4 bg-[#F8FBFE] border border-[#CBE2EE] rounded-xl text-[#102A45] text-sm sm:text-base placeholder-[#517696] focus:outline-none focus:border-[#287BA6] focus:ring-2 focus:ring-[#3897C0]/20 transition-all leading-normal"
              />
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="student-class-input"
                className="block text-xs font-semibold text-[#183E65] flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-[#287BA6] shrink-0" />
                <span>Lớp học</span>
              </label>
              <input
                id="student-class-input"
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Ví dụ: 11 Chuyên Địa"
                className="w-full h-11 px-4 bg-[#F8FBFE] border border-[#CBE2EE] rounded-xl text-[#102A45] text-sm sm:text-base placeholder-[#517696] focus:outline-none focus:border-[#287BA6] focus:ring-2 focus:ring-[#3897C0]/20 transition-all leading-normal"
              />
            </div>
          </div>

          {/* Level selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#183E65]">
                Chọn Cấp học (Gợi ý mặc định: THPT - Chuyên đề Địa lí 11)
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tieuhoc', label: 'Tiểu học', desc: 'Nhận biết cơ bản' },
                { id: 'thcs', label: 'THCS', desc: 'Kiến thức cốt lõi' },
                { id: 'thpt', label: 'THPT (Lớp 11)', desc: 'Chuyên đề sâu SGK' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { playClickSound(); setGradeLevel(item.id as GradeLevel); }}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    gradeLevel === item.id
                      ? 'bg-[#E1EFF7] border-[#287BA6] text-[#102A45] ring-2 ring-[#3897C0]/30 shadow-xs'
                      : 'bg-[#F8FBFE] border-[#CBE2EE] text-[#517696] hover:border-[#3897C0] hover:bg-[#F0F7FB]'
                  }`}
                >
                  {gradeLevel === item.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#287BA6] text-white flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="font-bold text-xs sm:text-sm text-[#183E65]">{item.label}</div>
                  <div className="text-[11px] text-[#517696] mt-0.5 line-clamp-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title ladder */}
          <div className="pt-3 border-t border-[#E1EFF7] space-y-2">
            <div className="text-xs font-semibold text-[#183E65] flex items-center justify-between">
              <span>Hệ thống Cấp bậc & Danh hiệu</span>
              <span className="text-[11px] text-[#287BA6] font-normal">Tích xu để thăng cấp</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STUDENT_TITLES.map((t) => {
                const isUnlocked = profile.coins >= t.requiredCoins;
                const isCurrent = profile.title === t.title;
                return (
                  <div
                    key={t.id}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      isCurrent
                        ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-300'
                        : isUnlocked
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-[#F8FBFE] border-[#E1EFF7] text-[#8EAEC4] opacity-70'
                    }`}
                  >
                    <span className="text-base shrink-0">{t.icon}</span>
                    <div className="truncate flex-1">
                      <div className="font-bold truncate text-[11px] sm:text-xs flex items-center gap-1">
                        <span>{t.title}</span>
                        {isCurrent && <span className="text-[9px] text-amber-600 font-normal">(Hiện tại)</span>}
                      </div>
                      <div className="text-[10px] text-[#517696]">{t.requiredCoins} Xu</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Modal Sticky Bottom Actions Bar */}
        <div className="shrink-0 px-5 py-3.5 sm:px-6 sm:py-4 bg-[#F0F7FB] border-t border-[#CBE2EE] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => { playClickSound(); onClose(); }}
            className="px-4 py-2 rounded-xl border border-[#CBE2EE] text-[#517696] hover:bg-white hover:text-[#102A45] text-sm font-medium transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="student-profile-form"
            className="px-6 py-2 rounded-xl bg-[#287BA6] hover:bg-[#1F5E86] text-white font-bold text-sm shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Lưu Hồ Sơ & Bắt Đầu Học</span>
          </button>
        </div>
      </div>
    </div>
  );
};

