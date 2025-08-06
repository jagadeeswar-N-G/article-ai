"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, BookOpen, MessageCircle, Brain, Loader2, AlertCircle, CheckCircle, Copy, Sparkles } from 'lucide-react';

// Type definitions
interface Article {
  title: string;
  excerpt: string;
  chunksStored: number;
  readTime: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizData {
  articleId: string;
  quiz: QuizQuestion[];
}

interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ApiResponse {
  message?: string;
  chunksStored?: number;
  answer?: string;
}

type ProcessingStep = 'input' | 'processing' | 'options' | 'summary' | 'quiz' | 'chat';

const AIArticleProcessor: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('input');
  const [url, setUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [processingStage, setProcessingStage] = useState<string>('');
  const [article, setArticle] = useState<Article | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = 'http://localhost:8000';

  const validateUrl = (inputUrl: string): string => {
    try {
      const urlPattern = /^https?:\/\/.+\..+/;
      if (!urlPattern.test(inputUrl)) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
      new URL(inputUrl);
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleUrlSubmit = async (): Promise<void> => {
    const validationError = validateUrl(url);
    if (validationError) {
      setUrlError(validationError);
      return;
    }
    setUrlError('');
    setError('');
    setCurrentStep('processing');
    setIsLoading(true);

    try {
      const generatedArticleId = Date.now().toString();
      setArticleId(generatedArticleId);
      
      setProcessingStage('Fetching article content...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStage('Analyzing content structure...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStage('Processing with AI...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStage('Generating embeddings...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStage('Storing in vector database...');

      const response = await fetch(`${API_BASE_URL}/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          articleId: generatedArticleId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      setProcessingStage('Ready for interaction!');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Extract title from URL for display
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      const title = pathParts.length > 0 
        ? pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Article';

      setArticle({
        title: title,
        excerpt: 'Article processed and ready for interaction',
        chunksStored: data.chunksStored || 0,
        readTime: 'Variable'
      });
      setIsLoading(false);
      setCurrentStep('options');
    } catch (err) {
      console.error('Error processing article:', err);
      setError('Failed to process article. Please check the URL and try again.');
      setIsLoading(false);
      setCurrentStep('input');
    }
  };

  const handleSummarize = async (): Promise<void> => {
    setCurrentStep('summary');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId: articleId,
          question: "What was the main argument in the article?"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setSummary(data.answer || '');
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Failed to generate summary. Please try again.');
      setIsLoading(false);
    }
  };

  const handleQuiz = async (): Promise<void> => {
    setCurrentStep('quiz');
    setIsLoading(true);
    setError('');
    setSelectedAnswers({});
    setShowQuizResults(false);

    try {
      const response = await fetch(`${API_BASE_URL}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          articleId: articleId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QuizData = await response.json();
      setQuiz(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChat = (): void => {
    setCurrentStep('chat');
    setChatMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hello! I've analyzed the article and I'm ready to answer your questions. What would you like to know?",
        timestamp: new Date()
      }
    ]);
  };

  const sendChatMessage = async (): Promise<void> => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId: articleId,
          question: currentInput
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.answer || 'No response received',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, selectedOption: string): void => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const submitQuiz = (): void => {
    setShowQuizResults(true);
  };

  const calculateScore = (): { correct: number; total: number } => {
    if (!quiz || !quiz.quiz) return { correct: 0, total: 0 };
    
    let correct = 0;
    quiz.quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        correct++;
      }
    });
    
    return { correct, total: quiz.quiz.length };
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const resetToInput = (): void => {
    setCurrentStep('input');
    setUrl('');
    setUrlError('');
    setArticle(null);
    setSummary('');
    setQuiz(null);
    setChatMessages([]);
    setArticleId(null);
    setSelectedAnswers({});
    setShowQuizResults(false);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void): void => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, #000 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #000 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, #000 0%, transparent 50%)
          `
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-black rounded-2xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">
            AI Article Processor
          </h1>
          <p className="text-gray-600 text-lg">Transform any article into summaries, quizzes, and interactive conversations</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-gray-100 border-l-4 border-black rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-black mr-3" />
              <p className="text-black font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden">
          {/* Input Stage */}
          {currentStep === 'input' && (
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Article URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (urlError) setUrlError('');
                      }}
                      placeholder="https://example.com/article"
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg text-lg transition-all duration-200 focus:outline-none ${
                        urlError ? 'border-red-500 bg-red-50' : 'border-black focus:border-gray-600'
                      }`}
                      onKeyPress={(e) => handleKeyPress(e, handleUrlSubmit)}
                    />
                  </div>
                  {urlError && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {urlError}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleUrlSubmit}
                  disabled={!url.trim()}
                  className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:bg-gray-800 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Process Article</span>
                </button>
              </div>
            </div>
          )}

