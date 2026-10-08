import type {
  AirportRunwayResponse,
  NearestAirportResponse,
} from '../../api/airports';
import './AirportContext.css';

type AirportContextProps = {
  airport: NearestAirportResponse | null;
  errorMessage: string | null;
  isLoading: boolean;
  label: string;
  runways: AirportRunwayResponse[] | null;
};

export function AirportContext({
  airport,
  errorMessage,
  isLoading,
  label,
  runways,
}: AirportContextProps) {
  if (isLoading) {
    return (
      <section className="airport-context" aria-label="Airport context">
        <p className="airport-context-label">{label}</p>
        <p className="airport-context-status">Loading airport context...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="airport-context" aria-label="Airport context">
        <p className="airport-context-label">{label}</p>
        <p className="airport-context-status airport-context-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (!airport) {
    return (
      <section className="airport-context" aria-label="Airport context">
        <p className="airport-context-label">{label}</p>
        <p className="airport-context-status">No airport found nearby.</p>
      </section>
    );
  }

  const runwayCount = runways?.length ?? 0;

  return (
    <section className="airport-context" aria-labelledby="airport-context-title">
      <div className="airport-context-header">
        <div>
          <p className="airport-context-label">{label}</p>
          <h2 id="airport-context-title">{airport.ident}</h2>
        </div>
        <span className="airport-distance">{airport.distanceKm.toFixed(1)} km</span>
      </div>

      <p className="airport-name">{airport.name}</p>

      <div className="runway-summary">
        <span>{runwayCount} runways</span>
        <span>{airport.type.replaceAll('_', ' ')}</span>
      </div>

      <ul className="runway-list" aria-label="Runways">
        {runways?.map((runway) => (
          <li className="runway-item" key={runway.sourceRunwayId}>
            <span className="runway-ident">
              {runway.leIdent ?? '?'} / {runway.heIdent ?? '?'}
            </span>
            <span className="runway-meta">
              {runway.lengthFt ? `${runway.lengthFt} ft` : 'length unknown'}
              {' - '}
              {runway.surface ?? 'surface unknown'}
            </span>
            <span className="runway-state">
              {runway.closed ? 'Closed' : 'Open'}
              {runway.lighted ? ' - Lighted' : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
