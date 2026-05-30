import { useState } from 'react'
import './CalendarPicker.css'

function CalendarPicker({ selectedDate, onSelectDate, minDate }) {
  // Parse minDate properly - ensure it's today at minimum
  const getMinDate = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (minDate) {
      const providedDate = new Date(minDate)
      providedDate.setHours(0, 0, 0, 0)
      return providedDate > today ? providedDate : today
    }
    return today
  }

  const minDateObj = getMinDate()
  const [currentMonth, setCurrentMonth] = useState(new Date(minDateObj))

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    // Don't allow going to previous months before minDate
    if (prevMonth.getFullYear() > minDateObj.getFullYear() || 
        (prevMonth.getFullYear() === minDateObj.getFullYear() && prevMonth.getMonth() >= minDateObj.getMonth())) {
      setCurrentMonth(prevMonth)
    }
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    selected.setHours(0, 0, 0, 0)
    // Format date as YYYY-MM-DD using local timezone (not UTC)
    const year = selected.getFullYear()
    const month = String(selected.getMonth() + 1).padStart(2, '0')
    const date = String(selected.getDate()).padStart(2, '0')
    onSelectDate(`${year}-${month}-${date}`)
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = []

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const monthName = currentMonth.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="calendar-picker">
      <div className="calendar-header">
        <button type="button" onClick={handlePrevMonth} className="calendar-nav">
          ←
        </button>
        <h3>{monthName}</h3>
        <button type="button" onClick={handleNextMonth} className="calendar-nav">
          →
        </button>
      </div>

      <div className="calendar-weekdays">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      <div className="calendar-days">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-day empty"></div>
          }

          const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          dateObj.setHours(0, 0, 0, 0)
          const dateStr = dateObj.toISOString().split('T')[0]
          const isSelected = dateStr === selectedDate
          const isPastMinDate = dateObj < minDateObj

          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isPastMinDate ? 'disabled' : ''}`}
              onClick={() => !isPastMinDate && handleDateClick(day)}
              disabled={isPastMinDate}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarPicker
