import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { InvitationBuilder } from "@/components/forms/invitation-builder"

export const dynamic = "force-dynamic"

export default async function NewInvitationPage() {
  await requireVerifiedUserOrRedirect()
  return (
    <div className="px-8 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Undangan baru</p>
        <h1 className="mt-1 font-display text-3xl">Buat draft undangan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tidak perlu langganan aktif untuk membuat draft. Anda bisa langsung
          menyimpan dan kembali kapan saja.
        </p>
      </header>
      <InvitationBuilder />
    </div>
  )
}
