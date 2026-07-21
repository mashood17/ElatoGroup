import { Hero } from '../hero/Hero'
import heroLogo from '../../assets/logos/elato-logo-home.svg'
import { heroContent } from '../../content/siteContent'

export function HomeHero() {
  return (
    <Hero
      id="home"
      logoSrc={heroLogo}
      logoAlt="ELATŌ"
      logoWidth={1000}
      logoHeight={400}
      headline={heroContent.headline}
      subStatement={heroContent.subStatement}
    />
  )
}
