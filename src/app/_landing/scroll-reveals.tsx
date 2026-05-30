"use client"

import { motion, useInView } from "framer-motion"
import { useRef, type ReactNode } from "react"

/**
 * Three different reveal styles for the landing page so it doesn't read as
 * "every section fades up the same way" - the most obvious AI tell. Hero
 * gets a subtle staggered-children effect, the template preview slides in
 * from the side, and the testimonial uses a clip-reveal across the headline.
 */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "-15% 0px", once: true })
  return { ref, inView }
}

export function HeroReveal({ children }: { children: ReactNode }) {
  const { ref, inView } = useReveal()
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function PreviewReveal({ children }: { children: ReactNode }) {
  const { ref, inView } = useReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function TestimonialReveal({ children }: { children: ReactNode }) {
  const { ref, inView } = useReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={inView ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
