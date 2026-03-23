// Data utilities for CSV parsing, storage, and analysis

export interface DatasetColumn {
  name: string
  type: "Numerical" | "Categorical" | "Date" | "Text"
  unique: number
  missing: number
  sample: string[]
}

export interface DatasetInfo {
  name: string
  size: string
  rows: number
  columns: DatasetColumn[]
  data: Record<string, unknown>[]
  uploadedAt: string
  // Python backend analysis results
  pythonAnalysis?: PythonAnalysisResult
}

export interface ParsedDataset {
  data: Record<string, unknown>[]
  columns: DatasetColumn[]
  rows: number
}

// Types for Python backend response
export interface StatisticalSummary {
  column: string
  mean: number
  median: number
  std_dev: number
  min_val: number
  max_val: number
  skewness: number
  kurtosis: number
}

export interface CorrelationPair {
  column1: string
  column2: string
  correlation: number
}

export interface CategoryCount {
  column: string
  value_counts: Record<string, number>
}

export interface PythonAnalysisResult {
  rows: number
  columns: number
  column_info: {
    name: string
    type: string
    unique: number
    missing: number
    sample: string[]
  }[]
  missing_summary: Record<string, number>
  statistical_summary: StatisticalSummary[]
  correlation_matrix: CorrelationPair[]
  top_categories: CategoryCount[]
}

// Analyze data using Python backend
export async function analyzeWithPython(data: Record<string, unknown>[]): Promise<PythonAnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Analysis failed: ${errorText}`)
  }

  return response.json()
}

// Detect column type from values
export function detectColumnType(values: unknown[]): "Numerical" | "Categorical" | "Date" | "Text" {
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "")
  if (nonNullValues.length === 0) return "Text"

  // Check if all values are numbers
  const numericCount = nonNullValues.filter((v) => {
    const num = Number(v)
    return !isNaN(num) && v !== ""
  }).length

  if (numericCount / nonNullValues.length > 0.8) {
    return "Numerical"
  }

  // Check for dates
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}/, // DD-MM-YYYY
    /^[A-Za-z]{3}\s\d{1,2},?\s\d{4}/, // Mon DD, YYYY
  ]

  const dateCount = nonNullValues.filter((v) => {
    const str = String(v)
    return datePatterns.some((pattern) => pattern.test(str)) || !isNaN(Date.parse(str))
  }).length

  if (dateCount / nonNullValues.length > 0.8) {
    return "Date"
  }

  // Check for categorical (low cardinality)
  const uniqueValues = new Set(nonNullValues.map(String))
  if (uniqueValues.size <= Math.min(20, nonNullValues.length * 0.1)) {
    return "Categorical"
  }

  return "Text"
}

// Analyze columns from parsed data
export function analyzeColumns(data: Record<string, unknown>[]): DatasetColumn[] {
  if (data.length === 0) return []

  const columnNames = Object.keys(data[0])

  return columnNames.map((name) => {
    const values = data.map((row) => row[name])
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "")
    const uniqueValues = new Set(nonNullValues.map(String))

    return {
      name,
      type: detectColumnType(values),
      unique: uniqueValues.size,
      missing: values.length - nonNullValues.length,
      sample: Array.from(uniqueValues).slice(0, 5).map(String),
    }
  })
}

// Calculate basic statistics for numerical columns
export function calculateStats(values: number[]): {
  mean: number
  median: number
  stdDev: number
  min: number
  max: number
} {
  if (values.length === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 }

  const sorted = [...values].sort((a, b) => a - b)
  const sum = values.reduce((a, b) => a + b, 0)
  const mean = sum / values.length
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]
  
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(variance)

  return {
    mean,
    median,
    stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  }
}

// Calculate correlation between two numerical columns
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0

  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0
  return numerator / denominator
}

// Storage functions - with size limits to avoid quota exceeded errors
const MAX_ROWS_FOR_STORAGE = 5000 // Limit rows to stay within localStorage quota

export function saveDataset(dataset: DatasetInfo): { success: boolean; error?: string } {
  if (typeof window === "undefined") {
    return { success: false, error: "Not in browser environment" }
  }
  
  try {
    // Clear any existing data first to free up space
    localStorage.removeItem("dataset")
    
    // Limit rows to prevent quota exceeded errors
    const limitedDataset: DatasetInfo = {
      ...dataset,
      data: dataset.data.slice(0, MAX_ROWS_FOR_STORAGE),
    }
    
    const totalRows = dataset.data.length
    const storedRows = limitedDataset.data.length
    const wasLimited = totalRows > MAX_ROWS_FOR_STORAGE
    const dataString = JSON.stringify(limitedDataset)
    localStorage.setItem("dataset", dataString)
    
    return { 
      success: true, 
      error: wasLimited ? `Data limited to ${MAX_ROWS_FOR_STORAGE} rows (original: ${totalRows})` : undefined 
    }
  } catch {
    // If still too large, try with even fewer rows
    try {
      const minimalDataset: DatasetInfo = {
        ...dataset,
        data: dataset.data.slice(0, 1000),
      }
      localStorage.setItem("dataset", JSON.stringify(minimalDataset))
      return { success: true, error: `Data limited to 1000 rows due to storage constraints` }
    } catch {
      return { success: false, error: "Dataset too large to store. Please use a smaller file." }
    }
  }
}

export function getDataset(): DatasetInfo | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("dataset")
    if (stored) {
      return JSON.parse(stored)
    }
  }
  return null
}

export function clearDataset(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("dataset")
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

// Get numerical values from a column
export function getNumericValues(data: Record<string, unknown>[], columnName: string): number[] {
  return data
    .map((row) => {
      const val = row[columnName]
      const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[$,]/g, ""))
      return isNaN(num) ? null : num
    })
    .filter((v): v is number => v !== null)
}

// Get value counts for categorical data
export function getValueCounts(data: Record<string, unknown>[], columnName: string): { value: string; count: number }[] {
  const counts: Record<string, number> = {}
  
  data.forEach((row) => {
    const val = String(row[columnName] ?? "Unknown")
    counts[val] = (counts[val] || 0) + 1
  })

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}
