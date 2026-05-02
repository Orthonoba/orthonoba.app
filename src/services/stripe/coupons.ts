import { stripe } from './index'
import type { CouponValidation } from '@/src/types/billing'
import type { PlanTier } from '@/src/types/clinic'

// ─── Validate a promotion code ────────────────────────────────────────────────

export async function validatePromotionCode(
  code: string,
  _plan?: PlanTier
): Promise<CouponValidation> {
  const results = await stripe.promotionCodes.list({ code, active: true, limit: 1 })
  const promoCode = results.data[0]

  if (!promoCode) {
    return { valid: false, errorCode: 'COUPON_NOT_FOUND', message: 'Código de descuento no encontrado.' }
  }

  // In Stripe SDK v22+, coupon lives in promoCode.promotion.coupon
  const promotion = promoCode.promotion
  const coupon = typeof promotion.coupon === 'string' ? null : promotion.coupon

  if (!coupon || !coupon.valid) {
    return { valid: false, errorCode: 'COUPON_INVALID', message: 'Este cupón no es válido.' }
  }

  if (coupon.redeem_by && coupon.redeem_by * 1000 < Date.now()) {
    return { valid: false, errorCode: 'COUPON_EXPIRED', message: 'Este cupón ha expirado.' }
  }

  if (
    coupon.max_redemptions != null &&
    coupon.times_redeemed >= coupon.max_redemptions
  ) {
    return {
      valid: false,
      errorCode: 'COUPON_MAX_REDEMPTIONS',
      message: 'Este cupón ha alcanzado el límite de usos.',
    }
  }

  const parsed: CouponValidation['coupon'] = {
    id: coupon.id,
    code,
    type: coupon.percent_off != null ? 'percent_off' : 'amount_off',
    percentOff: coupon.percent_off ?? undefined,
    amountOff: coupon.amount_off ?? undefined,
    duration: coupon.duration as 'once' | 'repeating' | 'forever',
    durationInMonths: coupon.duration_in_months ?? undefined,
  }

  return { valid: true, coupon: parsed }
}

// ─── Apply promotion code to a subscription ───────────────────────────────────

export async function applyPromotionCodeToSubscription(
  subscriptionId: string,
  promotionCodeId: string
) {
  return stripe.subscriptions.update(subscriptionId, {
    discounts: [{ promotion_code: promotionCodeId }],
  })
}

// ─── Create a Stripe coupon (platform admin only) ─────────────────────────────

interface CreateCouponParams {
  name: string
  percentOff?: number
  amountOff?: number
  currency?: string
  duration: 'once' | 'repeating' | 'forever'
  durationInMonths?: number
  maxRedemptions?: number
  redeemByUnix?: number
}

export async function createStripeCoupon(params: CreateCouponParams) {
  return stripe.coupons.create({
    name: params.name,
    ...(params.percentOff != null ? { percent_off: params.percentOff } : {}),
    ...(params.amountOff != null
      ? { amount_off: params.amountOff, currency: params.currency ?? 'eur' }
      : {}),
    duration: params.duration,
    ...(params.durationInMonths ? { duration_in_months: params.durationInMonths } : {}),
    ...(params.maxRedemptions ? { max_redemptions: params.maxRedemptions } : {}),
    ...(params.redeemByUnix ? { redeem_by: params.redeemByUnix } : {}),
  })
}

// ─── Create a promotion code for a coupon ─────────────────────────────────────

export async function createPromotionCode(
  couponId: string,
  code: string,
  maxRedemptions?: number
) {
  // In Stripe SDK v22+, coupon goes inside promotion.coupon
  return stripe.promotionCodes.create({
    promotion: { coupon: couponId, type: 'coupon' },
    code,
    ...(maxRedemptions ? { max_redemptions: maxRedemptions } : {}),
  })
}

// ─── List active coupons ──────────────────────────────────────────────────────

export async function listActiveCoupons(limit = 20) {
  return stripe.coupons.list({ limit })
}

// ─── Deactivate a promotion code ─────────────────────────────────────────────

export async function deactivatePromotionCode(promotionCodeId: string) {
  return stripe.promotionCodes.update(promotionCodeId, { active: false })
}
