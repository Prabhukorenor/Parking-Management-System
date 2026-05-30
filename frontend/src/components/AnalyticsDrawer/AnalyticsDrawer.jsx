import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { formatDateTime, formatCurrency } from '../../utils/formatters'
import './AnalyticsDrawer.css'

function AnalyticsDrawer({ title, data, type, onClose }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState(data)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data)
      return
    }

    const lowerSearch = searchTerm.toLowerCase()
    const filtered = data.filter((item) => {
      // Basic search across all string/number values in the object
      return Object.values(item).some((val) => 
        val && String(val).toLowerCase().includes(lowerSearch)
      )
    })
    setFilteredData(filtered)
  }, [searchTerm, data])

  // Prevent scrolling on the body when drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const renderContent = () => {
    if (!filteredData || filteredData.length === 0) {
      return <div className="analytics-drawer__empty">No data found matching your search.</div>
    }

    switch (type) {
      case 'users':
        return (
          <table className="analytics-drawer__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`drawer-badge role-${user.role?.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )

      case 'parkings':
        return (
          <table className="analytics-drawer__table">
            <thead>
              <tr>
                <th>Title</th>
                <th>City</th>
                <th>Status</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((parking) => (
                <tr key={parking.id}>
                  <td>{parking.title}</td>
                  <td>{parking.location?.city || 'N/A'}</td>
                  <td>
                    <span className={`drawer-badge ${parking.approved ? 'parking-approved' : 'parking-pending'}`}>
                      {parking.approved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </td>
                  <td>{parking.averageRating ? `${parking.averageRating}/5` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )

      case 'bookings':
        return (
          <table className="analytics-drawer__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Parking</th>
                <th>Status</th>
                <th>Book Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.user?.name || booking.userName || '-'}</td>
                  <td>{booking.parkingTitle}</td>
                  <td>
                    <span className={`drawer-badge status-${booking.status?.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>{formatDateTime(booking.startDate)}</td>
                  <td>{formatCurrency(booking.totalPrice || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )

      case 'reviews':
        return (
          <table className="analytics-drawer__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Parking ID</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((review) => (
                <tr key={review.id}>
                  <td>{review.userName}</td>
                  <td>#{review.parkingId}</td>
                  <td>{review.rating}/5</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {review.comment}
                  </td>
                  <td>{formatDateTime(review.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )

      default:
        return <div className="analytics-drawer__empty">Unsupported data type.</div>
    }
  }

  return (
    <div className="analytics-drawer-overlay" onClick={onClose}>
      <div className="analytics-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-drawer__header">
          <h2>{title}</h2>
          <button className="analytics-drawer__close" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>
        
        <div className="analytics-drawer__filters">
          <input
            type="text"
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="analytics-drawer__search"
          />
        </div>

        <div className="analytics-drawer__content">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDrawer
