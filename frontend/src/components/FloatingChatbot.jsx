import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaEllipsisH } from "react-icons/fa";

const FloatingChatbot = ({ isOpen: externalIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [messages, setMessages] = useState([
    {
      type: "agent",
      content: "Hello! I'm your shopping assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with external prop
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Ensure component mounts properly
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    // Simulate chatbot response (replace with actual API call)
    setTimeout(() => {
      const responses = [
        "I can help you find products, check order status, or answer questions about shopping. What would you like to know?",
        "That's a great question! You can browse products, add them to your cart, and checkout easily. Need help with anything specific?",
        "I'm here to help! You can search for products, view your orders, or get assistance with your shopping experience. What do you need?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          content: randomResponse,
          timestamp: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 1000);

    // TODO: Replace with actual API call to chatbot backend
    // try {
    //   const response = await fetch('http://localhost:8000/chat', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ query: inputValue.trim() })
    //   });
    //   const data = await response.json();
    //   setMessages(prev => [...prev, {
    //     type: 'agent',
    //     content: data.final_answer,
    //     timestamp: new Date().toISOString()
    //   }]);
    // } catch (error) {
    //   setMessages(prev => [...prev, {
    //     type: 'agent',
    //     content: 'Sorry, I encountered an error. Please try again.',
    //     timestamp: new Date().toISOString()
    //   }]);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button - Enhanced (only show if no external control) */}
      {externalIsOpen === undefined && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-[9999] w-20 h-20 bg-gradient-to-br from-[#FF8C00] to-[#FF4B91] hover:from-[#ffa733] hover:to-[#FF6BA3] text-black rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
          style={{ position: "fixed" }}
          whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
        >
        {/* Animated Background Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-white/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <FaTimes size={28} className="group-hover:rotate-90 transition-transform relative z-10" />
          ) : (
            <FaComments size={28} className="relative z-10" />
          )}
        </motion.div>

        {/* Notification Badge */}
        {!isOpen && (
          <motion.span
            className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-[#FF4B91] to-[#8A2BE2] rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            💬
          </motion.span>
        )}

        {/* Pulse Effect */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[#FF8C00]"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.7, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </motion.button>
      )}

      {/* Chatbot Modal - Enhanced */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-6 z-[9998] w-[420px] h-[650px] bg-gradient-to-br from-[#2E2E2E] to-[#1e1e1e] backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-[#FF8C00]/40 flex flex-col overflow-hidden"
            style={{
              boxShadow: "0 20px 60px rgba(255, 140, 0, 0.3), 0 0 40px rgba(255, 75, 145, 0.2)",
              position: "fixed",
            }}
          >
            {/* Header - Enhanced */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-[#FF8C00] via-[#FF4B91] to-[#FF8C00] p-5 flex items-center justify-between relative overflow-hidden"
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <motion.div
                  className="p-3 bg-black/30 rounded-full border-2 border-white/30 backdrop-blur-sm"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FaRobot size={24} className="text-black" />
                </motion.div>
                <div>
                  <h3 className="font-extrabold text-black text-xl drop-shadow-lg">
                    Shopping Assistant
                  </h3>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <p className="text-xs text-black/80 font-semibold">Online now</p>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={handleClose}
                className="p-2 hover:bg-black/30 rounded-full transition-all relative z-10 group"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="text-black group-hover:text-red-600" size={18} />
              </motion.button>
            </motion.div>

            {/* Messages - Enhanced */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-[#1e1e1e]/30">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                >
                  {message.type === "agent" && (
                    <motion.div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FF4B91] flex items-center justify-center flex-shrink-0 mb-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <FaRobot size={14} className="text-black" />
                    </motion.div>
                  )}
                  <motion.div
                    className={`max-w-[75%] rounded-2xl p-4 shadow-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-[#FF8C00] to-[#ffa733] text-black font-medium"
                        : "bg-[#1e1e1e] text-gray-100 border-2 border-[#FF8C00]/30 backdrop-blur-sm"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === "user" ? "text-black/60" : "text-gray-500"}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </motion.div>
                  {message.type === "user" && (
                    <motion.div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4B91] to-[#8A2BE2] flex items-center justify-center flex-shrink-0 mb-1 text-white font-bold text-xs"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      Y
                    </motion.div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start items-end gap-2"
                >
                  <motion.div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FF4B91] flex items-center justify-center flex-shrink-0 mb-1"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <FaRobot size={14} className="text-black" />
                  </motion.div>
                  <div className="bg-[#1e1e1e] rounded-2xl p-4 border-2 border-[#FF8C00]/30">
                    <div className="flex gap-2 items-center">
                      <motion.div
                        className="w-2.5 h-2.5 bg-[#FF8C00] rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2.5 h-2.5 bg-[#FF8C00] rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2.5 h-2.5 bg-[#FF8C00] rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Enhanced */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-5 border-t-2 border-[#FF8C00]/30 bg-gradient-to-t from-[#1e1e1e] to-[#2E2E2E]"
            >
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-5 py-3 pr-12 rounded-xl bg-[#2E2E2E] text-gray-100 border-2 border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-4 focus:ring-[#FF8C00]/20 outline-none transition-all duration-300 placeholder-gray-500 shadow-lg hover:border-[#FF8C00]/50 disabled:opacity-50"
                    disabled={loading}
                  />
                  {inputValue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setInputValue("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-[#FF8C00]/20 text-gray-400 hover:text-[#FF8C00] transition-colors"
                    >
                      <FaTimes size={12} />
                    </motion.button>
                  )}
                </div>
                <motion.button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || loading}
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-4 rounded-xl bg-gradient-to-br from-[#FF8C00] to-[#FF4B91] hover:from-[#ffa733] hover:to-[#FF6BA3] text-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden ${
                    inputValue.trim() && !loading ? "shadow-[#FF8C00]/50" : ""
                  }`}
                >
                  <motion.div
                    animate={inputValue.trim() && !loading ? { rotate: [0, 15, -15, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <FaPaperPlane size={20} />
                  </motion.div>
                  {inputValue.trim() && !loading && (
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-xl"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                    />
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;
