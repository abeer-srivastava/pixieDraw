"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Feather } from "lucide-react";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col font-mono text-[#f5f3ff]">
      {/* Navbar */}
      <header className="w-full px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50 bg-[#1f1f1f] border-b-4 border-black">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <div className="flex flex-row justify-center items-center">
            <Feather
              size={30}
              className="mr-2 bg-[#a78bfa] text-black border-2 border-black rounded-lg p-1"
            />
            PixieDraw
          </div>
        </h1>
        <Button className="rounded-full bg-[#a78bfa] hover:bg-[#674d94] text-black border-2 border-black shadow-md">
          <Link href="signup">Get Started</Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-20 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center md:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-[#ede9fe]">
              Collaborate. Sketch. Create.
              <br />
              With PixieDraw.
            </h2>
            <p className="text-lg text-[#e0d7ff] mb-6">
              A playful yet professional collaborative whiteboard for teams to
              brainstorm, sketch diagrams, and share ideas in real time.
            </p>
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg bg-[#7c3aed] hover:bg-[#6d28d9] border-2 border-black shadow-md text-white"
            ><Link href="/signup">Start Drawing Now</Link>
              
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative bg-[#7c3aed] w-full max-w-md aspect-video rounded-2xl overflow-hidden border-2 border-black shadow-lg hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-transform">
              <Image
                src="/placeholder-whiteboard.png"
                alt="PixieDraw Whiteboard"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-8 md:px-16 py-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#ede9fe]">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Real-time Collaboration", desc: "Work with your team live, no delays." },
              { title: "Hand-drawn Style", desc: "Sketch diagrams with a playful, natural look." },
              { title: "Export & Share", desc: "Easily export your boards and share with anyone." },
              { title: "Cross-Platform", desc: "Works seamlessly on desktop, tablet, and mobile devices." },
              { title: "Secure & Private", desc: "Your work stays yours with strong privacy options." },
              { title: "Customizable Boards", desc: "Choose themes, colors, and layouts that suit your workflow." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="rounded-2xl h-full bg-[#a78bfa] border-2 border-black shadow-lg hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-transform">
                  <CardContent className="p-6 text-center">
                    <h4 className="text-xl font-semibold mb-3 text-black">
                      {f.title}
                    </h4>
                    <p className="text-[#1e1b2e]">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="px-8 md:px-16 py-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#ede9fe]">
            How it Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create a Room", desc: "Start a new whiteboard room instantly." },
              { step: "2", title: "Draw & Collaborate", desc: "Sketch, brainstorm, and edit together in real-time." },
              { step: "3", title: "Share", desc: "Export your drawings or share a live link." },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="rounded-2xl h-full bg-[#a78bfa] border-2 border-black shadow-lg hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-[#5b21b6] mb-4">
                      {s.step}
                    </div>
                    <h4 className="text-xl font-semibold mb-3 text-black">
                      {s.title}
                    </h4>
                    <p className="text-[#1e1b2e]">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-8 md:px-16 py-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#ede9fe]">
            What People Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { quote: "PixieDraw made brainstorming sessions super fun and productive!", name: "Sarah L." },
              { quote: "I love the clean purple vibe—it feels creative and professional.", name: "Mark R." },
              { quote: "Our remote team relies on PixieDraw for daily standups.", name: "Priya K." },
              { quote: "A must-have tool for designers and educators alike!", name: "Daniel H." },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="rounded-2xl h-full bg-[#a78bfa] border-2 border-black shadow-lg hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-transform">
                  <CardContent className="p-6">
                    <p className="italic text-black mb-4">“{t.quote}”</p>
                    <p className="font-semibold text-[#2a1a3f]">— {t.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Call to Action */}
      <footer className="px-8 md:px-16 py-20 text-center bg-[#5b21b6] border-t-4 border-black">
        <h3 className="text-3xl font-bold mb-6 text-white">
          Ready to start creating?
        </h3>
        <Button className="rounded-full px-8 py-6 text-lg bg-[#7c3aed] text-white border-2 border-black hover:bg-[#6d28d9] shadow-lg">
          Get Started for Free
        </Button>
      </footer>
    </div>
  );
}
