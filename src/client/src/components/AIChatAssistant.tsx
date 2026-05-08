import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/ThemeProvider";
import { apiRequest } from "@/lib/queryClient";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Syringe,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
}

export interface ChatTrigger {
  type: "peptide" | "glp1" | "general";
  proactiveMessage: string;
}

interface AIChatAssistantProps {
  protocolData?: any;
  biomarkerData?: any;
  triggerContext?: ChatTrigger | null;
  onTriggerConsumed?: () => void;
}

const QUICK_SUGGESTIONS: Record<string, string[]> = {
  peptide: [
    "Give me a day-by-day guide for my peptide stack",
    "Week-by-week dosing schedule",
    "Can I stack these peptides together safely?",
    "What if I miss a dose — flexible alternatives?",
  ],
  glp1: [
    "Give me a week-by-week GLP-1 titration guide",
    "What should I eat while on GLP-1?",
    "How do I manage GLP-1 side effects?",
    "When will I start seeing results?",
  ],
  general: [
    "Give me a day-by-day protocol guide",
    "What are the top 3 things to focus on first?",
    "How long until I see results?",
    "What are flexible alternatives to my protocol?",
  ],
};

export function AIChatAssistant({
  protocolData,
  biomarkerData,
  triggerContext,
  onTriggerConsumed,
}: AIChatAssistantProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your Health Optimization Assistant. Ask me anything about your biomarkers, protocols, or how to improve specific health markers.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<string>("general");
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        context: {
          protocol: protocolData,
          biomarkers: biomarkerData,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        isEmergency: data.isEmergency || false,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Handle external trigger (peptide / GLP-1 section viewed)
  useEffect(() => {
    if (!triggerContext) return;

    // Open chat
    setIsOpen(true);
    setIsMinimized(false);

    // Inject proactive bot message
    const proactiveMsg: Message = {
      id: `trigger-${Date.now()}`,
      role: "assistant",
      content: triggerContext.proactiveMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => {
      // Avoid duplicate trigger messages
      const alreadyHas = prev.some((m) => m.id.startsWith("trigger-"));
      if (alreadyHas) return prev;
      return [...prev, proactiveMsg];
    });

    // Show quick suggestion chips
    setSuggestionType(triggerContext.type);
    setShowSuggestions(true);
    setHasUserSentMessage(false);

    // Tell parent we consumed this trigger
    onTriggerConsumed?.();
  }, [triggerContext]);

  const handleSend = (text?: string) => {
    const msg = (text || inputValue).trim();
    if (!msg || chatMutation.isPending) return;

    setHasUserSentMessage(true);
    setShowSuggestions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(msg);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions =
    QUICK_SUGGESTIONS[suggestionType] || QUICK_SUGGESTIONS.general;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-brand-red hover:bg-brand-red/90 z-50"
        size="icon"
        data-testid="button-open-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed z-50 shadow-2xl transition-all duration-300 ${
        isMinimized
          ? "bottom-6 right-6 w-72 h-14"
          : "bottom-6 right-6 w-96 h-[560px] max-h-[85vh]"
      }`}
      data-testid="chat-container"
    >
      <CardHeader className="p-3 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-brand-red/20">
            <Bot className="w-4 h-4 text-brand-red" />
          </div>
          <CardTitle className="text-sm font-medium">Health Assistant</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(!isMinimized)}
            data-testid="button-minimize-chat"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-56px)]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="p-1.5 rounded-full bg-muted h-fit">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-brand-red text-white"
                        : message.isEmergency
                          ? "bg-red-950 border-2 border-red-500 text-red-100"
                          : "bg-muted text-foreground"
                    }`}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    {message.isEmergency && (
                      <div className="flex items-center gap-2 mb-2 text-red-400 font-semibold">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Emergency Safety Notice
                      </div>
                    )}
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="p-1.5 rounded-full bg-brand-red/20 h-fit">
                      <User className="w-4 h-4 text-brand-red" />
                    </div>
                  )}
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-2 justify-start">
                  <div className="p-1.5 rounded-full bg-muted h-fit">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick suggestion chips — shown after trigger, hidden once user sends */}
          {showSuggestions && !hasUserSentMessage && (
            <div className="px-3 py-2 border-t border-border flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-brand-red/40 text-brand-red hover:bg-brand-red/10 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your health..."
                className="flex-1"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || chatMutation.isPending}
                size="icon"
                className="bg-brand-red hover:bg-brand-red/90"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
