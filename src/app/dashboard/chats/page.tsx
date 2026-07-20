"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserChats, getMessages, sendMessage } from "@/app/actions/chat";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  MessageSquare, 
  User, 
  Loader2, 
  FileText, 
  ChevronLeft, 
  ExternalLink 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatsPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  // Subscribe to real-time chats update (last messages snippet in sidebar)
  useEffect(() => {
    if (!user) return;

    const chatsChannel = supabase
      .channel("realtime:chats_sidebar")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async () => {
          // Simply reload the chats list to get the updated last message snippet
          const res = await getUserChats(user.uid);
          if (res.success && res.chats) {
            setChats(res.chats);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatsChannel);
    };
  }, [user]);

  // Subscribe to selected chat's real-time messages
  useEffect(() => {
    if (!selectedChat) return;

    setLoadingMessages(true);
    getMessages(selectedChat.id).then((res) => {
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
      setLoadingMessages(false);
      scrollToBottom();
    });

    const msgChannel = supabase
      .channel(`chat_messages:${selectedChat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            // Avoid duplicate additions
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const res = await getUserChats(user!.uid);
      if (res.success && res.chats) {
        setChats(res.chats);
        // Automatically select first chat if available on desktop
        if (res.chats.length > 0 && window.innerWidth >= 768) {
          setSelectedChat(res.chats[0]);
          setMobileView("chat");
        }
      }
    } catch (err) {
      toast.error("Failed to load conversations");
    } finally {
      setLoadingChats(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat || sendingMessage) return;

    const messageText = inputText.trim();
    setInputText("");
    setSendingMessage(true);

    try {
      const res = await sendMessage(selectedChat.id, user!.uid, messageText);
      if (res.success) {
        // Update local state if the realtime subscription hasn't caught it yet
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message?.id)) return prev;
          return [...prev, res.message];
        });
        
        // Update sidebar last message locally
        setChats((prevChats) =>
          prevChats.map((c) =>
            c.id === selectedChat.id
              ? { ...c, last_message: res.message }
              : c
          )
        );
      } else {
        toast.error("Failed to send message: " + res.error);
        setInputText(messageText);
      }
    } catch (err) {
      toast.error("Failed to send message");
      setInputText(messageText);
    } finally {
      setSendingMessage(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] flex gap-4 max-w-7xl mx-auto overflow-hidden">
      {/* ── Sidebar Conversations Panel ── */}
      <div className={cn(
        "w-full md:w-80 bg-card rounded-2xl border border-border/60 flex flex-col overflow-hidden shrink-0",
        mobileView === "chat" && "hidden md:flex"
      )}>
        <div className="p-4 border-b border-border/50">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conversations
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Chat with candidates and recruiters</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading conversations…</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2 opacity-35" />
              <p className="text-sm font-semibold">No messages yet</p>
              <p className="text-xs mt-0.5 leading-relaxed">Chats are created when you apply for a job or start a discussion.</p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = chat.other_user;
              const isSelected = selectedChat?.id === chat.id;
              const lastMsgText = chat.last_message?.text || chat.last_message?.content || "";

              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setMobileView("chat");
                  }}
                  className={cn(
                    "w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group relative",
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                      : "hover:bg-muted/80 text-foreground"
                  )}
                >
                  {otherUser.avatar_url ? (
                    <img 
                      src={otherUser.avatar_url} 
                      alt={otherUser.full_name} 
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10 shrink-0"
                    />
                  ) : (
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                    )}>
                      {(otherUser.full_name || "?")[0].toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-semibold text-sm truncate max-w-[130px]">
                        {otherUser.full_name}
                      </span>
                      {chat.last_message && (
                        <span className={cn(
                          "text-[9px]",
                          isSelected ? "text-primary-foreground/75" : "text-muted-foreground"
                        )}>
                          {formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs truncate leading-normal",
                      isSelected ? "text-primary-foreground/90 font-medium" : "text-muted-foreground"
                    )}>
                      {lastMsgText || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area Panel ── */}
      <div className={cn(
        "flex-1 bg-card rounded-2xl border border-border/60 flex flex-col overflow-hidden relative",
        mobileView === "list" && "hidden md:flex"
      )}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden h-8 w-8 rounded-lg"
                  onClick={() => setMobileView("list")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                {selectedChat.other_user.avatar_url ? (
                  <img 
                    src={selectedChat.other_user.avatar_url} 
                    alt={selectedChat.other_user.full_name} 
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/10"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {selectedChat.other_user.full_name[0].toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-sm leading-none">{selectedChat.other_user.full_name}</h3>
                  <span className="text-[10px] text-muted-foreground capitalize mt-0.5 inline-block">
                    {selectedChat.other_user.role || "User"}
                  </span>
                </div>
              </div>

              {selectedChat.document_id && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5 hidden sm:flex"
                  onClick={() => window.open(`/p/${selectedChat.seeker_id}`, "_blank")}
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Portfolio
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm font-semibold">Start the conversation</p>
                  <p className="text-xs">Type your message below and press send.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_id === user?.uid;
                  const msgText = msg.text || msg.content || "";

                  return (
                    <div 
                      key={msg.id || index}
                      className={cn(
                        "flex w-full",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed",
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted text-foreground rounded-tl-none"
                      )}>
                        <p className="whitespace-pre-wrap">{msgText}</p>
                        <div className={cn(
                          "text-[9px] mt-1.5 flex justify-end",
                          isMe ? "text-primary-foreground/75" : "text-muted-foreground/80"
                        )}>
                          {format(new Date(msg.created_at), "h:mm a")}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border/50 flex gap-2 bg-card">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message…"
                className="rounded-xl flex-1 focus-visible:ring-primary focus-visible:ring-offset-0 border-border/60"
                disabled={sendingMessage}
                required
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-[#3482BE] hover:bg-[#2a699a] shrink-0 rounded-xl"
                disabled={sendingMessage || !inputText.trim()}
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4 opacity-50">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Your Chat Center</h3>
            <p className="text-sm max-w-sm mt-1">Select a conversation from the sidebar to view messages, share CVs, and discuss applications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
