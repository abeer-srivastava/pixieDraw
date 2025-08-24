"use client"

import React from "react"

export default function BackgroundGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1f1f1f]">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)]"
        style={{
          backgroundSize: "60px 60px", // grid size
        }}
      />
      {/* App content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
