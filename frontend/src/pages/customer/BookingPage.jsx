import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import BookingForm from '../../components/BookingForm/BookingForm.jsx'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import { getParkingDetails } from '../../services/parkingService'
import { getApiErrorMessage } from '../../utils/formatters'
import './BookingPage.css'

const customerLinks = [
  { to: '/customer/home', label: 'Home' },
  { to: '/customer/bookings', label: 'My Bookings' },
  { to: '/customer/reviews', label: 'Reviews' },
]

function BookingPage() {
  const { parkingId } = useParams()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const data = await getParkingDetails(parkingId)
        setDetails(data)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Could not load booking form.'))
      }
    }

    load()
  }, [parkingId])

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! Booking created.')
    setTimeout(() => navigate('/customer/home'), 800)
  }

  return (
    <DashboardLayout
      eyebrow="Customer Dashboard"
      title="Book Slot"
      description="Pick a specific slot and reserve it for your date range."
      links={customerLinks}
    >
      {details && (
        <>
          <PageHero
            eyebrow="Checkout"
            title={`Booking for ${details.parking.title}`}
            // description="This page posts directly to /api/bookings with parkingId, slotId, startDate, endDate, and paymentStatus."
          />

          {error && <div className="message message-error">{error}</div>}

          <BookingForm
            parking={details.parking}
            amenityCharges={details.amenityCharges}
            slots={details.slots}
            onPaymentSuccess={handlePaymentSuccess}
            isSubmitting={false}
          />
        </>
      )}
    </DashboardLayout>
  )
}

export default BookingPage
