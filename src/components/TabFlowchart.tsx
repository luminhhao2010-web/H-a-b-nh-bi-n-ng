import React, { useState } from 'react';
import { FLOWCHART_STEPS } from '../data/flowchartData';
import { FlowchartStep } from '../types';
import { MascotKienSang } from './MascotKienSang';
import { 
  Scale, 
  FileText, 
  ShieldCheck, 
  Ship, 
  Waves, 
  Coins, 
  LifeBuoy, 
  MessageSquareText, 
  Compass, 
  Globe, 
  ArrowDown, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  X, 
  Sparkles 
} from 'lucide-react';
import { playClickSound, playTingTingSound } from '../utils/audio';

interface TabFlowchartProps {
  readSteps: string[];
  onReadStep: (stepId: string) => void;
}

export const TabFlowchart: React.FC<TabFlowchartProps> = ({
  readSteps,
  onReadStep
}) => {
  const [selectedStep, setSelectedStep] = useState<FlowchartStep | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scale': return <Scale className="w-5 h-5 text-cyan-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Ship': return <Ship className="w-5 h-5 text-cyan-400" />;
      case 'Waves': return <Waves className="w-5 h-5 text-teal-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-yellow-400" />;
      case 'LifeBuoy': return <LifeBuoy className="w-5 h-5 text-orange-400" />;
      case 'MessageSquareText': return <MessageSquareText className="w-5 h-5 text-emerald-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-red-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const col1Steps = FLOWCHART_STEPS.filter(s => s.column === 1);
  const col2Steps = FLOWCHART_STEPS.filter(s => s.column === 2);
  const col3Steps = FLOWCHART_STEPS.filter(s => s.column === 3);

  const handleStepClick = (step: FlowchartStep) => {
    playClickSound();
    setSelectedStep(step);
    if (!readSteps.includes(step.id)) {
      onReadStep(step.id);
      playTingTingSound();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-[#0D1C31] via-[#183E65] to-[#287BA6] border border-[#3897C0]/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <MascotKienSang size={70} expression="happy" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold mb-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Sơ đồ Khối Tương tác
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Quy Trình & Cơ Chế Hợp Tác Hòa Bình Ở Biển Đông
              </h2>
              <p className="text-xs sm:text-sm text-[#D8EBF5] mt-1 max-w-2xl">
                Khám phá mối quan hệ logic đa chiều giữa <strong>Cơ sở pháp lý quốc tế</strong>, <strong>Các lĩnh vực ưu tiên</strong> và <strong>Đường lối hành động kiên quyết, kiên trì của Việt Nam</strong>.
              </p>
            </div>
          </div>

          {/* Read Stats */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-sm">
            <div className="text-xs text-[#CBE2EE]">Khám phá các bước</div>
            <div className="text-base font-black text-white">
              {readSteps.length} / {FLOWCHART_STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* SVG Flow lines between columns for large screens */}
        <div className="hidden lg:block absolute left-1/3 top-1/2 -translate-y-1/2 -ml-3 z-0 pointer-events-none text-[#58B2D7]">
          <ArrowRight className="w-6 h-6 animate-pulse" />
        </div>
        <div className="hidden lg:block absolute left-2/3 top-1/2 -translate-y-1/2 -ml-3 z-0 pointer-events-none text-[#58B2D7]">
          <ArrowRight className="w-6 h-6 animate-pulse" />
        </div>

        {/* COLUMN 1: Pháp lý & Nguyên tắc */}
        <div className="flex flex-col space-y-4 z-10">
          <div className="p-4 rounded-2xl bg-white border border-[#CBE2EE] text-center shadow-xs">
            <span className="text-[11px] font-bold text-[#287BA6] uppercase tracking-wider block">
              Cột 1: Nền tảng
            </span>
            <h3 className="text-base font-extrabold text-[#102A45] mt-0.5">
              Cơ sở Pháp lý & Nguyên tắc
            </h3>
            <p className="text-xs text-[#517696] mt-1">
              Khung quy chuẩn quốc tế cao nhất điều chỉnh mọi hoạt động trên biển
            </p>
          </div>

          <div className="space-y-3">
            {col1Steps.map((step, idx) => {
              const isRead = readSteps.includes(step.id);
              const isSelected = selectedStep?.id === step.id;

              return (
                <div key={step.id} className="relative group">
                  <button
                    onClick={() => handleStepClick(step)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#EAF3FA] border-[#287BA6] ring-2 ring-[#3897C0] shadow-md'
                        : isRead
                        ? 'bg-white border-emerald-300 hover:border-[#287BA6]'
                        : 'bg-white border-[#D0E4F0] hover:border-[#3897C0] hover:bg-[#F0F7FB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[#E1EFF7] border border-[#BCE0F1]">
                          {getIcon(step.icon)}
                        </div>
                        <span className="text-xs font-bold text-[#183E65]">
                          Bước {step.stepNumber}: {step.tag}
                        </span>
                      </div>
                      {isRead && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <h4 className="text-sm font-bold text-[#102A45] group-hover:text-[#287BA6] transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#517696] leading-relaxed line-clamp-2">
                      {step.summary}
                    </p>
                    <div className="text-[11px] text-[#287BA6] font-semibold flex items-center gap-1 mt-1">
                      <span>Bấm xem chi tiết & căn cứ</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Vertical connector arrow inside column */}
                  {idx < col1Steps.length - 1 && (
                    <div className="flex justify-center py-1 text-[#58B2D7]">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Lĩnh vực Hợp tác Ưu tiên */}
        <div className="flex flex-col space-y-4 z-10">
          <div className="p-4 rounded-2xl bg-white border border-[#CBE2EE] text-center shadow-xs">
            <span className="text-[11px] font-bold text-[#183E65] uppercase tracking-wider block">
              Cột 2: Hành động
            </span>
            <h3 className="text-base font-extrabold text-[#102A45] mt-0.5">
              Lĩnh vực Hợp tác Ưu tiên
            </h3>
            <p className="text-xs text-[#517696] mt-1">
              4 trụ cột hợp tác then chốt giữa các nước ven Biển Đông
            </p>
          </div>

          <div className="space-y-3">
            {col2Steps.map((step, idx) => {
              const isRead = readSteps.includes(step.id);
              const isSelected = selectedStep?.id === step.id;

              return (
                <div key={step.id} className="relative group">
                  <button
                    onClick={() => handleStepClick(step)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#EAF3FA] border-[#287BA6] ring-2 ring-[#3897C0] shadow-md'
                        : isRead
                        ? 'bg-white border-emerald-300 hover:border-[#287BA6]'
                        : 'bg-white border-[#D0E4F0] hover:border-[#3897C0] hover:bg-[#F0F7FB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[#E1EFF7] border border-[#BCE0F1]">
                          {getIcon(step.icon)}
                        </div>
                        <span className="text-xs font-bold text-[#183E65]">
                          Trụ cột {step.stepNumber}: {step.tag}
                        </span>
                      </div>
                      {isRead && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <h4 className="text-sm font-bold text-[#102A45] group-hover:text-[#287BA6] transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#517696] leading-relaxed line-clamp-2">
                      {step.summary}
                    </p>
                    <div className="text-[11px] text-[#287BA6] font-semibold flex items-center gap-1 mt-1">
                      <span>Bấm xem mô hình thực tế</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {idx < col2Steps.length - 1 && (
                    <div className="flex justify-center py-1 text-[#58B2D7]">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: Hành động Quốc gia của Việt Nam */}
        <div className="flex flex-col space-y-4 z-10">
          <div className="p-4 rounded-2xl bg-white border border-[#CBE2EE] text-center shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Cột 3: Liên hệ thực tiễn
            </span>
            <h3 className="text-base font-extrabold text-[#102A45] mt-0.5">
              Hành động Quốc gia của Việt Nam
            </h3>
            <p className="text-xs text-[#517696] mt-1">
              Chính sách hòa bình, kiên quyết bảo vệ chủ quyền thiêng liêng
            </p>
          </div>

          <div className="space-y-3">
            {col3Steps.map((step, idx) => {
              const isRead = readSteps.includes(step.id);
              const isSelected = selectedStep?.id === step.id;

              return (
                <div key={step.id} className="relative group">
                  <button
                    onClick={() => handleStepClick(step)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#EAF3FA] border-emerald-500 ring-2 ring-emerald-400 shadow-md'
                        : isRead
                        ? 'bg-white border-emerald-300 hover:border-emerald-500'
                        : 'bg-white border-[#D0E4F0] hover:border-emerald-500 hover:bg-[#F0F7FB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                          {getIcon(step.icon)}
                        </div>
                        <span className="text-xs font-bold text-emerald-800">
                          Chiến lược {step.stepNumber}: {step.tag}
                        </span>
                      </div>
                      {isRead && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <h4 className="text-sm font-bold text-[#102A45] group-hover:text-emerald-700 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#517696] leading-relaxed line-clamp-2">
                      {step.summary}
                    </p>
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                      <span>Bấm xem giải pháp Việt Nam</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {idx < col3Steps.length - 1 && (
                    <div className="flex justify-center py-1 text-emerald-400">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Modal / Drawer on Step Click */}
      {selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-[#CBE2EE] rounded-2xl shadow-2xl overflow-hidden text-[#102A45] max-h-[90vh] flex flex-col">
            <div className="h-2 bg-gradient-to-r from-[#287BA6] via-[#3897C0] to-[#58B2D7]" />

            <div className="p-6 border-b border-[#E1EFF7] flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-[#E1EFF7] border border-[#BCE0F1] mt-1">
                  {getIcon(selectedStep.icon)}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#287BA6] uppercase tracking-wider">
                    {selectedStep.tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#102A45]">
                    {selectedStep.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#517696] mt-0.5 font-medium">
                    {selectedStep.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { playClickSound(); setSelectedStep(null); }}
                className="text-[#517696] hover:text-[#102A45] p-1.5 rounded-lg hover:bg-[#F0F7FB] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm no-scrollbar">
              <div className="p-4 rounded-xl bg-[#F8FBFE] border border-[#D5E6F1]">
                <h4 className="text-xs font-bold text-[#183E65] uppercase mb-1">Nội dung cốt lõi:</h4>
                <p className="text-[#102A45] leading-relaxed">
                  {selectedStep.details}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#EBF5FB] border border-[#BCE0F1]">
                <h4 className="text-xs font-bold text-emerald-800 uppercase mb-1">Cơ sở pháp lý & Ví dụ thực tế:</h4>
                <p className="text-[#183E65] text-xs leading-relaxed italic">
                  "{selectedStep.legalBasisOrExample}"
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" /> Điểm mấu chốt học sinh cần ghi nhớ:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedStep.keyPoints.map((pt, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E1EFF7] bg-[#F8FBFE] flex items-center justify-between">
              <span className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành bước học này (+5 Xu)
              </span>
              <button
                onClick={() => { playClickSound(); setSelectedStep(null); }}
                className="px-5 py-2 rounded-xl bg-[#287BA6] hover:bg-[#1F5E86] text-white font-bold text-xs transition-colors shadow-sm"
              >
                Đóng hộp thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
