import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx'
import PageHero from '../../components/PageHero/PageHero.jsx'
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx'
import { slotTypeOptions } from '../../constants/options'
import { addParkingSlot, getOwnerParkingList, getParkingSlots } from '../../services/parkingService'
import { getApiErrorMessage } from '../../utils/formatters'
import { toast } from 'react-toastify'
import './ManageSlotsPage.css'

const ownerLinks = [
  { to: '/owner/add-parking', label: 'Add Parking' },
  { to: '/owner/manage-slots', label: 'Manage Slots' },
  { to: '/owner/manage-parking', label: 'Manage Parking' },
  { to: '/owner/bookings', label: 'View Bookings' },
]

function ManageSlotsPage() {
  const [parkings, setParkings] = useState([])
  const [selectedParkingId, setSelectedParkingId] = useState('')
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({
    slotNumber: '',
    slotType: 'COVERED',
    isAvailable: true,
  })

  const loadSlots = async (parkingId) => {
    if (!parkingId) {
      setSlots([])
      return
    }
    setSlots(await getParkingSlots(parkingId))
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOwnerParkingList()
        setParkings(data)
        if (data[0]) {
          setSelectedParkingId(String(data[0].id))
          await loadSlots(data[0].id)
        }
      } catch (loadError) {
        toast.error(getApiErrorMessage(loadError, 'Could not load slots view.'))
      }
    }

    load()
  }, [])

  const handleParkingChange = async (value) => {
    setSelectedParkingId(value)
    try {
      await loadSlots(value)
    } catch (loadError) {
      toast.error(getApiErrorMessage(loadError, 'Could not load parking slots.'))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await addParkingSlot(Number(selectedParkingId), form)
      toast.success('Slot added successfully.')
      setForm({ slotNumber: '', slotType: 'COVERED', isAvailable: true })
      await loadSlots(selectedParkingId)
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Could not add slot.'))
    }
  }

  return (
    <DashboardLayout
      eyebrow="Owner Dashboard"
      title="Manage Slots"
      description="Add slot numbers per parking space and inspect availability state."
      links={ownerLinks}
    >
      {/* <PageHero
        eyebrow="SLOT MANAGEMENT"
        title="Smart slot management for smarter parking."
      /> */}

      <section className="section-card slots-page">
        <form className="slots-page__form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="parking-select">Parking</label>
              <select
                id="parking-select"
                value={selectedParkingId}
                onChange={(event) => handleParkingChange(event.target.value)}
              >
                {parkings.map((parking) => (
                  <option key={parking.id} value={parking.id}>
                    {parking.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="slotNumber">Slot number</label>
              <input
                id="slotNumber"
                required
                value={form.slotNumber}
                onChange={(event) => setForm((current) => ({ ...current, slotNumber: event.target.value }))}
              />
            </div>

            <div className="field-group">
              <label htmlFor="slotType">Slot type</label>
              <select
                id="slotType"
                value={form.slotType}
                onChange={(event) => setForm((current) => ({ ...current, slotType: event.target.value }))}
              >
                {slotTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-primary" type="submit">
            Add slot
          </button>
        </form>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td>{slot.slotNumber}</td>
                  <td>{slot.slotType}</td>
                  <td>
                    <StatusBadge value={slot.available ? 'AVAILABLE' : 'UNAVAILABLE'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default ManageSlotsPage
