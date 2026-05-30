import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import { useAuth } from '../../context/useAuth.jsx'
import { resolveAssetUrl } from '../../services/api'
import { getUserProfile, updateUserProfile } from '../../services/userService'
import { uploadParkingImages } from '../../services/parkingService'
import { getApiErrorMessage } from '../../utils/formatters'
import { toast } from 'react-toastify'
import './OwnerProfilePage.css'

const ownerLinks = [
  { to: '/owner/add-parking', label: 'Add Parking' },
  { to: '/owner/manage-slots', label: 'Manage Slots' },
  { to: '/owner/manage-parking', label: 'Manage Parking' },
  { to: '/owner/bookings', label: 'View Bookings' },
]

const getProfileImagePreview = (profileImage) =>
  profileImage ? resolveAssetUrl(profileImage) : null

function OwnerProfilePage() {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    phoneNumber: '',
    address: '',
    profileImage: '',
  })

  const [imagePreview, setImagePreview] = useState(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getUserProfile()
      setProfile(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        gender: data.gender || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        profileImage: data.profileImage || '',
      })
      setImagePreview(getProfileImagePreview(data.profileImage))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load profile.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile()
  }, [loadProfile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageSelect = async (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Upload image
      try {
        const uploadResponse = await uploadParkingImages([file])
        const uploadedUrl = uploadResponse?.imageUrls?.[0]
        if (uploadedUrl) {
          setFormData((prev) => ({
            ...prev,
            profileImage: uploadedUrl,
          }))
          toast.success('Image uploaded successfully!')
        }
      } catch {
        toast.error('Failed to upload image')
      }
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setFormData((prev) => ({
      ...prev,
      profileImage: '',
    }))
    toast.info('Image removed')
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')

      const updatedProfile = await updateUserProfile(formData)
      setProfile(updatedProfile)
      setFormData({
        name: updatedProfile.name || '',
        email: updatedProfile.email || '',
        gender: updatedProfile.gender || '',
        phoneNumber: updatedProfile.phoneNumber || '',
        address: updatedProfile.address || '',
        profileImage: updatedProfile.profileImage || '',
      })
      setImagePreview(getProfileImagePreview(updatedProfile.profileImage))
      setIsEditing(false)
      
      // Update user in auth context so navbar reflects changes
      updateUser(updatedProfile)
      
      toast.success('Profile updated successfully!')
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, 'Failed to update profile.')
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      gender: profile.gender || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || '',
      profileImage: profile.profileImage || '',
    })
    setImagePreview(getProfileImagePreview(profile.profileImage))
  }

  if (loading) {
    return (
      <DashboardLayout
        eyebrow="Parking Owner Dashboard"
        title="My Profile"
        description="View and manage your profile information."
        links={ownerLinks}
      >
        <div className="profile-loading">Loading profile...</div>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout
        eyebrow="Parking Owner Dashboard"
        title="My Profile"
        description="View and manage your profile information."
        links={ownerLinks}
      >
        <div className="profile-error">Failed to load profile</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      eyebrow="Parking Owner Dashboard"
      title="My Profile"
      description="View and manage your profile information."
      links={ownerLinks}
    >
      {error && <div className="message message-error">{error}</div>}

      <div className="profile-card section-card">
        <div className="profile-header">
          <h2>Profile Information</h2>
          {!isEditing && (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-content">
          {/* Profile Image Section */}
          <div className="profile-image-section">
            <div className="profile-image-container">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  <div className="placeholder-initial">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <span className="placeholder-text">No Image</span>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="profile-image-actions">
                <label htmlFor="image-input" className="upload-button">
                  📤 Upload Photo
                </label>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden-input"
                />
                {imagePreview && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={handleRemoveImage}
                  >
                    🗑️ Remove Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Details Section */}
          <div className="profile-details">
            {/* Name Field */}
            <div className="profile-field">
              <label>Full Name *</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="field-input"
                  required
                />
              ) : (
                <p className="field-value">{profile.name || 'Not specified'}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="profile-field">
              <label>Email *</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="field-input"
                  required
                />
              ) : (
                <p className="field-value">{profile.email || 'Not specified'}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="profile-field">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="field-input"
                />
              ) : (
                <p className="field-value">{profile.phoneNumber || 'Not provided'}</p>
              )}
            </div>

            {/* Address Field */}
            <div className="profile-field">
              <label>Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className="field-input field-textarea"
                  rows="3"
                />
              ) : (
                <p className="field-value">{profile.address || 'Not provided'}</p>
              )}
            </div>

            {/* Gender Field */}
            <div className="profile-field">
              <label>Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="field-input"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="field-value">{profile.gender || 'Not specified'}</p>
              )}
            </div>

            {/* Role Field (Read-only) */}
            <div className="profile-field">
              <label>Account Type</label>
              <p className="field-value">
                <span className="role-badge">{profile.role}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="profile-actions">
            <button
              className="btn btn-success"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default OwnerProfilePage
