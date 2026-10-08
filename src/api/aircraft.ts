export interface AircraftPositionFeatureCollection {
  readonly type: 'FeatureCollection';
  readonly features: AircraftPositionFeature[];
}

export interface AircraftPositionFeature {
  readonly type: 'Feature';
  readonly id: string;
  readonly geometry: AircraftPositionGeometry;
  readonly properties: AircraftPositionProperties;
}

export interface AircraftPositionGeometry {
  readonly type: 'Point';
  readonly coordinates: [longitude: number, latitude: number];
}

export interface AircraftPositionProperties {
  readonly icao24: string;
  readonly callsign: string | null;
  readonly altitudeMeters: number | null;
  readonly groundSpeedMetersPerSecond: number | null;
  readonly headingDegrees: number | null;
  readonly lastContactAt: string | null;
  readonly isStale: boolean;
  readonly source: string;
}

const MOCK_AIRCRAFT_POSITIONS: AircraftPositionFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '4ca8e7',
      geometry: {
        type: 'Point',
        coordinates: [4.52, 50.93],
      },
      properties: {
        icao24: '4ca8e7',
        callsign: 'RYR42AB',
        altitudeMeters: 1828,
        groundSpeedMetersPerSecond: 116,
        headingDegrees: 247,
        lastContactAt: '2026-10-08T09:12:00.000Z',
        isStale: false,
        source: 'mock',
      },
    },
    {
      type: 'Feature',
      id: '440172',
      geometry: {
        type: 'Point',
        coordinates: [4.3, 50.78],
      },
      properties: {
        icao24: '440172',
        callsign: 'BEL7GK',
        altitudeMeters: 3429,
        groundSpeedMetersPerSecond: 142,
        headingDegrees: 61,
        lastContactAt: '2026-10-08T09:12:04.000Z',
        isStale: false,
        source: 'mock',
      },
    },
    {
      type: 'Feature',
      id: '3c65a1',
      geometry: {
        type: 'Point',
        coordinates: [4.72, 50.71],
      },
      properties: {
        icao24: '3c65a1',
        callsign: 'DLH5TM',
        altitudeMeters: 6705,
        groundSpeedMetersPerSecond: 214,
        headingDegrees: 315,
        lastContactAt: '2026-10-08T09:10:42.000Z',
        isStale: true,
        source: 'mock',
      },
    },
  ],
};

export async function fetchAircraftPositions(): Promise<AircraftPositionFeatureCollection> {
  await delay(250);

  return MOCK_AIRCRAFT_POSITIONS;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
