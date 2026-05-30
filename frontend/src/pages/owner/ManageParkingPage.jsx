import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import ParkingCard from '../../components/ParkingCard/ParkingCard.jsx'
import { getOwnerParkingList } from '../../services/parkingService'
import { getApiErrorMessage } from '../../utils/formatters'
import './ManageParkingPage.css'

const ownerLinks = [
  { to: '/owner/add-parking', label: 'Add Parking' },
  { to: '/owner/manage-slots', label: 'Manage Slots' },
  { to: '/owner/manage-parking', label: 'Manage Parking' },
  { to: '/owner/bookings', label: 'View Bookings' },
]

function ManageParkingPage() {
  const [parkings, setParkings] = useState([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        setParkings(await getOwnerParkingList())
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Could not load owner parking list.'))
      }
    }

    load()
  }, [])

  return (
    <DashboardLayout
      eyebrow="Owner Dashboard"
      title="Manage Parking"
      description="Inspect approved and pending parking spaces created by this owner account."
      links={ownerLinks}
    >
      {error && <div className="message message-error">{error}</div>}
      {successMessage && <div className="message message-success">{successMessage}</div>}
      <section className="grid-cards">
        {parkings.map((parking) => (
          <ParkingCard key={parking.id} parking={parking} mode="owner" />
        ))}
      </section>
    </DashboardLayout>
  )
}

export default ManageParkingPage
