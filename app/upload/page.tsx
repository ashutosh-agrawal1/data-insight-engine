"use client"

import { useState, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  Hash,
  Calendar,
  Tag,
  Type,
} from "lucide-react"
import Papa from "papaparse"
import {
  analyzeColumns,
  saveDataset,
  formatFileSize,
  type DatasetColumn,
  type DatasetInfo,
} from "@/lib/data-utils"

interface FilePreview {
  name: string
  size: string
  rows: number
  columns: DatasetColumn[]
  data: Record<string, unknown>[]
}

const typeIcons: Record<string, typeof Hash> = {
  Numerical: Hash,
  Categorical: Tag,
  Date: Calendar,
  Text: Type,
}

const typeColors: Record<string, string> = {
  Numerical: "bg-[#00F5A0]/20 text-[#00F5A0]",
  Categorical: "bg-[#7A5CFF]/20 text-[#7A5CFF]",
  Date: "bg-[#00D9F5]/20 text-[#00D9F5]",
  Text: "bg-white/10 text-gray-300",
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const parseCSV = useCallback((uploadedFile: File) => {
    setIsParsing(true)
    setParseError(null)
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, unknown>[]
        
        if (data.length === 0) {
          setParseError("The file appears to be empty or has no valid data rows.")
          setIsParsing(false)
          return
        }

        const columns = analyzeColumns(data)

        setFile(uploadedFile)
        setFilePreview({
          name: uploadedFile.name,
          size: formatFileSize(uploadedFile.size),
          rows: data.length,
          columns,
          data,
        })
        setIsParsing(false)
      },
      error: (error) => {
        setParseError(`Failed to parse CSV: ${error.message}`)
        setIsParsing(false)
      },
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && droppedFile.name.endsWith(".csv")) {
        parseCSV(droppedFile)
      } else {
        setParseError("Please upload a CSV file.")
      }
    },
    [parseCSV]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        if (selectedFile.name.endsWith(".csv")) {
          parseCSV(selectedFile)
        } else {
          setParseError("Please upload a CSV file.")
        }
      }
    },
    [parseCSV]
  )

  const handleAnalyze = useCallback(async () => {
    if (!filePreview) return

    setIsAnalyzing(true)
    setParseError(null)
    
    const steps = [
      "Validating data structure...",
      "Detecting patterns...",
      "Finding anomalies...",
      "Generating insights...",
    ]

    for (const step of steps) {
      setAnalysisStep(step)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    // Save dataset to localStorage before navigation
    const dataset: DatasetInfo = {
      name: filePreview.name,
      size: filePreview.size,
      rows: filePreview.rows,
      columns: filePreview.columns,
      data: filePreview.data,
      uploadedAt: new Date().toISOString(),
    }

    // Use the safe saveDataset function with error handling
    const result = saveDataset(dataset)
    
    if (result.success) {
      window.location.href = "/dashboard"
    } else {
      setParseError(result.error || "Failed to save dataset. Please try a smaller file.")
      setIsAnalyzing(false)
    }
  }, [filePreview])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    setFilePreview(null)
    setParseError(null)
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Upload Your Dataset
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Drop your CSV file and let our AI analyze it for insights,
              patterns, and recommendations.
            </p>
          </div>

          {/* Upload Area */}
          {!file && !isParsing ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? "border-[#00F5A0] bg-[#00F5A0]/5"
                  : "border-white/10 hover:border-white/20 bg-white/[0.02]"
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className="p-12 md:p-16 text-center">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                    isDragging
                      ? "bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] scale-110"
                      : "bg-white/5"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 ${
                      isDragging ? "text-[#050505]" : "text-gray-400"
                    }`}
                  />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragging ? "Drop your file here" : "Drag and drop your file"}
                </h3>
                <p className="text-gray-400 mb-4">or click to browse</p>
                <p className="text-sm text-gray-500">
                  Supports CSV files
                </p>

                {parseError && (
                  <p className="mt-4 text-sm text-[#FF006E]">{parseError}</p>
                )}
              </div>
            </div>
          ) : isParsing ? (
            // Parsing state
            <div className="rounded-2xl glass border border-white/10 p-12 text-center">
              <Loader2 className="w-12 h-12 text-[#00F5A0] animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Parsing your CSV file...</p>
              <p className="text-sm text-gray-400 mt-2">Analyzing column types and data structure</p>
            </div>
          ) : filePreview ? (
            // File Preview
            <div className="rounded-2xl glass border border-white/10 p-6 glow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-[#050505]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {filePreview.name}
                    </h3>
                    <p className="text-sm text-gray-400">{filePreview.size}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* File stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-2xl font-bold text-white">
                    {filePreview.rows.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Rows</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-2xl font-bold text-white">
                    {filePreview.columns.length}
                  </div>
                  <div className="text-sm text-gray-400">Columns</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
                  <div className="text-2xl font-bold text-[#00F5A0]">Ready</div>
                  <div className="text-sm text-gray-400">For Analysis</div>
                </div>
              </div>

              {/* Detected fields */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Detected Fields ({filePreview.columns.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filePreview.columns.map((column, index) => {
                    const Icon = typeIcons[column.type] || Type
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                      >
                        <span className="text-sm text-white">{column.name}</span>
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${typeColors[column.type]}`}
                        >
                          <Icon className="w-3 h-3" />
                          {column.type}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Analysis button */}
              {isAnalyzing ? (
                <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center animate-pulse">
                      <Sparkles className="w-5 h-5 text-[#050505]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{analysisStep}</div>
                      <div className="h-2 mt-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#7A5CFF] animate-gradient w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleAnalyze}
                  className="w-full bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#7A5CFF] text-[#050505] font-semibold text-lg py-6 hover:opacity-90 transition-all"
                >
                  Analyze Dataset
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  )
}
