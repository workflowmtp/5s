// src/components/layout/ChatFab.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { useSession } from 'next-auth/react';

const QUICK_ACTIONS: Record<string, { label: string; prompt: string }[]> = {
  general: [
    { label: '📊 Ma progression', prompt: 'Analyse ma progression globale en 5S et suggestions.' },
    { label: '🎯 Priorités du jour', prompt: 'Quelles devraient être mes priorités 5S aujourd\'hui ?' },
    { label: '💡 Idées suggestion', prompt: 'Propose-moi 3 idées de suggestions d\'amélioration.' },
    { label: '🏆 Objectif badges', prompt: 'Quels badges puis-je débloquer prochainement ?' },
  ],
  eval5s: [
    { label: '🔍 Analyser résultats', prompt: 'Analyse en détail mes résultats 5S.' },
    { label: '📋 Plan d\'action', prompt: 'Propose un plan d\'action en 5 points pour améliorer mon score 5S.' },
    { label: '🆚 Comparer évals', prompt: 'Compare cette évaluation avec mes précédentes.' },
  ],
  suggestion: [
    { label: '✍️ Améliorer formulation', prompt: 'Comment mieux formuler ma suggestion ?' },
    { label: '💰 Chiffrer les gains', prompt: 'Aide-moi à estimer les bénéfices de ma suggestion.' },
    { label: '🎯 Chances d\'adoption', prompt: 'Évalue les chances que ma suggestion soit retenue.' },
  ],
};

export function ChatFab() {
  const { isOpen, context, messages, isSending, openChat, closeChat, addMessage, setSending, clearMessages } = useChatStore();
  const { data: session } = useSession();
  const [input, setInput] = useState('');
  const msgEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastCtx, setLastCtx] = useState('');

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && context !== lastCtx) {
      clearMessages();
      setLastCtx(context);
      const name = session?.user?.name?.split(' ')[0] || 'Collègue';
      addMessage({ role: 'bot', text: `Bonjour ${name} ! Je suis votre assistant 5S. Comment puis-je vous aider ?` });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, context]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isSending) return;
    setInput('');
    addMessage({ role: 'user', text: msg });
    setSending(true);

    try {
      const apiMessages = [...messages.slice(-10), { role: 'user', text: msg }]
        .map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, context: '' }),
      });

      const data = await res.json();
      console.log('[CHAT] Raw response:', data);
      console.log('[CHAT] Reply length:', data.reply?.length);
      console.log('[CHAT] Reply preview:', data.reply?.substring(0, 200));
      addMessage({ role: 'bot', text: data.reply || 'Pas de réponse.' });
    } catch {
      addMessage({ role: 'bot', text: 'Erreur de communication. Veuillez réessayer.' });
    }
    setSending(false);
  };

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button onClick={() => openChat('general')}
          className="fixed bottom-[82px] right-4 w-[52px] h-[52px] rounded-full flex items-center justify-center text-2xl text-white z-[200] transition-all hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
          🤖
        </button>
      )}

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-[500]" style={{ background: 'rgba(7,13,26,0.6)' }} onClick={closeChat} />}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 max-h-[88vh] flex flex-col z-[510] animate-slide-up rounded-t-2xl"
          style={{ background: 'var(--bg-secondary)' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>🤖</div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Assistant IA 5S</div>
              <div className="text-[11px] font-mono" style={{ color: '#8B5CF6' }}>
                {context === 'eval5s' ? 'Contexte : Évaluation 5S' : context === 'suggestion' ? 'Contexte : Suggestion' : 'Mode libre'}
              </div>
            </div>
            <button onClick={closeChat} className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 min-h-[200px] max-h-[50vh]">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed animate-fade-in
                ${m.role === 'user'
                  ? 'self-end bg-blue-500 text-white rounded-br-sm'
                  : 'self-start rounded-bl-sm'}`}
                style={m.role === 'bot' ? { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' } : undefined}
                dangerouslySetInnerHTML={{ 
                  __html: m.role === 'bot' 
                    ? m.text
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\n/g, '<br>')
                        .replace(/^/, '<p>')
                        .replace(/$/, '</p>')
                        .replace(/<p><\/p>/g, '')
                        .replace(/<p>(.*?)<\/p>/g, '<p style="margin: 4px 0;">$1</p>')
                    : m.text 
                }}
              />
            ))}
            {isSending && (
              <div className="self-start px-4 py-3 rounded-xl flex gap-1 items-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Quick actions */}
          <div className="flex gap-1.5 px-4 py-2 overflow-x-auto flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            {(QUICK_ACTIONS[context] || QUICK_ACTIONS.general).map((a, i) => (
              <button key={i} onClick={() => send(a.prompt)}
                className="px-3 py-1.5 rounded-2xl text-[11px] font-medium whitespace-nowrap transition-all active:scale-95"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                {a.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0))' }}>
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Posez votre question..."
              className="flex-1 px-3.5 py-2.5 rounded-full text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <button onClick={() => send()} disabled={isSending || !input.trim()}
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-lg text-white flex-shrink-0 transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
