import { Search } from 'lucide-react'
import { vehicleTypeOptions } from '../../constants/options'
import './FilterSidebar.css'

function FilterSidebar({ filters, onChange, onReset }) {
  return (
    <aside className="filter-sidebar section-card">
      <div className="filter-sidebar__head">
        <h2>Find the right spot</h2>
      </div>

      <div className="field-group filter-sidebar__search">
        <label htmlFor="city">City</label>
        <div className="filter-sidebar__input-wrap">
          <input
            id="city"
            value={filters.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="Search city"
          />
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="vehicleType">Vehicle type</label>
        <select
          id="vehicleType"
          value={filters.vehicleType}
          onChange={(event) => onChange('vehicleType', event.target.value)}
        >
          <option value="">All vehicles</option>
          {vehicleTypeOptions.map((vehicleType) => (
            <option key={vehicleType} value={vehicleType}>
              {vehicleType}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-sidebar__actions">
        <button className="btn btn-primary" type="button">
          Apply Filters
        </button>
        <button className="btn btn-secondary" type="button" onClick={onReset}>
          Reset Filters
        </button>
      </div>
    </aside>
  )
}

export default FilterSidebar
