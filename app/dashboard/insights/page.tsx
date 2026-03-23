"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowUpRight,
  BarChart3,
  Zap,
  Shield,
  Loader2,
  Upload,
} from "lucide-react"
import {
  calculateStats,
  calculateCorrelation,
  getNumericValues,
  getValueCounts,
  type DatasetInfo,
} from "@/lib/data-utils"

interface Insight {
  id: number
  title: string
  description: string
  metric: string
  correlation: string
  confidence: string
  type: string
  icon: typeof TrendingUp
  gradient: string
}

interface Anomaly {
  id: number
  title: string
  what: string
  when: string
  impact: string
  severity: string
  category: string
}

interface Recommendation {
  id: number
  action: string
  reason: string
  impact: string
  effort: string
  effortColor: string
  priority: string
  priorityColor: string
  dataSupport: string
}

export default function InsightsPage() {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [noDataset, setNoDataset] = useState(false)
  const [insights, setInsights] = useState<Insight[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("dataset")
    
    if (!stored) {
      setNoDataset(true)
      setLoading(false)
      return
    }

    const storedDataset: DatasetInfo = JSON.parse(stored)
    setDataset(storedDataset)

    // Generate insights from data
    const numericColumns = storedDataset.columns.filter(col => col.type === "Numerical")
    const categoricalColumns = storedDataset.columns.filter(col => col.type === "Categorical")
    
    const generatedInsights: Insight[] = []
    let insightId = 1

    // Find strongest correlations
    if (numericColumns.length >= 2) {
      let maxCorr = 0
      let maxPair = ["", ""]
      
      for (let i = 0; i < Math.min(numericColumns.length, 5); i++) {
        for (let j = i + 1; j < Math.min(numericColumns.length, 5); j++) {
          const col1 = numericColumns[i]
          const col2 = numericColumns[j]
          const values1 = getNumericValues(storedDataset.data, col1.name)
          const values2 = getNumericValues(storedDataset.data, col2.name)
          const minLen = Math.min(values1.length, values2.length)
          const r = calculateCorrelation(values1.slice(0, minLen), values2.slice(0, minLen))
          
          if (Math.abs(r) > Math.abs(maxCorr)) {
            maxCorr = r
            maxPair = [col1.name, col2.name]
          }
        }
      }

      if (maxCorr !== 0) {
        generatedInsights.push({
          id: insightId++,
          title: `Strong Relationship: ${maxPair[0]} & ${maxPair[1]}`,
          description: `Analysis reveals a ${maxCorr > 0 ? "positive" : "negative"} correlation between ${maxPair[0]} and ${maxPair[1]}. This relationship explains ${(Math.abs(maxCorr) * 100).toFixed(0)}% of the variance between these variables.`,
          metric: `r = ${maxCorr > 0 ? "+" : ""}${maxCorr.toFixed(2)}`,
          correlation: `R² = ${(maxCorr * maxCorr).toFixed(2)}`,
          confidence: Math.abs(maxCorr) > 0.7 ? "High" : Math.abs(maxCorr) > 0.4 ? "Medium" : "Low",
          type: "correlation",
          icon: TrendingUp,
          gradient: "from-[#00F5A0] to-[#00D9F5]",
        })
      }
    }

    // Analyze categorical distribution
    if (categoricalColumns.length > 0) {
      const col = categoricalColumns[0]
      const counts = getValueCounts(storedDataset.data, col.name)
      if (counts.length > 0) {
        const topCategory = counts[0]
        const percentage = ((topCategory.count / storedDataset.rows) * 100).toFixed(1)
        
        generatedInsights.push({
          id: insightId++,
          title: `${col.name} Distribution Pattern`,
          description: `"${topCategory.value}" dominates with ${percentage}% of records. ${counts.length} unique categories found in this column.`,
          metric: `${percentage}%`,
          correlation: `${counts.length} categories`,
          confidence: "High",
          type: "pattern",
          icon: Target,
          gradient: "from-[#00D9F5] to-[#7A5CFF]",
        })
      }
    }

    // Numeric column insights
    if (numericColumns.length > 0) {
      const col = numericColumns[0]
      const values = getNumericValues(storedDataset.data, col.name)
      const stats = calculateStats(values)
      
      generatedInsights.push({
        id: insightId++,
        title: `${col.name} Statistics`,
        description: `Average value is ${stats.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })} with a standard deviation of ${stats.stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Range spans from ${stats.min.toLocaleString(undefined, { maximumFractionDigits: 2 })} to ${stats.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`,
        metric: `Avg: ${stats.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        correlation: `SD: ${stats.stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        confidence: "High",
        type: "statistics",
        icon: BarChart3,
        gradient: "from-[#7A5CFF] to-[#4CC9F0]",
      })
    }

    // Data quality insight
    const totalMissing = storedDataset.columns.reduce((sum, col) => sum + col.missing, 0)
    const totalCells = storedDataset.rows * storedDataset.columns.length
    const completeness = ((1 - totalMissing / totalCells) * 100).toFixed(1)
    
    generatedInsights.push({
      id: insightId++,
      title: "Data Quality Assessment",
      description: `Dataset is ${completeness}% complete with ${totalMissing.toLocaleString()} missing values across ${storedDataset.columns.filter(c => c.missing > 0).length} columns. ${totalMissing === 0 ? "Excellent data quality!" : "Consider handling missing values before analysis."}`,
      metric: `${completeness}%`,
      correlation: `${totalMissing} missing`,
      confidence: "High",
      type: "quality",
      icon: Lightbulb,
      gradient: "from-[#FFBE0B] to-[#FB5607]",
    })

    setInsights(generatedInsights)

    // Generate anomalies
    const generatedAnomalies: Anomaly[] = []
    
    // Check for columns with high missing values
    const columnsWithMissing = storedDataset.columns.filter(col => col.missing > storedDataset.rows * 0.05)
    if (columnsWithMissing.length > 0) {
      generatedAnomalies.push({
        id: 1,
        title: "High Missing Value Rate",
        what: `${columnsWithMissing.length} column(s) have >5% missing values`,
        when: "Detected during data analysis",
        impact: `Affects ${columnsWithMissing.map(c => c.name).join(", ")}`,
        severity: "Medium",
        category: "Data Quality",
      })
    }

    // Check for outliers in numeric columns
    if (numericColumns.length > 0) {
      const col = numericColumns[0]
      const values = getNumericValues(storedDataset.data, col.name)
      const stats = calculateStats(values)
      const outlierThreshold = stats.mean + 3 * stats.stdDev
      const outliers = values.filter(v => v > outlierThreshold).length
      
      if (outliers > 0) {
        generatedAnomalies.push({
          id: 2,
          title: "Potential Outliers Detected",
          what: `${outliers} values in ${col.name} exceed 3 standard deviations`,
          when: "Statistical outlier analysis",
          impact: `May affect mean calculations and predictions`,
          severity: outliers > 10 ? "High" : "Low",
          category: col.name,
        })
      }
    }

    setAnomalies(generatedAnomalies)

    // Generate recommendations
    const generatedRecommendations: Recommendation[] = []
    
    if (totalMissing > 0) {
      generatedRecommendations.push({
        id: 1,
        action: "Handle Missing Values",
        reason: `${totalMissing} missing values detected. Consider imputation or removal strategies.`,
        impact: "Improve model accuracy",
        effort: "Medium",
        effortColor: "bg-[#00D9F5]/20 text-[#00D9F5]",
        priority: "High Impact",
        priorityColor: "bg-[#7A5CFF]/20 text-[#7A5CFF]",
        dataSupport: `${storedDataset.columns.filter(c => c.missing > 0).length} columns affected`,
      })
    }

    if (numericColumns.length >= 2) {
      generatedRecommendations.push({
        id: 2,
        action: "Explore Feature Relationships",
        reason: "Multiple numeric columns available for correlation and regression analysis.",
        impact: "Discover predictive patterns",
        effort: "Low",
        effortColor: "bg-[#00F5A0]/20 text-[#00F5A0]",
        priority: "Quick Win",
        priorityColor: "bg-[#00F5A0]/20 text-[#00F5A0]",
        dataSupport: `${numericColumns.length} numeric columns available`,
      })
    }

    if (categoricalColumns.length > 0) {
      generatedRecommendations.push({
        id: 3,
        action: "Segment Analysis by Category",
        reason: `Categorical columns like "${categoricalColumns[0].name}" can reveal group-level patterns.`,
        impact: "Identify segment-specific trends",
        effort: "Medium",
        effortColor: "bg-[#00D9F5]/20 text-[#00D9F5]",
        priority: "Strategic",
        priorityColor: "bg-[#FFBE0B]/20 text-[#FFBE0B]",
        dataSupport: `${categoricalColumns.length} categorical columns`,
      })
    }

    setRecommendations(generatedRecommendations)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[#00F5A0] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Generating insights...</p>
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#050505]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              AI + Statistical Insights
            </h1>
            <p className="text-gray-400">
              Data-driven analysis of <span className="text-[#00F5A0]">{dataset.name}</span>
            </p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00F5A0]" />
            Key Insights
            <span className="text-xs text-gray-500 font-normal ml-2">Generated from your data</span>
          </h2>
          <div className="grid gap-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="group relative rounded-2xl glass border border-white/5 p-6 hover:border-white/10 transition-all duration-300 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${insight.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`}
                />

                <div className="relative flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${insight.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <insight.icon className="w-6 h-6 text-[#050505]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {insight.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          insight.confidence === "High"
                            ? "bg-[#00F5A0]/20 text-[#00F5A0]"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {insight.confidence} Confidence
                      </span>
                    </div>
                    <p className="text-gray-400 leading-relaxed mb-4">
                      {insight.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <ArrowUpRight className="w-4 h-4 text-[#00F5A0]" />
                        <span className="text-sm text-white font-medium">{insight.metric}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <BarChart3 className="w-4 h-4 text-[#00D9F5]" />
                        <span className="text-sm text-gray-300">{insight.correlation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF006E]" />
              Anomalies Detected
              <span className="text-xs text-gray-500 font-normal ml-2">Issues requiring attention</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="rounded-2xl glass border border-white/5 p-5 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        anomaly.severity === "High"
                          ? "bg-[#FF006E]/20 text-[#FF006E]"
                          : anomaly.severity === "Medium"
                          ? "bg-[#FB5607]/20 text-[#FB5607]"
                          : "bg-[#FFBE0B]/20 text-[#FFBE0B]"
                      }`}
                    >
                      {anomaly.severity} Severity
                    </span>
                    <span className="text-xs text-gray-500">{anomaly.category}</span>
                  </div>
                  <h3 className="text-white font-medium mb-3">{anomaly.title}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 w-14 flex-shrink-0">What:</span>
                      <span className="text-gray-300">{anomaly.what}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 w-14 flex-shrink-0">When:</span>
                      <span className="text-gray-300">{anomaly.when}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 w-14 flex-shrink-0">Impact:</span>
                      <span className="text-[#FF006E] font-medium">{anomaly.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FFBE0B]" />
              Actionable Recommendations
              <span className="text-xs text-gray-500 font-normal ml-2">Data-backed suggestions</span>
            </h2>
            <div className="rounded-2xl glass border border-[#FFBE0B]/20 p-6">
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 group"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rec.priorityColor}`}>
                        {rec.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rec.effortColor}`}>
                        {rec.effort} Effort
                      </span>
                    </div>
                    
                    <h3 className="text-white font-semibold mb-2 group-hover:text-[#00F5A0] transition-colors">
                      {rec.action}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-4">
                      {rec.reason}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-[#00F5A0]" />
                        <span className="text-sm font-semibold text-[#00F5A0]">{rec.impact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Shield className="w-3.5 h-3.5" />
                        {rec.dataSupport}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
