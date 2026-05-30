import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import { amenityOptions, vehicleTypeOptions } from '../../constants/options'
import { getLocations } from '../../services/locationService'
import { getParkingDetails, updateParking, uploadParkingImages } from '../../services/parkingService'
import { resolveAssetUrl } from '../../services/api'
import { getApiErrorMessage } from '../../utils/formatters'
import './EditParkingPage.css'

const ownerLinks = [
  { to: '/owner/add-parking', label: 'Add Parking' },
  { to: '/owner/manage-slots', label: 'Manage Slots' },
  { to: '/owner/manage-parking', label: 'Manage Parking' },
  { to: '/owner/bookings', label: 'View Bookings' },
]

const emptyParking = {
  locationId: '',
  title: '',
  description: '',
  pricePerDay: '',
  pricePerHour: '',
  availableFrom: '06:00',
  availableTo: '23:00',
  amenities: [],
  vehicleTypes: [],
}

function EditParkingPage() {
  const { parkingId } = useParams()
  const navigate = useNavigate()
  
  const [locations, setLocations] = useState([])
  const [parkingForm, setParkingForm] = useState(emptyParking)
  const [existingImages, setExistingImages] = useState([])
  const [imagesToRemove, setImagesToRemove] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initialize() {
      try {
        setError('')
        const [parkingDetails, locationsData] = await Promise.all([
          getParkingDetails(parkingId),
          getLocations(),
        ])
        setLocations(locationsData)
        
        const parking = parkingDetails.parking
        setParkingForm({
          locationId: parking.location?.id || '',
          title: parking.title || '',
          description: parking.description || '',
          pricePerDay: parking.pricePerDay || '',
          pricePerHour: parking.pricePerHour || '',
          availableFrom: parking.availableFrom || '06:00',
          availableTo: parking.availableTo || '23:00',
          amenities: parking.amenities || [],
          vehicleTypes: parking.vehicleTypes || [],
        })
        
        setExistingImages(parking.images || [])
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Could not load parking details.'))
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [parkingId])

  const toggleArrayValue = (name, value) => {
    setParkingForm((current) => {
      const currentValues = current[name]
      return {
        ...current,
        [name]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      }
    })
  }

  const handleRemoveExistingImage = (imageUrl) => {
    setExistingImages((current) => current.filter((img) => img !== imageUrl))
    setImagesToRemove((current) => [...current, imageUrl])
  }

  const handleRemoveNewFile = (index) => {
    setNewFiles((current) => current.filter((_, i) => i !== index))
  }

  const handleUpdateParking = async (event) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')
      
      let newImages = []
      if (newFiles.length) {
        const uploadResponse = await uploadParkingImages(newFiles)
        newImages = uploadResponse.imageUrls
      }

      const allImages = [...existingImages, ...newImages]
      
      await updateParking(parkingId, {
        ...parkingForm,
        locationId: Number(parkingForm.locationId),
        pricePerDay: Number(parkingForm.pricePerDay),
        pricePerHour: Number(parkingForm.pricePerHour),
        images: allImages,
        removedImages: imagesToRemove,
      })
      
      setMessage('Parking updated successfully!')
      setNewFiles([])
      setImagesToRemove([])
      
      setTimeout(() => {
        navigate('/owner/manage-parking')
      }, 2000)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Could not update parking.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout
        eyebrow="Owner Dashboard"
        title="Edit Parking"
        description="Update your parking space details."
        links={ownerLinks}
      >
        <div className="loading">Loading parking details...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      eyebrow="Owner Dashboard"
      title="Edit Parking"
      description="Update your parking space details and images."
      links={ownerLinks}
    >
      {error && <div className="message message-error">{error}</div>}
      {message && <div className="message message-success">{message}</div>}

      <section className="owner-forms">
        <form className="section-card owner-form" onSubmit={handleUpdateParking}>
          <h2>Update parking details</h2>
          
          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="locationId">Location</label>
              <select
                id="locationId"
                required
                value={parkingForm.locationId}
                onChange={(event) =>
                  setParkingForm((current) => ({ ...current, locationId: event.target.value }))
                }
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.area}, {location.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                required
                value={parkingForm.title}
                onChange={(event) => setParkingForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div className="field-group">
              <label htmlFor="pricePerDay">Price per day</label>
              <input
                id="pricePerDay"
                type="number"
                min="1"
                required
                value={parkingForm.pricePerDay}
                onChange={(event) =>
                  setParkingForm((current) => ({ ...current, pricePerDay: event.target.value }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="pricePerHour">Price per hour</label>
              <input
                id="pricePerHour"
                type="number"
                min="1"
                required
                value={parkingForm.pricePerHour}
                onChange={(event) =>
                  setParkingForm((current) => ({ ...current, pricePerHour: event.target.value }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="availableFrom">Available from</label>
              <input
                id="availableFrom"
                type="time"
                required
                value={parkingForm.availableFrom}
                onChange={(event) =>
                  setParkingForm((current) => ({ ...current, availableFrom: event.target.value }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="availableTo">Available to</label>
              <input
                id="availableTo"
                type="time"
                required
                value={parkingForm.availableTo}
                onChange={(event) =>
                  setParkingForm((current) => ({ ...current, availableTo: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              required
              value={parkingForm.description}
              onChange={(event) =>
                setParkingForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>

          <div className="field-group">
            <label>Amenities</label>
            <div className="owner-form__checks">
              {amenityOptions.map((amenity) => (
                <label key={amenity}>
                  <input
                    type="checkbox"
                    checked={parkingForm.amenities.includes(amenity)}
                    onChange={() => toggleArrayValue('amenities', amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>Vehicle types</label>
            <div className="owner-form__checks owner-form__checks--inline">
              {vehicleTypeOptions.map((vehicleType) => (
                <label key={vehicleType}>
                  <input
                    type="checkbox"
                    checked={parkingForm.vehicleTypes.includes(vehicleType)}
                    onChange={() => toggleArrayValue('vehicleTypes', vehicleType)}
                  />
                  <span>{vehicleType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="field-group">
              <label>Current images</label>
              <div className="images-grid">
                {existingImages.map((imageUrl, index) => (
                  <div key={index} className="image-card">
                    <img src={resolveAssetUrl(imageUrl)} alt={`Parking ${index}`} />
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => handleRemoveExistingImage(imageUrl)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {newFiles.length > 0 && (
            <div className="field-group">
              <label>New images to upload</label>
              <div className="images-grid">
                {newFiles.map((file, index) => (
                  <div key={index} className="image-card">
                    <img src={URL.createObjectURL(file)} alt={`New ${index}`} />
                    <p className="image-filename">{file.name}</p>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => handleRemoveNewFile(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="field-group">
            <label htmlFor="newImages">Add or replace images</label>
            <input
              id="newImages"
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setNewFiles((current) => [...current, ...Array.from(event.target.files || [])])}
            />
          </div>

          <div className="form-actions">
            <Link to="/owner/manage-parking" className="btn btn-secondary">
              Cancel
            </Link>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating parking...' : 'Update parking'}
            </button>
          </div>
        </form>
      </section>
    </DashboardLayout>
  )
}

export default EditParkingPage
