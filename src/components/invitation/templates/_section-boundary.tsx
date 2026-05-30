"use client"

import { Component, type ReactNode } from "react"

interface SectionBoundaryProps {
  children: ReactNode
  /** Quiet replacement shown when the wrapped section throws. Defaults to nothing. */
  fallback?: ReactNode
}

interface SectionBoundaryState {
  hasError: boolean
}

/**
 * Per-section error boundary.
 *
 * A single misbehaving section (a runtime error inside a form, a malformed
 * gift entry, a gallery interaction edge case) must never blank out the whole
 * invitation. Each template wraps its sections in this boundary so a failure
 * degrades to a quiet gap instead of a white screen.
 *
 * Class component because React error boundaries can only be expressed with
 * `getDerivedStateFromError` / `componentDidCatch`.
 */
export class SectionBoundary extends Component<SectionBoundaryProps, SectionBoundaryState> {
  constructor(props: SectionBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): SectionBoundaryState {
    return { hasError: true }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
