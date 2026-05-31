"use client"

import * as Tabs from "@radix-ui/react-tabs"
import Link from "next/link"
import { formatDateID, formatRupiah } from "@/lib/utils"
import { InvoicesTable, type InvoiceRow } from "./invoices-table"

interface BillingTabsProps {
  plans: Array<{
    id: string
    code: string
    name: string
    price: number
    durationDays: number
    description: string | null
    invitationLimit: number | null
  }>
  subscription: {
    status: string
    planCode: string
    invitationLimit: number | null
    expiresAt: string
  } | null
  invoices: InvoiceRow[]
}

const PLAN_BLURB: Record<string, string> = {
  BASIC: "Pas untuk satu undangan dengan kebutuhan dasar.",
  PRO: "Cocok bila Anda ingin punya beberapa varian undangan.",
  RESELLER: "Untuk vendor dan WO yang menerbitkan banyak undangan tiap bulan.",
}

export function BillingTabs({ plans, subscription, invoices }: BillingTabsProps) {
  const isActive = subscription?.status === "ACTIVE"
  return (
    <Tabs.Root defaultValue="paket" className="mt-2">
      <Tabs.List className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-white p-1 text-sm">
        <TabTrigger value="paket">Paket</TabTrigger>
        <TabTrigger value="riwayat">Riwayat tagihan</TabTrigger>
      </Tabs.List>

      <Tabs.Content value="paket" className="mt-8 outline-none">
        {isActive ? (
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-rose-50 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-rose-500">Paket aktif</p>
              <p className="mt-2 font-display text-3xl text-stone-900">
                {subscription!.planCode}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Berlaku hingga{" "}
                <strong className="text-stone-900">
                  {formatDateID(subscription!.expiresAt)}
                </strong>
              </p>
            </div>
            <span className="text-xs text-stone-500">
              {subscription!.invitationLimit === null
                ? "Tanpa batas undangan terpublikasi"
                : `Batas ${subscription!.invitationLimit} undangan terpublikasi`}
            </span>
          </div>
        ) : null}

        <ul className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const featured = plan.code === "PRO"
            return (
              <li
                key={plan.id}
                className={
                  "relative flex flex-col rounded-2xl p-7 transition-colors " +
                  (featured
                    ? "bg-stone-900 text-rose-50 shadow-lg"
                    : "border border-rose-100 bg-white text-stone-900 hover:border-rose-200")
                }
              >
                {featured ? (
                  <span className="absolute right-6 top-6 rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.32em] text-white">
                    Favorit
                  </span>
                ) : null}
                <p
                  className={
                    "text-xs uppercase tracking-[0.32em] " +
                    (featured ? "text-rose-300" : "text-rose-500")
                  }
                >
                  Paket {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-3xl">{plan.name}</h3>
                <p
                  className={
                    "mt-2 text-sm " + (featured ? "text-rose-100/70" : "text-stone-500")
                  }
                >
                  {plan.description ?? PLAN_BLURB[plan.code] ?? ""}
                </p>
                <p className="mt-6 font-display text-4xl tabular-nums">
                  {formatRupiah(plan.price)}
                </p>
                <p
                  className={
                    "text-xs " + (featured ? "text-rose-100/70" : "text-stone-500")
                  }
                >
                  / {plan.durationDays} hari
                </p>
                <Link
                  href={`/dashboard/billing/checkout?plan=${plan.code}`}
                  className={
                    "mt-7 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors " +
                    (featured
                      ? "bg-rose-500 text-white hover:bg-rose-400"
                      : "bg-stone-900 text-white hover:bg-stone-800")
                  }
                >
                  {isActive ? "Perpanjang" : "Pilih paket ini"}
                </Link>
              </li>
            )
          })}
        </ul>
      </Tabs.Content>

      <Tabs.Content value="riwayat" className="mt-8 outline-none">
        <InvoicesTable rows={invoices} />
      </Tabs.Content>
    </Tabs.Root>
  )
}

function TabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Tabs.Trigger
      value={value}
      className="rounded-full px-4 py-2 text-stone-600 transition-colors data-[state=active]:bg-rose-500 data-[state=active]:text-white"
    >
      {children}
    </Tabs.Trigger>
  )
}
