"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, Loader2, MessageCirclePlus } from 'lucide-react';
import { toast } from 'sonner';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { apiClient } from '@/lib/apiClient';
import type { ChatMessage, ConversationSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const initialGreeting: ChatMessage = {
  id: -1,
  role: 'assistant',
  content: "Hello, I’m Seviyan. Share what’s on your mind, and we’ll work through it together.",
  createdAt: new Date().toISOString()
};

const filterVisibleMessages = (messages: ChatMessage[]) =>
  messages.filter((message) => message.role === 'user' || message.role === 'assistant');

const ChatContent = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    setChatError(null);
    try {
      const data = await apiClient.getChatMessages(conversationId);
      data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(data);
    } catch (error) {
      console.error('Failed to load chat messages', error);
      setChatError('We could not load this conversation. Please try again.');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const loadConversations = useCallback(async (preferredId?: string | null) => {
    setConversationsLoading(true);
    setChatError(null);
    try {
      const list = await apiClient.listChatConversations();
      setConversations(list);

      let nextId = preferredId ?? activeConversationId;
      if (nextId && !list.some((item) => item.id === nextId)) {
        nextId = null;
      }
      if (!nextId && list.length) {
        nextId = list[0].id;
      }

      setActiveConversationId(nextId ?? null);

      if (nextId) {
        await loadMessages(nextId);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load conversations', error);
      setChatError('We could not load your conversations. Please refresh.');
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
    } finally {
      setConversationsLoading(false);
    }
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const handleSelectConversation = async (conversationId: string) => {
    if (conversationId === 'new') {
      setActiveConversationId(null);
      setMessages([]);
      return;
    }

    if (conversationId === activeConversationId) return;
    setActiveConversationId(conversationId);
    await loadMessages(conversationId);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    setIsSending(true);
    setChatError(null);

    const tempId = Date.now();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');

    try {
      const response = await apiClient.sendChatMessage({
        message: trimmed,
        conversationId: activeConversationId ?? undefined
      });

      await loadConversations(response.conversationId);
    } catch (error) {
      console.error('Failed to send chat message', error);
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
      toast.error('Unable to send your message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const visibleMessages = filterVisibleMessages(messages);
  const hasConversation = Boolean(activeConversationId || visibleMessages.length);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Seviyan</span>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Select value={activeConversationId ?? 'new'} onValueChange={handleSelectConversation} disabled={conversationsLoading}>
              <SelectTrigger className="sm:w-64">
                <SelectValue placeholder="Choose a conversation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New conversation</SelectItem>
                {conversations.map((conversation) => (
                  <SelectItem key={conversation.id} value={conversation.id}>
                    {conversation.title ?? 'Untitled conversation'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => handleSelectConversation('new')}>
              <MessageCirclePlus className="h-4 w-4" />
              Reset chat
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          {chatError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{chatError}</div>
          ) : null}

          {loadingMessages ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="h-20 w-2/3" />
              <Skeleton className="h-20 w-4/5" />
            </div>
          ) : hasConversation ? (
            <>
              {visibleMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`relative max-w-lg rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user' ? 'bg-blue-600 text-white ml-12' : 'bg-white border border-gray-200 mr-12 text-gray-800'}`}
                  >
                    {message.role === 'assistant' ? <Bot className="absolute -left-10 top-1 h-8 w-8 text-blue-600" /> : null}
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 px-6 py-10 text-center text-blue-600">
              <p className="text-lg font-medium">Start a new conversation</p>
              <p className="mt-2 text-sm text-blue-500">Seviyan can help you process emotions, plan gentle actions, or celebrate small wins.</p>
            </div>
          )}

          {isSending ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm mr-12">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            </motion.div>
          ) : null}

          {!loadingMessages && !visibleMessages.length && !isSending ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="relative max-w-lg rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm mr-12">
                <Bot className="absolute -left-10 top-1 h-8 w-8 text-blue-600" />
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{initialGreeting.content}</p>
              </div>
            </motion.div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-white px-4 py-4">
        <form onSubmit={handleSendMessage} className="mx-auto flex w-full max-w-3xl gap-3">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Share what’s on your mind…"
            disabled={isSending}
            className="rounded-xl"
          />
          <Button type="submit" disabled={isSending || !input.trim()} className="rounded-xl">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatContent />
    </RequireAuth>
  );
}
