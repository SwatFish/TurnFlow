import { AircraftPositionFeature } from '../../api/aircraft';
import {
  formatCoordinate,
  formatHeading,
  formatMeters,
  formatSpeed,
  formatTimestamp,
} from '../../utils/aircraftFormat';
import './AircraftDetails.css';

export type AircraftDetailsProps = {
  feature: AircraftPositionFeature | null;
};

export function AircraftDetails({ feature }: AircraftDetailsProps) {
  if (!feature) {
    return (
      <section className="aircraft-details aircraft-details-empty">
        Select an aircraft to view details
      </section>
    );
  }

  return (
    <section className="aircraft-details" aria-label="Selected aircraft details">
      <div className="aircraft-details-header">
        <h2>{feature.properties.callsign ?? feature.properties.icao24}</h2>
        <span className="aircraft-details-icao">{feature.properties.icao24}</span>
      </div>
      <dl className="aircraft-details-grid">
        <div>
          <dt>Altitude</dt>
          <dd>{formatMeters(feature.properties.altitudeMeters)}</dd>
        </div>
        <div>
          <dt>Ground speed</dt>
          <dd>{formatSpeed(feature.properties.groundSpeedMetersPerSecond)}</dd>
        </div>
        <div>
          <dt>Heading</dt>
          <dd>{formatHeading(feature.properties.headingDegrees)}</dd>
        </div>
        <div>
          <dt>Last contact</dt>
          <dd>{formatTimestamp(feature.properties.lastContactAt)}</dd>
        </div>
        <div>
          <dt>Longitude</dt>
          <dd>{formatCoordinate(feature.geometry.coordinates[0])}</dd>
        </div>
        <div>
          <dt>Latitude</dt>
          <dd>{formatCoordinate(feature.geometry.coordinates[1])}</dd>
        </div>
      </dl>
    </section>
  );
}
