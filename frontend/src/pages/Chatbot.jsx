import { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT = `You are the official PayChain AI Assistant. PayChain is a Web3 financial technology company redefining global payments by connecting local banking rails into single Web3 vaults.

If the user asks questions about PayChain, you MUST answer them accurately using the following information:
- **Mission**: Democratizing global payments, making cross-border transactions as easy as sending a text message.
- **Uptime SLA**: 99.99% system uptime.
- **Average Settlement Speed**: 2.5 seconds.
- **Standard Fee**: $0.00 (Zero fees for standard peer-to-peer and blockchain-based wire rails).
- **Supported Assets**: Over 150+ fiat currencies and digital assets (including USD, EUR, GBP, SGD, CHF, USDC, USDT, BTC, ETH).
- **Processed Volume**: Over $100B+ in total transaction volume.
- **Total Users**: Over 5M+ global users.
- **Total Team Members**: 400+ team members globally.
- **Office Locations**:
  1. Global HQ: New York, USA (123 Innovation Drive, Tech City, CA 94000)
  2. European Hub: Zurich, Switzerland (45 Bahnhofstrasse)
  3. APAC Headquarters: Singapore (8 Marina Boulevard)
- **Leadership Team**:
  - Sarah Jenkins: CEO & Co-Founder (Former Fintech Executive with 12+ years experience)
  - David Chen: CTO & Co-Founder (Decentralized protocol developer)
  - Elena Rostova: Head of Compliance (Ex-regulator specializing in crypto compliance)
  - Marcus Aurelius: VP of Product Engineering (Frontend specialist)
- **History Milestones**:
  - 2026: Founding in NY by Sarah & David. $3.5M seed round.
  - 2027: Public Beta launch. Reached $1B volume.
  - 2028: Added SEPA (Europe) and Pix (Latin America) rails. Opened Zurich & São Paulo offices.
  - 2029: Launched custom multi-currency wallets, reached $100B+ volume, 5M+ users.
- **Department Support Desks**:
  - General Support: support@paychain.inc
  - Enterprise Sales: Link to Schedule a Demo
  - Developer Portal: Link to API docs
  - Security Desk: Link to Bug Bounty vulnerability reporting

FALLBACK RULE:
If the user asks an irrelevant question (e.g. general questions about math, programming, history, science, geography, cooking, jokes, etc. that have absolutely nothing to do with PayChain), you MUST answer the question accurately, politely, and cleanly using your general knowledge. You can optionally add a brief friendly sign-off like 'Let me know if you also need help with your PayChain global transactions!' or similar context-aware suggestion, but answer their question directly.

Keep all answers concise, informative, friendly, and formatted in clean markdown. Do not make up or hallucinate any facts not mentioned above.`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your PayChain Assistant. Ask me anything about our global payment network, fees, compliance, offices, or feel free to ask any general question!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);

  const suggestionChips = [
    "What is PayChain's speed?",
    "Tell me about fees",
    "Where are your offices?",
    "What is photosynthesis?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    setErrorMsg('');
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Request goes to backend

      const history = [...messages, userMessage].map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: Status ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

      setMessages((prev) => [...prev, { role: 'assistant', content: botReply }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setErrorMsg(error.message || "Failed to communicate with Groq API.");
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: "❌ Sorry, I encountered an issue while communicating with the AI service. Please check your network connection or ensure the API key is configured correctly." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper" ref={chatbotRef}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)} aria-label="Open Chatbot">
          <i className="bx bx-bot"></i>
          <span className="toggle-pulse"></span>
          <span className="toggle-text">Chat with AI</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-panel glass-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-info">
              <div className="avatar-status">
                <i className="bx bx-bot"></i>
                <span className="status-dot online"></span>
              </div>
              <div>
                <h3>PayChain Assistant</h3>
                <p>Powered by Groq AI</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)} aria-label="Close Chat">
              <i className="bx bx-x"></i>
            </button>
          </div>

          {/* Messages Logs */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble-wrapper ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-bubble-wrapper assistant">
                <div className="message-bubble loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="chatbot-error-banner">
                <i className="bx bx-error-circle"></i>
                <p>{errorMsg}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="chatbot-suggestions">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Footer Input Form */}
          <form 
            className="chatbot-input-form" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              required
            />
            <button type="submit" className="chatbot-send-btn" disabled={isLoading || !input.trim()}>
              <i className="bx bx-send"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
