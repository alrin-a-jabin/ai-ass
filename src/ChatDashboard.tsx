import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import './ChatDashboard.css';
import { analyzeAndRespond } from './services/aiService';

interface Message {
  text: string;
  isUser: boolean;
  hasIssues?: boolean;
  timestamp: number;
}

const ChatDashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAIThinking]);

  const handleSend = async (message: string) => {
    // Add user message
    const userMessage: Message = {
      text: message,
      isUser: true,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    // Get AI response
    setIsAIThinking(true);
    try {
      const aiResponse = await analyzeAndRespond(message);
      
      const aiMessage: Message = {
        text: aiResponse.message,
        isUser: false,
        hasIssues: aiResponse.hasIssues,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAIThinking(false);
    }
  };

  return (
    <div className="chat-dashboard-container">
      <header className="chat-header">
        <h1>Language Chat Dashboard</h1>
        <span className="chat-subtitle">Practice, learn, and chat in your favorite language!</span>
        <div className="ai-status">
          <span className="status-dot"></span>
          AI Assistant Ready
        </div>
      </header>
      <div className="chat-card">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">No messages yet. Start typing or use voice input!</div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                className={`chat-message ${msg.isUser ? 'user-message' : 'ai-message'} ${msg.hasIssues ? 'has-issues' : ''}`}
                key={idx}
              >
                {!msg.isUser && <div className="message-label">AI Assistant</div>}
                <div className="message-text">{msg.text}</div>
              </div>
            ))
          )}
          {isAIThinking && (
            <div className="chat-message ai-message analyzing">
              <div className="analyzing-text">Analyzing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={handleSend} disabled={isAIThinking} />
      </div>
    </div>
  );
};

export default ChatDashboard;
