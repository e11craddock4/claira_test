import React, { useState } from 'react';
import { apiService } from '../services/api';
import { CopilotResponse } from '../types';

interface ChatMessage {
  id: number;
  question: string;
  response: CopilotResponse;
  timestamp: Date;
}

const Copilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "How much did I spend on groceries last month?",
    "What was my biggest purchase in May?",
    "How much did I spend on restaurants this month?",
    "How many transactions did I have last month?",
    "What's my total spending on entertainment?"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || loading) return;

    setLoading(true);
    
    try {
      console.log(currentQuestion);
      const response = await apiService.queryCopilot(currentQuestion);
      
      const newMessage: ChatMessage = {
        id: Date.now(),
        question: currentQuestion,
        response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentQuestion('');
    } catch (error) {
      console.error('Error querying copilot:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now(),
        question: currentQuestion,
        response: {
          answer: "Sorry, I couldn't process your question. Please try again.",
          data: null
        },
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuestion = (question: string) => {
    setCurrentQuestion(question);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">💬 Financial Copilot</h2>
      
      {/* Sample Questions */}
      {messages.length === 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try asking questions like:</h3>
          <div className="grid grid-cols-1 gap-2">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuestion(question)}
                className="text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 p-2 rounded transition-colors"
              >
                "{question}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {/* User Question */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                <p className="text-sm">{message.question}</p>
                <p className="text-xs opacity-75 mt-1">{formatTimestamp(message.timestamp)}</p>
              </div>
            </div>
            
            {/* Copilot Response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                <p className="text-sm text-gray-800 dark:text-gray-100">{message.response.answer}</p>
                
                {/* Additional Data Display */}
                {message.response.data && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-600 p-2 rounded">
                    {message.response.data.category && (
                      <p>Category: {message.response.data.category}</p>
                    )}
                    {message.response.data.period && (
                      <p>Period: {message.response.data.period}</p>
                    )}
                    {message.response.data.transaction_count && (
                      <p>Transactions: {message.response.data.transaction_count}</p>
                    )}
                  </div>
                )}
                
                <p className="text-xs opacity-75 mt-1">{formatTimestamp(message.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          placeholder="Ask about your expenses..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!currentQuestion.trim() || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>💡 Tip: Ask about specific categories, time periods, or spending patterns</p>
      </div>
    </div>
  );
};

export default Copilot; 
