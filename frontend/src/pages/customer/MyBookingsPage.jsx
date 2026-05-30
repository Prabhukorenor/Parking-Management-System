import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx'
import {
  cancelBooking,
  exitParking,
  getExitRefundPreview,
  getUserBookings,
  startParking,
} from '../../services/bookingService'
import { formatCurrency, formatDateTime, getApiErrorMessage } from '../../utils/formatters'
import './MyBookingsPage.css'

const customerLinks = [
  { to: '/customer/home', label: 'Home' },
  { to: '/customer/bookings', label: 'My Bookings' },
  { to: '/customer/reviews', label: 'Reviews' },
]

function getVehicleEntered(booking) {
  return Boolean(booking.isVehicleEntered ?? booking.vehicleEntered)
}

function formatDuration(value, unit) {
  return `${value} ${unit}${value === 1 ? '' : 's'}`
}

function getExitPreview(booking) {
  const bookedAmount = Number(booking.totalPrice || 0)
  const entryTime = new Date(booking.entryTime || booking.startDate).getTime()
  const startTime = new Date(booking.startDate).getTime()
  const endTime = new Date(booking.endDate).getTime()
  const now = Date.now()
  const hourMs = 60 * 60 * 1000
  const dayMs = 24 * hourMs
  const availableUsageMs = Math.max(endTime - entryTime, 1)
  const usedMs = Math.min(Math.max(now - entryTime, 0), availableUsageMs)
  
  // FIXED: Determine if daily pricing based on ACTUAL used duration, not booked duration
  const isDaily = usedMs >= dayMs
  const usedUnits = Math.max(1, Math.ceil(usedMs / (isDaily ? dayMs : hourMs)))
  const rate = Number(isDaily ? booking.pricePerDay : booking.pricePerHour) || 0
  const usedCharges = Math.min(bookedAmount, usedUnits * rate)
  const refundAmount = Math.max(bookedAmount - usedCharges, 0)
  const unit = isDaily ? 'day' : 'hour'

  return {
    bookedAmount,
    usedDuration: formatDuration(usedUnits, unit),
    rateApplied: `${formatCurrency(rate)}/${unit}`,
    usedCharges,
    refundAmount,
  }
}

