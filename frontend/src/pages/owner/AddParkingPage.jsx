import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import { amenityOptions, vehicleTypeOptions } from '../../constants/options'
import { createLocation, getLocations } from '../../services/locationService'
import { createParking, uploadParkingImages } from '../../services/parkingService'
import { getApiErrorMessage } from '../../utils/formatters'
import { toast } from 'react-toastify'
import './AddParkingPage.css'

const ownerLinks = [
  { to: '/owner/add-parking', label: 'Add Parking' },
  { to: '/owner/manage-slots', label: 'Manage Slots' },
  { to: '/owner/manage-parking', label: 'Manage Parking' },
  { to: '/owner/bookings', label: 'View Bookings' },
]

const emptyLocation = {
  street: '',
  area: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
}

const emptyParking = {
  locationId: '',
  title: '',
  description: '',
  pricePerDay: '',
  pricePerHour: '',
  availableFrom: '06:00',
  availableTo: '23:00',
  amenities: ['CCTV surveillance'],
  vehicleTypes: ['CAR'],
}

function AddParkingPage() {
  const [locations, setLocations] = useState([])
  const [locationForm, setLocationForm] = useState(emptyLocation)
  const [parkingForm, setParkingForm] = useState(emptyParking)
  const [files, setFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function initialize() {
      try {
        const data = await getLocations()
        setLocations(data)
        if (data[0]) {
          setParkingForm((current) => ({
            ...current,
            locationId: current.locationId || data[0].id,
          }))
        }
      } catch (loadError) {
        toast.error(getApiErrorMessage(loadError, 'Could not load locations.'))
      }
    }

    initialize()
  }, [])

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

  const handleCreateLocation = async (event) => {
    event.preventDefault()
    try {
      const created = await createLocation(locationForm)
      toast.success(`Location created: ${created.area}, ${created.city}`)
      setLocationForm(emptyLocation)
      const data = await getLocations()
      setLocations(data)
      setParkingForm((current) => ({ ...current, locationId: created.id }))
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Could not create location.'))
    }
  }

  const handleCreateParking = async (event) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      let images = []
      if (files.length) {
        const uploadResponse = await uploadParkingImages(files)
        images = uploadResponse.imageUrls
      }
      await createParking({
        ...parkingForm,
        locationId: Number(parkingForm.locationId),
        pricePerDay: Number(parkingForm.pricePerDay),
        pricePerHour: Number(parkingForm.pricePerHour),
        images,
      })
      toast.success('Parking created successfully. It may await admin approval.')
      setParkingForm((current) => ({
        ...emptyParking,
        locationId: current.locationId,
      }))
      setFiles([])
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Could not create parking.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      eyebrow="Owner Dashboard"
      title="Add Parking"
      description="Create location, upload images, and post parking spaces."
      links={ownerLinks}
    >
      <section className="owner-forms">
        <form className="section-card owner-form" onSubmit={handleCreateLocation}>
          <h2>Create location</h2>
          <div className="form-grid">
            {Object.keys(emptyLocation).map((field) => (
              <div key={field} className="field-group">
                <label htmlFor={field}>{field}</label>
                <input
                  id={field}
                  required
                  value={locationForm[field]}
                  onChange={(event) =>
                    setLocationForm((current) => ({ ...current, [field]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" type="submit">
            Save location
          </button>
        </form>

        <form className="section-card owner-form" onSubmit={handleCreateParking}>
          <h2>Create parking</h2>
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

          <div className="field-group">
            <label htmlFor="images">Upload images</label>
            <input id="images" type="file" multiple accept="image/*" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating parking...' : 'Create parking'}
          </button>
        </form>
      </section>
    </DashboardLayout>
  )
}

export default AddParkingPage
