export function formatCoordinate(value: number): string {
  return value.toFixed(4);
}

export function formatHeading(value: number | null): string {
  if (value === null) {
    return 'Unknown';
  }

  return `${value} deg`;
}

export function formatMeters(value: number | null): string {
  if (value === null) {
    return 'Unknown';
  }

  return `${value} m`;
}

export function formatSpeed(value: number | null): string {
  if (value === null) {
    return 'Unknown';
  }

  return `${value} m/s`;
}

export function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}
