/**
 * Modern Minimalist template.
 *
 * Visual identity:
 *   - Stark whitespace, single accent line
 *   - Sans typography, all-caps tracking, lowercase labels
 *   - Off-white ground, asymmetric editorial-style stacks
 *   - No ornaments, very few colour shifts; rhythm comes from typography
 *
 * Differs from Classic Elegant in *layout* and *typography*, not just colour.
 */
import Link from "next/link"
import type { InvitationTemplateProps } from "./types"
import { Countdown } from "../sections/countdown"
import { formatScheduleDate, formatScheduleRange } from "../sections/section-helpers"
import { formatDateID } from "@/lib/utils"

interface InvitationContent {
  schedule?: Array<{ label: string; startsAt: string; endsAt?: string; notes?: string }>
  groomFatherName?: string
  groomMotherName?: string
  brideFatherName?: string
  brideMotherName?: string
  coupleStory?: string
  openingQuote?: string
  galleryUrls?: string[]
  giftAccounts?: Array<{ bankName: string; accountNumber: string; accountHolder: string }>
  giftEnabled?: boolean
  mapsUrl?: string
}

export function ModernMinimalist({ invitation, recipient }: InvitationTemplateProps) {
  const c = (invitation.content ?? {}) as InvitationContent
  const accent = invitation.primaryColor ?? "#2f3437"

  return (
    <article className="min-h-screen bg-[#fafaf7] text-[#2f3437]">
      {/* Hero - fully editorial: oversized number date, restrained type */}
      <header className="border-b border-[#2f3437]/15">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#2f3437]/60">
              undangan pernikahan
            </p>
            <h1 className="mt-10 font-display text-[10vw] leading-[0.85] tracking-tight sm:text-7xl lg:text-8xl">
              {invitation.groomName.split(" ")[0]}
              <br />
              <span className="text-[#2f3437]/40">&amp;</span>{" "}
              {invitation.brideName.split(" ")[0]}
            </h1>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-[#2f3437]/70">
              Untuk <strong className="font-medium text-[#2f3437]">{recipient}</strong>,
              kami ingin mengundang Anda untuk hadir di hari yang kami nantikan.
            </p>
          </div>
          <aside className="flex flex-col justify-end gap-6 border-l border-[#2f3437]/15 pl-6 lg:pl-12">
            {invitation.eventDate ? (
              <div>
                <span className="text-[11px] uppercase tracking-[0.4em] text-[#2f3437]/50">
                  tanggal
                </span>
                <p className="mt-3 font-display text-2xl">{formatDateID(invitation.eventDate)}</p>
              </div>
            ) : null}
            {invitation.venueName ? (
              <div>
                <span className="text-[11px] uppercase tracking-[0.4em] text-[#2f3437]/50">
                  lokasi
                </span>
                <p className="mt-3 text-base">{invitation.venueName}</p>
                {invitation.venueAddress ? (
                  <p className="mt-1 text-sm text-[#2f3437]/60">{invitation.venueAddress}</p>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </header>

      {/* Couple - two thin columns */}
      <section className="mx-auto grid max-w-4xl gap-12 px-6 py-20 sm:grid-cols-2">
        {[
          {
            name: invitation.groomName,
            parents: [c.groomFatherName, c.groomMotherName].filter(Boolean) as string[],
          },
          {
            name: invitation.brideName,
            parents: [c.brideFatherName, c.brideMotherName].filter(Boolean) as string[],
          },
        ].map((person, i) => (
          <div key={i} className="border-t border-[#2f3437]/15 pt-6">
            <span className="text-[11px] uppercase tracking-[0.4em] text-[#2f3437]/50">
              {i === 0 ? "mempelai pria" : "mempelai wanita"}
            </span>
            <h3 className="mt-4 font-display text-3xl">{person.name}</h3>
            {person.parents.length > 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-[#2f3437]/70">
                Putra/i dari Bapak {person.parents[0]}
                {person.parents[1] ? ` dan Ibu ${person.parents[1]}` : ""}
              </p>
            ) : null}
          </div>
        ))}
      </section>

      {/* Schedule - timeline-ish */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="mx-auto max-w-4xl px-6 py-20">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#2f3437]/60">acara</p>
          <h2 className="mt-3 font-display text-4xl">Jadwal</h2>
          <ol className="mt-10 divide-y divide-[#2f3437]/10">
            {c.schedule.map((item, i) => (
              <li key={i} className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#2f3437]/60">
                  {item.label}
                </p>
                <div>
                  <p className="font-display text-xl">{formatScheduleDate(item)}</p>
                  <p className="mt-0.5 text-sm text-[#2f3437]/70">{formatScheduleRange(item)}</p>
                  {item.notes ? (
                    <p className="mt-2 text-sm text-[#2f3437]/60">{item.notes}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="mx-auto max-w-4xl border-t border-[#2f3437]/10 px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-[#2f3437]/60">menuju</p>
              <h2 className="mt-2 font-display text-3xl">Hitung mundur</h2>
            </div>
            <Countdown target={invitation.eventDate} variant="minimal" />
          </div>
        </section>
      ) : null}

      {/* Map */}
      {invitation.venueName ? (
        <section className="mx-auto max-w-4xl px-6 py-20">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#2f3437]/60">peta</p>
          <h2 className="mt-3 font-display text-4xl">{invitation.venueName}</h2>
          {invitation.venueAddress ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#2f3437]/70">
              {invitation.venueAddress}
            </p>
          ) : null}
          {(c.mapsUrl ||
            (typeof invitation.latitude === "number" &&
              typeof invitation.longitude === "number")) ? (
            <Link
              href={
                c.mapsUrl ??
                `https://www.google.com/maps?q=${invitation.latitude},${invitation.longitude}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border-b border-current pb-1 text-sm font-medium"
              style={{ color: accent }}
            >
              Buka peta →
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && Array.isArray(c.giftAccounts) && c.giftAccounts.length > 0 ? (
        <section className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#2f3437]/60">hadiah</p>
          <h2 className="mt-3 font-display text-4xl">Tanda kasih</h2>
          <p className="mt-4 max-w-md text-sm text-[#2f3437]/70">
            Tidak diharuskan, tetapi jika berkenan rekening berikut akan kami kabarkan.
          </p>
          <ul className="mt-8 space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li key={i} className="border-t border-[#2f3437]/10 pt-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#2f3437]/60">
                  {g.bankName}
                </p>
                <p className="mt-2 font-mono text-base">{g.accountNumber}</p>
                <p className="text-sm text-[#2f3437]/70">{g.accountHolder}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="mx-auto max-w-3xl border-t border-[#2f3437]/10 px-6 py-16">
        <p className="font-display text-2xl">{invitation.groomName} &amp; {invitation.brideName}</p>
        <p className="mt-2 text-sm text-[#2f3437]/60">
          Sebuah hari yang kami siapkan dengan tenang. Terima kasih sudah meluangkan waktu untuk kami.
        </p>
      </footer>
    </article>
  )
}
