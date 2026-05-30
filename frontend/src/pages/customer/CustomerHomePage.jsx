import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar.jsx'
import ParkingCard from '../../components/ParkingCard/ParkingCard.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import { getParkingList } from '../../services/parkingService'
import { getApiErrorMessage } from '../../utils/formatters'
import './CustomerHomePage.css'

const customerLinks = [
  { to: '/customer/home', label: 'Home' },
  { to: '/customer/bookings', label: 'My Bookings' },
  { to: '/customer/reviews', label: 'Reviews' },
]

const defaultFilters = {
  city: '',
  vehicleType: '',
  amenities: [],
}

function CustomerHomePage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [parkings, setParkings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const data = await getParkingList({
          city: filters.city || undefined,
          vehicleType: filters.vehicleType || undefined,
          amenities: filters.amenities.length ? filters.amenities : undefined,
        })
        setParkings(data)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Could not load customer parking feed.'))
      }
    }

    load()
  }, [filters])

  return (
    <DashboardLayout
      eyebrow="Customer Dashboard"
      title="Explore Parking"
      description="Browse secure and verified parking locations designed to provide safe, reliable, and convenient parking for every journey.."
      links={customerLinks}
    >
     
      <section className="customer-home__marketplace">
        <FilterSidebar
          filters={filters}
          onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
          onReset={() => setFilters(defaultFilters)}
        />

        <div className="customer-home__list">
          {error && <div className="message message-error">{error}</div>}
          <div className="grid-cards">
            {parkings.map((parking) => (
              <ParkingCard key={parking.id} parking={parking} />
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default CustomerHomePage

