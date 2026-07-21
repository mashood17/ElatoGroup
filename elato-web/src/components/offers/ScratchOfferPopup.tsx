import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useModalFocusTrap } from '../../lib/useModalFocusTrap'
import { ScratchCard } from './ScratchCard'
import { AvailOfferForm } from './AvailOfferForm'
import { getActiveOffer, getClaimStatus, type ActiveOfferDto } from '../../lib/offerRepository'
import { getVisitorId } from '../../lib/visitorId'
import { OPEN_OFFER_POPUP_EVENT } from '../../lib/offerPopupEvents'
import { trackEvent } from '../../lib/analytics'

// "Approximately 6-7 seconds" widened slightly to 7-8s per the latest
// direction — the popup now opens on every fresh page load/refresh rather
// than once ever per visitor (duplicate claims are still prevented
// server-side by phone number, and per-visitor by the claim-status check
// below), so a shorter, more consistent delay reads better than a one-time
// surprise.
const MIN_DELAY_MS = 7000
const MAX_DELAY_MS = 8200

type Stage = 'scratching' | 'revealed' | 'form' | 'success' | 'claimed'

/**
 * Premium scratch-card offer popup, mounted once at the app root so it can
 * appear on any page. Shows the single currently-active admin-configured
 * offer (never a random reward). Opens automatically once per page
 * load/refresh (~7-8s in, on a fixed timer — independent of scrolling) —
 * not gated by a persistent "seen" flag, since duplicate claims are enforced by the
 * backend (phone number) regardless of how many times the popup itself
 * appears. A returning visitor who's already claimed the current offer
 * (checked by visitor id) never gets the automatic popup at all — it stays
 * silent so browsing isn't interrupted with a message they've already seen.
 * They can still reach an "already claimed" message via the floating Offer
 * button, which opens the popup on demand via the OPEN_OFFER_POPUP_EVENT
 * window event regardless of claim status.
 */
export function ScratchOfferPopup() {
  const [offer, setOffer] = useState<ActiveOfferDto | null>(null)
  const [claimed, setClaimed] = useState(false)
  const [claimStatusChecked, setClaimStatusChecked] = useState(false)
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<Stage>('scratching')
  const triggeredRef = useRef(false)
  const dialogRef = useModalFocusTrap(open, () => setOpen(false))

  useEffect(() => {
    let cancelled = false
    getActiveOffer().then((active) => {
      if (cancelled) return
      setOffer(active)
      if (active) {
        getClaimStatus(getVisitorId()).then((isClaimed) => {
          if (cancelled) return
          setClaimed(isClaimed)
          setClaimStatusChecked(true)
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!offer) return
    const currentOffer = offer

    function openPopup(source: 'auto' | 'manual') {
      if (triggeredRef.current && source === 'auto') return
      triggeredRef.current = true
      setStage(claimed ? 'claimed' : 'scratching')
      setOpen(true)
      trackEvent('offer_popup_shown', window.location.pathname, { offer_id: currentOffer.id, source })
      window.clearTimeout(timer)
    }

    function onManualOpen() {
      openPopup('manual')
    }

    // Wait for the claim-status check to resolve before scheduling the
    // auto-popup timer at all — an already-claimed visitor should never see
    // it fire, not even briefly while the check is still in flight.
    let timer: number | undefined
    if (claimStatusChecked && !claimed) {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
      timer = window.setTimeout(() => openPopup('auto'), delay)
    }
    window.addEventListener(OPEN_OFFER_POPUP_EVENT, onManualOpen)

    return () => {
      window.removeEventListener(OPEN_OFFER_POPUP_EVENT, onManualOpen)
      window.clearTimeout(timer)
    }
  }, [offer, claimed, claimStatusChecked])

  if (!open || !offer) return null

  function close() {
    setOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f0a06]/70 p-4 backdrop-blur-md"
      onClick={close}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={offer.popup_heading}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[#E7CAA0]/25 bg-gradient-to-b from-[#211a12]/95 to-[#0f0a06]/95 p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:max-w-md sm:p-9"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#E7CAA0]/60 transition-colors hover:bg-white/5 hover:text-[#E7CAA0]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <span className="mx-auto mb-3 block h-px w-10 bg-[#E7CAA0]/50" aria-hidden="true" />
          <h2 className="font-sans text-[22px] font-semibold leading-snug tracking-wide text-[#E7CAA0] sm:text-[26px]">
            {offer.popup_heading}
          </h2>
        </div>

        {stage === 'claimed' ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6 flex flex-col items-center gap-3 text-center"
          >
            <p className="text-body-lg font-semibold text-[#f5ead9]">
              You&rsquo;ve already claimed this exclusive offer.
            </p>
            <p className="text-caption text-[#e7caa0]/70">Keep visiting ELATŌ for our next surprise.</p>
            <button
              type="button"
              onClick={close}
              className="mt-2 h-11 w-full max-w-[200px] rounded-xl border border-[#E7CAA0]/30 text-body font-medium text-[#E7CAA0] transition-colors hover:bg-white/5"
            >
              Close
            </button>
          </motion.div>
        ) : stage === 'scratching' || stage === 'revealed' ? (
          <div className="mt-6 flex flex-col items-center gap-5">
            <ScratchCard
              width={260}
              height={150}
              revealThreshold={0.4}
              onReveal={() => {
                setStage('revealed')
                trackEvent('offer_scratch_revealed', window.location.pathname, { offer_id: offer.id })
              }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-[#3a2c17] to-[#1c150c] px-4 text-center">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#e7caa0]/60">
                  {offer.scratch_reveal_text ?? 'Your Reward'}
                </p>
                <p className="font-sans text-[30px] font-bold text-[#f5ead9]">{offer.reward_text}</p>
              </div>
            </ScratchCard>

            {stage === 'revealed' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div>
                  <p className="text-body-lg font-semibold text-[#f5ead9]">Congratulations!</p>
                  {offer.description && <p className="mt-1 text-caption text-[#e7caa0]/70">{offer.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setStage('form')}
                  className="h-12 w-full max-w-[220px] rounded-xl bg-[#E7CAA0] text-body font-semibold tracking-wide text-[#2b2116] transition-colors hover:bg-[#f0dcb8]"
                >
                  {offer.button_text}
                </button>
              </motion.div>
            )}
          </div>
        ) : stage === 'form' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-6">
            <p className="mb-5 text-center text-caption text-[#e7caa0]/70">
              {offer.reward_text} — enter your details to claim it at ELATŌ.
            </p>
            <AvailOfferForm
              offerId={offer.id}
              buttonText={offer.button_text}
              onSuccess={() => {
                setClaimed(true)
                setStage('success')
              }}
              onAlreadyClaimed={() => setStage('claimed')}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6 flex flex-col items-center gap-3 text-center"
          >
            <p className="text-body-lg font-semibold text-[#f5ead9]">You're all set!</p>
            <p className="text-caption text-[#e7caa0]/70">
              Show your name and phone number at ELATŌ to redeem {offer.reward_text}.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-2 h-11 w-full max-w-[200px] rounded-xl border border-[#E7CAA0]/30 text-body font-medium text-[#E7CAA0] transition-colors hover:bg-white/5"
            >
              Close
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
