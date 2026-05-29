/**
 * Tripay payment service.
 *
 * All Tripay HTTP calls happen here. Route handlers and services elsewhere
 * never `fetch` Tripay directly. This way credentials and signature logic
 * live in one place.
 *
 * Reference: https://tripay.co.id/developer
 *
 * Closed payment signature: HMAC-SHA256(merchantCode + merchantRef + amount, privateKey)
 * Callback signature:        HMAC-SHA256(rawJsonBody, privateKey)
 */
import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { getServerEnv } from "@/lib/env"
import {
  tripayCallbackSchema,
  type TripayCallbackPayload,
} from "@/lib/validators/billing"

const SANDBOX_BASE = "https://tripay.co.id/api-sandbox"
const PROD_BASE = "https://tripay.co.id/api"

export interface TripayConfig {
  apiKey: string
  privateKey: string
  merchantCode: string
  callbackUrl: string
  returnUrl: string
  baseUrl: string
}

export function getTripayConfig(): TripayConfig {
  const env = getServerEnv()
  return {
    apiKey: env.TRIPAY_API_KEY,
    privateKey: env.TRIPAY_PRIVATE_KEY,
    merchantCode: env.TRIPAY_MERCHANT_CODE,
    callbackUrl: env.TRIPAY_CALLBACK_URL,
    returnUrl: env.TRIPAY_RETURN_URL,
    baseUrl: env.TRIPAY_MODE === "production" ? PROD_BASE : SANDBOX_BASE,
  }
}

// ─── Signatures ──────────────────────────────────────────────────────────────

export function generateClosedPaymentSignature(
  merchantRef: string,
  amount: number
): string {
  const cfg = getTripayConfig()
  return createHmac("sha256", cfg.privateKey)
    .update(`${cfg.merchantCode}${merchantRef}${amount}`)
    .digest("hex")
}

/**
 * Constant-time callback signature verification.
 * `rawBody` MUST be the exact bytes Tripay sent (no JSON re-stringify).
 */
export function verifyCallbackSignature(rawBody: string, headerSignature: string): boolean {
  const cfg = getTripayConfig()
  const expected = createHmac("sha256", cfg.privateKey).update(rawBody).digest("hex")
  const a = Buffer.from(expected, "utf8")
  const b = Buffer.from(headerSignature, "utf8")
  if (a.length !== b.length) {
    timingSafeEqual(a, a)
    return false
  }
  return timingSafeEqual(a, b)
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

interface TripayResponse<T> {
  success: boolean
  message: string
  data: T
}

async function tripayGet<T>(path: string): Promise<T> {
  const cfg = getTripayConfig()
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${cfg.apiKey}` },
    cache: "no-store",
  })
  return parseTripayResponse<T>(res)
}

async function tripayPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const cfg = getTripayConfig()
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  return parseTripayResponse<T>(res)
}

async function parseTripayResponse<T>(res: Response): Promise<T> {
  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    throw new TripayApiError(`Tripay returned non-JSON response (status ${res.status})`)
  }
  const typed = payload as TripayResponse<T>
  if (!res.ok || !typed.success) {
    throw new TripayApiError(typed.message || `Tripay error (status ${res.status})`)
  }
  return typed.data
}

export class TripayApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TripayApiError"
  }
}

// ─── Domain types ────────────────────────────────────────────────────────────

export interface PaymentChannel {
  group: string
  code: string
  name: string
  type: string
  fee_merchant: { flat: number; percent: number }
  fee_customer: { flat: number; percent: number }
  total_fee: { flat: number; percent: number }
  minimum_fee: number
  maximum_fee: number
  icon_url: string
  active: boolean
}

export interface CreateClosedPaymentInput {
  method: string
  merchantRef: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  orderItems: { name: string; price: number; quantity: number }[]
  expiredMinutes?: number
}

export interface CreatedTransaction {
  reference: string
  merchant_ref: string
  payment_method: string
  payment_method_code: string
  payment_name: string
  amount: number
  fee_merchant: number
  fee_customer: number
  total_fee: number
  amount_received: number
  pay_code?: string
  pay_url?: string
  checkout_url: string
  qr_url?: string
  qr_string?: string
  status: string
  expired_time: number
}

export interface TransactionDetail extends CreatedTransaction {
  paid_at: number | null
  callback_url?: string
  return_url?: string
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getPaymentChannels(): Promise<PaymentChannel[]> {
  return tripayGet<PaymentChannel[]>("/merchant/payment-channel")
}

export async function createClosedPaymentTransaction(
  input: CreateClosedPaymentInput
): Promise<CreatedTransaction> {
  const expiredMinutes = input.expiredMinutes ?? 60
  const expiredTimestamp = Math.floor(Date.now() / 1000) + expiredMinutes * 60
  const cfg = getTripayConfig()

  return tripayPost<CreatedTransaction>("/transaction/create", {
    method: input.method,
    merchant_ref: input.merchantRef,
    amount: input.amount,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone ?? "",
    order_items: input.orderItems,
    callback_url: cfg.callbackUrl,
    return_url: cfg.returnUrl,
    expired_time: expiredTimestamp,
    signature: generateClosedPaymentSignature(input.merchantRef, input.amount),
  })
}

export function getTransactionDetail(reference: string): Promise<TransactionDetail> {
  const url = `/transaction/detail?reference=${encodeURIComponent(reference)}`
  return tripayGet<TransactionDetail>(url)
}

// ─── Callback parsing ───────────────────────────────────────────────────────

export interface ParsedCallback {
  signatureValid: boolean
  event: string
  payload: TripayCallbackPayload | null
  parseError?: string
}

/**
 * Verify + parse a Tripay webhook request. Caller must hand over the raw
 * bytes (not the JSON-decoded object) so signature verification is exact.
 */
export function parseCallback(
  rawBody: string,
  headers: { signature: string | null; event: string | null }
): ParsedCallback {
  const event = headers.event ?? ""
  if (!headers.signature) {
    return { signatureValid: false, event, payload: null, parseError: "missing_signature" }
  }
  const signatureValid = verifyCallbackSignature(rawBody, headers.signature)
  if (!signatureValid) {
    return { signatureValid: false, event, payload: null, parseError: "bad_signature" }
  }

  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return { signatureValid: true, event, payload: null, parseError: "invalid_json" }
  }
  const parsed = tripayCallbackSchema.safeParse(json)
  if (!parsed.success) {
    return { signatureValid: true, event, payload: null, parseError: "schema_mismatch" }
  }
  return { signatureValid: true, event, payload: parsed.data }
}
