import React, { useState, useRef, useEffect } from 'react';
import { MascotKienSang } from './MascotKienSang';
import { ChatMessage } from '../types';
import { getAnswerFromKnowledgeBase } from '../data/knowledgeBase';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Maximize2,
  BookOpen,
  Mic,
  MicOff,
  Radio
} from 'lucide-react';
import { playClickSound, playTingTingSound } from '../utils/audio';
import { 
  speakVietnamese, 
  stopSpeech, 
  createVietnameseSpeechRecognizer, 
  isSpeechRecognitionSupported, 
  isSpeechSynthesisSupported 
} from '../utils/speech';

interface FloatingChatbotProps {
  onOpenFullTab: () => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ onOpenFullTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'f-1',
      sender: 'kiensang',
      text: 'Chào bạn! Kiến Sáng có thể giải đáp nhanh mọi câu hỏi về Chuyên đề Biển Đông bằng chữ hoặc giọng nói tiếng Việt nè! 🌊🎙️',
      timestamp: 'Vừa xong',
      suggestions: [
        'Ý nghĩa Nhà giàn DK1 là gì?',
        'Phán quyết PCA 2016 có nội dung gì?'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<{ start: () => void; stop: () => void; abort: () => void } | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      stopSpeech();
      recognizerRef.current?.abort();
      setIsListening(false);
      setSpeakingId(null);
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    return () => {
      stopSpeech();
      recognizerRef.current?.abort();
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isTyping) return;

    stopSpeech();
    setSpeakingId(null);
    playClickSound();

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(async () => {
      let botResp = getAnswerFromKnowledgeBase(text);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.answer) {
            botResp = {
              text: data.answer,
              reference: data.reference || 'Tư liệu SGK Địa lí 11 & Tri thức Biển Đông',
              suggestions: data.suggestions || botResp.suggestions
            };
          }
        }
      } catch {
        // Fallback
      }

