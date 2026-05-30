import { useEffect, useState } from 'react'
import { AiFillStar } from 'react-icons/ai'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import { deleteReview } from '../../services/adminService'
import { getParkingList } from '../../services/parkingService'
import { getParkingReviews } from '../../services/reviewService'
import { formatDateTime, getApiErrorMessage } from '../../utils/formatters'
import './ReviewsModerationPage.css'

const adminLinks = [
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/users', label: 'Users Management' },
  { to: '/admin/parking-approval', label: 'Parking Approval' },
  { to: '/admin/reviews', label: 'Reviews Moderation' },
]

function ReviewsModerationPage() {
  const [reviewRows, setReviewRows] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setError('')
      const parkings = await getParkingList()
      const reviewGroups = await Promise.all(
        parkings.map(async (parking) => ({
          parkingTitle: parking.title,
          reviews: await getParkingReviews(parking.id),
        })),
      )
      setReviewRows(
        reviewGroups.flatMap((group) =>
          group.reviews.map((review) => ({
            ...review,
            parkingTitle: group.parkingTitle,
          })),
        ),
      )
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Could not load reviews.'))
    }
  }

  useEffect(() => {
    async function initialize() {
      await load()
    }

    initialize()
  }, [])

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId)
      await load()
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Could not delete review.'))
    }
  }

  return (
    <DashboardLayout
      eyebrow="Admin Dashboard"
      title="Reviews Moderation"
      description="Inspect user feedback per parking and remove spam or inappropriatereviews when needed."
      links={adminLinks}
    >
      
      {error && <div className="message message-error">{error}</div>}

      <section className="grid-cards">
        {reviewRows.map((review) => (
          <article key={review.id} className="review-row section-card">
            <div className="review-row__head">
              <div>
                <strong>{review.parkingTitle}</strong>
                <p>
                  {review.userName}
                  <span className="review-row__stars">
                    {[...Array(5)].map((_, i) => (
                      <AiFillStar
                        key={i}
                        className={i < review.rating ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                  </span>
                </p>
              </div>
              <button className="btn btn-danger" type="button" onClick={() => handleDelete(review.id)}>
                Delete review
              </button>
            </div>
            <p className="review-row__comment">{review.comment}</p>
            <small className="muted">{formatDateTime(review.createdAt)}</small>
          </article>
        ))}
      </section>
    </DashboardLayout>
  )
}

export default ReviewsModerationPage
