"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  MessageSquare,
  Upload,
  TrendingUp,
  Brain,
  ChevronRight,
  Menu,
  FileSpreadsheet,
} from "lucide-react"
import { useState, useEffect } from "react"

const sidebarLinks = [
  { href: "/upload", icon: Upload, label: "Upload Dataset" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview (EDA)" },
  { href: "/dashboard/insights", icon: Sparkles, label: "AI + Statistical Insights" },
  { href: "/dashboard/analysis", icon: Brain, label: "Statistical Analysis" },
  { href: "/dashboard/predictions", icon: TrendingUp, label: "Predictions" },
  { href: "/dashboard/charts", icon: BarChart3, label: "Charts" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "Chat with Data" },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [datasetInfo, setDatasetInfo] = useState<{ name: string; rows: number; columns: number } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("dataset")
    if (stored) {
      try {
        const dataset = JSON.parse(stored)
        setDatasetInfo({
          name: dataset.name || "Unknown",
          rows: dataset.data?.length || 0,
          columns: dataset.columns?.length || 0,
        })
      } catch {
        setDatasetInfo(null)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5A0] via-[#00D9F5] to-[#7A5CFF] flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-[#050505]"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">Kryntal AI</span>
            </Link>
          </div>

          {/* Current dataset */}
          <div className="px-4 py-4 border-b border-white/5">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Current Dataset</div>
              {datasetInfo ? (
                <>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#00F5A0]" />
                    <div className="text-sm text-white font-medium truncate">
                      {datasetInfo.name}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {datasetInfo.rows.toLocaleString()} rows • {datasetInfo.columns} columns
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400">No dataset uploaded</div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-[#00F5A0]/10 to-transparent border border-[#00F5A0]/20 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-[#00F5A0]" : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  <span className="flex-1 text-sm">{link.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-[#00F5A0]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Data Science badge */}
          <div className="p-4 border-t border-white/5">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#00F5A0]/5 to-[#7A5CFF]/5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-[#00F5A0]" />
                <span className="text-sm font-medium text-white">Data Science Mode</span>
              </div>
              <p className="text-xs text-gray-400">
                Advanced EDA, statistical analysis, and ML predictions enabled
              </p>
            </div>
          </div>


        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5A0] via-[#00D9F5] to-[#7A5CFF] flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-[#050505]"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </Link>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