function RefundConfirmationModal({ booking, mode, onClose, onConfirm, isSubmitting }) {
  const [exitPreview, setExitPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const isCancel = mode === 'cancel'

  useEffect(() => {
    if (!isCancel && booking && mode === 'exit') {
      const fetchPreview = async () => {
        try {
          setPreviewLoading(true)
          setPreviewError('')
          const preview = await getExitRefundPreview(booking.id)
          setExitPreview(preview)
        } catch (error) {
          setPreviewError(getApiErrorMessage(error, 'Failed to load refund preview.'))
        } finally {
          setPreviewLoading(false)
        }
      }
      fetchPreview()
    }
  }, [booking, mode, isCancel])

  return (
    <div className="refund-modal" role="presentation">
      <div className="refund-dialog" role="dialog" aria-modal="true" aria-labelledby="refund-title">
        <div className={`refund-dialog__marker ${isCancel ? 'is-full' : 'is-partial'}`} />
        <h2 id="refund-title">{isCancel ? 'Cancel Booking?' : 'Exit Parking Early?'}</h2>

        {isCancel ? (
          <div className="refund-dialog__content">
            <p>You have not entered the parking facility yet.</p>
            <p>
              You are eligible for a <strong>FULL REFUND</strong> of{' '}
              <strong>{formatCurrency(booking.totalPrice)}</strong>.
            </p>
            <p>The refunded amount will be credited back to your account.</p>
          </div>
        ) : (
          <div className="refund-dialog__content">
            {previewLoading ? (
              <p>Loading refund details...</p>
            ) : previewError ? (
              <p className="error-text">{previewError}</p>
            ) : exitPreview ? (
              <>
                <p>Parking usage charges are calculated based on actual parking duration.</p>
                <div className="refund-breakdown">
                  <span>Booked Amount</span>
                  <strong>{formatCurrency(exitPreview.bookedAmount)}</strong>
                  <span>Used Duration</span>
                  <strong>{exitPreview.usedDuration}</strong>
                  <span>Rate Applied</span>
                  <strong>{exitPreview.rateApplied}</strong>
                  <span>Used Charges</span>
                  <strong>{formatCurrency(exitPreview.usedCharges)}</strong>
                  <span>Refund Amount</span>
                  <strong>{formatCurrency(exitPreview.refundAmount)}</strong>
                </div>
                <p>Do you want to continue?</p>
              </>
            ) : null}
          </div>
        )}

        <div className="refund-dialog__actions">
          <button className="btn btn-secondary" type="button" onClick={onClose} disabled={isSubmitting || previewLoading}>
            {isCancel ? 'Keep Booking' : 'Stay Parked'}
          </button>
          <button
            className={`btn ${isCancel ? 'btn-primary' : 'btn-warning'}`}
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || previewLoading || ((!isCancel && !exitPreview))}
          >
            {isSubmitting ? 'Processing...' : isCancel ? 'Confirm Cancellation' : 'Confirm Exit'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [modalMode, setModalMode] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadBookings = async () => {
    try {
      setError('')
      setBookings(await getUserBookings())
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load bookings.'))
    }
  }

  useEffect(() => {
    async function initialize() {
      await loadBookings()
    }

    initialize()
  }, [])

  const openRefundModal = (booking, mode) => {
    setSelectedBooking(booking)
    setModalMode(mode)
  }

  const closeRefundModal = () => {
    setSelectedBooking(null)
    setModalMode(null)
  }

  const handleStartParking = async (bookingId) => {
    try {
      setIsSubmitting(true)
      setError('')
      await startParking(bookingId)
      await loadBookings()
    } catch (startError) {
      setError(getApiErrorMessage(startError, 'Could not start parking.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmRefundAction = async () => {
    if (!selectedBooking || !modalMode) {
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      if (modalMode === 'exit') {
        await exitParking(selectedBooking.id)
      } else {
        await cancelBooking(selectedBooking.id)
      }
      closeRefundModal()
      await loadBookings()
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'Could not process booking action.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderRefund = (booking) => {
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

  const renderAction = (booking) => {
    const paymentStatus = booking.payment?.status || 'PENDING'
    const vehicleEntered = getVehicleEntered(booking)
    const refundAmount = Number(booking.refundAmount || 0)

    if (booking.status === 'BOOKED' && !vehicleEntered && paymentStatus === 'PAID') {
      return (
        <div className="booking-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => handleStartParking(booking.id)}
            disabled={isSubmitting}
          >
            Start Parking
          </button>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => openRefundModal(booking, 'cancel')}
            disabled={isSubmitting}
          >
            Cancel Booking
          </button>
        </div>
      )
    }

    if (booking.status === 'ACTIVE' && vehicleEntered && paymentStatus === 'PAID') {
      return (
        <button
          className="btn btn-warning"
          type="button"
          onClick={() => openRefundModal(booking, 'exit')}
          disabled={isSubmitting}
        >
          Exit Parking
        </button>
      )
    }

    if (booking.status === 'COMPLETED') {
      return <span className="booking-action-label booking-action-label--complete">Completed</span>
    }

    if (booking.status === 'CANCELLED') {
      return <span className="refund-chip">Refunded {formatCurrency(refundAmount)}</span>
    }

    return <span className="muted">No action</span>
  }

  return (
    <DashboardLayout
      eyebrow="Customer Dashboard"
      title="My Bookings"
      description="Track future, active, completed, cancelled, and refunded reservations."
      links={customerLinks}
    >
      <PageHero
        // eyebrow="Reservations"
        title="Every booking in one place."
        description="Start your parking session, cancel before entry for a full refund, or exit early with a calculated partial refund."
      />

      {error && <div className="message message-error">{error}</div>}

      <section className="section-card bookings-table">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parking</th>
                <th>Slot</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Refund</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.parkingTitle}</td>
                  <td>{booking.slotNumber}</td>
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
                  <td>{renderAction(booking)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedBooking && modalMode && (
        <RefundConfirmationModal
          booking={selectedBooking}
          mode={modalMode}
          onClose={closeRefundModal}
          onConfirm={handleConfirmRefundAction}
          isSubmitting={isSubmitting}
        />
      )}
    </DashboardLayout>
  )
}

export default MyBookingsPage
