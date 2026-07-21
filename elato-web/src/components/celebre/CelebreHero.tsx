import { Hero } from '../hero/Hero'
import { celebreHero } from '../../content/celebreContent'
import celebreLogo from '../../assets/logos/elato-logo-celebre.svg'

export function CelebreHero() {
  return (
    <Hero
      id="celebre-hero"
      logoSrc={celebreLogo}
      logoAlt="ELATŌ Celebré"
      logoWidth={1000}
      logoHeight={400}
      headline={celebreHero.tagline}
      logoDesktopClassName="lg:-translate-y-6 xl:-translate-y-8"
      mobileGapClassName="gap-16"
      headlineClassName="max-w-lg font-sans text-[22px] font-semibold leading-snug tracking-[0.04em] text-[#B08F63] sm:text-[24px] md:text-[19px] lg:text-[20px] xl:text-[21px]"
    />
  )
}
