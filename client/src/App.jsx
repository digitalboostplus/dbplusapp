import { useEffect, useMemo, useState } from 'react';
import LocationDetailSkeleton from './components/LocationDetailSkeleton';
import LocationTableSkeleton from './components/LocationTableSkeleton';
import './App.css';

const PAGE_SIZE = 100;

const buildQueryString = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  return search.toString();
};

const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};

function App() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailFilter, setEmailFilter] = useState('');
  const [order, setOrder] = useState('createdAt:desc');
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [detailsError, setDetailsError] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [lastLoaded, setLastLoaded] = useState(null);

  const debouncedEmail = useDebouncedValue(emailFilter, 400);

  const loadLocations = async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const query = buildQueryString({ ...params, all: 'true', limit: PAGE_SIZE });
      const response = await fetch(`/api/locations?${query}`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed to fetch locations');
      }
      const data = await response.json();
      setLocations(data.locations || []);
      setLastLoaded(new Date());
    } catch (err) {
      setError(err.message || 'Unexpected error');
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations({ email: debouncedEmail, order });
  }, [debouncedEmail, order]);

  useEffect(() => {
    if (!selectedLocationId) {
      setLocationDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setDetailsLoading(true);
      setDetailsError(null);
      try {
        const response = await fetch(`/api/locations/${selectedLocationId}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message || 'Failed to fetch location details');
        }
        const data = await response.json();
        setLocationDetails(data);
      } catch (err) {
        setDetailsError(err.message || 'Unexpected error');
        setLocationDetails(null);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [selectedLocationId]);

  const orderedLocations = useMemo(() => locations, [locations]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Agency Sub-Account Dashboard</h1>
        <p className="tagline">Search, review, and inspect every location connected to your HighLevel agency.</p>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="emailFilter">Email filter</label>
            <input
              id="emailFilter"
              type="email"
              placeholder="name@example.com"
              value={emailFilter}
              onChange={(event) => setEmailFilter(event.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="orderSelect">Sort order</label>
            <select
              id="orderSelect"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
            >
              <option value="createdAt:desc">Newest first</option>
              <option value="createdAt:asc">Oldest first</option>
              <option value="name:asc">Name A → Z</option>
              <option value="name:desc">Name Z → A</option>
            </select>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={() => loadLocations({ email: debouncedEmail, order })}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
        {lastLoaded && <p className="last-loaded">Last updated {lastLoaded.toLocaleTimeString()}</p>}
      </header>

      <main className="dashboard">
        <section className="locations-panel">
          <div className="panel-header">
            <h2>Locations ({orderedLocations.length})</h2>
            {isLoading && <span className="status-badge">Loading…</span>}
            {error && <span className="status-badge error">{error}</span>}
          </div>
          <div className="table-wrapper">
            {isLoading && <LocationTableSkeleton />}
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {orderedLocations.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="empty">
                      {error ? 'No results' : 'No locations found for the selected filters.'}
                    </td>
                  </tr>
                )}
                {orderedLocations.map((location) => (
                  <tr
                    key={location.id}
                    className={location.id === selectedLocationId ? 'selected' : ''}
                    onClick={() => setSelectedLocationId(location.id)}
                  >
                    <td>{location.name || '—'}</td>
                    <td>{location.email || '—'}</td>
                    <td>{location.phone || '—'}</td>
                    <td>{location.city || '—'}</td>
                    <td>{location.state || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="details-panel">
          <div className="panel-header">
            <h2>Location details</h2>
            {detailsLoading && <span className="status-badge">Loading…</span>}
            {detailsError && <span className="status-badge error">{detailsError}</span>}
          </div>
          {!selectedLocationId && <p className="placeholder">Select a location to inspect its profile.</p>}
          {selectedLocationId && !detailsError && locationDetails && (
            <dl className="details-grid">
              <div>
                <dt>Name</dt>
                <dd>{locationDetails.name || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{locationDetails.email || '—'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{locationDetails.phone || '—'}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  {locationDetails.website ? (
                    <a href={locationDetails.website} target="_blank" rel="noreferrer">
                      {locationDetails.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>
                  {[locationDetails.address1, locationDetails.address2, locationDetails.city, locationDetails.state, locationDetails.postalCode]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{locationDetails.createdAt ? new Date(locationDetails.createdAt).toLocaleString() : '—'}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{locationDetails.updatedAt ? new Date(locationDetails.updatedAt).toLocaleString() : '—'}</dd>
              </div>
              <div>
                <dt>Time zone</dt>
                <dd>{locationDetails.timezone || '—'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{locationDetails.status || '—'}</dd>
              </div>
            </dl>
          )}
          {selectedLocationId && detailsLoading && <LocationDetailSkeleton />}
        </section>
      </main>
    </div>
  );
}

export default App;
