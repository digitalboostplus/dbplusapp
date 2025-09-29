const FIELDS = [
  'Name',
  'Email',
  'Phone',
  'Website',
  'Address',
  'Created',
  'Updated',
  'Time zone',
  'Status',
];

const LocationDetailSkeleton = () => {
  return (
    <div className="skeleton-overlay detail-skeleton" aria-hidden="true">
      <div className="skeleton-card-grid">
        {FIELDS.map((label) => (
          <div key={label} className="skeleton-field">
            <span className="skeleton-label" />
            <span className="skeleton-value" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationDetailSkeleton;
