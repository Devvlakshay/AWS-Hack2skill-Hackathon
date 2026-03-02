"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function AnimatedHero() {
  return (
    <motion.div
      className="glass-card-lg p-10 sm:p-14 text-center max-w-3xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {/* Badge */}
      <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 mb-6">
        <span className="glass-card-mid px-4 py-1.5 rounded-full text-sm font-medium text-violet-300 border border-violet-500/20">
          <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-glow-pulse mr-2 align-middle" />
          AI for Bharat 2025
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={fadeUp}
        custom={0.1}
        className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
      >
        Try Before You Buy{" "}
        <span className="text-gradient-primary animate-gradient block mt-1">
          with AI
        </span>
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        variants={fadeUp}
        custom={0.2}
        className="mt-6 text-lg sm:text-xl text-[rgb(var(--text-secondary))] leading-relaxed max-w-2xl mx-auto"
      >
        FitView AI brings the fitting room to your screen. Select a model, choose
        your outfit, and see it on — powered by cutting-edge generative AI,{" "}
        <span className="text-violet-300 font-medium">built for Indian retail</span>.
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={fadeUp}
        custom={0.3}
        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link href="/register" className="btn-primary text-base px-9 py-4 rounded-xl">
          Get Started Free
        </Link>
        <Link href="/login" className="btn-outline-gradient text-base px-9 py-4 rounded-xl">
          Sign In
        </Link>
      </motion.div>

      {/* Social proof */}
      <motion.div
        variants={fadeUp}
        custom={0.4}
        className="mt-8 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-[rgb(var(--text-muted))]"
      >
        <span>No credit card required</span>
        <span className="w-1 h-1 rounded-full bg-[rgb(var(--text-muted))]" />
        <span>Free try-on credits</span>
        <span className="w-1 h-1 rounded-full bg-[rgb(var(--text-muted))]" />
        <span>Retailer dashboard</span>
      </motion.div>
    </motion.div>
  );
}
