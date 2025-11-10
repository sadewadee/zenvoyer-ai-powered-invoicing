import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare, Send, User, X, Wrench, Clock } from 'lucide-react';
import { chatService, formatTime, renderToolCall } from '@/lib/chat';
import type { ChatState } from '../../worker/types';
import { cn } from '@/lib/utils';
export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      chatService.newSession();
      chatService.getMessages().then(res => {
        if (res.success && res.data) setChatState(res.data);
      });
    }
  }, [isOpen]);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatState.messages, chatState.streamingMessage]);
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const message = input.trim();
    setInput('');
    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: message, timestamp: Date.now() };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage], isProcessing: true, streamingMessage: '' }));
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({ ...prev, streamingMessage: (prev.streamingMessage || '') + chunk }));
    });
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(response.data);
    } else {
      setChatState(prev => ({ ...prev, isProcessing: false }));
    }
  };
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 bg-primary-700 hover:bg-primary-800"
      >
        <MessageSquare className="h-8 w-8" />
      </Button>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[85vh] flex flex-col">
          <DrawerHeader className="flex justify-between items-center">
            <div>
              <DrawerTitle className="flex items-center gap-2 text-xl">
                <Bot className="h-6 w-6 text-primary-700" />
                AI Support Assistant
              </DrawerTitle>
              <DrawerDescription>Ask me anything about your invoices or clients.</DrawerDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </DrawerHeader>
          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {chatState.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'assistant' && <Bot className="h-6 w-6 text-primary-700 flex-shrink-0" />}
                  <div className={cn("max-w-md rounded-lg p-3", msg.role === 'user' ? 'bg-primary-700 text-white' : 'bg-muted')}>
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    {msg.toolCalls && (
                      <div className="mt-2 pt-2 border-t border-current/20 space-y-1">
                        <p className="text-xs opacity-80 flex items-center gap-1"><Wrench className="h-3 w-3" /> Tools Used:</p>
                        {msg.toolCalls.map((tool, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{renderToolCall(tool)}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs opacity-60 mt-2 text-right flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" /> {formatTime(msg.timestamp)}
                    </p>
                  </div>
                  {msg.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                </motion.div>
              ))}
              {chatState.streamingMessage && (
                <div className="flex items-start gap-3 justify-start">
                  <Bot className="h-6 w-6 text-primary-700 flex-shrink-0" />
                  <div className="max-w-md rounded-lg p-3 bg-muted">
                    <p className="whitespace-pre-wrap text-sm">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
                  </div>
                </div>
              )}
              {chatState.isProcessing && !chatState.streamingMessage && (
                <div className="flex items-start gap-3 justify-start">
                  <Bot className="h-6 w-6 text-primary-700 flex-shrink-0" />
                  <div className="max-w-md rounded-lg p-3 bg-muted flex items-center gap-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
                placeholder="e.g., 'What was my total revenue last month?'"
                className="flex-1 resize-none"
                rows={1}
                disabled={chatState.isProcessing}
              />
              <Button type="submit" disabled={!input.trim() || chatState.isProcessing}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}