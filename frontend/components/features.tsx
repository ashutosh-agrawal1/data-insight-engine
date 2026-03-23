"use client"

import { useEffect, useRef, useState } from "react"
import {
  Upload,
  Brain,
  BarChart3,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  Users,
} from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Drag and drop CSV or Excel files. We handle the rest.",
    gradient: "from-[#00F5A0] to-[#00D9F5]",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Advanced algorithms detect patterns, trends, and anomalies.",
    gradient: "from-[#00D9F5] to-[#7A5CFF]",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description: "Beautiful charts and graphs that tell your data's story.",
    gradient: "from-[#7A5CFF] to-[#4CC9F0]",
  },
  {
    icon: MessageSquare,
    title: "Chat with Data",
    description: "Ask questions in plain English and get instant answers.",
    gradient: "from-[#FF006E] to-[#FB5607]",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get actionable insights in seconds, not hours.",
    gradient: "from-[#FB5607] to-[#FFBE0B]",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared with third parties.",
    gradient: "from-[#3A0CA3] to-[#4361EE]",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Automate hours of manual analysis into minutes.",
    gradient: "from-[#4361EE] to-[#4CC9F0]",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share reports and insights with your entire team.",
    gradient: "from-[#00F5A0] to-[#7A5CFF]",
  },
]

export function Features() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-radial from-[#7A5CFF]/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[#00F5A0]/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            Everything you need to{" "}
            <span className="gradient-text">understand your data</span>
          </h2>
          <p
            className={`text-lg text-gray-400 max-w-2xl mx-auto ${
              isVisible ? "animate-fade-in-up animate-delay-100" : "opacity-0"
            }`}
          >
            Powerful features designed for startups and product teams who need fast,
            actionable insights from their data.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${(index + 2) * 50}ms` }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-[0.05]`}
                />
              </div>

              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-[#050505]" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>

                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
