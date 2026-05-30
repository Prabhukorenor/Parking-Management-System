import { useEffect, useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'react-toastify'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import { useAuth } from '../../context/useAuth.jsx'
import { getUserBookings } from '../../services/bookingService'
import { createReview, getParkingReviews } from '../../services/reviewService'
import { getApiErrorMessage } from '../../utils/formatters'
import './ReviewsPage.css'

const customerLinks = [
  { to: '/customer/home', label: 'Home' },
  { to: '/customer/bookings', label: 'My Bookings' },
  { to: '/customer/reviews', label: 'Reviews' },
]

const isReviewEligibleBooking = (booking) =>
  booking.status !== 'CANCELLED' && 
  (booking.payment?.status === 'PAID' || booking.payment?.status === 'PARTIAL_REFUND')

function ReviewsPage() {
  const { user } = useAuth()
  const [reviewEligibleBookings, setReviewEligibleBookings] = useState([])
  const [reviewedByParking, setReviewedByParking] = useState({})
  const [error, setError] = useState('')
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const bookings = await getUserBookings()
        const reviewEligible = bookings.filter(isReviewEligibleBooking)
        setReviewEligibleBookings(reviewEligible)

        const reviewGroups = await Promise.all(
          Array.from(new Map(reviewEligible.map((booking) => [booking.parkingId, booking])).values()).map(async (booking) => {
            try {
              const reviews = await getParkingReviews(booking.parkingId)
              const currentUserReview = reviews.find((review) => String(review.userId) === String(user?.id))
              return [booking.parkingId, currentUserReview || null]
            } catch {
              return [booking.parkingId, null]
            }
          }),
        )

        setReviewedByParking(Object.fromEntries(reviewGroups.filter(([, review]) => review)))
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Could not load review targets.'))
      }
    }

    load()
  }, [user?.id])

  const availableBookings = useMemo(
    () => reviewEligibleBookings.filter((booking) => !reviewedByParking[booking.parkingId]),
    [reviewEligibleBookings, reviewedByParking],
  )

  const selectedBooking = useMemo(
    () => availableBookings.find((booking) => String(booking.id) === selectedBookingId),
    [availableBookings, selectedBookingId],
  )

  const getBookingOptionLabel = (booking) => {
    const parkingName = booking.parkingTitle || 'Parking Space'
    const slotName = booking.slotNumber ? `Slot ${booking.slotNumber}` : 'Assigned slot'

    return `${parkingName} - ${slotName}`
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedBooking) {
      setError('Please select a paid parking booking.')
      toast.warning('Please select a paid parking booking.')
      return
    }

    if (!comment.trim()) {
      setError('Please write a review description.')
      toast.warning('Please write a review description.')
      return
    }

    const payload = {
      parkingId: selectedBooking.parkingId,
      rating: Number(rating),
      comment: comment.trim(),
    }

    try {
      setIsSubmitting(true)
      setError('')
      const createdReview = await createReview(payload)
      setReviewedByParking((current) => ({
        ...current,
        [payload.parkingId]: createdReview,
      }))
      toast.success('Review submitted successfully')
      setSelectedBookingId('')
      setComment('')
      setRating(5)
      setHoverRating(0)
    } catch (submitError) {
      const submitMessage = getApiErrorMessage(submitError, 'Could not submit review.')
      setError(submitMessage)
      toast.error(submitMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      eyebrow="Customer Dashboard"
      title="Reviews"
      description="Submit feedback for parking bookings with completed payment."
      links={customerLinks}
    >
      <section className="reviews-page">
        <header className="reviews-hero">
          <p>CUSTOMER REVIEWS</p>
          <h1>Share Your Parking Experience</h1>
          <span>Rate and review parking spaces you have booked with completed payment.</span>
        </header>

        {/* {error && <div className="message message-error">{error}</div>} */}

        <form className="review-form-card" onSubmit={handleSubmit}>
          <div className="review-form-card__field">
            <label htmlFor="review-booking">Select Parking Slot</label>
            <select
              id="review-booking"
              value={selectedBooking ? selectedBookingId : ''}
              onChange={(event) => {
                setSelectedBookingId(event.target.value)
                setError('')
              }}
              disabled={isSubmitting}
              required
            >
              <option value="">Select Parking Slot</option>
              {availableBookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {getBookingOptionLabel(booking)}
                </option>
              ))}
            </select>
            {!availableBookings.length && (
              <p className="review-form-card__hint">No paid parking bookings are available for review right now.</p>
            )}
          </div>

          <div className="review-form-card__field">
            <label>Rating</label>
            <div className="review-form-card__stars" aria-label={`Selected rating ${rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={value <= (hoverRating || rating) ? 'is-active' : ''}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                >
                  <Star size={36} />
                </button>
              ))}
            </div>
          </div>

          <div className="review-form-card__field">
            <label htmlFor="review-comment">Review Description</label>
            <textarea
              id="review-comment"
              required
              value={comment}
              onChange={(event) => {
                setComment(event.target.value)
                setError('')
              }}
              placeholder="Share your experience about this parking space..."
              disabled={isSubmitting}
            />
          </div>

          <div className="review-form-card__actions">
            <button type="submit" disabled={isSubmitting || !availableBookings.length}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </section>
    </DashboardLayout>
  )
}

export default ReviewsPage
