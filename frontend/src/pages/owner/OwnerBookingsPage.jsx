import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx'
import { getOwnerBookings } from '../../services/bookingService'
import { formatCurrency, formatDateTime, getApiErrorMessage } from '../../utils/formatters'
import './OwnerBookingsPage.css'

const ownerLinks = [
  { to: '/owner/add-parking', label: 'Add Parking' },
  { to: '/owner/manage-slots', label: 'Manage Slots' },
  { to: '/owner/manage-parking', label: 'Manage Parking' },
  { to: '/owner/bookings', label: 'View Bookings' },
]

function renderRefund(booking) {
  const paymentStatus = booking.payment?.status || 'PENDING'
  const refundAmount = Number(booking.refundAmount || 0)

  if (paymentStatus === 'REFUNDED') {
    return <span className="refund-status refund-status--full">Full Refund</span>
  }

  if (paymentStatus === 'PARTIAL_REFUND') {
    return <span className="refund-status refund-status--partial">{formatCurrency(refundAmount)} Refunded</span>
  }

  return <span className="muted">-</span>
}

function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        setLoading(true)
        const data = await getOwnerBookings()
        console.log('Fetched owner bookings:', data)
        setBookings(data || [])
      } catch (loadError) {
        console.error('Error loading owner bookings:', loadError)
        setError(getApiErrorMessage(loadError, 'Could not load owner bookings.'))
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <DashboardLayout
      eyebrow="Owner Dashboard"
      title="View Bookings"
      description="Access real-time booking activity, review customer reservations, 
            and keep your parking operations organized and efficient."
      links={ownerLinks}
    >
    
      {error && <div className="message message-error">{error}</div>}

      {loading && <div className="message message-info">Loading bookings...</div>}

      <section className="section-card owner-bookings">
        <div className="table-wrap">
          {bookings.length === 0 && !loading && (
            <div className="empty-state">
              <p>No bookings found for your parking spaces.</p>
            </div>
          )}
          {bookings.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Parking</th>
                  <th>Slot</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Refund</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.user?.name || '-'}</td>
                    <td>{booking.user?.email || '-'}</td>
                    <td>{booking.parkingTitle || '-'}</td>
                    <td>{booking.slotNumber || '-'}</td>
                    <td>{formatDateTime(booking.startDate)}</td>
                    <td>{formatDateTime(booking.endDate)}</td>
                    <td>{formatCurrency(booking.totalPrice)}</td>
                    <td>
                      <StatusBadge value={booking.status} />
                    </td>
                    <td>
                      <StatusBadge value={booking.payment?.status || 'PENDING'} />
                    </td>
                    <td>{renderRefund(booking)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </DashboardLayout>
  )
}

export default OwnerBookingsPage
