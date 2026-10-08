import { formatTimestamp } from '../../utils/aircraftFormat';
import './AircraftStatus.css';

export type AircraftStatusProps = {
  aircraftCount: number | null;
  errorMessage: string | null;
  isLoading: boolean;
  lastUpdatedAt: string | null;
};

export function AircraftStatus({
  aircraftCount,
  errorMessage,
  isLoading,
  lastUpdatedAt,
}: AircraftStatusProps) {
  const formattedLastUpdatedAt = lastUpdatedAt
    ? formatTimestamp(lastUpdatedAt)
    : null;
  const updatedSuffix = formattedLastUpdatedAt
    ? ` - Last updated: ${formattedLastUpdatedAt}`
    : '';
  const statusCopy = errorMessage
    ? formattedLastUpdatedAt
      ? `${errorMessage} Showing last update from ${formattedLastUpdatedAt}.`
      : errorMessage
    : isLoading
      ? 'Loading aircraft positions...'
      : `Loaded aircraft: ${aircraftCount ?? 0}${updatedSuffix}`;

  return <p className="aircraft-status">{statusCopy}</p>;
}
