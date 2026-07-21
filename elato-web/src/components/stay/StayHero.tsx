import { Hero } from '../hero/Hero'
import { stayHero } from '../../content/stayContent'
import eventsStayLogo from '../../assets/logos/elato-logo-stay-event.svg'

export function StayHero() {
  return (
    <Hero
      id="stay-hero"
      logoSrc={eventsStayLogo}
      logoAlt="ELATŌ Events & Stay"
      logoWidth={1000}
      logoHeight={400}
      headline={stayHero.tagline}
      logoDesktopClassName="lg:-translate-y-6 xl:-translate-y-8"
      mobileGapClassName="gap-16"
      headlineClassName="max-w-lg font-sans text-[22px] font-semibold leading-snug tracking-[0.04em] text-[#B08F63] sm:text-[24px] md:text-[19px] lg:text-[20px] xl:text-[21px]"
    />
  )
}
