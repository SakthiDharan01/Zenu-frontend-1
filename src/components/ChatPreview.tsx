import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import type { AuthUser } from "@/lib/authClient";

interface ChatPreviewProps {
  user: AuthUser | null;
}

export const ChatPreview = ({ user }: ChatPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>(() => {
    const initialName = user?.username ?? user?.fullName ?? user?.email?.split('@')[0] ?? null;
    const greeting = `Hi${initialName ? ` ${initialName}` : ''}! I'm Seviyan, your wellness companion. How can I support you today?`;
    return [{ text: greeting, sender: 'bot' }];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const greetingPrefix = useMemo(() => {
    if (!user) return null;
    return user.username ?? user.fullName ?? user.email?.split('@')[0] ?? null;
  }, [user]);

  const suggestedPrompts = [
    "I'm feeling tense — help me breathe",
    "I need to calm down quickly",
    "Help me journal my thoughts"
  ];

  const initialGreeting = useMemo(() => (
    `Hi${greetingPrefix ? ` ${greetingPrefix}` : ''}! I'm Seviyan, your wellness companion. How can I support you today?`
  ), [greetingPrefix]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0]?.sender === 'bot') {
        return [{ text: initialGreeting, sender: 'bot' }];
      }
      return prev;
    });
  }, [initialGreeting]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMessage = { text: text.trim(), sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.sendChatMessage({
        message: text.trim(),
        ...(conversationId ? { conversationId } : {})
      });

      setConversationId(response.conversationId);
      setMessages(prev => [...prev, { text: response.reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: "I'm having trouble connecting right now. Please try again in a moment.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-br from-zen-primary to-zen-accent hover:scale-110 hover:shadow-xl",
          isOpen && "scale-95"
        )}
        aria-label="Open chat with Seviyan"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] glass-card rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-zen-primary to-zen-accent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Seviyan</h3>
                  <p className="text-xs text-white/80">
                    {greetingPrefix ? `Supporting ${greetingPrefix}` : 'AI Wellness Companion'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                    message.sender === 'user'
                      ? "bg-gradient-to-r from-zen-primary to-zen-accent text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-zen-muted animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-zen-muted animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-2 h-2 rounded-full bg-zen-muted animate-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Suggested:</p>
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left text-xs px-3 py-2 rounded-xl bg-zen-primary/5 hover:bg-zen-primary/10 text-zen-primary border border-zen-primary/20 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border-zen-primary/20 focus:border-zen-primary"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isLoading}
                className="rounded-xl bg-gradient-to-r from-zen-primary to-zen-accent hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
