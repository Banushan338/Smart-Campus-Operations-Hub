import { useState } from 'react'

const RESOURCE_TYPE_LABELS = {
  LECTURE_HALL: 'Lecture hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting room',
  EQUIPMENT: 'Equipment',
}

function resourceTypeLabel(resourceType) {
  if (!resourceType) return '—'
  return RESOURCE_TYPE_LABELS[resourceType] || resourceType.replace(/_/g, ' ')
}

function statusLabel(status) {
  if (status === 'BOOKED') return 'Booked'
  if (status === 'ACTIVE') return 'Active'
  if (status === 'OUT_OF_SERVICE') return 'Out of service'
  return status ? String(status).replace(/_/g, ' ') : '—'
}

function resourceDisplayStatus(item) {
  if (item?.isBooked && item?.status === 'ACTIVE') return 'BOOKED'
  return item?.status
}

function ResourcesPage({
  loading,
  resources,
  resourceType,
  resourceStatus,
  resourceLocation,
  minCapacity,
  onSetResourceType,
  onSetResourceStatus,
  onSetResourceLocation,
  onSetMinCapacity,
  onSelectResource,
  onBookResource,
  onRefresh,
  onApplyFilters,
  onResetFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <section>
      <div className="section-head">
        <div>
          <h1>Facilities & Assets Catalogue</h1>
        </div>
        <div className="section-head-actions">
          <button
            type="button"
            className="btn light"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide filters' : 'Filter'}
          </button>
          <button className="btn light" disabled={loading} onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      {filtersOpen && (
        <div className="resources-filters">
          <label className="resources-filters-field">
            <span>Type</span>
            <select value={resourceType} onChange={(e) => onSetResourceType(e.target.value)}>
              <option value="">All</option>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </label>
          <label className="resources-filters-field">
            <span>Status</span>
            <select value={resourceStatus} onChange={(e) => onSetResourceStatus(e.target.value)}>
              <option value="">Any</option>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of service</option>
            </select>
          </label>
          <label className="resources-filters-field span-2">
            <span>Location</span>
            <input
              placeholder="Contains…"
              value={resourceLocation}
              onChange={(e) => onSetResourceLocation(e.target.value)}
            />
          </label>
          <div className="resources-filters-row span-2">
            <label className="resources-filters-field">
              <span>Min capacity</span>
              <input
                type="number"
                min={0}
                placeholder="—"
                value={minCapacity}
                onChange={(e) => onSetMinCapacity(e.target.value)}
              />
            </label>
            <div className="resources-filters-field resources-filters-field--actions">
              <span>Actions</span>
              <div className="resources-filters-buttons" role="group" aria-label="Filter actions">
                <button
                  type="button"
                  className="btn light btn-compact resources-filters-btn"
                  disabled={loading}
                  onClick={onResetFilters}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn primary btn-compact resources-filters-btn"
                  onClick={onApplyFilters}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="resource-grid">
        {resources.map((item) => {
          const displayStatus = resourceDisplayStatus(item)
          return (
          <article key={item.id} className="resource-card" onClick={() => onSelectResource(item.id)}>
            <div className="resource-copy">
              <h3>{item.name}</h3>
              <p className="resource-location">{item.location}</p>
              <div className="resource-meta">
                <p className="resource-capacity">
                  <span className="resource-meta-label">Capacity</span>
                  <span className="resource-meta-value">{item.capacity}</span>
                </p>
                <div className="resource-meta-tags">
                  <span className="resource-type" title={item.resourceType}>
                    {resourceTypeLabel(item.resourceType)}
                  </span>
                  <span
                    className={
                      displayStatus === 'BOOKED'
                        ? 'chip chip-status amber'
                        : displayStatus === 'ACTIVE'
                          ? 'chip chip-status green'
                          : 'chip chip-status red'
                    }
                  >
                    {statusLabel(displayStatus)}
                  </span>
                </div>
              </div>
              <button
                className="btn primary btn-compact resource-book-btn"
                type="button"
                disabled={item.status !== 'ACTIVE' || item.isBooked}
                onClick={(event) => {
                  event.stopPropagation()
                  onBookResource(item.id)
                }}
              >
                {item.isBooked ? 'Booked' : 'Book'}
              </button>
            </div>
          </article>
          )
        })}
      </div>
    </section>
  )
}

export default ResourcesPage
