import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import ParkingCard from '../../components/ParkingCard/ParkingCard.jsx'
import { approveParking } from '../../services/adminService'
import { getParkingList } from '../../services/parkingService'
import { getApiErrorMessage } from '../../utils/formatters'
import './ParkingApprovalPage.css'

const adminLinks = [
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/users', label: 'Users Management' },
  { to: '/admin/parking-approval', label: 'Parking Approval' },
  { to: '/admin/reviews', label: 'Reviews Moderation' },
]

function ParkingApprovalPage() {
  const [parkings, setParkings] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setError('')
      setParkings(await getParkingList())
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Could not load parking approvals.'))
    }
  }

  useEffect(() => {
    async function initialize() {
      await load()
    }

    initialize()
  }, [])

  const handleApprove = async (parkingId) => {
    try {
      await approveParking(parkingId)
      await load()
    } catch (approveError) {
      setError(getApiErrorMessage(approveError, 'Could not approve parking.'))
    }
  }

  return (
    <DashboardLayout
      eyebrow="Admin Dashboard"
      title="Parking Approval"
      description="Approve parking spaces before they become visible to customers."
      links={adminLinks}
    >

      {error && <div className="message message-error">{error}</div>}

      <section className="grid-cards">
        {parkings.map((parking) => (
          <ParkingCard key={parking.id} parking={parking} mode="admin" onApprove={handleApprove} />
        ))}
      </section>
    </DashboardLayout>
  )
}

export default ParkingApprovalPage
