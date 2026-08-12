"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageCirclePlus, MessagesSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

import { RequireAuth } from '@/components/auth/RequireAuth';
import PandaAvatar from '@/components/PandaAvatar';
import { apiClient } from '@/lib/apiClient';
import type { ChatMessage, ConversationSummary } from '@/lib/types';
import { trackEngagement } from '@/lib/signals';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  ZenPage,
  ZenButton,
  ZenBadge,
  ZenInput,
  ZenSkeleton,
  ZenSheet,
  ZenSheetContent,
  ZenSheetHeader,
  ZenSheetTitle,
} from '@/components/zen';

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

function ConversationList({
  conversations,
  activeId,
  loading,
  onSelect,
  onNew,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-col h-full gap-3">
      <ZenButton variant="outline" size="sm" onClick={onNew} className="w-full justify-start">
        <MessageCirclePlus className="h-4 w-4" aria-hidden="true" />
        New conversation
      </ZenButton>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {loading ? (
          <div className="space-y-2">
            <ZenSkeleton className="h-10 w-full" rounded="lg" />
            <ZenSkeleton className="h-10 w-full" rounded="lg" />
            <ZenSkeleton className="h-10 w-5/6" rounded="lg" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="zen-body-sm text-zen-fg-muted px-1">No conversations yet.</p>
        ) : (
          conversations.map((conversation) => {
            const active = conversation.id === activeId;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  'w-full text-left rounded-zen-lg px-3 py-2.5 min-h-11',
                  'text-sm transition-colors duration-zen-fast ease-zen-out',
                  'active:scale-[0.98]',
                  'focus-visible:outline-2 focus-visible:outline-zen-primary focus-visible:outline-offset-2',
                  active
                    ? 'bg-zen-primary-soft text-zen-primary font-medium'
                    : 'text-zen-fg-muted hover:bg-zen-bg-subtle hover:text-zen-fg',
                )}
              >
                <span className="line-clamp-2">{conversation.title ?? 'Untitled conversation'}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

const ChatContent = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    setChatError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/chat/conversations/${conversationId}/messages`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const msgList = data.messages || [];
        msgList.sort((a: any, b: any) => new Date(a.created_at || a.createdAt).getTime() - new Date(b.created_at || b.createdAt).getTime());
        setMessages(msgList.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at || m.createdAt || new Date().toISOString(),
        })));
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Failed to load chat messages', error);
      setChatError('We could not load this conversation. Please try again.');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    const loadConversations = async () => {
      setConversationsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/chat/conversations`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const list = (data.conversations || data || []) as ConversationSummary[];
          setConversations(Array.isArray(list) ? list : []);
        }
      } catch {
        setConversations([]);
      } finally {
        setConversationsLoading(false);
      }
    };
    void loadConversations();
  }, []);

  const handleSelectConversation = async (conversationId: string) => {
    if (conversationId === 'new') {
      setActiveConversationId(null);
      setMessages([]);
      setSheetOpen(false);
      return;
    }

    if (conversationId === activeConversationId) {
      setSheetOpen(false);
      return;
    }
    setActiveConversationId(conversationId);
    await loadMessages(conversationId);
    setSheetOpen(false);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setChatError(null);

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
          session_id: activeConversationId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      
      if (data.session_id && !activeConversationId) {
        setActiveConversationId(data.session_id);
        const convRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/chat/conversations`, {
          credentials: 'include',
        });
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.conversations || []);
        }
      }

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
  const hasConversation = Boolean(activeConversationId || visibleMessages.length);

  return (
    <ZenPage atmosphere="calm" gradient className="h-[calc(100dvh-4rem)]">
      <div className="flex h-full max-w-6xl mx-auto">
        <aside
          className={cn(
            'hidden md:flex flex-col border-r border-zen-border-soft glass-subtle',
            'transition-[width] duration-zen-base ease-zen-out overflow-hidden',
            sidebarOpen ? 'w-72 p-4' : 'w-0 p-0 border-0',
          )}
        >
          {sidebarOpen ? (
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              loading={conversationsLoading}
              onSelect={(id) => void handleSelectConversation(id)}
              onNew={() => void handleSelectConversation('new')}
            />
          ) : null}
        </aside>

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
                variant="ghost"
                size="icon-md"
                className="hidden md:inline-flex"
                aria-label={sidebarOpen ? 'Collapse conversations' : 'Expand conversations'}
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <MessagesSquare className="h-5 w-5" />
              </ZenButton>
              <ZenButton
                variant="ghost"
                size="icon-md"
                className="md:hidden"
                aria-label="Open conversations"
                onClick={() => setSheetOpen(true)}
              >
                <MessagesSquare className="h-5 w-5" />
              </ZenButton>
              <ZenButton
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => void handleSelectConversation('new')}
              >
                <MessageCirclePlus className="h-4 w-4" aria-hidden="true" />
                New
              </ZenButton>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              {chatError ? (
                <div
                  className="rounded-zen-xl border border-zen-danger/25 bg-zen-danger-soft px-4 py-3 zen-body-sm text-zen-danger"
                  role="alert"
                >
                  {chatError}
                </div>
              ) : null}

              {loadingMessages ? (
                <div className="space-y-4">
                  <ZenSkeleton className="h-20 w-3/4" rounded="xl" />
                  <ZenSkeleton className="h-20 w-2/3 ml-auto" rounded="xl" />
                  <ZenSkeleton className="h-20 w-4/5" rounded="xl" />
                </div>
              ) : hasConversation ? (
                visibleMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    {...enterMotion}
                    className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'relative max-w-lg rounded-zen-xl px-4 py-3 shadow-zen-subtle',
                        message.role === 'user'
                          ? 'bg-zen-primary text-white ml-10'
                          : 'bg-white border border-zen-border mr-10 text-zen-fg',
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed zen-body-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-zen-xl border border-dashed border-zen-primary/30 bg-zen-primary-soft px-6 py-10 text-center">
                  <p className="zen-h3 text-zen-primary">Start a new conversation</p>
                  <p className="mt-2 zen-body-sm text-zen-fg-muted">
                    Seviyan can help you process emotions, plan gentle actions, or celebrate small wins.
                  </p>
                </div>
              )}

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

              {!loadingMessages && !visibleMessages.length && !isSending ? (
                <motion.div
                  {...enterMotion}
                  className="flex justify-start"
                >
                  <div className="max-w-lg rounded-zen-xl border border-zen-border bg-white px-4 py-3 shadow-zen-subtle mr-10">
                    <p className="text-zen-fg whitespace-pre-wrap leading-relaxed zen-body-sm">
                      {initialGreeting.content}
                    </p>
                  </div>
                </motion.div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-zen-border-soft glass px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto w-full max-w-3xl space-y-3">
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

      <ZenSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <ZenSheetContent side="bottom" className="h-[70vh]">
          <ZenSheetHeader>
            <ZenSheetTitle>Conversations</ZenSheetTitle>
          </ZenSheetHeader>
          <div className="mt-4 h-[calc(100%-3rem)]">
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              loading={conversationsLoading}
              onSelect={(id) => void handleSelectConversation(id)}
              onNew={() => void handleSelectConversation('new')}
            />
          </div>
        </ZenSheetContent>
      </ZenSheet>
    </ZenPage>
  );
};

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatContent />
    </RequireAuth>
  );
}
