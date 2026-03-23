"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"

const insightCards = [
  {
    icon: TrendingUp,
    title: "Revenue Trend",
    value: "+23.5%",
    description: "Monthly growth detected",
    gradient: "from-[#00F5A0] to-[#00D9F5]",
  },
  {
    icon: AlertTriangle,
    title: "Anomaly Found",
    value: "3 outliers",
    description: "In customer churn data",
    gradient: "from-[#FF006E] to-[#FB5607]",
  },
  {
    icon: Lightbulb,
    title: "Recommendation",
    value: "High Impact",
    description: "Focus on segment A",
    gradient: "from-[#7A5CFF] to-[#4CC9F0]",
  },
]

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://my.spline.design/thebluemarble-jAOC4ggZ1z4ogr58Ah9eRi5m/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="absolute inset-0 w-full h-full"
          title="3D Background"
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]/80" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 ${
                mounted ? "animate-fade-in-up opacity-100" : "opacity-0"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#00F5A0]" />
              <span className="text-sm text-gray-300">AI-Powered Data Analysis</span>
            </div>

            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance ${
                mounted ? "animate-fade-in-up animate-delay-100 opacity-100" : "opacity-0"
              }`}
            >
              Turn your messy data into{" "}
              <span className="gradient-text">clear business decisions</span> in seconds
            </h1>

            <p
              className={`mt-6 text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 text-pretty ${
                mounted ? "animate-fade-in-up animate-delay-200 opacity-100" : "opacity-0"
              }`}
            >
              Upload your CSV or Excel files and let our AI instantly analyze patterns, detect
              anomalies, and generate actionable business insights.
            </p>

            <div
              className={`mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ${
                mounted ? "animate-fade-in-up animate-delay-300 opacity-100" : "opacity-0"
              }`}
            >
              <Link href="/upload">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#00F5A0] via-[#00D9F5] to-[#7A5CFF] text-[#050505] font-semibold text-lg px-8 hover:opacity-90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#00F5A0]/20"
                >
                  Upload Dataset
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div
              className={`mt-12 flex items-center gap-8 justify-center lg:justify-start ${
                mounted ? "animate-fade-in-up animate-delay-400 opacity-100" : "opacity-0"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm text-gray-500">Datasets Analyzed</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-500">Teams Trust Us</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Content - Demo Preview */}
          <div
            className={`relative ${
              mounted ? "animate-fade-in-up animate-delay-400 opacity-100" : "opacity-0"
            }`}
          >
            {/* Main preview card */}
            <div className="relative rounded-2xl glass border border-white/10 p-6 glow">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-gray-500 font-mono">sales_data.csv</span>
              </div>

              <div className="space-y-4">
                {/* Progress indicator */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#050505]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Analyzing patterns...</div>
                    <div className="h-1.5 mt-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Insight cards */}
                <div className="space-y-3">
                  {insightCards.map((card, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300 group cursor-pointer"
                      style={{
                        animationDelay: `${(index + 5) * 100}ms`,
                      }}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <card.icon className="w-5 h-5 text-[#050505]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400">{card.title}</div>
                        <div className="text-lg font-semibold text-white">{card.value}</div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">{card.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#7A5CFF]/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#00F5A0]/20 to-transparent rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
