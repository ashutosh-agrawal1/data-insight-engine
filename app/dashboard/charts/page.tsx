"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { BarChart3, TrendingUp, Info, Loader2, Upload } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  calculateStats,
  getNumericValues,
  getValueCounts,
  type DatasetInfo,
} from "@/lib/data-utils"

const COLORS = ["#00F5A0", "#00D9F5", "#7A5CFF", "#FF006E", "#FFBE0B"]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-white/10">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface ChartData {
  numericDistribution: { range: string; count: number }[]
  categoryDistribution: { name: string; value: number }[]
  numericTrend: { index: number; value: number }[]
  topCategories: { category: string; count: number }[]
}

export default function ChartsPage() {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [noDataset, setNoDataset] = useState(false)
  const [chartData, setChartData] = useState<ChartData>({
    numericDistribution: [],
    categoryDistribution: [],
    numericTrend: [],
    topCategories: [],
  })
  const [selectedNumericCol, setSelectedNumericCol] = useState<string>("")
  const [selectedCategoricalCol, setSelectedCategoricalCol] = useState<string>("")

  useEffect(() => {
    const stored = localStorage.getItem("dataset")
    
    if (!stored) {
      setNoDataset(true)
      setLoading(false)
      return
    }

    const storedDataset: DatasetInfo = JSON.parse(stored)
    setDataset(storedDataset)

    const numericColumns = storedDataset.columns.filter(col => col.type === "Numerical")
    const categoricalColumns = storedDataset.columns.filter(col => col.type === "Categorical")

    // Set default selections
    if (numericColumns.length > 0) {
      setSelectedNumericCol(numericColumns[0].name)
    }
    if (categoricalColumns.length > 0) {
      setSelectedCategoricalCol(categoricalColumns[0].name)
    }

    // Generate chart data
    const newChartData: ChartData = {
      numericDistribution: [],
      categoryDistribution: [],
      numericTrend: [],
      topCategories: [],
    }

    // Numeric distribution (histogram)
    if (numericColumns.length > 0) {
      const col = numericColumns[0]
      const values = getNumericValues(storedDataset.data, col.name)
      const stats = calculateStats(values)
      
      // Create histogram bins
      const binCount = 8
      const binWidth = (stats.max - stats.min) / binCount
      const bins = Array(binCount).fill(0)
      
      values.forEach(v => {
        const binIndex = Math.min(Math.floor((v - stats.min) / binWidth), binCount - 1)
        bins[binIndex]++
      })

      newChartData.numericDistribution = bins.map((count, i) => ({
        range: `${(stats.min + i * binWidth).toFixed(0)}-${(stats.min + (i + 1) * binWidth).toFixed(0)}`,
        count,
      }))

      // Trend data (first 50 values)
      newChartData.numericTrend = values.slice(0, 50).map((value, index) => ({
        index: index + 1,
        value,
      }))
    }

    // Categorical distribution
    if (categoricalColumns.length > 0) {
      const col = categoricalColumns[0]
      const counts = getValueCounts(storedDataset.data, col.name)
      
      newChartData.categoryDistribution = counts.slice(0, 5).map(c => ({
        name: c.value.length > 15 ? c.value.substring(0, 15) + "..." : c.value,
        value: c.count,
      }))

      newChartData.topCategories = counts.slice(0, 6).map(c => ({
        category: c.value.length > 20 ? c.value.substring(0, 20) + "..." : c.value,
        count: c.count,
      }))
    }

    setChartData(newChartData)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[#00F5A0] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Generating visualizations...</p>
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
              Upload a CSV file to visualize your data with interactive charts.
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

  const numericColumns = dataset.columns.filter(col => col.type === "Numerical")
  const categoricalColumns = dataset.columns.filter(col => col.type === "Categorical")

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00D9F5] to-[#7A5CFF] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#050505]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Charts & Visualizations
            </h1>
            <p className="text-gray-400">
              Visualizing <span className="text-[#00F5A0]">{dataset.name}</span>
            </p>
          </div>
        </div>

        {/* Numeric Distribution Chart */}
        {chartData.numericDistribution.length > 0 && (
          <div className="rounded-2xl glass border border-white/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <h2 className="text-lg font-semibold text-white">
                {selectedNumericCol} Distribution
              </h2>
              {numericColumns.length > 1 && (
                <select
                  value={selectedNumericCol}
                  onChange={(e) => {
                    setSelectedNumericCol(e.target.value)
                    const values = getNumericValues(dataset.data, e.target.value)
                    const stats = calculateStats(values)
                    const binCount = 8
                    const binWidth = (stats.max - stats.min) / binCount
                    const bins = Array(binCount).fill(0)
                    values.forEach(v => {
                      const binIndex = Math.min(Math.floor((v - stats.min) / binWidth), binCount - 1)
                      bins[binIndex]++
                    })
                    setChartData(prev => ({
                      ...prev,
                      numericDistribution: bins.map((count, i) => ({
                        range: `${(stats.min + i * binWidth).toFixed(0)}-${(stats.min + (i + 1) * binWidth).toFixed(0)}`,
                        count,
                      })),
                    }))
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#00F5A0]/50"
                >
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name} className="bg-[#0a0a0a]">
                      {col.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="mb-6 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#00D9F5] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400">
                  Histogram showing the distribution of values in the {selectedNumericCol} column.
                </p>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.numericDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="range"
                    stroke="#666"
                    tick={{ fill: "#999", fontSize: 11 }}
                    axisLine={{ stroke: "#262626" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: "#999" }}
                    axisLine={{ stroke: "#262626" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Count"
                    fill="#7A5CFF"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Two column charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          {chartData.categoryDistribution.length > 0 && (
            <div className="rounded-2xl glass border border-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <h2 className="text-lg font-semibold text-white">
                  {selectedCategoricalCol} Distribution
                </h2>
                {categoricalColumns.length > 1 && (
                  <select
                    value={selectedCategoricalCol}
                    onChange={(e) => {
                      setSelectedCategoricalCol(e.target.value)
                      const counts = getValueCounts(dataset.data, e.target.value)
                      setChartData(prev => ({
                        ...prev,
                        categoryDistribution: counts.slice(0, 5).map(c => ({
                          name: c.value.length > 15 ? c.value.substring(0, 15) + "..." : c.value,
                          value: c.count,
                        })),
                        topCategories: counts.slice(0, 6).map(c => ({
                          category: c.value.length > 20 ? c.value.substring(0, 20) + "..." : c.value,
                          count: c.count,
                        })),
                      }))
                    }}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#00F5A0]/50"
                  >
                    {categoricalColumns.map(col => (
                      <option key={col.name} value={col.name} className="bg-[#0a0a0a]">
                        {col.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="h-72 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.categoryDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {chartData.categoryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="glass rounded-lg p-3 border border-white/10">
                              <p className="text-white font-medium">{data.name}</p>
                              <p className="text-sm text-[#00F5A0]">{data.value.toLocaleString()} records</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {chartData.categoryDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-400">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Categories Bar */}
          {chartData.topCategories.length > 0 && (
            <div className="rounded-2xl glass border border-white/5 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Top Categories by Count
              </h2>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.topCategories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis
                      type="number"
                      stroke="#666"
                      tick={{ fill: "#999" }}
                      axisLine={{ stroke: "#262626" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      stroke="#666"
                      tick={{ fill: "#999", fontSize: 11 }}
                      axisLine={{ stroke: "#262626" }}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      name="Count"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1000}
                    >
                      {chartData.topCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Numeric Trend Line */}
        {chartData.numericTrend.length > 0 && (
          <div className="rounded-2xl glass border border-white/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-white">
                {selectedNumericCol} Values (First 50 Records)
              </h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00F5A0]/10 border border-[#00F5A0]/20">
                <TrendingUp className="w-4 h-4 text-[#00F5A0]" />
                <span className="text-sm text-[#00F5A0] font-medium">Line Chart</span>
              </div>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.numericTrend}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F5A0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00F5A0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="index"
                    stroke="#666"
                    tick={{ fill: "#999" }}
                    axisLine={{ stroke: "#262626" }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: "#999" }}
                    axisLine={{ stroke: "#262626" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={selectedNumericCol}
                    stroke="#00F5A0"
                    strokeWidth={2}
                    fill="url(#trendGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* No data message */}
        {chartData.numericDistribution.length === 0 && chartData.categoryDistribution.length === 0 && (
          <div className="rounded-2xl glass border border-white/10 p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Chartable Data</h3>
            <p className="text-gray-400">
              Your dataset doesn&apos;t contain numeric or categorical columns that can be visualized.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
