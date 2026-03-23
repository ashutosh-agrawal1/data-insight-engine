"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Mail, Linkedin, Github, User } from "lucide-react"
import Link from "next/link"

const contactInfo = [
  {
    icon: User,
    label: "Name",
    value: "Ashutosh Agrawal",
    href: null,
  },
  {
    icon: Mail,
    label: "Email",
    value: "ashutosh69003@gmail.com",
    href: "mailto:ashutosh69003@gmail.com",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "Connect on LinkedIn",
    href: "https://www.linkedin.com/in/ashutosh-agrawal-823753238",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "View GitHub Profile",
    href: "https://github.com/ashutosh-agrawal1",
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="max-w-xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-gray-400">
              Open to connecting, collaborating, or discussing opportunities in data science and analytics.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="space-y-4 mb-8">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F5A0]/10 to-[#7A5CFF]/10 flex items-center justify-center flex-shrink-0 group-hover:from-[#00F5A0]/20 group-hover:to-[#7A5CFF]/20 transition-colors">
                      <item.icon className="w-5 h-5 text-[#00D9F5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="text-white font-medium group-hover:text-[#00F5A0] transition-colors truncate">
                        {item.value}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F5A0]/10 to-[#7A5CFF]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#00D9F5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="text-white font-medium truncate">{item.value}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Portfolio Note */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[#00F5A0]/5 to-[#7A5CFF]/5 border border-white/5">
            <p className="text-gray-400 text-sm leading-relaxed">
              This project is part of my data science portfolio. I am actively seeking internship 
              and entry-level opportunities in Data Science, Data Analytics, and related roles.
            </p>
            <p className="text-gray-500 text-sm mt-3">
              Feel free to reach out if you would like to collaborate or discuss opportunities.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
