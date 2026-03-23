"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  FileSpreadsheet,
  Rows3,
  Columns3,
  AlertCircle,
  Hash,
  Calendar,
  Tag,
  Type,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  Upload,
} from "lucide-react"
import {
  type DatasetInfo,
  type DatasetColumn,
} from "@/lib/data-utils"

interface StatisticalSummary {
  column: string
  mean: string
  median: string
  stdDev: string
  min: string
  max: string
  skewness: string
  skewnessValue: number
}

interface CorrelationData {
  pair: string
  value: number
  strength: string
}

const typeIcons: Record<string, typeof Hash> = {
  Numerical: Hash,
  Categorical: Tag,
  Date: Calendar,
  Text: Type,
}

const typeColors: Record<string, string> = {
  Numerical: "text-[#00F5A0] bg-[#00F5A0]/10",
  Categorical: "text-[#7A5CFF] bg-[#7A5CFF]/10",
  Date: "text-[#00D9F5] bg-[#00D9F5]/10",
  Text: "text-gray-400 bg-white/10",
}

function getCorrelationColor(value: number): string {
  if (value >= 0.7) return "bg-[#00F5A0]"
  if (value >= 0.4) return "bg-[#00D9F5]"
  if (value >= 0) return "bg-[#7A5CFF]"
  if (value >= -0.4) return "bg-[#FFBE0B]"
  return "bg-[#FF006E]"
}

function getCorrelationWidth(value: number): string {
  return `${Math.abs(value) * 100}%`
}

function getCorrelationStrength(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 0.7) return value > 0 ? "Strong Positive" : "Strong Negative"
  if (abs >= 0.4) return value > 0 ? "Moderate Positive" : "Moderate Negative"
  return value > 0 ? "Weak Positive" : "Weak Negative"
}

