import './StatusBadge.css'

function StatusBadge({ value }) {
  const normalized = String(value || 'UNKNOWN').toLowerCase()
  return <span className={`status-badge status-badge--${normalized}`}>{value}</span>
}

export default StatusBadge
