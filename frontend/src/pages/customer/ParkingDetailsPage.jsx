import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AiFillStar } from 'react-icons/ai'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import SlotPicker from '../../components/SlotPicker/SlotPicker.jsx'
import { resolveAssetUrl } from '../../services/api'
import { getAvailableParkingSlots, getParkingDetails } from '../../services/parkingService'
import { getParkingReviews } from '../../services/reviewService'
import { formatCurrency, getApiErrorMessage } from '../../utils/formatters'
import './ParkingDetailsPage.css'

const customerLinks = [
  { to: '/customer/home', label: 'Home' },
  { to: '/customer/bookings', label: 'My Bookings' },
  { to: '/customer/reviews', label: 'Reviews' },
]

const formatLocalDateTimeParam = (date) => {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function ParkingDetailsPage() {
  const { parkingId } = useParams()
  const [details, setDetails] = useState(null)
  const [reviews, setReviews] = useState([])
  const [liveSlots, setLiveSlots] = useState([])
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const [parkingDetails, parkingReviews] = await Promise.all([
          getParkingDetails(parkingId),
          getParkingReviews(parkingId),
        ])
        setDetails(parkingDetails)
        setLiveSlots(parkingDetails.slots)

        // Show all reviews - no filtering by user bookings
        // Reviews are only created by users who have valid bookings (enforced in backend)
        setReviews(parkingReviews)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Could not load parking details.'))
      }
    }

    load()
  }, [parkingId])

  useEffect(() => {
    if (!details?.slots?.length) {
      return undefined
    }

    let ignoreResult = false

    const loadLiveAvailability = async () => {
      const now = new Date()
      const nextMoment = new Date(now.getTime() + 1000)

      try {
        const availableSlots = await getAvailableParkingSlots(parkingId, {
          startDate: formatLocalDateTimeParam(now),
          endDate: formatLocalDateTimeParam(nextMoment),
        })

        if (ignoreResult) {
          return
        }

        const availableIds = new Set(availableSlots.map((slot) => slot.id))
        const updatedSlots = details.slots.map((slot) => ({
          ...slot,
          available: availableIds.has(slot.id),
        }))

        setLiveSlots(updatedSlots)
        setSelectedSlotId((currentSlotId) => {
          if (currentSlotId && updatedSlots.some((slot) => slot.id === currentSlotId && slot.available)) {
            return currentSlotId
          }
          return updatedSlots.find((slot) => slot.available)?.id || null
        })
      } catch (loadError) {
        if (!ignoreResult) {
          setError(getApiErrorMessage(loadError, 'Could not refresh live slot availability.'))
        }
      }
    }

    loadLiveAvailability()
    const intervalId = window.setInterval(loadLiveAvailability, 30000)

    return () => {
      ignoreResult = true
      window.clearInterval(intervalId)
    }
  }, [details, parkingId])

  const parking = details?.parking
  const liveAvailableSlots = liveSlots.filter((slot) => slot.available).length

  return (
    <DashboardLayout
      eyebrow="Customer Dashboard"
      title="Parking Details"
      description="Review slots, amenity charges, and user feedback before booking."
      links={customerLinks}
    >
      {error && <div className="message message-error">{error}</div>}
      {parking && (
        <>
          <PageHero
            eyebrow={parking.location?.city}
            title={parking.title}
            description={parking.description}
          >
            <Link className="btn btn-primary" to={`/customer/book/${parking.id}`}>
              Book this parking
            </Link>
          </PageHero>

          <section className="parking-details__gallery section-card">
            <img src={resolveAssetUrl(parking.images?.[0])} alt={parking.title} />
            <div className="parking-details__facts">
              <div className="parking-details__fact">
                <span className="parking-details__fact-label">Daily rate</span>
                <strong>{formatCurrency(parking.pricePerDay)}</strong>
                <span>Per day</span>
              </div>
              <div className="parking-details__fact">
                <span className="parking-details__fact-label">Hourly rate</span>
                <strong>{formatCurrency(parking.pricePerHour)}</strong>
                <span>Per hour</span>
              </div>
              <div className="parking-details__fact parking-details__fact--success">
                <span className="parking-details__fact-label">Live availability</span>
                <strong>{liveAvailableSlots}</strong>
                <span>of {parking.totalSlots} slots available now</span>
              </div>
            </div>
          </section>

          <section className="parking-details__panel section-card">
            <h2>Slot preview</h2>
            <SlotPicker slots={liveSlots} selectedSlotId={selectedSlotId} onSelect={setSelectedSlotId} />
          </section>

          <section className="parking-details__panel section-card">
            <h2>Amenity charges</h2>
            <div className="grid-cards">
              {details.amenityCharges.map((charge) => (
                <div key={charge.amenity} className="parking-details__charge">
                  <strong>{charge.amenity}</strong>
                  <span>{formatCurrency(charge.chargePerHour)} / hour</span>
                  <span>{formatCurrency(charge.chargePerDay)} / day</span>
                </div>
              ))}
            </div>
          </section>

          <section className="parking-details__panel section-card">
            <h2>Reviews</h2>
            <div className="parking-details__reviews">
              {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
              {reviews.map((review) => (
                <article key={review.id} className="parking-details__review">
                  <div className="parking-details__review-header">
                    <strong>{review.userName}</strong>
                    <div className="parking-details__review-stars">
                      {[...Array(5)].map((_, i) => (
                        <AiFillStar
                          key={i}
                          className={i < review.rating ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                    </div>
                  </div>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  )
}

export default ParkingDetailsPage
