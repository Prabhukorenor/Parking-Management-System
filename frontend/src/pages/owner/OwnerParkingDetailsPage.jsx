import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AiFillStar } from 'react-icons/ai'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx'
import { resolveAssetUrl } from '../../services/api'
import { getParkingDetails, getParkingSlots } from '../../services/parkingService'
import { formatCurrency, getApiErrorMessage } from '../../utils/formatters'
import './OwnerParkingDetailsPage.css'

const ownerLinks = [
  { to: '/owner/add-parking', label: 'Add Parking' },
  { to: '/owner/manage-slots', label: 'Manage Slots' },
  { to: '/owner/manage-parking', label: 'Manage Parking' },
  { to: '/owner/bookings', label: 'View Bookings' },
]

function OwnerParkingDetailsPage() {
  const { parkingId } = useParams()
  const [details, setDetails] = useState(null)
  const [slots, setSlots] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        setLoading(true)
        const [parkingDetails, parkingSlots] = await Promise.all([
          getParkingDetails(parkingId),
          getParkingSlots(parkingId),
        ])
        setDetails(parkingDetails)
        setSlots(parkingSlots)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Could not load parking details.'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [parkingId])

  if (loading) {
    return (
      <DashboardLayout
        eyebrow="Owner Dashboard"
        title="Parking Details"
        description="View detailed information about your parking space."
        links={ownerLinks}
      >
        <div className="loading">Loading parking details...</div>
      </DashboardLayout>
    )
  }

  if (error || !details) {
    return (
      <DashboardLayout
        eyebrow="Owner Dashboard"
        title="Parking Details"
        description="View detailed information about your parking space."
        links={ownerLinks}
      >
        <div className="message message-error">{error || 'Parking details not found.'}</div>
        <Link to="/owner/manage-parking" className="btn btn-secondary">
          Back to Manage Parking
        </Link>
      </DashboardLayout>
    )
  }

  const parking = details?.parking
  const locationLabel = parking?.location ? `${parking.location.area}, ${parking.location.city}` : 'Parking location'
  const totalSlots = slots.length
  const availableSlots = slots.filter((s) => s.available).length
  const occupiedSlots = totalSlots - availableSlots

  return (
    <DashboardLayout
      eyebrow="Owner Dashboard"
      title={parking?.title || 'Parking Details'}
      description={locationLabel}
      links={ownerLinks}
    >
      {error && <div className="message message-error">{error}</div>}

      <div className="parking-details-container">
        <div className="parking-details-header">
          <div className="parking-image-wrapper">
            <img
              src={resolveAssetUrl(parking?.images?.[0])}
              alt={parking?.title}
              className="parking-image"
            />
            <StatusBadge value={parking?.approved ? 'APPROVED' : 'PENDING'} />
          </div>

          <div className="parking-info">
            <h1>{parking?.title}</h1>
            <p className="parking-location">{locationLabel}</p>
            <p className="parking-description">{parking?.description}</p>

            <div className="parking-stats">
              <div className="stat">
                <span className="stat-label">Total Slots</span>
                <span className="stat-value">{totalSlots}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Available</span>
                <span className="stat-value">{availableSlots}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Occupied</span>
                <span className="stat-value">{occupiedSlots}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Rating</span>
                <span className="stat-value">
                  <AiFillStar className="star-icon" />
                  {parking?.averageRating || 0} / 5
                </span>
              </div>
            </div>

            <div className="parking-pricing">
              <div className="price-item">
                <span>Hourly Rate</span>
                <span className="price">{formatCurrency(parking?.pricePerHour)}</span>
              </div>
              <div className="price-item">
                <span>Daily Rate</span>
                <span className="price">{formatCurrency(parking?.pricePerDay)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="parking-amenities">
          <h2>Amenities</h2>
          <div className="amenities-list">
            {parking?.amenities && parking.amenities.length > 0 ? (
              parking.amenities.map((amenity) => (
                <span key={amenity} className="amenity-tag">
                  {amenity}
                </span>
              ))
            ) : (
              <p>No amenities listed.</p>
            )}
          </div>
        </div>

        <div className="parking-vehicles">
          <h2>Supported Vehicle Types</h2>
          <div className="vehicles-list">
            {parking?.vehicleTypes && parking.vehicleTypes.length > 0 ? (
              parking.vehicleTypes.map((vehicle) => (
                <span key={vehicle} className="vehicle-tag">
                  {vehicle}
                </span>
              ))
            ) : (
              <p>No specific vehicle types listed.</p>
            )}
          </div>
        </div>

        <div className="parking-slots">
          <h2>Slots Overview</h2>
          <div className="slots-table">
            <table>
              <thead>
                <tr>
                  <th>Slot Number</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td>{slot.slotNumber}</td>
                    <td>{slot.slotType}</td>
                    <td>
                      <span className={`status-badge ${slot.available ? 'available' : 'occupied'}`}>
                        {slot.available ? 'Available' : 'Occupied'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/owner/manage-parking" className="btn btn-secondary">
            Back to Manage Parking
          </Link>
          <Link to="/owner/manage-slots" className="btn btn-primary">
            Manage Slots
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default OwnerParkingDetailsPage
