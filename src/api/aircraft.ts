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

  return {
    type: 'FeatureCollection',
    features: MOCK_AIRCRAFT_POSITIONS.features.map(advanceMockPosition),
  };
}

/**
 * Mock aircraft drift along their heading at their ground speed so trails
 * accumulate points across polls. Purely cosmetic demo behavior.
 */
function advanceMockPosition(
  feature: AircraftPositionFeature,
): AircraftPositionFeature {
  const secondsSinceEpoch = Date.now() / 1000;
  const [longitude, latitude] = feature.geometry.coordinates;
  const speed = feature.properties.groundSpeedMetersPerSecond ?? 0;
  const heading = ((feature.properties.headingDegrees ?? 0) + 90) * (Math.PI / 180);

  const metersNorth = speed * secondsSinceEpoch * Math.sin(heading);
  const metersEast = speed * secondsSinceEpoch * Math.cos(heading);
  const nextLatitude = latitude + (metersNorth / 111_320) % 0.5;
  const nextLongitude =
    longitude + (metersEast / (111_320 * Math.cos(latitude * (Math.PI / 180)))) % 0.5;

  return {
    ...feature,
    geometry: {
      type: 'Point',
      coordinates: [
        Number(nextLongitude.toFixed(4)),
        Number(nextLatitude.toFixed(4)),
      ],
    },
  };
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
