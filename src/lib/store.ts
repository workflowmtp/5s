// src/lib/store.ts
import { create } from 'zustand';
import type { ChatMessage } from '@/types';

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('5S_THEME', next);
      document.documentElement.setAttribute('data-theme', next === 'light' ? 'light' : '');
    }
    return { theme: next };
  }),
  initTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('5S_THEME') as 'dark' | 'light' || 'dark';
      document.documentElement.setAttribute('data-theme', saved === 'light' ? 'light' : '');
      set({ theme: saved });
    }
  },
}));

interface ChatState {
  isOpen: boolean;
  context: 'general' | 'eval5s' | 'suggestion';
  messages: ChatMessage[];
  isSending: boolean;
  openChat: (ctx?: 'general' | 'eval5s' | 'suggestion') => void;
  closeChat: () => void;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setSending: (v: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  context: 'general',
  messages: [],
  isSending: false,
  openChat: (ctx = 'general') => set({ isOpen: true, context: ctx }),
  closeChat: () => set({ isOpen: false }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  setSending: (v) => set({ isSending: v }),
}));

interface ConfirmState {
  isOpen: boolean;
  message: string;
  icon: string;
  okLabel: string;
  okClass: string;
  onConfirm: (() => void) | null;
  showConfirm: (opts: { message: string; icon?: string; okLabel?: string; okClass?: string; onConfirm: () => void }) => void;
  closeConfirm: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  message: '',
  icon: '⚠️',
  okLabel: 'Confirmer',
  okClass: 'btn-danger',
  onConfirm: null,
  showConfirm: (opts) => set({
    isOpen: true,
    message: opts.message,
    icon: opts.icon || '⚠️',
    okLabel: opts.okLabel || 'Confirmer',
    okClass: opts.okClass || 'btn-danger',
    onConfirm: opts.onConfirm,
  }),
  closeConfirm: () => set({ isOpen: false, onConfirm: null }),
}));
