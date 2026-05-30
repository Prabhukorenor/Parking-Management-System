import { useEffect, useMemo, useState } from 'react'
import CalendarPicker from '../CalendarPicker/CalendarPicker.jsx'
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/bookingService'
import { getAvailableParkingSlots } from '../../services/parkingService'
import './BookingForm.css'

const getApiErrorMessage = (error, fallback = 'Unknown error') => {
  return error.response?.data?.message || error.response?.data?.error || error.message || fallback
}

const getDurationHours = (startDate, startHour, endDate, endHour) => {
  if (!startDate || !endDate) {
    return 0
  }

  const startDateTime = new Date(
    parseInt(startDate.split('-')[0]),
    parseInt(startDate.split('-')[1]) - 1,
    parseInt(startDate.split('-')[2]),
    parseInt(startHour),
    0,
    0
  )
  const endDateTime = new Date(
    parseInt(endDate.split('-')[0]),
    parseInt(endDate.split('-')[1]) - 1,
    parseInt(endDate.split('-')[2]),
    parseInt(endHour),
    0,
    0
  )

  const diffHours = (endDateTime - startDateTime) / (1000 * 60 * 60)
  return diffHours > 0 ? Math.ceil(diffHours) : 0
}

function BookingForm({ parking, amenityCharges = [], slots, onPaymentSuccess, isSubmitting }) {
  const [form, setForm] = useState({
    slotId: '',
    startDate: '',
    startHour: String(getCurrentHour()).padStart(2, '0'),
    endDate: '',
    endHour: '23',
    paymentStatus: 'PAID',
  })

  const [showBillingDetails, setShowBillingDetails] = useState(false)
  const [billingData, setBillingData] = useState(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [availabilityResult, setAvailabilityResult] = useState(null)
  const [slotAvailabilityError, setSlotAvailabilityError] = useState(null)
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)

  const baseAvailableSlots = useMemo(() => slots.filter((slot) => slot.available), [slots])
  const selectedDurationHours = getDurationHours(
    form.startDate,
    form.startHour,
    form.endDate,
    form.endHour
  )
  const hasValidDateRange = Boolean(form.startDate && form.endDate && selectedDurationHours > 0)
  const availabilityKey = `${form.startDate}-${form.startHour}-${form.endDate}-${form.endHour}`
  const availableSlots =
    hasValidDateRange && availabilityResult?.key === availabilityKey
      ? availabilityResult.slots
      : baseAvailableSlots
  const slotOptions = hasValidDateRange && availabilityResult?.key === availabilityKey ? availableSlots : []
  const currentSlotAvailabilityError =
    slotAvailabilityError?.key === availabilityKey ? slotAvailabilityError.message : ''
  const isCheckingSlotAvailability = hasValidDateRange && availabilityResult?.key !== availabilityKey

  const getAvailableHours = () => {
    return Array.from({ length: 17 }, (_, i) => String(i + 7).padStart(2, '0'))
  }

  const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  const formatHourWithAMPM = (hour) => {
    const hourNum = parseInt(hour)
    const isPM = hourNum >= 12
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
    const ampm = isPM ? 'PM' : 'AM'
    return `${String(displayHour).padStart(2, '0')}:00 ${ampm}`
  }

  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const date = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  function getCurrentHour() {
    return new Date().getHours()
  }

  const getAvailableStartHours = () => {
    const allHours = getAvailableHours()
    const today = getTodayString()
    const currentHour = getCurrentHour()

    if (form.startDate === today) {
      return allHours.filter((hour) => parseInt(hour) >= currentHour)
    }
    return allHours
  }

  const getAvailableEndHours = () => {
    const allHours = getAvailableHours()
    const today = getTodayString()
    const currentHour = getCurrentHour()

    let filtered = allHours

    if (form.startDate && form.endDate === form.startDate) {
      const startHourNum = parseInt(form.startHour)
      filtered = filtered.filter((hour) => parseInt(hour) > startHourNum)
    }

    if (form.endDate === today) {
      filtered = filtered.filter((hour) => parseInt(hour) >= currentHour)
    }

    return filtered
  }

  const calculateDurationHours = () => {
    return selectedDurationHours
  }

  const calculateBilling = () => {
    if (!form.slotId || !form.startDate || !form.endDate) {
      return {
        durationHours: 0,
        baseAmount: 0,
        amenityAmount: 0,
        totalAmount: 0,
      }
    }

    const totalHours = calculateDurationHours()
    if (totalHours <= 0) {
      return {
        durationHours: 0,
        baseAmount: 0,
        amenityAmount: 0,
        totalAmount: 0,
      }
    }

    const fullDays = Math.floor(totalHours / 24)
    const remainingHours = totalHours % 24
    const pricePerDay = parseFloat(parking.pricePerDay) || 0
    const pricePerHour = parseFloat(parking.pricePerHour) || 0
    const baseAmount = fullDays * pricePerDay + remainingHours * pricePerHour
    const amenityAmount = amenityCharges.reduce((total, amenity) => {
      const chargePerDay = parseFloat(amenity.chargePerDay) || 0
      const chargePerHour = parseFloat(amenity.chargePerHour) || 0
      return total + fullDays * chargePerDay + remainingHours * chargePerHour
    }, 0)
    const totalAmount = baseAmount + amenityAmount

    return {
      durationHours: totalHours,
      baseAmount: Math.round(baseAmount * 100) / 100,
      amenityAmount: Math.round(amenityAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    }
  }

  const buildDateTimeParam = (date, hour) => {
    return `${date}T${hour}:00:00`
  }

  const handleChange = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  useEffect(() => {
    const today = getTodayString()
    const currentHour = getCurrentHour()
    const allHours = getAvailableHours()

    if (form.startDate === today && parseInt(form.startHour) < currentHour) {
      const validStartHours = allHours.filter((hour) => parseInt(hour) >= currentHour)
      if (validStartHours.length > 0) {
        setForm((current) => ({
          ...current,
          startHour: validStartHours[0],
        }))
      }
    }

    if (form.endDate && form.startDate) {
      const endHourNum = parseInt(form.endHour)
      const startHourNum = parseInt(form.startHour)

      if (form.endDate === form.startDate && endHourNum <= startHourNum) {
        const validEndHours = allHours.filter((hour) => parseInt(hour) > startHourNum)
        if (validEndHours.length > 0) {
          setForm((current) => ({
            ...current,
            endHour: validEndHours[0],
          }))
        }
      }

      if (form.endDate === today && endHourNum < currentHour) {
        const validEndHours = allHours.filter((hour) => parseInt(hour) >= currentHour)
        if (validEndHours.length > 0) {
          setForm((current) => ({
            ...current,
            endHour: validEndHours[0],
          }))
        }
      }
    }
  }, [form.startDate, form.endDate, form.startHour])

  useEffect(() => {
    if (!parking?.id || !hasValidDateRange) {
      return
    }

    let ignoreResult = false

    const loadAvailableSlots = async () => {
      try {
        setSlotAvailabilityError(null)
        const data = await getAvailableParkingSlots(parking.id, {
          startDate: buildDateTimeParam(form.startDate, form.startHour),
          endDate: buildDateTimeParam(form.endDate, form.endHour),
        })

        if (ignoreResult) {
          return
        }

        setAvailabilityResult({
          key: availabilityKey,
          slots: data,
        })
        if (form.slotId && !data.some((slot) => String(slot.id) === String(form.slotId))) {
          setForm((current) => ({
            ...current,
            slotId: '',
          }))
        }
      } catch (error) {
        if (!ignoreResult) {
          setSlotAvailabilityError({
            key: availabilityKey,
            message: getApiErrorMessage(error, 'Could not refresh available slots.'),
          })
          setAvailabilityResult({
            key: availabilityKey,
            slots: [],
          })
        }
      }
    }

    loadAvailableSlots()

    return () => {
      ignoreResult = true
    }
  }, [parking?.id, hasValidDateRange, availabilityKey, form.startDate, form.startHour, form.endDate, form.endHour, form.slotId])

  const handleShowBillingDetails = (event) => {
    event.preventDefault()

    if (!form.slotId || !form.startDate || !form.endDate) {
      alert('Please fill all required fields')
      return
    }

    const billing = calculateBilling()
    if (billing.totalAmount <= 0) {
      alert('Invalid date/time range')
      return
    }

    setBillingData({
      slotNumber: availableSlots.find((s) => s.id == form.slotId)?.slotNumber,
      startDate: form.startDate,
      startHour: form.startHour,
      endDate: form.endDate,
      endHour: form.endHour,
      durationHours: billing.durationHours,
      baseAmount: billing.baseAmount,
      amenityAmount: billing.amenityAmount,
      amount: billing.totalAmount,
      parkingTitle: parking.title,
    })

    setShowBillingDetails(true)
  }

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded. Please refresh the page.')
      return
    }

    setIsProcessingPayment(true)

    try {
      let orderData
      try {
        console.log('Creating Razorpay order with amount:', billingData.amount)
        orderData = await createRazorpayOrder({
          amount: billingData.amount,
          parkingId: parking.id,
          slotId: form.slotId,
          startDate: form.startDate,
          startHour: form.startHour,
          endDate: form.endDate,
          endHour: form.endHour,
        })
        console.log('Order created:', orderData)
      } catch (orderError) {
        console.error('Order creation failed:', orderError)
        const errorMsg = getApiErrorMessage(orderError)
        alert('Failed to create payment order:\n' + errorMsg)
        setIsProcessingPayment(false)
        return
      }

      if (!orderData || !orderData.orderId) {
        alert('Invalid payment order response - no orderId received')
        setIsProcessingPayment(false)
        return
      }

      const amountInPaise = Math.round(billingData.amount * 100)
      console.log('Opening Razorpay with amount (paise):', amountInPaise, 'orderId:', orderData.orderId)

      const options = {
        key: orderData.key,
        amount: amountInPaise,
        currency: 'INR',
        name: 'PMS Parking',
        description: `Parking at ${billingData.parkingTitle}`,
        order_id: orderData.orderId,
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
        },
        theme: {
          color: '#3498db',
        },
        handler: async (response) => {
          try {
            console.log('Payment successful, verifying:', response)

            const verifyResult = await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              parkingId: parking.id,
              slotId: form.slotId,
              startDate: form.startDate,
              startHour: form.startHour,
              endDate: form.endDate,
              endHour: form.endHour,
            })

            console.log('Payment verified, booking created:', verifyResult)
            setIsProcessingPayment(false)
            onPaymentSuccess?.(verifyResult)
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr)
            const errorMsg = getApiErrorMessage(verifyErr)
            alert('Payment or booking confirmation failed:\n' + errorMsg + '\n\nPlease contact support if this persists.')
            setIsProcessingPayment(false)
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed by user')
            setIsProcessingPayment(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('Razorpay error:', err)
      alert('Payment error: ' + (err.message || 'Unknown error'))
      setIsProcessingPayment(false)
    }
  }

  const billingPreview = calculateBilling()
  const totalAmount = billingPreview.totalAmount

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>

      {!showBillingDetails ? (
        <form className="booking-form section-card">
          <div className="booking-form__head">
            <div>
              <p className="booking-form__eyebrow">Slot-level booking</p>
              <h2>Reserve your time window</h2>
            </div>
            <div className="booking-form__price">
              <strong>Rs {totalAmount.toFixed(2)}</strong>
              <span>includes amenities</span>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="slotId">Choose slot</label>
              <select
                id="slotId"
                required
                value={form.slotId}
                onChange={(event) => handleChange('slotId', event.target.value)}
                disabled={!hasValidDateRange || isCheckingSlotAvailability}
              >
                <option value="">
                  {!hasValidDateRange
                    ? 'Select date and time first'
                    : isCheckingSlotAvailability
                      ? 'Checking available slots...'
                      : 'Select slot'}
                </option>
                {slotOptions.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.slotNumber} - {slot.slotType}
                  </option>
                ))}
              </select>
              {currentSlotAvailabilityError && <small className="field-error">{currentSlotAvailabilityError}</small>}
              {!currentSlotAvailabilityError && hasValidDateRange && !isCheckingSlotAvailability && slotOptions.length === 0 && (
                <small className="field-error">No slots are available for this duration.</small>
              )}
            </div>

            <div className="field-group calendar-field">
              <label>Start date</label>
              <div className="calendar-input-wrapper">
                <input
                  type="text"
                  readOnly
                  value={
                    form.startDate
                      ? parseLocalDate(form.startDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Select date'
                  }
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                  className="calendar-input"
                  placeholder="Select start date"
                />
                {showStartCalendar && (
                  <div className="calendar-dropdown">
                    <CalendarPicker
                      selectedDate={form.startDate}
                      onSelectDate={(date) => {
                        handleChange('startDate', date)
                        setShowStartCalendar(false)
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="startHour">Start time</label>
              <select
                id="startHour"
                required
                value={form.startHour}
                onChange={(event) => handleChange('startHour', event.target.value)}
              >
                {getAvailableStartHours().map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHourWithAMPM(hour)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group calendar-field">
              <label>End date</label>
              <div className="calendar-input-wrapper">
                <input
                  type="text"
                  readOnly
                  value={
                    form.endDate
                      ? parseLocalDate(form.endDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Select date'
                  }
                  onClick={() => setShowEndCalendar(!showEndCalendar)}
                  className="calendar-input"
                  placeholder="Select end date"
                />
                {showEndCalendar && (
                  <div className="calendar-dropdown">
                    <CalendarPicker
                      selectedDate={form.endDate}
                      onSelectDate={(date) => {
                        handleChange('endDate', date)
                        setShowEndCalendar(false)
                      }}
                      minDate={form.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="endHour">End time</label>
              <select
                id="endHour"
                required
                value={form.endHour}
                onChange={(event) => handleChange('endHour', event.target.value)}
              >
                {getAvailableEndHours().map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHourWithAMPM(hour)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="button"
            onClick={handleShowBillingDetails}
            disabled={isSubmitting}
          >
            Review Billing Details
          </button>
        </form>
      ) : (
        <div className="billing-details section-card">
          <div className="billing-details__head">
            <h2>Billing Details</h2>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setShowBillingDetails(false)}
            >
              Back to Booking
            </button>
          </div>

          <div className="billing-details__content">
            <div className="billing-row">
              <span>Parking:</span>
              <strong>{billingData.parkingTitle}</strong>
            </div>
            <div className="billing-row">
              <span>Slot:</span>
              <strong>{billingData.slotNumber}</strong>
            </div>
            <div className="billing-row">
              <span>Check-in:</span>
              <strong>
                {parseLocalDate(billingData.startDate).toLocaleDateString('en-IN')} at{' '}
                {formatHourWithAMPM(billingData.startHour)}
              </strong>
            </div>
            <div className="billing-row">
              <span>Check-out:</span>
              <strong>
                {parseLocalDate(billingData.endDate).toLocaleDateString('en-IN')} at{' '}
                {formatHourWithAMPM(billingData.endHour)}
              </strong>
            </div>
            <div className="billing-row">
              <span>Duration:</span>
              <strong>{billingData.durationHours} hour(s)</strong>
            </div>
            <div className="billing-divider"></div>
            <div className="billing-row">
              <span>Base price:</span>
              <strong>Rs {billingData.baseAmount.toFixed(2)}</strong>
            </div>
            <div className="billing-row">
              <span>Amenity charges:</span>
              <strong>Rs {billingData.amenityAmount.toFixed(2)}</strong>
            </div>
            <div className="billing-row billing-total">
              <span>Total Amount:</span>
              <strong>Rs {billingData.amount.toFixed(2)}</strong>
            </div>
          </div>

          <button
            className="btn btn-success"
            type="button"
            onClick={handleRazorpayPayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? 'Processing...' : 'Pay with Razorpay'}
          </button>
        </div>
      )}
    </>
  )
}

export default BookingForm
