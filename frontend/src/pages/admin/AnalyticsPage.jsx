import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import AnalyticsDrawer from '../../components/AnalyticsDrawer/AnalyticsDrawer.jsx'
import { getAnalytics, getUsers, getAllBookings, getAllReviews } from '../../services/adminService'
import { getParkingList } from '../../services/parkingService'
import { getApiErrorMessage, formatCurrency } from '../../utils/formatters'
import './AnalyticsPage.css'

const adminLinks = [
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/users', label: 'Users Management' },
  { to: '/admin/parking-approval', label: 'Parking Approval' },
  { to: '/admin/reviews', label: 'Reviews Moderation' },
]

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')
  
  // Drawer state
  const [drawerConfig, setDrawerConfig] = useState({
    isOpen: false,
    title: '',
    data: [],
    type: '' // 'users', 'parkings', 'bookings', 'reviews'
  })

  // Full datasets
  const [allUsers, setAllUsers] = useState([])
  const [allParkings, setAllParkings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [allReviews, setAllReviews] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const [stats, users, parkings, bookings, reviews] = await Promise.all([
          getAnalytics(),
          getUsers(),
          getParkingList(),
          getAllBookings(),
          getAllReviews()
        ])
        
        const revenue = bookings
          .filter(b => b.status !== 'CANCELLED')
          .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)

        const enhancedStats = {
          ...stats,
          totalRevenue: formatCurrency(revenue)
        }
        
        setAnalytics(enhancedStats)
        setAllUsers(users)
        setAllParkings(parkings)
        setAllBookings(bookings)
        setAllReviews(reviews)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Could not load analytics data.'))
      }
    }

    load()
  }, [])

  const handleCardClick = (key) => {
    if (!analytics) return

    let config = { isOpen: true, title: key, data: [], type: '' }

    switch (key) {
      case 'totalUsers':
        config.data = allUsers
        config.type = 'users'
        break
      case 'totalOwners':
        config.data = allUsers.filter(u => u.role === 'OWNER')
        config.type = 'users'
        break
      case 'totalCustomers':
        config.data = allUsers.filter(u => u.role === 'CUSTOMER')
        config.type = 'users'
        break
      case 'totalParkingSpaces':
        config.data = allParkings
        config.type = 'parkings'
        break
      case 'approvedParkingSpaces':
        config.data = allParkings.filter(p => p.approved)
        config.type = 'parkings'
        break
      case 'pendingParkingSpaces':
        config.data = allParkings.filter(p => !p.approved)
        config.type = 'parkings'
        break
      case 'activeBookings':
        const now = new Date()
        config.data = allBookings.filter(b => {
           if (b.status === 'ACTIVE') return true
           if (b.status === 'BOOKED') {
             const start = new Date(b.startDate)
             const end = new Date(b.endDate)
             return now >= start && now <= end
           }
           return false
        })
        config.type = 'bookings'
        break
      case 'cancelledBookings':
        config.data = allBookings.filter(b => b.status === 'CANCELLED')
        config.type = 'bookings'
        break
      case 'totalReviews':
        config.data = allReviews
        config.type = 'reviews'
        break
      case 'totalRevenue':
        config.data = allBookings.filter(b => b.status !== 'CANCELLED')
        config.type = 'bookings'
        break
      default:
        return // Unhandled card
    }

    setDrawerConfig(config)
  }

  const closeDrawer = () => {
    setDrawerConfig({ ...drawerConfig, isOpen: false })
  }

  return (
    <DashboardLayout
      eyebrow="Admin Dashboard"
      title="Analytics"
      description="Monitor platform activity, manage approvals, track bookings, and oversee overall parking system performance."
      links={adminLinks}
    >

      {error && <div className="message message-error">{error}</div>}

      {analytics && (
        <section className="grid-cards">
          {Object.entries(analytics).map(([key, value]) => (
            <article 
              key={key} 
              className={`analytics-card section-card clickable-card analytics-card--${key}`}
              onClick={() => handleCardClick(key)}
            >
              <p>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
              <strong>{value}</strong>
            </article>
          ))}
        </section>
      )}

      {drawerConfig.isOpen && (
        <AnalyticsDrawer 
          title={drawerConfig.title}
          data={drawerConfig.data}
          type={drawerConfig.type}
          onClose={closeDrawer}
        />
      )}
    </DashboardLayout>
  )
}

export default AnalyticsPage
