"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface GalleryProps {
  urls: string[]
  /**
   * Layout variant lets each template pick a composition that matches its
   * rhythm. `mosaic` is the safe default; templates with strong vertical
   * scaffolding (cinematic, dark-romance) tend to prefer `cinema`.
   */
  variant?: "mosaic" | "polaroid" | "cinema" | "circle"
  className?: string
  caption?: string
}

/**
 * Resilient gallery section. Hides itself entirely if no URLs are supplied
 * so the template doesn't render a sad empty box. Each thumbnail opens a
 * lightweight overlay on click.
 *
 * Layout shifts are avoided via aspect-ratio + Tailwind fixed grids - we
 * never wait for image natural dimensions.
 */
export function Gallery({ urls, variant = "mosaic", className, caption }: GalleryProps) {
  const [active, setActive] = useState<string | null>(null)
  if (!urls || urls.length === 0) return null

  // Keep things bounded - past 12 the section turns into a wall of thumbnails
  // and the page weight balloons. Owners with bigger galleries can split them
  // across multiple invitations or use a dedicated gallery host.
  const list = urls.slice(0, 12)

  return (
    <div className={cn("relative", className)}>
      {variant === "mosaic" ? <MosaicLayout list={list} onOpen={setActive} /> : null}
      {variant === "polaroid" ? <PolaroidLayout list={list} onOpen={setActive} /> : null}
      {variant === "cinema" ? <CinemaLayout list={list} onOpen={setActive} /> : null}
      {variant === "circle" ? <CircleLayout list={list} onOpen={setActive} /> : null}

      {caption ? (
        <p className="mt-4 text-center text-xs uppercase tracking-[0.32em] text-stone-500">
          {caption}
        </p>
      ) : null}

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4"
          onClick={() => setActive(null)}
        >
          <div className="relative h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl">
            <Image
              src={active}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
              priority
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActive(null)
            }}
            className="absolute right-6 top-6 rounded-full bg-white/90 px-4 py-1.5 text-xs uppercase tracking-widest text-stone-900"
          >
            Tutup
          </button>
        </div>
      ) : null}
    </div>
  )
}

interface LayoutProps {
  list: string[]
  onOpen: (url: string) => void
}

function MosaicLayout({ list, onOpen }: LayoutProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {list.map((url, i) => (
        <li key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-xl">
          <button
            type="button"
            onClick={() => onOpen(url)}
            className="block h-full w-full transition hover:opacity-90"
          >
            <Image
              src={url}
              alt={`Foto ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          </button>
        </li>
      ))}
    </ul>
  )
}

function PolaroidLayout({ list, onOpen }: LayoutProps) {
  return (
    <ul className="flex flex-wrap items-start justify-center gap-6">
      {list.map((url, i) => (
        <li
          key={`${url}-${i}`}
          className="relative w-44 rotate-[-1deg] bg-white p-2.5 shadow-md odd:rotate-[1.5deg]"
        >
          <button
            type="button"
            onClick={() => onOpen(url)}
            className="relative block aspect-[3/4] w-full overflow-hidden bg-stone-100"
          >
            <Image
              src={url}
              alt={`Polaroid ${i + 1}`}
              fill
              sizes="176px"
              className="object-cover"
            />
          </button>
        </li>
      ))}
    </ul>
  )
}

function CinemaLayout({ list, onOpen }: LayoutProps) {
  return (
    <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4">
      {list.map((url, i) => (
        <li
          key={`${url}-${i}`}
          className="relative aspect-[2/3] h-[60vh] flex-none snap-center overflow-hidden md:h-[70vh]"
        >
          <button type="button" onClick={() => onOpen(url)} className="block h-full w-full">
            <Image
              src={url}
              alt={`Adegan ${i + 1}`}
              fill
              sizes="(max-width: 768px) 80vw, 50vw"
              className="object-cover"
            />
          </button>
        </li>
      ))}
    </ul>
  )
}

function CircleLayout({ list, onOpen }: LayoutProps) {
  return (
    <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {list.map((url, i) => (
        <li key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-full">
          <button
            type="button"
            onClick={() => onOpen(url)}
            className="block h-full w-full"
          >
            <Image
              src={url}
              alt={`Kenangan ${i + 1}`}
              fill
              sizes="(max-width: 768px) 33vw, 16vw"
              className="object-cover"
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
