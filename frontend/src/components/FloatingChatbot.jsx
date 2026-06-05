import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// --- FIXED THE IMPORT HERE ---
// Replaced FaSparkles with FaMagic, which is available in the 'fa' package.
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaMagic } from "react-icons/fa";

const CHATBOT_API_URL =
  import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8000";

const FloatingChatbot = ({ isOpen: externalIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [messages, setMessages] = useState([
    {
      type: "agent",
      content: "Hello! I'm your AI shopping assistant. How can I help you find the perfect item today?",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle external props
  useEffect(() => {
    if (externalIsOpen !== undefined) setIsOpen(externalIsOpen);
  }, [externalIsOpen]);

  // Handle mounting to avoid hydration errors
  useEffect(() => setMounted(true), []);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userText = inputValue.trim();

    const userMessage = {
      type: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const authToken = localStorage.getItem("token");
      const response = await fetch(`${CHATBOT_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userText,
          ...(authToken ? { auth_token: authToken } : {}),
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      const botMessage = {
        type: "agent",
        content: data.final_answer,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat connection error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          content: "Sorry, I can't connect to the server right now. Please ensure the backend is running.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) return null;

  // Inline style to hide scrollbar (cross-browser compatible)
  const hideScrollbarStyle = {
    msOverflowStyle: 'none',  /* IE and Edge */
    scrollbarWidth: 'none',  /* Firefox */
  };

  return (
    <>
      {/* Floating Chat Button */}
      {externalIsOpen === undefined && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          {/* Ping animation */}
          {!isOpen && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
          )}
          
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-xl transition-all border border-white/20 backdrop-blur-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <FaTimes size={24} className="text-white" />
              ) : (
                <FaComments size={28} className="text-white" />
              )}
            </motion.div>
          </motion.button>
        </div>
      )}

      {/* Main Chat Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-box"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-[9998] flex h-[600px] w-[380px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-xl sm:w-[420px]"
          >
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 shadow-lg">
                  <FaRobot className="text-white" size={18} />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0a] bg-emerald-400"></span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Shopping AI</h3>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
                    <p className="text-[10px] font-medium text-gray-400">Online & Ready</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              className="relative z-10 flex-1 overflow-y-auto p-4"
              style={hideScrollbarStyle} // Applied inline style instead of <style> tag
            >
              {/* Hide scrollbar for Webkit (Chrome/Safari) via inline style approach didn't cover css selector, so we rely on container overflow */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium text-gray-500">
                    Today
                  </span>
                </div>

                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        message.type === "user"
                          ? "rounded-tr-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                          : "rounded-tl-sm border border-white/10 bg-white/10 text-gray-100 backdrop-blur-sm"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`mt-1 text-[9px] ${message.type === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/5">
                      {/* --- FIXED THE ICON HERE --- */}
                      <FaMagic className="text-purple-400" size={12} />
                    </div>
                    <div className="flex h-8 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-4">
                      <motion.div className="h-1.5 w-1.5 rounded-full bg-purple-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                      <motion.div className="h-1.5 w-1.5 rounded-full bg-purple-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="h-1.5 w-1.5 rounded-full bg-purple-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="relative z-20 p-4">
              <div className="relative flex items-center gap-2 rounded-3xl border border-white/20 bg-white/5 p-2 pl-4 shadow-lg backdrop-blur-md transition-all focus-within:border-purple-500/50 focus-within:bg-white/10">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about products..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none disabled:opacity-50"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    inputValue.trim() && !loading
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  <FaPaperPlane size={14} className={inputValue.trim() ? "translate-x-0.5 translate-y-0.5" : ""} />
                </motion.button>
              </div>
              <div className="mt-2 text-center">
                <p className="text-[9px] text-gray-500">Powered by Groq RAG Technology</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;
