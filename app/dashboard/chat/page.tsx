"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  RefreshCw,
  Copy,
  Check,
  Database,
  TrendingUp,
  BarChart3,
  Loader2,
  Upload,
} from "lucide-react"
import {
  calculateStats,
  getNumericValues,
  getValueCounts,
  type DatasetInfo,
} from "@/lib/data-utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [noDataset, setNoDataset] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const stored = localStorage.getItem("dataset")
    
    if (!stored) {
      setNoDataset(true)
      setLoading(false)
      return
    }

    const storedDataset: DatasetInfo = JSON.parse(stored)
    setDataset(storedDataset)

    // Initialize with welcome message
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: `Hello! I've analyzed your dataset "${storedDataset.name}" with ${storedDataset.rows.toLocaleString()} rows and ${storedDataset.columns.length} columns. I can help you understand patterns, correlations, and insights from your data. What would you like to explore?`,
        timestamp: new Date(),
      },
    ])
    
    setLoading(false)
  }, [])

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const generateResponse = (question: string): string => {
    if (!dataset) return "No dataset loaded."
    
    const lowerQuestion = question.toLowerCase()
    const numericColumns = dataset.columns.filter(col => col.type === "Numerical")
    const categoricalColumns = dataset.columns.filter(col => col.type === "Categorical")

    // Dataset overview questions
    if (lowerQuestion.includes("overview") || lowerQuestion.includes("summary") || lowerQuestion.includes("describe")) {
      return `**Dataset Overview: ${dataset.name}**\n\n• **Rows:** ${dataset.rows.toLocaleString()}\n• **Columns:** ${dataset.columns.length}\n• **Numeric columns:** ${numericColumns.length}\n• **Categorical columns:** ${categoricalColumns.length}\n\n**Columns:**\n${dataset.columns.map(c => `• ${c.name} (${c.type})`).join('\n')}`
    }

    // Statistics questions
    if (lowerQuestion.includes("statistic") || lowerQuestion.includes("mean") || lowerQuestion.includes("average") || lowerQuestion.includes("distribution")) {
      if (numericColumns.length === 0) {
        return "Your dataset doesn't contain any numeric columns for statistical analysis."
      }
      
      const col = numericColumns[0]
      const values = getNumericValues(dataset.data, col.name)
      const stats = calculateStats(values)
      
      return `**Statistics for ${col.name}:**\n\n• **Mean:** ${stats.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n• **Median:** ${stats.median.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n• **Std Dev:** ${stats.stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n• **Min:** ${stats.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n• **Max:** ${stats.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n\nThe data ranges from ${stats.min.toLocaleString(undefined, { maximumFractionDigits: 2 })} to ${stats.max.toLocaleString(undefined, { maximumFractionDigits: 2 })} with an average of ${stats.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`
    }

    // Column info questions
    if (lowerQuestion.includes("column") || lowerQuestion.includes("field") || lowerQuestion.includes("variable")) {
      return `**Dataset Columns (${dataset.columns.length} total):**\n\n${dataset.columns.map(c => 
        `• **${c.name}** - ${c.type}\n  Unique values: ${c.unique.toLocaleString()}, Missing: ${c.missing.toLocaleString()}`
      ).join('\n\n')}`
    }

    // Missing values questions
    if (lowerQuestion.includes("missing") || lowerQuestion.includes("null") || lowerQuestion.includes("empty")) {
      const totalMissing = dataset.columns.reduce((sum, col) => sum + col.missing, 0)
      const columnsWithMissing = dataset.columns.filter(col => col.missing > 0)
      
      if (totalMissing === 0) {
        return "Great news! Your dataset has no missing values. All columns are complete."
      }
      
      return `**Missing Values Analysis:**\n\n• **Total missing:** ${totalMissing.toLocaleString()} values\n• **Columns affected:** ${columnsWithMissing.length}\n\n**Details:**\n${columnsWithMissing.map(c => 
        `• ${c.name}: ${c.missing.toLocaleString()} missing (${((c.missing / dataset.rows) * 100).toFixed(2)}%)`
      ).join('\n')}\n\n**Recommendation:** Consider imputation strategies or removing rows with missing values depending on your analysis goals.`
    }

    // Category questions
    if (lowerQuestion.includes("categor") || lowerQuestion.includes("unique") || lowerQuestion.includes("group")) {
      if (categoricalColumns.length === 0) {
        return "Your dataset doesn't contain categorical columns. All columns are either numeric, date, or text type."
      }
      
      const col = categoricalColumns[0]
      const counts = getValueCounts(dataset.data, col.name)
      const topCategories = counts.slice(0, 5)
      
      return `**Category Analysis for ${col.name}:**\n\n• **Unique categories:** ${col.unique}\n\n**Top categories:**\n${topCategories.map((c, i) => 
        `${i + 1}. "${c.value}" - ${c.count.toLocaleString()} records (${((c.count / dataset.rows) * 100).toFixed(1)}%)`
      ).join('\n')}`
    }

    // Correlation questions
    if (lowerQuestion.includes("correlat") || lowerQuestion.includes("relationship") || lowerQuestion.includes("relate")) {
      if (numericColumns.length < 2) {
        return "Correlation analysis requires at least 2 numeric columns. Your dataset has fewer numeric columns."
      }
      
      return `**Correlation Analysis:**\n\nYour dataset has ${numericColumns.length} numeric columns that can be analyzed for correlations:\n\n${numericColumns.map(c => `• ${c.name}`).join('\n')}\n\nYou can explore correlations between these variables in the **Statistical Analysis** section of the dashboard for detailed correlation coefficients and interpretations.`
    }

    // Row count questions
    if (lowerQuestion.includes("row") || lowerQuestion.includes("record") || lowerQuestion.includes("how many")) {
      return `Your dataset contains **${dataset.rows.toLocaleString()} rows** (records) across **${dataset.columns.length} columns**.\n\nThe file size is ${dataset.size}.`
    }

    // Help / general questions
    return `I can help you explore your dataset! Here are some things you can ask:\n\n• **"Give me an overview"** - Dataset summary\n• **"Show statistics"** - Statistical analysis of numeric columns\n• **"What are the columns?"** - Column information\n• **"Any missing values?"** - Missing data analysis\n• **"Show categories"** - Category distribution\n• **"What correlations exist?"** - Relationship analysis\n\nWhat would you like to know about your data?`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = generateResponse(input)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleSuggestionClick = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[#00F5A0] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading chat...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (noDataset || !dataset) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Dataset Found</h2>
            <p className="text-gray-400 mb-6">
              Upload a CSV file to chat with your data using natural language.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#7A5CFF] text-[#050505] font-semibold hover:opacity-90 transition-opacity"
            >
              <Upload className="w-5 h-5" />
              Upload Dataset
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const suggestedQuestions = [
    "Give me an overview of my data",
    "Show me statistics",
    "Are there any missing values?",
    "What columns do I have?",
    "Show category distribution",
    "What correlations exist?",
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF006E] to-[#FB5607] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Chat with Your Data
            </h1>
            <p className="text-gray-400">
              Ask questions about <span className="text-[#00F5A0]">{dataset.name}</span>
            </p>
          </div>
        </div>

        {/* Dataset context panel */}
        <div className="mb-4 flex-shrink-0 rounded-xl glass border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-[#00D9F5]" />
            <span className="text-sm font-medium text-white">Dataset Context</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-gray-500">Dataset</div>
              <div className="text-sm text-white truncate">{dataset.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Rows</div>
              <div className="text-sm text-white">{dataset.rows.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Columns</div>
              <div className="text-sm text-white">{dataset.columns.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Size</div>
              <div className="text-sm text-[#00F5A0]">{dataset.size}</div>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-[#00F5A0]" />
              <span className="text-gray-400">{dataset.columns.filter(c => c.type === "Numerical").length} numeric columns</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <BarChart3 className="w-3.5 h-3.5 text-[#7A5CFF]" />
              <span className="text-gray-400">{dataset.columns.filter(c => c.type === "Categorical").length} categorical columns</span>
            </div>
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 rounded-2xl glass border border-white/5 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#050505]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#00F5A0]/20 to-[#00D9F5]/20 border border-[#00F5A0]/30"
                      : "bg-white/5 border border-white/5"
                  }`}
                >
                  <div
                    className="text-white text-sm whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#00F5A0]'>$1</strong>")
                        .replace(/\n/g, "<br />"),
                    }}
                  />

                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#050505]" />
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-[#00F5A0] animate-spin" />
                    <span className="text-sm text-gray-400">Analyzing data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 md:px-6 pb-4">
              <p className="text-xs text-gray-500 mb-2">Ask about your data:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    className="px-3 py-1.5 rounded-full text-xs text-gray-300 bg-white/5 border border-white/10 hover:border-[#00F5A0]/30 hover:bg-[#00F5A0]/5 transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-4 md:p-6 border-t border-white/5"
          >
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your data..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00F5A0]/50 focus:ring-1 focus:ring-[#00F5A0]/20 transition-all"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-[#050505] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
