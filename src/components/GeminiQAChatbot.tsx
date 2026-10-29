import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Bot, User, X, ChevronDown, Check, Copy, Zap, Shield, Cpu, Bug } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiQAChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  failingTestContext?: string;
}

export const GeminiQAChatbot: React.FC<GeminiQAChatbotProps> = ({
  isOpen,
  onClose,
  failingTestContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'model',
      text: 'Hello! I am your **TestGenius AI QA Copilot**. I can help you design automated test suites, write Playwright scripts, test custom Machine Learning models for data drift, or diagnose test regressions. What would you like to verify today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<'qa_architect' | 'ml_engineer' | 'debug_specialist' | 'general'>('qa_architect');
  const [isFastMode, setIsFastMode] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (failingTestContext && isOpen) {
      setInputText(`Can you analyze this failure and explain how to fix it?\n\n${failingTestContext}`);
    }
  }, [failingTestContext, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, text: m.text })),
          role: selectedRole,
          fastMode: isFastMode,
        }),
      });

      const data = await resp.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: 'model',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: data.modelUsed,
          },
        ]);
      }
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: `Error connecting to AI service: ${(err as Error)?.message || 'Service unavailable'}. Please verify your connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        role: 'model',
        text: 'Chat history cleared. How can I assist with your automated testing or custom ML model QA?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    { label: 'How to test ML Data Drift (PSI)?', query: 'Explain how to calculate and test Population Stability Index (PSI) for continuous features in custom ML models.' },
    { label: 'Diagnose Expired JWT Bug', query: 'Why does jwt.decode throw ExpiredSignatureError and how should auth middleware handle it to return HTTP 401?' },
    { label: 'Playwright Page Locators', query: 'Show best practices for resilient Playwright locators using data-testid vs CSS selectors.' },
    { label: 'Adversarial Noise Testing', query: 'What is an effective epsilon perturbation test to verify classifier prediction invariance?' },
  ];

  const roleLabels = {
    qa_architect: { label: 'QA Architect', icon: Shield, desc: 'Pytest, Playwright, API test suites' },
    ml_engineer: { label: 'ML Reliability', icon: Cpu, desc: 'Drift, Adversarial, Latency SLAs' },
    debug_specialist: { label: 'Debug Specialist', icon: Bug, desc: 'Stack traces, root causes, fixes' },
    general: { label: 'General Copilot', icon: Sparkles, desc: 'General automated testing assistant' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[88vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">GeniusBot AI — Testing Copilot</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  {isFastMode ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Multi-turn conversational assistant for automated software QA & ML model validation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Clear conversation history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar (Role selector & Fast mode) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs">
          {/* Role selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Specialist Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium text-xs focus:border-indigo-500"
            >
              <option value="qa_architect">🛡️ QA Automation Architect (Pytest/Playwright)</option>
              <option value="ml_engineer">🤖 ML Reliability Engineer (Drift & Robustness)</option>
              <option value="debug_specialist">🐛 Debug Specialist (Stack Traces & Fixes)</option>
              <option value="general">⚡ General Testing Copilot</option>
            </select>
          </div>

          {/* Model Speed Toggle */}
          <button
            onClick={() => setIsFastMode(!isFastMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
              isFastMode
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle between fast responses and deep reasoning"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Fast Mode: {isFastMode ? 'ON (Flash-Lite)' : 'OFF (3.8 Flash)'}</span>
          </button>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl space-y-1.5 shadow-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                    <span className="font-semibold">{isUser ? 'You' : 'TestGenius Copilot'}</span>
                    <span>{m.timestamp}</span>
                  </div>

                  {/* Render content */}
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                    {m.text}
                  </div>

                  {!isUser && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <span>{m.modelUsed || 'gemini-3.8-flash'}</span>
                      <button
                        onClick={() => handleCopy(m.text, m.id)}
                        className="hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs">Thinking & formulating QA response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-5 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">Suggestions:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="px-2.5 py-1 rounded-full text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about test strategies, Playwright assertions, ML model drift, or paste a failure log..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
