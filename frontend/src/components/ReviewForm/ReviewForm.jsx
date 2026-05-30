import { useState } from 'react'
import './ReviewForm.css'

function ReviewForm({ parkingId, parkingTitle, onSubmit, isSubmitting }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      parkingId,
      rating: Number(rating),
      comment,
    })
    setComment('')
    setRating(5)
  }

  return (
    <form className="review-form section-card" onSubmit={handleSubmit}>
      <div>
        <p className="review-form__eyebrow">Review parking</p>
        <h3>{parkingTitle}</h3>
      </div>

      <div className="field-group">
        <label htmlFor={`rating-${parkingId}`}>Rating</label>
        <select id={`rating-${parkingId}`} value={rating} onChange={(event) => setRating(event.target.value)}>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label htmlFor={`comment-${parkingId}`}>Comment</label>
        <textarea
          id={`comment-${parkingId}`}
          required
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your experience"
        />
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting review...' : 'Add review'}
      </button>
    </form>
  )
}

export default ReviewForm