          {/* Processing Stage */}
          {currentStep === 'processing' && (
            <div className="p-8 text-center">
              <div className="space-y-8">
                <div className="flex justify-center">
                  <Loader2 className="w-16 h-16 text-black animate-spin" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-4">Processing Article</h3>
                  <p className="text-black text-lg font-medium">{processingStage}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Options Stage */}
          {currentStep === 'options' && article && (
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-black">Article Processed Successfully</h3>
                  <CheckCircle className="w-8 h-8 text-black" />
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-black mb-2">{article.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{article.excerpt}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{article.chunksStored} chunks stored</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleSummarize}
                  className="p-6 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                >
                  <BookOpen className="w-8 h-8 text-black mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-black mb-2">Summarize</h4>
                  <p className="text-gray-600 text-sm">Get a concise summary of the article</p>
                </button>

                <button
                  onClick={handleQuiz}
                  className="p-6 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                >
                  <Brain className="w-8 h-8 text-black mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-black mb-2">Take Quiz</h4>
                  <p className="text-gray-600 text-sm">Test your understanding with questions</p>
                </button>

                <button
                  onClick={handleChat}
                  className="p-6 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                >
                  <MessageCircle className="w-8 h-8 text-black mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-black mb-2">Chat</h4>
                  <p className="text-gray-600 text-sm">Ask questions about the article</p>
                </button>
              </div>

              <button
                onClick={resetToInput}
                className="w-full mt-6 py-3 text-gray-600 hover:text-black transition-colors"
              >
                ← Process Another Article
              </button>
            </div>
          )}

          {/* Summary Stage */}
          {currentStep === 'summary' && (
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-black mb-4 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-black" />
                  Article Summary
                </h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-black animate-spin mr-3" />
                  <span className="text-gray-600">Generating summary...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                    <p className="text-gray-800 leading-relaxed text-lg">{summary}</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentStep('options')}
                      className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ← Back to Options
                    </button>
                    <button 
                      onClick={() => copyToClipboard(summary)}
                      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Summary
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz Stage */}
          {currentStep === 'quiz' && (
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-black mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-black" />
                  Knowledge Quiz
                </h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-black animate-spin mr-3" />
                  <span className="text-gray-600">Generating quiz...</span>
                </div>
              ) : quiz && quiz.quiz && (
                <div className="space-y-8">
                  {quiz.quiz.map((question, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-black mb-4">
                        {index + 1}. {question.question}
                      </h4>
                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => handleAnswerSelect(index, option)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                              selectedAnswers[index] === option
                                ? 'border-black bg-gray-100'
                                : showQuizResults
                                ? option === question.answer
                                  ? 'border-green-500 bg-green-50'
                                  : selectedAnswers[index] === option
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200'
                                : 'border-gray-200 hover:border-black hover:bg-gray-50'
                            }`}
                            disabled={showQuizResults}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                            {showQuizResults && option === question.answer && (
                              <CheckCircle className="w-4 h-4 text-green-600 float-right mt-0.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {showQuizResults && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="text-xl font-semibold text-black mb-2">Quiz Results</h4>
                      <p className="text-gray-700">
                        You scored {calculateScore().correct} out of {calculateScore().total} questions correctly!
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentStep('options')}
                      className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ← Back to Options
                    </button>
                    {!showQuizResults ? (
                      <button 
                        onClick={submitQuiz}
                        disabled={Object.keys(selectedAnswers).length !== (quiz.quiz?.length || 0)}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setShowQuizResults(false);
                          setSelectedAnswers({});
                        }}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Retake Quiz
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat Stage */}
          {currentStep === 'chat' && (
            <div className="flex flex-col h-96">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xl font-semibold text-black flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-black" />
                  Chat with AI about the Article
                </h3>
                <button
                  onClick={() => setCurrentStep('options')}
                  className="text-sm text-gray-600 hover:text-black mt-2"
                >
                  ← Back to Options
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-black border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about the article..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    onKeyPress={(e) => handleKeyPress(e, sendChatMessage)}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isLoading}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIArticleProcessor;