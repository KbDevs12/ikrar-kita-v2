/**
 * Auth layout - intentionally barebones. Each page handles its own composition.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>
}
