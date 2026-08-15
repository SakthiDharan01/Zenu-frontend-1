"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import { RequireAuth } from '@/components/auth/RequireAuth';
import PandaAvatar from '@/components/PandaAvatar';
import type { ChatMessage } from '@/lib/types';
import { trackEngagement } from '@/lib/signals';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  ZenPage,
  ZenButton,
  ZenBadge,
  ZenInput,
} from '@/components/zen';
import ModulePage from '@/components/ui/ModulePage';
import { getTheme } from '@/lib/moduleThemes';

const initialGreeting: ChatMessage = {
  id: -1,
  role: 'assistant',
  content: "Hello, I'm Seviyan. Share what's on your mind, and we'll work through it together.",
  createdAt: new Date().toISOString(),
};

const QUICK_PROMPTS = [
  "I'm feeling overwhelmed by school",
  'Help me unwind after a long day',
  'I need a gentle pep talk',
  "Let's plan one small next step",
];

const filterVisibleMessages = (messages: ChatMessage[]) =>
  messages.filter((message) => message.role === 'user' || message.role === 'assistant');

const ChatContent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const pandaState = isSending ? 'thinking' : inputFocused || input.trim() ? 'listening' : 'idle';
  const enterMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring' as const, stiffness: 320, damping: 28 },
      };

  useEffect(() => {
    trackEngagement('chatbot_seviyan', 'opened');
    const start = Date.now();
    return () => {
      const duration = Math.round((Date.now() - start) / 1000);
      trackEngagement('chatbot_seviyan', 'completed', duration);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);

    const newUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setInput('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/chat/message`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "I'm here for you. Can you tell me more?";

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.safety_triggered) {
        toast.warning(
          'We noticed you might be going through a tough time. Please reach out to someone you trust.',
        );
      }
    } catch (error) {
      console.error('Failed to send chat message', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I had trouble connecting. Please try again — I'm here for you.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const visibleMessages = filterVisibleMessages(messages);
  const hasConversation = visibleMessages.length > 0;

  const theme = getTheme('chat');

  return (
    <ModulePage theme={theme}>
      <ZenPage atmosphere="none" className="h-[calc(100dvh-4rem)]">
      <div className="flex h-full w-full max-w-[1600px] mx-auto px-2 lg:px-4">
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zen-border-soft glass">
            <div className="flex items-center gap-3 min-w-0">
              <PandaAvatar state={pandaState} size={44} label={`Seviyan is ${pandaState}`} />
              <div className="min-w-0">
                <h1 className="zen-h3 text-zen-fg truncate">Seviyan</h1>
                <p className="zen-caption text-zen-fg-muted">Your listening companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ZenButton
                variant="outline"
                size="sm"
                onClick={() => setMessages([])}
              >
                Clear chat
              </ZenButton>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
              {hasConversation ? (
                visibleMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    {...enterMotion}
                    className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'relative max-w-[85%] lg:max-w-[75%] rounded-zen-xl px-5 py-4 shadow-zen-subtle',
                        message.role === 'user'
                          ? 'bg-zen-primary text-white ml-6 lg:ml-12'
                          : 'bg-white border border-zen-border mr-6 lg:mr-12 text-zen-fg',
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed zen-body md:text-lg">{message.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : null}

              {isSending ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-zen-border rounded-zen-xl px-4 py-3 shadow-zen-subtle">
                    <Loader2 className="h-5 w-5 animate-spin text-zen-primary" aria-label="Seviyan is thinking" />
                  </div>
                </motion.div>
              ) : null}

              {!visibleMessages.length && !isSending ? (
                <motion.div
                  {...enterMotion}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] lg:max-w-[75%] rounded-zen-xl border border-zen-border bg-white px-5 py-4 shadow-zen-subtle mr-6 lg:mr-12">
                    <p className="text-zen-fg whitespace-pre-wrap leading-relaxed zen-body md:text-lg">
                      {initialGreeting.content}
                    </p>
                  </div>
                </motion.div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-zen-border-soft glass px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto w-full max-w-5xl space-y-3">
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <ZenBadge
                    key={prompt}
                    as="button"
                    interactive
                    variant="primary"
                    size="lg"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </ZenBadge>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                <div className="flex-1">
                  <ZenInput
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Share what's on your mind…"
                    disabled={isSending}
                    aria-label="Message Seviyan"
                  />
                </div>
                <ZenButton
                  type="submit"
                  size="icon-md"
                  disabled={isSending || !input.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </ZenButton>
              </form>
            </div>
          </div>
        </div>
      </div>
      </ZenPage>
    </ModulePage>
  );
};

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatContent />
    </RequireAuth>
  );
}
