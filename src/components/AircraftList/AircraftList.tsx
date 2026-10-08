import { AircraftPositionFeature } from '../../api/aircraft';
import { formatMeters, formatSpeed } from '../../utils/aircraftFormat';
import './AircraftList.css';

export type AircraftListProps = {
  features: AircraftPositionFeature[];
  selectedAircraftId?: string | null;
  onSelectAircraft: (id: string) => void;
};

export function AircraftList({
  features,
  selectedAircraftId,
  onSelectAircraft,
}: AircraftListProps) {
  if (features.length === 0) {
    return <p className="aircraft-list-empty">No traffic in range.</p>;
  }

  return (
    <ul className="aircraft-list">
      {features.map((feature) => {
        const isSelected = feature.id === selectedAircraftId;

        return (
          <li className="aircraft-list-item" key={feature.id}>
            <button
              className={`aircraft-list-button ${isSelected ? 'aircraft-list-button-selected' : ''}`}
              onClick={() => onSelectAircraft(feature.id)}
              type="button"
            >
              <span className="aircraft-callsign">
                {feature.properties.callsign ?? feature.properties.icao24}
              </span>
              <span className="aircraft-meta">
                {formatMeters(feature.properties.altitudeMeters)} ·{' '}
                {formatSpeed(feature.properties.groundSpeedMetersPerSecond)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
