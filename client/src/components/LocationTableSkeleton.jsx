const COLUMN_COUNT = 5;

const LocationTableSkeleton = ({ rows = 8 }) => {
  return (
    <div className="skeleton-overlay table-skeleton" aria-hidden="true">
      <div className="skeleton-table">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="skeleton-row">
            {Array.from({ length: COLUMN_COUNT }).map((_, colIndex) => (
              <span key={colIndex} className="skeleton-cell" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationTableSkeleton;
