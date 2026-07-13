import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { rooms } from '../../content/stayContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'

const gradients = [
  'from-primary-300 to-secondary-500',
  'from-secondary-500 to-primary-100',
  'from-primary-100 to-secondary-700',
]

function scrollToBooking(e: React.MouseEvent) {
  e.preventDefault()
  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
}

export function RoomDetails() {
  return (
    <section className="bg-surface-base py-16 lg:py-32">
      <div className="container-elato">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="text-h2 mb-12 text-center text-secondary-900"
        >
          The Rooms
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {rooms.map((room, i) => (
            <motion.div key={room.id} variants={sectionReveal}>
              <Card hoverable={false} className="flex h-full flex-col overflow-hidden">
                <div
                  className={`aspect-4/3 w-full bg-gradient-to-br ${gradients[i % gradients.length]}`}
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-h3 text-secondary-900">{room.name}</h3>
                  <p className="text-body mt-2 flex-1 text-neutral-warm-500">{room.description}</p>
                  <p className="text-caption mt-4 text-secondary-500">
                    Max {room.maxOccupancy} guests
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {room.amenities.map((a) => (
                      <Badge key={a}>{a}</Badge>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="primary" onClick={scrollToBooking}>
                      Enquire
                    </Button>
                    <Button variant="secondary" onClick={scrollToBooking}>
                      Check Availability
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