export default function DashboardPage() {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [noDataset, setNoDataset] = useState(false)
  const [statisticalSummary, setStatisticalSummary] = useState<StatisticalSummary[]>([])
  const [correlations, setCorrelations] = useState<CorrelationData[]>([])
  const [missingByColumn, setMissingByColumn] = useState<{ column: string; missing: number; percentage: string }[]>([])
  const [totalMissing, setTotalMissing] = useState(0)
  const [completeness, setCompleteness] = useState(100)

  useEffect(() => {
    // Read directly from localStorage
    const stored = localStorage.getItem("dataset")
    
    if (!stored) {
      setNoDataset(true)
      setLoading(false)
      return
    }

    const storedDataset: DatasetInfo = JSON.parse(stored)
    setDataset(storedDataset)

    // Use Python analysis results if available
    const pythonAnalysis = storedDataset.pythonAnalysis

    if (pythonAnalysis) {
      // Use pre-computed Python analysis from Pandas/NumPy
      const stats: StatisticalSummary[] = pythonAnalysis.statistical_summary.slice(0, 6).map(stat => ({
        column: stat.column,
        mean: stat.mean.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        median: stat.median.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        stdDev: stat.std_dev.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        min: stat.min_val.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        max: stat.max_val.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        skewness: stat.skewness > 0.5 ? "Right-skewed" : stat.skewness < -0.5 ? "Left-skewed" : "Normal",
        skewnessValue: stat.skewness,
      }))
      setStatisticalSummary(stats)

      // Use pre-computed correlations from Python
      const corrPairs: CorrelationData[] = pythonAnalysis.correlation_matrix.slice(0, 6).map(corr => ({
        pair: `${corr.column1} vs ${corr.column2}`,
        value: corr.correlation,
        strength: getCorrelationStrength(corr.correlation),
      }))
      setCorrelations(corrPairs)

      // Use pre-computed missing values from Python
      const missingData = Object.entries(pythonAnalysis.missing_summary)
        .map(([column, missing]) => ({
          column,
          missing,
          percentage: ((missing / storedDataset.rows) * 100).toFixed(2) + "%",
        }))
        .slice(0, 5)
      
      const missingCount = Object.values(pythonAnalysis.missing_summary).reduce((a, b) => a + b, 0)
      setMissingByColumn(missingData)
      setTotalMissing(missingCount)
      
      const totalCells = storedDataset.rows * storedDataset.columns.length
      setCompleteness(totalCells > 0 ? ((1 - missingCount / totalCells) * 100) : 100)
    } else {
      // Fallback: use column-level missing info from dataset
      const totalCells = storedDataset.rows * storedDataset.columns.length
      let missingCount = 0
      const missingData = storedDataset.columns
        .filter(col => col.missing > 0)
        .map(col => {
          missingCount += col.missing
          return {
            column: col.name,
            missing: col.missing,
            percentage: ((col.missing / storedDataset.rows) * 100).toFixed(2) + "%",
          }
        })
        .slice(0, 5)
      
      setMissingByColumn(missingData)
      setTotalMissing(missingCount)
      setCompleteness(totalCells > 0 ? ((1 - missingCount / totalCells) * 100) : 100)
    }
    
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[#00F5A0] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading dataset...</p>
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
              Upload a CSV file to start analyzing your data with AI-powered insights.
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

  const summaryCards = [
    {
      icon: Rows3,
      label: "Total Rows",
      value: dataset.rows.toLocaleString(),
      gradient: "from-[#00F5A0] to-[#00D9F5]",
    },
    {
      icon: Columns3,
      label: "Columns",
      value: dataset.columns.length.toString(),
      gradient: "from-[#00D9F5] to-[#7A5CFF]",
    },
    {
      icon: AlertCircle,
      label: "Missing Values",
      value: totalMissing.toLocaleString(),
      description: `${((totalMissing / (dataset.rows * dataset.columns.length)) * 100).toFixed(2)}% of data`,
      gradient: "from-[#FF006E] to-[#FB5607]",
    },
    {
      icon: FileSpreadsheet,
      label: "File Size",
      value: dataset.size,
      gradient: "from-[#7A5CFF] to-[#4CC9F0]",
    },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Exploratory Data Analysis (EDA)
          </h1>
          <p className="text-gray-400">
            Analyzing: <span className="text-[#00F5A0]">{dataset.name}</span>
          </p>
        </div>

        {/* Dataset Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl glass border border-white/5 hover:border-white/10 transition-all duration-300 group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <card.icon className="w-5 h-5 text-[#050505]" />
              </div>
              <div className="text-sm text-gray-400 mb-1">{card.label}</div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              {card.description && (
                <div className="text-xs text-gray-500 mt-1">{card.description}</div>
              )}
            </div>
          ))}
        </div>

        {/* Statistical Summary */}
        {statisticalSummary.length > 0 && (
          <div className="rounded-2xl glass border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-[#00F5A0]" />
              <h2 className="text-lg font-semibold text-white">Statistical Summary</h2>
              <span className="text-xs text-gray-500 ml-2">Numerical columns</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4">Column</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">Mean</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">Median</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">Std Dev</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">Min</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">Max</th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-3 pl-4">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {statisticalSummary.map((stat, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pr-4">
                        <span className="text-white font-medium">{stat.column}</span>
                      </td>
                      <td className="text-right py-4 px-4 text-gray-300">{stat.mean}</td>
                      <td className="text-right py-4 px-4 text-gray-300">{stat.median}</td>
                      <td className="text-right py-4 px-4 text-gray-300">{stat.stdDev}</td>
                      <td className="text-right py-4 px-4 text-gray-400">{stat.min}</td>
                      <td className="text-right py-4 px-4 text-gray-400">{stat.max}</td>
                      <td className="text-right py-4 pl-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stat.skewnessValue > 0.5 ? "bg-[#FFBE0B]/10 text-[#FFBE0B]" :
                          stat.skewnessValue < -0.5 ? "bg-[#7A5CFF]/10 text-[#7A5CFF]" :
                          "bg-[#00F5A0]/10 text-[#00F5A0]"
                        }`}>
                          {stat.skewness}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Correlation Analysis */}
        {correlations.length > 0 && (
          <div className="rounded-2xl glass border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#00D9F5]" />
              <h2 className="text-lg font-semibold text-white">Correlation Analysis</h2>
            </div>
            <div className="grid gap-3">
              {correlations.map((corr, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{corr.pair}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${
                        corr.value > 0 ? "text-[#00F5A0]" : "text-[#FF006E]"
                      }`}>
                        r = {corr.value > 0 ? "+" : ""}{corr.value.toFixed(2)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        corr.strength.includes("Strong") ? "bg-[#00F5A0]/10 text-[#00F5A0]" :
                        corr.strength.includes("Moderate") ? "bg-[#00D9F5]/10 text-[#00D9F5]" :
                        "bg-white/10 text-gray-400"
                      }`}>
                        {corr.strength}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getCorrelationColor(corr.value)} transition-all duration-500`}
                      style={{ width: getCorrelationWidth(corr.value) }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {correlations.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-[#00F5A0]/5 border border-[#00F5A0]/20">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#00F5A0] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-400">
                    <span className="text-[#00F5A0] font-medium">Analysis note:</span> Correlations are calculated from your uploaded data. Values closer to +1 or -1 indicate stronger relationships between variables.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Quality Section */}
        <div className="rounded-2xl glass border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-[#00F5A0]" />
            <h2 className="text-lg font-semibold text-white">Data Quality Assessment</h2>
            <span className="ml-auto px-3 py-1 rounded-full bg-[#00F5A0]/10 text-[#00F5A0] text-sm font-medium">
              {completeness.toFixed(2)}% Complete
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Missing Values */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-[#FF006E]" />
                Missing Values by Column
              </h3>
              {missingByColumn.length > 0 ? (
                <div className="space-y-3">
                  {missingByColumn.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white">{item.column}</span>
                        <span className="text-sm text-[#FF006E]">{item.missing} ({item.percentage})</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#FF006E]"
                          style={{ width: item.percentage }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#00F5A0]/5 border border-[#00F5A0]/20 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#00F5A0] mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No missing values detected!</p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F5A0]" />
                Quality Metrics
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-gradient-to-r from-[#00F5A0]/5 to-transparent border border-[#00F5A0]/20">
                  <div className="text-sm text-gray-400 mb-1">Data Completeness</div>
                  <div className="text-2xl font-bold text-[#00F5A0]">{completeness.toFixed(2)}%</div>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-sm text-gray-400 mb-1">Total Missing Values</div>
                  <div className="text-2xl font-bold text-white">{totalMissing.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-sm text-gray-400 mb-1">Columns with Missing Data</div>
                  <div className="text-2xl font-bold text-[#FFBE0B]">{missingByColumn.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column Insights */}
        <div className="rounded-2xl glass border border-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Column Insights
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataset.columns.map((column, index) => {
              const Icon = typeIcons[column.type] || Type
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium truncate mr-2">{column.name}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[column.type]}`}
                    >
                      <Icon className="w-3 h-3" />
                      {column.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unique values</span>
                      <span className="text-gray-300">{column.unique.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Missing</span>
                      <span className={column.missing === 0 ? "text-[#00F5A0]" : "text-[#FF006E]"}>
                        {column.missing.toLocaleString()}
                      </span>
                    </div>
                    {column.sample.length > 0 && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-gray-500 text-xs">Sample values:</span>
                        <div className="text-gray-400 text-xs mt-1 truncate">
                          {column.sample.slice(0, 3).join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
