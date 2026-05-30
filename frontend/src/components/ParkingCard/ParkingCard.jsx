import { Link } from 'react-router-dom'
import { MapPin, Star, Edit2 } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import StatusBadge from '../StatusBadge/StatusBadge.jsx'
import './ParkingCard.css'

function ParkingCard({ parking, mode = 'customer', onApprove }) {
  const primaryImage = resolveAssetUrl(parking.images?.[0])
  const visibleAmenities = parking.amenities?.slice(0, 4) || []
  const extraAmenityCount = Math.max((parking.amenities?.length || 0) - visibleAmenities.length, 0)
  const locationParts = [parking.location?.area, parking.location?.city].filter(Boolean)
  const locationLabel = locationParts.length ? locationParts.join(', ') : 'Verified parking location'
  const vehicleTypes = parking.vehicleTypes?.length ? parking.vehicleTypes : ['N/A']
  const averageRating = Number(parking.averageRating || 0).toFixed(1)

  return (
    <>
      <article className="parking-card section-card">
        <div className="parking-card__imagewrap">
          <img className="parking-card__image" src={primaryImage} alt={parking.title} />
          <p className="parking-card__location">
            <MapPin size={15} />
            <span>{locationLabel}</span>
          </p>
        </div>

        <div className="parking-card__body">
          <div className="parking-card__header">
            <h3>{parking.title}</h3>
            {mode !== 'customer' && <StatusBadge value={parking.approved ? 'APPROVED' : 'PENDING'} />}
          </div>

          <p className="parking-card__description">{parking.description}</p>

          <div className="pill-list">
            {visibleAmenities.map((amenity) => (
              <span key={amenity} className="pill">
                {amenity}
              </span>
            ))}
            {extraAmenityCount > 0 && <span className="pill pill--more">+{extraAmenityCount} more</span>}
          </div>

          <div className="parking-card__meta">
            <div className="parking-card__vehicles" aria-label="Supported vehicle types">
              {vehicleTypes.map((vehicleType) => (
                <span key={vehicleType}>{vehicleType}</span>
              ))}
            </div>
            <div className="parking-card__rating" aria-label={`Rating ${averageRating} out of 5`}>
              <Star size={16} />
              <span>{averageRating} / 5</span>
            </div>
          </div>

          <div className="parking-card__actions">
            {mode === 'owner' ? (
              <>
                <Link className="btn btn-secondary" to={`/owner/parking-details/${parking.id}`}>
                  View Parking
                </Link>
                <Link
                  className="btn btn-primary"
                  to={`/owner/edit-parking/${parking.id}`}
                  title="Edit parking space"
                >
                  <Edit2 size={16} style={{ marginRight: '6px' }} />
                  Update
                </Link>
              </>
            ) : mode === 'admin' ? (
              <>
                <Link className="btn btn-secondary" to={`/admin/parking-details/${parking.id}`}>
                  View Parking
                </Link>
                {!parking.approved && (
                  <button className="btn btn-primary" type="button" onClick={() => onApprove?.(parking.id)}>
                    Approve parking
                  </button>
                )}
              </>
            ) : (
              <>
                <Link className="btn btn-secondary" to={`/customer/parking/${parking.id}`}>
                  View Parking
                </Link>
                <Link className="btn btn-primary" to={`/customer/book/${parking.id}`}>
                  Book Parking
                </Link>
              </>
            )}
          </div>
        </div>
      </article>
    </>
  )
}

export default ParkingCard