      const botMsgId = `k-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'kiensang',
        text: botResp.text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        reference: botResp.reference,
        suggestions: botResp.suggestions
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      playTingTingSound();

      // Speak response
      if (isSpeechSynthesisSupported()) {
        setSpeakingId(botMsgId);
        speakVietnamese(
          botResp.text,
          () => setSpeakingId(botMsgId),
          () => setSpeakingId(null),
          () => setSpeakingId(null)
        );
      }
    }, 450);
  };

  const handleToggleMic = () => {
    playClickSound();
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) return;

    setIsListening(true);
    recognizerRef.current = createVietnameseSpeechRecognizer({
      onStart: () => setIsListening(true),
      onResult: (transcript, isFinal) => {
        setInputQuery(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          handleSend(transcript.trim());
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false)
    });
    recognizerRef.current?.start();
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      stopSpeech();
      setSpeakingId(null);
      return;
    }
    playClickSound();
    stopSpeech();
    setSpeakingId(msgId);
    speakVietnamese(
      text,
      () => setSpeakingId(msgId),
      () => setSpeakingId(null),
      () => setSpeakingId(null)
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Floating Popup Box */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[480px] mb-3 bg-white border border-[#CBE2EE] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#102A45] animate-scaleUp">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#0D1C31] via-[#183E65] to-[#287BA6] border-b border-[#3897C0]/30 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <MascotKienSang size={36} expression="happy" />
              <div>
                <div className="font-extrabold text-sm text-white flex items-center gap-1">
                  Trợ Lý AI Kiến Sáng
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </div>
                <div className="text-[10px] text-[#D8EBF5]">Giải đáp Địa lí 11 24/7</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  playClickSound();
                  setIsOpen(false);
                  onOpenFullTab();
                }}
                className="p-1 text-[#D8EBF5] hover:text-white rounded hover:bg-white/10"
                title="Mở toàn màn hình"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { playClickSound(); setIsOpen(false); }}
                className="p-1 text-[#D8EBF5] hover:text-white rounded hover:bg-white/10"
                title="Thu nhỏ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs custom-scrollbar bg-[#F8FBFE]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'kiensang' && (
                  <MascotKienSang size={28} expression="happy" className="mt-0.5 flex-shrink-0" />
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#287BA6] text-white font-semibold rounded-tr-none shadow-2xs'
                      : 'bg-white border border-[#CBE2EE] text-[#102A45] rounded-tl-none shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{m.text}</div>
                  {m.reference && (
                    <div className="mt-1.5 pt-1 border-t border-[#E1EFF7] text-[10px] text-[#287BA6] font-medium italic">
                      {m.reference}
                    </div>
                  )}

                  {m.sender === 'kiensang' && (
                    <div className="mt-1.5 pt-1 border-t border-[#E1EFF7] flex items-center gap-1.5 text-[10px] text-[#517696]">
                      <button
                        onClick={() => handleSpeak(m.id, m.text)}
                        className={`hover:text-[#287BA6] flex items-center gap-1 ${
                          speakingId === m.id ? 'text-[#287BA6] font-bold' : ''
                        }`}
                      >
                        {speakingId === m.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        <span>{speakingId === m.id ? 'Dừng đọc' : 'Nghe đọc'}</span>
                      </button>
                    </div>
                  )}

                  {m.suggestions && (
                    <div className="mt-2 flex flex-col gap-1">
                      {m.suggestions.slice(0, 2).map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          className="text-left text-[11px] bg-[#F0F7FB] hover:bg-[#E1EFF7] text-[#183E65] px-2 py-1 rounded-lg border border-[#CBE2EE] flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3 text-[#287BA6] flex-shrink-0" />
                          <span className="truncate">{s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-[11px] text-[#287BA6]">
                <MascotKienSang size={24} expression="thinking" />
                <span className="animate-pulse">Kiến Sáng đang soạn câu trả lời...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Listening banner if active */}
          {isListening && (
            <div className="px-3 py-1.5 bg-[#EAF3FA] border-t border-[#287BA6] text-[#183E65] text-[11px] flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Đang nghe tiếng Việt...
              </span>
              <button
                onClick={handleToggleMic}
                className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded font-bold"
              >
                Gửi
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-2 border-t border-[#CBE2EE] bg-white flex items-center gap-1.5">
            <button
              onClick={handleToggleMic}
              className={`p-2 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-[#F0F7FB] hover:bg-[#E1EFF7] text-[#183E65] border-[#CBE2EE]'
              }`}
              title={isListening ? 'Dừng nói' : 'Nói tiếng Việt'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#287BA6]" />}
            </button>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Đặt câu hỏi hoặc bấm Mic..."
              className="flex-1 bg-[#F8FBFE] border border-[#CBE2EE] rounded-xl px-3 py-1.5 text-xs text-[#102A45] placeholder-[#517696] focus:outline-none focus:border-[#287BA6]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isTyping}
              className={`p-2 rounded-xl font-bold ${
                inputQuery.trim() && !isTyping ? 'bg-[#287BA6] hover:bg-[#1F5E86] text-white shadow-2xs' : 'bg-[#F0F7FB] text-[#8EAEC4] border border-[#D0E4F0]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button with Mascot Avatar */}
      <button
        onClick={() => {
          playClickSound();
          setIsOpen(prev => !prev);
        }}
        className="group relative flex items-center gap-2.5 p-2 pr-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 ring-4 ring-cyan-400/40"
        title="Bấm để chat cùng Mascot Kiến Sáng"
      >
        <div className="relative">
          <MascotKienSang size={42} expression="happy" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-cyan-400 border-2 border-slate-900 rounded-full animate-ping" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-black tracking-wide leading-tight">
            Chat với Kiến Sáng
          </span>
          <span className="text-[10px] font-bold text-slate-900/80 leading-none">
            Hỏi đáp Địa lí 11 💡
          </span>
        </div>
      </button>
    </div>
  );
};
