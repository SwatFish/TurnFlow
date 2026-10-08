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
    ? ` · Updated ${formattedLastUpdatedAt}`
    : '';
  const statusCopy = errorMessage
    ? formattedLastUpdatedAt
      ? `${errorMessage} Showing last update from ${formattedLastUpdatedAt}.`
      : errorMessage
    : isLoading
      ? 'Loading aircraft positions…'
      : `${aircraftCount ?? 0} aircraft tracked${updatedSuffix}`;

  const statusClass = errorMessage
    ? 'aircraft-status-error'
    : isLoading
      ? 'aircraft-status-loading'
      : '';

  return <p className={`aircraft-status ${statusClass}`}>{statusCopy}</p>;
}
