import { motion } from 'framer-motion'
import { Sofa, Maximize, BedDouble, Bath, ChefHat, ParkingCircle, Leaf, Wifi, type LucideIcon } from 'lucide-react'
import stayHeroImage from '../../assets/services/stay.png'
import stayImage from '../../assets/stay/thestay.png'
import sectionBackground from '../../assets/newbg/bg.jpg'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb.png'
import { SectionBackground } from '../ui/SectionBackground'
import Stack from '../ui/Stack'
import { amenities } from '../../content/stayContent'
import { useStayGallery } from '../../lib/useStayGallery'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'
import { useSectionExitFade } from '../../lib/useSectionExitFade'

const amenityIcons: Record<string, LucideIcon> = {
  'Fully Furnished': Sofa,
  'Spacious Living Area': Maximize,
  'Premium Bedrooms': BedDouble,
  'Modern Bathrooms': Bath,
  Kitchen: ChefHat,
  Parking: ParkingCircle,
  'Peaceful Environment': Leaf,
  'Free Wi-Fi': Wifi,
}

// Static fallback shown while the admin-managed gallery loads or if no photos
// have been added yet — keeps the stacked-cards visual intact.
const fallbackStackCards = [
  <img
    key="1"
    src={stayHeroImage}
    alt="ELATŌ Stay — the living space"
    className="box-border h-full w-full border-[6px] border-[#9e7641] object-cover"
  />,
  <img
    key="2"
    src={stayImage}
    alt="ELATŌ Stay — the apartment interior"
    className="box-border h-full w-full border-[6px] border-[#9e7641] object-cover object-top"
  />,
  <img
    key="3"
    src={stayHeroImage}
    alt="ELATŌ Stay — the property"
    className="box-border h-full w-full border-[6px] border-[#9e7641] object-cover object-bottom"
  />,
]

export function Amenities() {
  const { status, images } = useStayGallery()
  const exitFade = useSectionExitFade<HTMLElement>()

  // Same admin-managed Stay gallery as "A Glimpse Inside" — rendered here as
  // the stacked cards. Falls back to the static images until photos load.
  const stackCards =
    status === 'ready'
      ? images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            alt={img.caption || 'ELATŌ Stay'}
            className="box-border h-full w-full border-[6px] border-[#9e7641] object-cover"
          />
        ))
      : fallbackStackCards

  return (
    <motion.section ref={exitFade.ref} style={exitFade.style} className="relative overflow-hidden py-16 lg:py-32">
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />

      <div className="container-elato relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16"
        >
          <motion.div variants={sectionReveal} className="order-1 flex-1 lg:order-1">
            <p className="text-caption text-[#9e7641]">Boutique Retreat</p>
            <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641]">Where Comfort Meets Quiet Luxury</h2>
            <p className="text-body mt-4 max-w-md font-sans text-[#9e7641]">
              Nothing to arrange, nothing missing — every stay comes fully equipped and ready from the moment you
              arrive.
            </p>

            <p className="text-h3 mt-10 font-bold text-[#9e7641]">What's Included</p>
            <ul className="mt-4 grid grid-cols-4 gap-2">
              {amenities.map((amenity) => {
                const Icon = amenityIcons[amenity]
                return (
                  <motion.li
                    key={amenity}
                    variants={sectionReveal}
                    className="flex flex-col items-center gap-1 rounded-md border border-[#9e7641]/20 bg-primary-50 px-1.5 py-1.5 text-center shadow-elato-lg"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9e7641]/10 text-[#9e7641]">
                      <Icon className="h-2.5 w-2.5" strokeWidth={1.75} />
                    </span>
                    <span className="text-[9px] font-sans normal-case leading-tight tracking-normal text-[#9e7641]">
                      {amenity}
                    </span>
                  </motion.li>
                )
              })}
            </ul>
          </motion.div>

          <motion.div variants={sectionReveal} className="order-2 flex justify-center lg:order-2 lg:justify-start">
            <div className="h-80 w-80 sm:h-96 sm:w-96 lg:h-[28rem] lg:w-[28rem]">
              <Stack randomRotation sendToBackOnClick cards={stackCards} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
