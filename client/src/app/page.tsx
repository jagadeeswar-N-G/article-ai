"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Link, Zap, Settings, Globe, Sparkles, ArrowRight, Bot } from 'lucide-react'
import { useState } from "react"

export default function Component() {
  const [url, setUrl] = useState("")
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [summary, setSummary] = useState("")
  const [quiz, setQuiz] = useState<Array<{question: string, options: string[], correct: number}>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!url) return
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setSummary("This is a sample summary of the content from the provided URL. The content discusses various aspects of artificial intelligence and machine learning, covering topics such as neural networks, deep learning algorithms, and their practical applications in modern technology.")
      setQuiz([
        {
          question: "What is the primary focus of the article?",
          options: ["Web Development", "Artificial Intelligence", "Database Management", "Mobile Apps"],
          correct: 1
        },
        {
          question: "Which technology is mentioned as a key component?",
          options: ["Blockchain", "Neural Networks", "Cloud Computing", "IoT"],
          correct: 1
        }
      ])
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/30 via-black to-gray-900/20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Subtle Gradient Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">
                  AI Analyzer
                </span>
              </div>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">Features</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">Models</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">Pricing</a>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white hover:text-black transition-all font-medium">
                  Sign In
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 bg-gray-800/50 text-gray-300 border-gray-700/50 font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by Advanced AI
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
                Analyze Any URL with
                <span className="block text-gray-300 mt-2">
                  AI Intelligence
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                Transform any web content into intelligent summaries and interactive quizzes. 
                Choose your preferred AI model and unlock insights instantly.
              </p>
            </div>

            {/* Main Input Section */}
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 font-semibold">
                  <Globe className="w-5 h-5 text-gray-300" />
                  Content Analyzer
                </CardTitle>
                <CardDescription className="text-gray-400 font-light">
                  Paste any URL to generate summaries and quizzes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-white font-light"
                    />
                  </div>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-white font-medium">
                      <Bot className="w-4 h-4 mr-2 text-gray-300" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="gpt-4" className="text-white font-medium">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5" className="text-white font-medium">GPT-3.5</SelectItem>
                      <SelectItem value="claude" className="text-white font-medium">Claude</SelectItem>
                      <SelectItem value="gemini" className="text-white font-medium">Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAnalyze}
                  disabled={!url || isLoading}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze Content
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {(summary || quiz.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Summary */}
                {summary && (
                  <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2 font-semibold">
                        <Settings className="w-5 h-5 text-gray-300" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="min-h-32 bg-gray-800/50 border-gray-700 text-gray-300 resize-none font-light"
                        placeholder="Summary will appear here..."
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Quiz */}
                {quiz.length > 0 && (
                  <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2 font-semibold">
                        <Brain className="w-5 h-5 text-gray-300" />
                        Generated Quiz
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {quiz.map((q, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="text-white font-medium">{index + 1}. {q.question}</h4>
                          <div className="space-y-1">
                            {q.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded text-sm cursor-pointer transition-colors font-light ${
                                  optIndex === q.correct
                                    ? 'bg-white/10 border border-white/20 text-white'
                                    : 'bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:bg-gray-700/30'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                          {index < quiz.length - 1 && <Separator className="bg-gray-800" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 border-t border-gray-800/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Powerful AI Features
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
                Leverage cutting-edge AI models to extract insights from any web content
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm hover:bg-gray-900/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-white font-semibold">Smart Summarization</CardTitle>
                  <CardDescription className="text-gray-400 font-light">
                    Extract key insights and main points from any article or webpage
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm hover:bg-gray-900/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-white font-semibold">Interactive Quizzes</CardTitle>
                  <CardDescription className="text-gray-400 font-light">
                    Generate engaging quizzes to test comprehension and retention
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm hover:bg-gray-900/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-white font-semibold">Multiple AI Models</CardTitle>
                  <CardDescription className="text-gray-400 font-light">
                    Choose from GPT-4, Claude, Gemini, and more for optimal results
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 py-8 px-4">
          <div className="container mx-auto text-center">
            <p className="text-gray-500 font-light">
              © 2024 AI Analyzer. Powered by advanced artificial intelligence.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
