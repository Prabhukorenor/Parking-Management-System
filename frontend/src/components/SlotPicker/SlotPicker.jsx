import './SlotPicker.css'

function SlotPicker({ slots, selectedSlotId, onSelect }) {
  return (
    <div className="slot-picker">
      {slots.map((slot) => (
        <button
          key={slot.id}
          type="button"
          className={`slot-picker__item ${selectedSlotId === slot.id ? 'slot-picker__item--active' : ''}`}
          onClick={() => onSelect(slot.id)}
          disabled={!slot.available}
        >
          <strong>{slot.slotNumber}</strong>
          <span>{slot.slotType}</span>
          <small>{slot.available ? 'Available' : 'Unavailable'}</small>
        </button>
      ))}
    </div>
  )
}

export default SlotPicker
