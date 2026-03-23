"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  BarChart3,
  Brain,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  Target,
  Code2,
  Layers,
} from "lucide-react"

const capabilities = [
  {
    icon: FileSpreadsheet,
    title: "Real-Time Processing",
    description: "Parses and processes uploaded CSV datasets instantly with automatic column type detection.",
  },
  {
    icon: Brain,
    title: "Exploratory Data Analysis",
    description: "Performs comprehensive EDA including statistical summaries, distributions, and correlations.",
  },
  {
    icon: BarChart3,
    title: "Data Visualization",
    description: "Generates interactive charts and visualizations to reveal trends and patterns in your data.",
  },
  {
    icon: Sparkles,
    title: "Insight Generation",
    description: "Translates raw data into actionable insights through automated analysis pipelines.",
  },
]

const technologies = [
  { name: "Next.js", description: "React framework for production" },
  { name: "React", description: "UI component library" },
  { name: "Tailwind CSS", description: "Utility-first styling" },
  { name: "PapaParse", description: "CSV parsing engine" },
  { name: "Recharts", description: "Data visualization" },
  { name: "TypeScript", description: "Type-safe development" },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Target className="w-4 h-4 text-[#00F5A0]" />
              <span className="text-sm text-gray-400">Data Science Portfolio Project</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About <span className="gradient-text">Kryntal AI</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              An interactive data analysis platform designed to help users quickly understand 
              and explore structured datasets through automated analysis, visualizations, and intuitive summaries.
            </p>
          </div>

          {/* Purpose Section */}
          <div className="mb-16">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F5A0]/20 to-[#7A5CFF]/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-[#00F5A0]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Purpose</h2>
                  <p className="text-gray-400 leading-relaxed">
                    The goal of this project is to simplify the data exploration process and enable faster, 
                    data-driven decision-making, especially for users without deep technical backgrounds. 
                    This project demonstrates the integration of core data science concepts into a practical, 
                    real-world application.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">EDA</div>
                  <div className="text-xs text-gray-500">Exploratory Analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">Stats</div>
                  <div className="text-xs text-gray-500">Statistical Summaries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">Viz</div>
                  <div className="text-xs text-gray-500">Data Visualization</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">AI</div>
                  <div className="text-xs text-gray-500">Insight Generation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Data Science Capabilities</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {capabilities.map((capability, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F5A0]/10 to-[#7A5CFF]/10 flex items-center justify-center mb-4">
                    <capability.icon className="w-5 h-5 text-[#00D9F5]" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{capability.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Technologies Used</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center"
                >
                  <div className="text-white font-medium mb-1">{tech.name}</div>
                  <div className="text-xs text-gray-500">{tech.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Built With */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#00F5A0]/5 to-[#7A5CFF]/5 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="w-5 h-5 text-[#00F5A0]" />
              <h3 className="text-lg font-medium text-white">Development & Deployment</h3>
            </div>
            <div className="space-y-3 text-gray-400">
              <p>
                <span className="text-white font-medium">v0</span> was used for UI prototyping and building 
                the interactive dashboard interface, enabling rapid development of the data visualization components.
              </p>
              <p>
                <span className="text-white font-medium">Vercel</span> is used for deployment, providing 
                fast global edge delivery and seamless integration with the Next.js framework.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
