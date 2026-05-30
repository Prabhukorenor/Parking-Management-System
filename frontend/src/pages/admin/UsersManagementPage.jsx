import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import { getUsers, deactivateUser, activateUser } from '../../services/adminService'
import { getApiErrorMessage } from '../../utils/formatters'
import './UsersManagementPage.css'

const adminLinks = [
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/users', label: 'Users Management' },
  { to: '/admin/parking-approval', label: 'Parking Approval' },
  { to: '/admin/reviews', label: 'Reviews Moderation' },
]

function UsersManagementPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [actionUser, setActionUser] = useState(null)
  const [actionType, setActionType] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)

  const loadUsers = async () => {
    try {
      setError('')
      setUsers(await getUsers())
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Could not load users.'))
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const openModal = (user, type) => {
    setActionUser(user)
    setActionType(type)
    setError('')
  }

  const closeModal = () => {
    setActionUser(null)
    setActionType('')
    setError('')
  }

  const handleAction = async () => {
    try {
      setIsActionLoading(true)
      setError('')
      if (actionType === 'deactivate') {
        await deactivateUser(actionUser.id)
      } else {
        await activateUser(actionUser.id)
      }
      await loadUsers()
      closeModal()
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to ${actionType} user.`))
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <DashboardLayout
      eyebrow="Admin Dashboard"
      title="Users Management"
      description="Review accounts across customer, owner, and admin roles."
      links={adminLinks}
    >
      <PageHero
        eyebrow="User registry"
        title="All registered users."
      />

      {error && <div className="message message-error">{error}</div>}

      <section className="section-card users-page">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-pill ${user.active ? 'active' : 'deactivated'}`}>
                      {user.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>
                    {user.active ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => openModal(user, 'deactivate')}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => openModal(user, 'activate')}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {actionUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{actionType === 'deactivate' ? 'Deactivate Account?' : 'Reactivate Account?'}</h3>
            <div className="modal-body">
              {actionType === 'deactivate' ? (
                <>
                  <p>Are you sure you want to deactivate this account?</p>
                  <p>The user will no longer be able to access the SmartPark platform.</p>
                  <p>Existing bookings, reviews, and parking history will remain preserved for system consistency.</p>
                </>
              ) : (
                <p>This user will regain access to the SmartPark platform.</p>
              )}
            </div>
            {error && <div className="message message-error">{error}</div>}
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={isActionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAction}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Processing...' : (actionType === 'deactivate' ? 'Confirm Deactivation' : 'Confirm Activation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default UsersManagementPage
